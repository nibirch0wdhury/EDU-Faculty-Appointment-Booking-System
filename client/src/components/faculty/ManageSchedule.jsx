import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { toast } from 'react-toastify';
import { Plus, Trash2, Clock, Sparkles, Loader2, Calendar as CalendarIcon, RefreshCw, ChevronLeft, ChevronRight, Repeat, CalendarDays, Info } from 'lucide-react';
import api from '../../utils/api';
import MagneticButton from '../ui/MagneticButton';
import SpotlightCard from '../ui/SpotlightCard';
import PageTransition, { MotionContainer } from '../ui/PageTransition';
import ConfirmModal from '../ui/ConfirmModal';

// ============================================
// UTILITY FUNCTIONS - TIMEZONE SAFE
// ============================================

// Format date to YYYY-MM-DD without timezone shift
const formatDateToLocalString = (date) => {
    if (!date) return '';
    const d = date instanceof Date ? date : new Date(date);
    if (isNaN(d.getTime())) return '';
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

// Parse date string to Date object without timezone shift
const parseLocalDate = (dateString) => {
    if (!dateString) return null;
    if (dateString instanceof Date) return isNaN(dateString.getTime()) ? null : dateString;
    if (typeof dateString !== 'string') return null;

    // If it's an ISO string with time/timezone info, parse via Date constructor
    // to get the correct local date, then reconstruct without time component
    if (dateString.includes('T') || dateString.includes('Z')) {
        const parsed = new Date(dateString);
        if (isNaN(parsed.getTime())) return null;
        // Extract local date components to avoid timezone shift
        return new Date(parsed.getFullYear(), parsed.getMonth(), parsed.getDate());
    }

    // Plain "YYYY-MM-DD" string — parse as local date components directly
    const parts = dateString.split('-').map(Number);
    if (parts.length !== 3 || parts.some(isNaN)) return null;
    const [year, month, day] = parts;
    const d = new Date(year, month - 1, day);
    return isNaN(d.getTime()) ? null : d;
};

// Get today's date as YYYY-MM-DD
const getTodayString = () => {
    const today = new Date();
    return formatDateToLocalString(today);
};

// Get tomorrow's date as YYYY-MM-DD
const getTomorrowString = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return formatDateToLocalString(tomorrow);
};

// Format time for display (12-hour format)
const formatTimeDisplay = (time) => {
    if (!time || typeof time !== 'string') return '';
    const parts = time.split(':').map(Number);
    if (parts.length < 2 || parts.some(isNaN)) return time;
    const [hours, minutes] = parts;
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const hour12 = hours % 12 || 12;
    return `${hour12}:${String(minutes).padStart(2, '0')} ${ampm}`;
};

// Format date for display
const formatDateDisplay = (dateString) => {
    if (!dateString) return '';
    const date = parseLocalDate(dateString);
    if (!date) return '';
    return date.toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        year: 'numeric',
    });
};

// Check if time is valid
const isTimeValid = (startTime, endTime) => {
    if (!startTime || !endTime || typeof startTime !== 'string' || typeof endTime !== 'string') return false;
    const sParts = startTime.split(':').map(Number);
    const eParts = endTime.split(':').map(Number);
    if (sParts.length < 2 || eParts.length < 2 || sParts.some(isNaN) || eParts.some(isNaN)) return false;
    const [startHour, startMinute] = sParts;
    const [endHour, endMinute] = eParts;
    return (startHour * 60 + startMinute) < (endHour * 60 + endMinute);
};

// Get duration string
const getDurationString = (startTime, endTime) => {
    if (!startTime || !endTime || !isTimeValid(startTime, endTime)) return null;
    const [sh, sm] = startTime.split(':').map(Number);
    const [eh, em] = endTime.split(':').map(Number);
    const diff = (eh * 60 + em) - (sh * 60 + sm);
    const hours = Math.floor(diff / 60);
    const minutes = diff % 60;
    if (hours === 0) return `${minutes}m`;
    if (minutes === 0) return `${hours}h`;
    return `${hours}h ${minutes}m`;
};

// ============================================
// DATE VALIDATION - PAST DATE CHECK
// ============================================

// Check if a date is in the past (before today)
const isPastDate = (date) => {
    if (!date) return false;
    const d = date instanceof Date ? date : parseLocalDate(date);
    if (!d || isNaN(d.getTime())) return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const checkDate = new Date(d);
    checkDate.setHours(0, 0, 0, 0);
    return checkDate < today;
};

// Check if a date string is in the past
const isPastDateString = (dateString) => {
    if (!dateString) return true;
    const date = parseLocalDate(dateString);
    if (!date) return true;
    return isPastDate(date);
};

// Check if a date is today
const isToday = (date) => {
    if (!date) return false;
    const d = date instanceof Date ? date : parseLocalDate(date);
    if (!d || isNaN(d.getTime())) return false;
    const today = new Date();
    return d.getDate() === today.getDate() &&
        d.getMonth() === today.getMonth() &&
        d.getFullYear() === today.getFullYear();
};

// Check if a date string is today
const isTodayString = (dateString) => {
    if (!dateString) return false;
    const date = parseLocalDate(dateString);
    if (!date) return false;
    return isToday(date);
};

// ============================================
// CHECK IF TIME IS IN THE PAST FOR TODAY
// ============================================
const isPastTimeForToday = (dateString, startTime) => {
    if (!dateString || !startTime || typeof startTime !== 'string') return false;

    const date = parseLocalDate(dateString);
    if (!date || isNaN(date.getTime())) return false;

    const today = new Date();

    const isTodayDate = date.getDate() === today.getDate() &&
        date.getMonth() === today.getMonth() &&
        date.getFullYear() === today.getFullYear();

    if (!isTodayDate) return false;

    const parts = startTime.split(':').map(Number);
    if (parts.length < 2 || parts.some(isNaN)) return false;
    const [hours, minutes] = parts;
    const slotStartTime = new Date(today);
    slotStartTime.setHours(hours, minutes, 0, 0);

    return slotStartTime < today;
};

// ============================================
// ✅ NEW: Sort function - closest first
// ============================================
const sortSlotsByClosest = (slots) => {
    return [...slots].sort((a, b) => {
        // First compare by date
        const dateA = new Date(a.date);
        const dateB = new Date(b.date);
        
        if (dateA.getTime() !== dateB.getTime()) {
            return dateA.getTime() - dateB.getTime(); // Closest date first
        }
        
        // If same date, compare by start time
        return a.startTime.localeCompare(b.startTime);
    });
};

// ============================================
// DAY NAMES HELPER
// ============================================
const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTH_OPTIONS = [1, 2, 3, 4, 6, 12];

// ============================================
// MAIN COMPONENT
// ============================================

const ManageSchedule = () => {
    const [schedule, setSchedule] = useState([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [refreshing, setRefreshing] = useState(false);
    // ---- Delete Modal State ----
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [slotToDelete, setSlotToDelete] = useState(null);
    const [deletingSlot, setDeletingSlot] = useState(false);

    // ---- Bulk Delete Modal State ----
    const [bulkDeleteModalOpen, setBulkDeleteModalOpen] = useState(false);
    const [bulkDeleteType, setBulkDeleteType] = useState(null); // 'day' | 'all'
    const [targetDayIndex, setTargetDayIndex] = useState(null);
    const [targetDayName, setTargetDayName] = useState('');
    const [bulkDeleting, setBulkDeleting] = useState(false);

    // ---- Mode: 'single' or 'recurring' ----
    const [scheduleMode, setScheduleMode] = useState('single');

    // ---- Single Slot State ----
    const [newSlot, setNewSlot] = useState({
        date: getTomorrowString(),
        startTime: '09:00',
        endTime: '10:00',
    });

    const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
    const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
    const [selectedDate, setSelectedDate] = useState(() => {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        return tomorrow;
    });

    const [dateError, setDateError] = useState('');

    // ---- Recurring State ----
    const [recurringForm, setRecurringForm] = useState({
        daysOfWeek: [],    // array of day indices 0-6
        startTime: '09:00',
        endTime: '10:00',
        months: 4,
        startDate: getTodayString(),
    });

    const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    const days = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

    const fetchSchedule = useCallback(async (showToast = false) => {
        try {
            setLoading(true);
            const response = await api.get('/faculty/my-schedule');
            const scheduleData = Array.isArray(response.data) ? response.data : response.data?.data || [];
            setSchedule(scheduleData);
            if (showToast) {
                toast.success(`Loaded ${scheduleData.length} schedule slots`);
            }
        } catch (error) {
            console.error('Error fetching schedule:', error);
            toast.error('Failed to load schedule');
            setSchedule([]);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, []);

    useEffect(() => {
        fetchSchedule();
    }, [fetchSchedule]);

    const goToPreviousMonth = () => {
        if (currentMonth === 0) {
            setCurrentMonth(11);
            setCurrentYear(currentYear - 1);
        } else {
            setCurrentMonth(currentMonth - 1);
        }
    };

    const goToNextMonth = () => {
        if (currentMonth === 11) {
            setCurrentMonth(0);
            setCurrentYear(currentYear + 1);
        } else {
            setCurrentMonth(currentMonth + 1);
        }
    };

    const goToToday = () => {
        const today = new Date();
        setCurrentMonth(today.getMonth());
        setCurrentYear(today.getFullYear());
        const dateStr = formatDateToLocalString(today);
        setNewSlot(prev => ({ ...prev, date: dateStr }));
        setSelectedDate(today);
        setDateError('');
    };

    const clearDate = () => {
        setNewSlot(prev => ({ ...prev, date: '' }));
        setSelectedDate(null);
        setDateError('');
    };

    const handleDateSelect = (day) => {
        const newDate = new Date(currentYear, currentMonth, day);

        if (isPastDate(newDate)) {
            setDateError('❌ Cannot select a past date. Please choose today or a future date.');
            toast.error('Cannot select a past date');
            return;
        }

        const dateStr = formatDateToLocalString(newDate);
        setNewSlot(prev => ({ ...prev, date: dateStr }));
        setSelectedDate(newDate);
        setDateError('');
    };

    const getDaysInMonth = () => new Date(currentYear, currentMonth + 1, 0).getDate();
    const getFirstDayOfMonth = () => new Date(currentYear, currentMonth, 1).getDay();

    const renderCalendarDays = () => {
        const daysInMonth = getDaysInMonth();
        const firstDay = getFirstDayOfMonth();
        const daysArray = [];

        for (let i = 0; i < firstDay; i++) {
            daysArray.push(<div key={`empty-${i}`} className="h-9 w-9"></div>);
        }

        for (let day = 1; day <= daysInMonth; day++) {
            const date = new Date(currentYear, currentMonth, day);
            const disabled = isPastDate(date);
            const selected = isSelected(date);
            const today = isToday(date);

            daysArray.push(
                <button
                    key={day}
                    type="button"
                    onClick={() => handleDateSelect(day)}
                    disabled={disabled}
                    className={`
            h-9 w-9 rounded-xl text-sm font-medium transition-all duration-200
            ${disabled ? 'opacity-30 cursor-not-allowed text-slate-400 dark:text-slate-600 line-through' : 'hover:scale-105 cursor-pointer'}
            ${selected ? 'bg-primary-500 text-white shadow-md shadow-primary-500/25 dark:shadow-primary-500/50' : ''}
            ${today && !selected ? 'border-2 border-primary-500/50 dark:border-primary-400/50 text-primary-600 dark:text-primary-400' : ''}
            ${!disabled && !selected ? 'hover:bg-primary-50 dark:hover:bg-primary-950/30 text-slate-700 dark:text-slate-300' : ''}
          `}
                >
                    {day}
                </button>
            );
        }

        return daysArray;
    };

    const isSelected = (date) => {
        if (!selectedDate) return false;
        return date.getDate() === selectedDate.getDate() &&
            date.getMonth() === selectedDate.getMonth() &&
            date.getFullYear() === selectedDate.getFullYear();
    };

    const handleRefresh = () => {
        setRefreshing(true);
        fetchSchedule(true);
    };

    const handleTimeChange = (field, value) => {
        setNewSlot(prev => {
            const updated = { ...prev, [field]: value };
            if (field === 'startTime' && updated.endTime) {
                if (!isTimeValid(updated.startTime, updated.endTime)) {
                    const [hours, minutes] = updated.startTime.split(':').map(Number);
                    const endHour = hours + 1;
                    const endMinutes = minutes;
                    const newEndTime = `${String(endHour).padStart(2, '0')}:${String(endMinutes).padStart(2, '0')}`;
                    updated.endTime = newEndTime;
                    toast.info('End time adjusted to 1 hour after start time');
                }
            }
            if (field === 'endTime' && updated.startTime) {
                if (!isTimeValid(updated.startTime, updated.endTime)) {
                    toast.error('End time must be after start time');
                }
            }
            return updated;
        });
    };

    const handleAddSlot = async (e) => {
        e.preventDefault();
        setDateError('');

        if (!newSlot.date) {
            toast.error('Please select a date');
            return;
        }

        if (isPastDateString(newSlot.date)) {
            const errorMsg = '❌ Cannot schedule slots in the past. Please select today or a future date.';
            setDateError(errorMsg);
            toast.error(errorMsg);
            return;
        }

        if (isPastTimeForToday(newSlot.date, newSlot.startTime)) {
            const currentTime = new Date();
            const currentTimeStr = currentTime.toLocaleTimeString('en-US', {
                hour: '2-digit',
                minute: '2-digit',
                hour12: true
            });
            const errorMsg = `❌ Cannot create slots for times that have already passed today. Current time is ${currentTimeStr}. Please select a future time.`;
            setDateError(errorMsg);
            toast.error(errorMsg);
            return;
        }

        if (!isTimeValid(newSlot.startTime, newSlot.endTime)) {
            toast.error('⚠️ End time must be after start time');
            return;
        }

        const [sh, sm] = newSlot.startTime.split(':').map(Number);
        const [eh, em] = newSlot.endTime.split(':').map(Number);
        const duration = (eh * 60 + em) - (sh * 60 + sm);

        if (duration < 30) {
            toast.error('⚠️ Slot duration must be at least 30 minutes');
            return;
        }

        if (duration > 240) {
            toast.error('⚠️ Slot duration cannot exceed 4 hours');
            return;
        }

        const duplicate = schedule.some(slot => {
            const slotDate = formatDateToLocalString(new Date(slot.date));
            return slotDate === newSlot.date && slot.startTime === newSlot.startTime;
        });

        if (duplicate) {
            toast.error('⚠️ You already have a slot at this date and time');
            return;
        }

        setSubmitting(true);
        try {
            const payload = {
                date: newSlot.date,
                startTime: newSlot.startTime,
                endTime: newSlot.endTime,
            };

            console.log('📤 Sending slot data:', payload);

            const response = await api.post('/faculty/schedule', payload);
            const slotData = response.data?.data || response.data?.slot || response.data;

            if (slotData && slotData._id) {
                setSchedule(prev => [slotData, ...prev]);
                toast.success('✅ Slot added successfully!');

                const tomorrowStr = getTomorrowString();
                setNewSlot({
                    date: tomorrowStr,
                    startTime: '09:00',
                    endTime: '10:00',
                });
                const tomorrowDate = parseLocalDate(tomorrowStr);
                setSelectedDate(tomorrowDate);
                setDateError('');

                setTimeout(() => fetchSchedule(true), 500);
            }
        } catch (error) {
            console.error('❌ Add slot error:', error);
            const errorMsg = error.response?.data?.message || 'Failed to add slot';

            if (errorMsg.toLowerCase().includes('past') ||
                errorMsg.toLowerCase().includes('current time') ||
                errorMsg.toLowerCase().includes('already passed')) {
                setDateError('❌ ' + errorMsg);
            }

            toast.error(`❌ ${errorMsg}`);
        } finally {
            setSubmitting(false);
        }
    };

    const promptDeleteSlot = (slot) => {
        setSlotToDelete(slot);
        setDeleteModalOpen(true);
    };

    const handleConfirmDeleteSlot = async () => {
        if (!slotToDelete) return;
        setDeletingSlot(true);
        try {
            await api.delete(`/faculty/schedule/${slotToDelete._id}`);
            setSchedule(prev => prev.filter(slot => slot._id !== slotToDelete._id));
            toast.success('✅ Slot deleted successfully');
            setDeleteModalOpen(false);
            setSlotToDelete(null);
            setTimeout(() => fetchSchedule(true), 300);
        } catch (error) {
            console.error('❌ Delete slot error:', error);
            const errorMsg = error.response?.data?.message || 'Failed to delete slot';
            toast.error(`❌ ${errorMsg}`);
        } finally {
            setDeletingSlot(false);
        }
    };

    const promptDeleteDaySlots = (dayIdx, dayName) => {
        setBulkDeleteType('day');
        setTargetDayIndex(dayIdx);
        setTargetDayName(dayName);
        setBulkDeleteModalOpen(true);
    };

    const promptDeleteAllSlots = () => {
        setBulkDeleteType('all');
        setBulkDeleteModalOpen(true);
    };

    const handleConfirmBulkDelete = async () => {
        setBulkDeleting(true);
        try {
            if (bulkDeleteType === 'day') {
                const response = await api.post('/faculty/schedule/delete-day', { dayOfWeek: targetDayIndex });
                toast.success(response.data?.message || `Deleted slots for ${targetDayName}`);
            } else if (bulkDeleteType === 'all') {
                const response = await api.post('/faculty/schedule/delete-all');
                toast.success(response.data?.message || 'Cleared all schedule slots');
            }
            setBulkDeleteModalOpen(false);
            await fetchSchedule(true);
        } catch (error) {
            console.error('❌ Bulk delete error:', error);
            const errorMsg = error.response?.data?.message || 'Failed to delete slots';
            toast.error(`❌ ${errorMsg}`);
        } finally {
            setBulkDeleting(false);
        }
    };

    const toggleAvailability = async (slotId, currentStatus) => {
        try {
            const response = await api.put(`/faculty/schedule/${slotId}/toggle`);
            const updatedSlot = response.data?.data || response.data?.slot || response.data;
            setSchedule(prev =>
                prev.map(slot =>
                    slot._id === slotId ? { ...slot, isAvailable: updatedSlot?.isAvailable ?? !currentStatus } : slot
                )
            );
            toast.success(`✅ Slot ${!currentStatus ? 'available' : 'unavailable'} successfully`);
        } catch (error) {
            toast.error('❌ Failed to update availability');
        }
    };

    // ============================================
    // RECURRING SCHEDULE LOGIC
    // ============================================

    const toggleDayOfWeek = (dayIndex) => {
        setRecurringForm(prev => {
            const exists = prev.daysOfWeek.includes(dayIndex);
            return {
                ...prev,
                daysOfWeek: exists
                    ? prev.daysOfWeek.filter(d => d !== dayIndex)
                    : [...prev.daysOfWeek, dayIndex].sort((a, b) => a - b),
            };
        });
    };

    const handleRecurringTimeChange = (field, value) => {
        setRecurringForm(prev => {
            const updated = { ...prev, [field]: value };
            if (field === 'startTime' && updated.endTime) {
                if (!isTimeValid(updated.startTime, updated.endTime)) {
                    const [hours, minutes] = updated.startTime.split(':').map(Number);
                    const endHour = Math.min(hours + 1, 23);
                    updated.endTime = `${String(endHour).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
                }
            }
            return updated;
        });
    };

    // Calculate estimated slot count for preview
    const estimatedSlots = useMemo(() => {
        const { daysOfWeek, months: durationMonths, startDate } = recurringForm;
        if (daysOfWeek.length === 0) return 0;

        const start = startDate ? parseLocalDate(startDate) : new Date();
        if (!start) return 0;
        start.setHours(0, 0, 0, 0);

        const end = new Date(start);
        end.setMonth(end.getMonth() + durationMonths);

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        let count = 0;
        const curr = new Date(start);
        while (curr <= end) {
            if (daysOfWeek.includes(curr.getDay()) && curr >= today) {
                count++;
            }
            curr.setDate(curr.getDate() + 1);
        }
        return count;
    }, [recurringForm]);

    const handleAddRecurringSlots = async (e) => {
        e.preventDefault();

        if (recurringForm.daysOfWeek.length === 0) {
            toast.error('Please select at least one day of the week');
            return;
        }

        if (!isTimeValid(recurringForm.startTime, recurringForm.endTime)) {
            toast.error('End time must be after start time');
            return;
        }

        const [sh, sm] = recurringForm.startTime.split(':').map(Number);
        const [eh, em] = recurringForm.endTime.split(':').map(Number);
        const duration = (eh * 60 + em) - (sh * 60 + sm);
        if (duration < 30) {
            toast.error('Slot duration must be at least 30 minutes');
            return;
        }

        setSubmitting(true);
        try {
            const payload = {
                daysOfWeek: recurringForm.daysOfWeek,
                startTime: recurringForm.startTime,
                endTime: recurringForm.endTime,
                months: recurringForm.months,
                startDate: recurringForm.startDate,
            };

            console.log('📤 Sending recurring schedule:', payload);

            const response = await api.post('/faculty/schedule/recurring', payload);
            const result = response.data;

            if (result.success) {
                toast.success(result.message || `Created ${result.data?.createdCount || 0} recurring slots!`);
                await fetchSchedule();
            } else {
                toast.error(result.message || 'Failed to create recurring slots');
            }
        } catch (error) {
            console.error('❌ Recurring schedule error:', error);
            const errorMsg = error.response?.data?.message || 'Failed to create recurring slots';
            toast.error(`❌ ${errorMsg}`);
        } finally {
            setSubmitting(false);
        }
    };

    // ============================================
    // ✅ GROUPED AND SORTED SCHEDULE - CLOSEST FIRST
    // ============================================

    // First, sort all slots by date and time (closest first)
    const sortedSlots = sortSlotsByClosest(schedule);
    
    // Then group by date
    const groupedSchedule = sortedSlots.reduce((acc, slot) => {
        if (!slot || !slot.date) return acc;
        const dateKey = formatDateToLocalString(new Date(slot.date));
        if (!acc[dateKey]) acc[dateKey] = [];
        acc[dateKey].push(slot);
        return acc;
    }, {});

    // ✅ FIXED: Sort dates in ascending order (closest first)
    const sortedDates = Object.keys(groupedSchedule).sort((a, b) => a.localeCompare(b));

    const isSelectedDatePast = newSlot.date && isPastDateString(newSlot.date);
    const isSelectedTimePast = newSlot.date && newSlot.startTime && isPastTimeForToday(newSlot.date, newSlot.startTime);
    const isFormInvalid = isSelectedDatePast || isSelectedTimePast;

    const getCurrentTimeStr = () => {
        const now = new Date();
        return now.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
        });
    };

    // ============================================
    // RENDER
    // ============================================

    return (
        <PageTransition className="py-8 md:py-12 bg-slate-50/80 dark:bg-slate-950/80 pattern-dots">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
                <MotionContainer className="space-y-1">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary-50 dark:bg-primary-950/30 border border-primary-500/20 dark:border-primary-500/30 text-primary-600 dark:text-primary-400 text-xs font-semibold">
                        <Sparkles className="w-3.5 h-3.5 text-primary-500 dark:text-primary-400" />
                        <span>Faculty Schedule Manager</span>
                    </div>
                    <h1 className="text-3xl font-display font-bold text-slate-900 dark:text-white">Manage Consultation Availability</h1>
                    <p className="text-slate-500 dark:text-slate-400 text-sm">
                        Set your availability for specific dates or create recurring weekly schedules.
                        <span className="text-red-500 dark:text-red-400 font-semibold ml-1">* Cannot schedule past dates or past times</span>
                    </p>
                </MotionContainer>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Left Column - Add Slot Form */}
                    <MotionContainer delay={0.1}>
                        <div className="bg-white dark:bg-slate-900/95 rounded-3xl shadow-card dark:shadow-card-dark border border-primary-500/10 dark:border-primary-500/20 p-6 sm:p-8 space-y-6 transition-all duration-300 relative">

                            {/* Mode Switcher Tabs */}
                            <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-2xl">
                                <button
                                    type="button"
                                    onClick={() => setScheduleMode('single')}
                                    className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all duration-200 ${scheduleMode === 'single'
                                        ? 'bg-white dark:bg-slate-700 text-primary-600 dark:text-primary-400 shadow-sm'
                                        : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'
                                        }`}
                                >
                                    <CalendarDays className="w-3.5 h-3.5" />
                                    Single Date Slot
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setScheduleMode('recurring')}
                                    className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all duration-200 ${scheduleMode === 'recurring'
                                        ? 'bg-white dark:bg-slate-700 text-primary-600 dark:text-primary-400 shadow-sm'
                                        : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'
                                        }`}
                                >
                                    <Repeat className="w-3.5 h-3.5" />
                                    Recurring Weekly
                                </button>
                            </div>

                            {/* ========== SINGLE MODE ========== */}
                            {scheduleMode === 'single' && (
                                <>
                                    <div className="flex items-center justify-between">
                                        <h2 className="text-xl font-display font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                            <Plus className="w-5 h-5 text-primary-500 dark:text-primary-400" />
                                            <span>Add New Time Slot</span>
                                        </h2>
                                        <button
                                            onClick={handleRefresh}
                                            disabled={refreshing}
                                            className="p-2 rounded-xl text-slate-400 dark:text-slate-500 hover:text-primary-500 dark:hover:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-950/30 transition-colors"
                                            title="Refresh schedule"
                                        >
                                            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
                                        </button>
                                    </div>

                                    <form onSubmit={handleAddSlot} className="space-y-5">
                                        <div>
                                            <label className="input-label">
                                                <CalendarIcon className="inline-block w-4 h-4 mr-1.5 text-primary-500 dark:text-primary-400" />
                                                Select Date <span className="text-red-500">*</span>
                                            </label>
                                            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 p-4">
                                                <div className="flex items-center justify-between mb-3">
                                                    <button
                                                        type="button"
                                                        onClick={goToPreviousMonth}
                                                        className="p-1.5 rounded-lg hover:bg-primary-50 dark:hover:bg-primary-950/30 text-slate-400 dark:text-slate-500 hover:text-primary-500 dark:hover:text-primary-400 transition-colors"
                                                    >
                                                        <ChevronLeft className="w-4 h-4" />
                                                    </button>
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-sm font-bold text-slate-900 dark:text-white">
                                                            {months[currentMonth]} {currentYear}
                                                        </span>
                                                    </div>
                                                    <button
                                                        type="button"
                                                        onClick={goToNextMonth}
                                                        className="p-1.5 rounded-lg hover:bg-primary-50 dark:hover:bg-primary-950/30 text-slate-400 dark:text-slate-500 hover:text-primary-500 dark:hover:text-primary-400 transition-colors"
                                                    >
                                                        <ChevronRight className="w-4 h-4" />
                                                    </button>
                                                </div>

                                                <div className="grid grid-cols-7 gap-1 mb-2">
                                                    {days.map((day) => (
                                                        <div key={day} className="h-7 flex items-center justify-center text-[10px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                                                            {day}
                                                        </div>
                                                    ))}
                                                </div>

                                                <div className="grid grid-cols-7 gap-1">{renderCalendarDays()}</div>

                                                <div className="mt-3 pt-2 border-t border-slate-200 dark:border-slate-700 flex items-center justify-between">
                                                    <button
                                                        type="button"
                                                        onClick={clearDate}
                                                        className="text-[10px] font-medium text-slate-400 dark:text-slate-500 hover:text-red-500 dark:hover:text-red-400 transition-colors"
                                                    >
                                                        Clear
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={goToToday}
                                                        className="text-[10px] font-medium px-2 py-0.5 rounded-lg bg-primary-50 dark:bg-primary-950/30 border border-primary-500/20 dark:border-primary-500/30 text-primary-600 dark:text-primary-400 hover:bg-primary-100 dark:hover:bg-primary-950/50 transition-colors"
                                                    >
                                                        Today
                                                    </button>
                                                </div>
                                            </div>

                                            {newSlot.date && (
                                                <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
                                                    <p className="text-xs text-primary-600 dark:text-primary-400">
                                                        Selected: {formatDateDisplay(newSlot.date)}
                                                        {isTodayString(newSlot.date) && (
                                                            <span className="ml-2 px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400 text-[10px] font-semibold">
                                                                TODAY
                                                            </span>
                                                        )}
                                                        {isPastDateString(newSlot.date) && (
                                                            <span className="ml-2 px-2 py-0.5 rounded-full bg-red-100 dark:bg-red-950/50 text-red-700 dark:text-red-400 text-[10px] font-semibold">
                                                                ⚠️ PAST DATE - NOT ALLOWED
                                                            </span>
                                                        )}
                                                    </p>
                                                    {isTodayString(newSlot.date) && newSlot.startTime && (
                                                        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${isPastTimeForToday(newSlot.date, newSlot.startTime)
                                                            ? 'bg-red-100 dark:bg-red-950/50 text-red-700 dark:text-red-400'
                                                            : 'bg-emerald-100 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400'
                                                            }`}>
                                                            {isPastTimeForToday(newSlot.date, newSlot.startTime)
                                                                ? '⚠️ TIME PASSED'
                                                                : '✅ TIME AVAILABLE'}
                                                        </span>
                                                    )}
                                                </div>
                                            )}

                                            {dateError && (
                                                <p className="mt-2 text-xs text-red-600 dark:text-red-400 flex items-center gap-1.5">
                                                    <span className="text-lg">❌</span>
                                                    {dateError}
                                                </p>
                                            )}
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="input-label">Start Time</label>
                                                <input
                                                    type="time"
                                                    value={newSlot.startTime}
                                                    onChange={(e) => handleTimeChange('startTime', e.target.value)}
                                                    className="input-field"
                                                    required
                                                    disabled={submitting}
                                                    step="300"
                                                />
                                                {isTodayString(newSlot.date) && newSlot.startTime && (
                                                    <p className="text-[10px] mt-1">
                                                        {isPastTimeForToday(newSlot.date, newSlot.startTime) ? (
                                                            <span className="text-red-500 dark:text-red-400 font-semibold">
                                                                ⚠️ This time has already passed today
                                                            </span>
                                                        ) : (
                                                            <span className="text-emerald-600 dark:text-emerald-400">
                                                                ✅ This time is available
                                                            </span>
                                                        )}
                                                    </p>
                                                )}
                                            </div>
                                            <div>
                                                <label className="input-label">End Time</label>
                                                <input
                                                    type="time"
                                                    value={newSlot.endTime}
                                                    onChange={(e) => handleTimeChange('endTime', e.target.value)}
                                                    className="input-field"
                                                    required
                                                    disabled={submitting}
                                                    step="300"
                                                />
                                                <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1">
                                                    Duration: {newSlot.startTime && newSlot.endTime && isTimeValid(newSlot.startTime, newSlot.endTime) ? (
                                                        <span className="text-emerald-600 dark:text-emerald-400">{getDurationString(newSlot.startTime, newSlot.endTime)}</span>
                                                    ) : (
                                                        <span className="text-red-500 dark:text-red-400">⚠️ Invalid time range</span>
                                                    )}
                                                </p>
                                            </div>
                                        </div>

                                        <MagneticButton
                                            type="submit"
                                            variant="primary"
                                            className="w-full py-3 shadow-md shadow-primary-500/25 dark:shadow-primary-500/50"
                                            disabled={
                                                submitting ||
                                                !isTimeValid(newSlot.startTime, newSlot.endTime) ||
                                                !newSlot.date ||
                                                isSelectedDatePast ||
                                                isSelectedTimePast
                                            }
                                        >
                                            {submitting ? (
                                                <><Loader2 className="w-4 h-4 animate-spin" /><span>Adding Slot...</span></>
                                            ) : isSelectedDatePast ? (
                                                <><span>❌ Cannot Add - Past Date</span></>
                                            ) : isSelectedTimePast ? (
                                                <><span>❌ Cannot Add - Time Passed</span></>
                                            ) : (
                                                <><Plus className="w-4 h-4" /><span>Add Consultation Slot</span></>
                                            )}
                                        </MagneticButton>

                                        {isSelectedDatePast && (
                                            <p className="text-center text-[11px] text-red-500 dark:text-red-400 font-semibold">
                                                ⚠️ The selected date is in the past. Please choose today or a future date.
                                            </p>
                                        )}
                                        {isSelectedTimePast && !isSelectedDatePast && (
                                            <p className="text-center text-[11px] text-red-500 dark:text-red-400 font-semibold">
                                                ⚠️ The selected time has already passed today. Current time is <strong>{getCurrentTimeStr()}</strong>.
                                            </p>
                                        )}
                                    </form>
                                </>
                            )}

                            {/* ========== RECURRING MODE ========== */}
                            {scheduleMode === 'recurring' && (
                                <>
                                    <div className="flex items-center justify-between">
                                        <h2 className="text-xl font-display font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                            <Repeat className="w-5 h-5 text-primary-500 dark:text-primary-400" />
                                            <span>Recurring Weekly Schedule</span>
                                        </h2>
                                        <button
                                            onClick={handleRefresh}
                                            disabled={refreshing}
                                            className="p-2 rounded-xl text-slate-400 dark:text-slate-500 hover:text-primary-500 dark:hover:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-950/30 transition-colors"
                                            title="Refresh schedule"
                                        >
                                            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
                                        </button>
                                    </div>

                                    <div className="p-3.5 rounded-xl bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800/50 text-blue-700 dark:text-blue-400 text-sm font-medium flex items-center gap-2.5">
                                        <Info className="w-5 h-5 text-blue-500 dark:text-blue-400 shrink-0" />
                                        <span>You can always delete individual slots later if something comes up.</span>
                                    </div>

                                    <form onSubmit={handleAddRecurringSlots} className="space-y-5">
                                        {/* Day of Week Selector */}
                                        <div>
                                            <label className="input-label">
                                                <CalendarDays className="inline-block w-4 h-4 mr-1.5 text-primary-500 dark:text-primary-400" />
                                                Select Days of the Week <span className="text-red-500">*</span>
                                            </label>
                                            <div className="flex flex-wrap gap-2 mt-2">
                                                {DAY_LABELS.map((label, index) => (
                                                    <button
                                                        key={index}
                                                        type="button"
                                                        onClick={() => toggleDayOfWeek(index)}
                                                        className={`px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 border-2 ${recurringForm.daysOfWeek.includes(index)
                                                            ? 'bg-primary-500 border-primary-500 text-white shadow-md shadow-primary-500/25 dark:shadow-primary-500/50 scale-105'
                                                            : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 hover:border-primary-300 dark:hover:border-primary-600 hover:bg-primary-50 dark:hover:bg-primary-950/30'
                                                            }`}
                                                    >
                                                        {label}
                                                    </button>
                                                ))}
                                            </div>
                                            {recurringForm.daysOfWeek.length > 0 && (
                                                <p className="text-[10px] text-primary-600 dark:text-primary-400 mt-2">
                                                    Selected: {recurringForm.daysOfWeek.map(d => DAY_LABELS[d]).join(', ')}
                                                </p>
                                            )}
                                        </div>

                                        {/* Time Selection */}
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="input-label">Start Time</label>
                                                <input
                                                    type="time"
                                                    value={recurringForm.startTime}
                                                    onChange={(e) => handleRecurringTimeChange('startTime', e.target.value)}
                                                    className="input-field"
                                                    required
                                                    disabled={submitting}
                                                    step="300"
                                                />
                                            </div>
                                            <div>
                                                <label className="input-label">End Time</label>
                                                <input
                                                    type="time"
                                                    value={recurringForm.endTime}
                                                    onChange={(e) => handleRecurringTimeChange('endTime', e.target.value)}
                                                    className="input-field"
                                                    required
                                                    disabled={submitting}
                                                    step="300"
                                                />
                                                <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1">
                                                    Duration: {recurringForm.startTime && recurringForm.endTime && isTimeValid(recurringForm.startTime, recurringForm.endTime) ? (
                                                        <span className="text-emerald-600 dark:text-emerald-400">{getDurationString(recurringForm.startTime, recurringForm.endTime)}</span>
                                                    ) : (
                                                        <span className="text-red-500 dark:text-red-400">⚠️ Invalid</span>
                                                    )}
                                                </p>
                                            </div>
                                        </div>

                                        {/* Duration & Start Date */}
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="input-label">Duration (Months)</label>
                                                <select
                                                    value={recurringForm.months}
                                                    onChange={(e) => setRecurringForm(prev => ({ ...prev, months: parseInt(e.target.value, 10) }))}
                                                    className="input-field"
                                                    disabled={submitting}
                                                >
                                                    {MONTH_OPTIONS.map(m => (
                                                        <option key={m} value={m}>{m} Month{m > 1 ? 's' : ''}</option>
                                                    ))}
                                                </select>
                                            </div>
                                            <div>
                                                <label className="input-label">Starting From</label>
                                                <input
                                                    type="date"
                                                    value={recurringForm.startDate}
                                                    min={getTodayString()}
                                                    onChange={(e) => setRecurringForm(prev => ({ ...prev, startDate: e.target.value }))}
                                                    className="input-field"
                                                    disabled={submitting}
                                                />
                                            </div>
                                        </div>

                                        {/* Preview Summary */}
                                        {recurringForm.daysOfWeek.length > 0 && isTimeValid(recurringForm.startTime, recurringForm.endTime) && (
                                            <div className="p-4 rounded-2xl bg-gradient-to-br from-primary-50 to-primary-100/50 dark:from-primary-950/40 dark:to-primary-900/20 border border-primary-200 dark:border-primary-800/50">
                                                <h4 className="text-xs font-bold text-primary-700 dark:text-primary-300 uppercase tracking-wider mb-2">📋 Preview Summary</h4>
                                                <div className="space-y-1 text-xs text-primary-600 dark:text-primary-400">
                                                    <p>
                                                        <strong>Days:</strong> {recurringForm.daysOfWeek.map(d => DAY_LABELS[d]).join(', ')}
                                                    </p>
                                                    <p>
                                                        <strong>Time:</strong> {formatTimeDisplay(recurringForm.startTime)} – {formatTimeDisplay(recurringForm.endTime)}{' '}
                                                        <span className="opacity-70">({getDurationString(recurringForm.startTime, recurringForm.endTime)})</span>
                                                    </p>
                                                    <p>
                                                        <strong>Period:</strong> {recurringForm.months} month{recurringForm.months > 1 ? 's' : ''} from {formatDateDisplay(recurringForm.startDate)}
                                                    </p>
                                                    <p className="pt-1 border-t border-primary-200 dark:border-primary-700 font-bold text-sm">
                                                        ≈ {estimatedSlots} slot{estimatedSlots !== 1 ? 's' : ''} will be created
                                                    </p>
                                                </div>
                                            </div>
                                        )}

                                        <MagneticButton
                                            type="submit"
                                            variant="primary"
                                            className="w-full py-3 shadow-md shadow-primary-500/25 dark:shadow-primary-500/50"
                                            disabled={
                                                submitting ||
                                                recurringForm.daysOfWeek.length === 0 ||
                                                !isTimeValid(recurringForm.startTime, recurringForm.endTime)
                                            }
                                        >
                                            {submitting ? (
                                                <><Loader2 className="w-4 h-4 animate-spin" /><span>Generating Slots...</span></>
                                            ) : (
                                                <><Repeat className="w-4 h-4" /><span>Generate & Save Recurring Slots</span></>
                                            )}
                                        </MagneticButton>

                                        {/* Active Recurring Weekly Schedules Overview & Delete Options */}
                                        {schedule.length > 0 && (
                                            <div className="pt-5 border-t border-slate-200 dark:border-slate-800 space-y-4">
                                                <div className="flex items-center justify-between">
                                                    <div>
                                                        <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                                            <CalendarDays className="w-4 h-4 text-primary-500 dark:text-primary-400" />
                                                            <span>Active Recurring Weekly Schedules</span>
                                                        </h3>
                                                        <p className="text-[11px] text-slate-500 dark:text-slate-400">
                                                            Configured recurring days and slots ({schedule.length} total slots)
                                                        </p>
                                                    </div>

                                                    <button
                                                        type="button"
                                                        onClick={promptDeleteAllSlots}
                                                        className="px-3 py-1.5 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800/50 text-red-600 dark:text-red-400 text-xs font-semibold hover:bg-red-100 dark:hover:bg-red-950/50 transition-colors flex items-center gap-1.5 shrink-0"
                                                    >
                                                        <Trash2 className="w-3.5 h-3.5" />
                                                        <span>Delete All Schedules</span>
                                                    </button>
                                                </div>

                                                {/* Grouped Days List */}
                                                <div className="space-y-3">
                                                    {DAY_LABELS.map((dayName, dayIdx) => {
                                                        const daySlots = schedule.filter(slot => {
                                                            const d = parseLocalDate(slot.date);
                                                            return d && d.getDay() === dayIdx;
                                                        });

                                                        if (daySlots.length === 0) return null;

                                                        const timeRanges = Array.from(new Set(daySlots.map(s => `${s.startTime}-${s.endTime}`)));

                                                        return (
                                                            <div
                                                                key={dayName}
                                                                className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 flex items-center justify-between gap-3"
                                                            >
                                                                <div className="space-y-1">
                                                                    <div className="flex items-center gap-2">
                                                                        <span className="px-2.5 py-0.5 rounded-lg bg-primary-500 text-white font-bold text-xs">
                                                                            Every {dayName}
                                                                        </span>
                                                                        <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                                                                            ({daySlots.length} slot{daySlots.length !== 1 ? 's' : ''})
                                                                        </span>
                                                                    </div>
                                                                    <p className="text-xs text-slate-500 dark:text-slate-400">
                                                                        Times:{' '}
                                                                        {timeRanges.map(tr => {
                                                                            const [st, et] = tr.split('-');
                                                                            return `${formatTimeDisplay(st)} - ${formatTimeDisplay(et)}`;
                                                                        }).join(', ')}
                                                                    </p>
                                                                </div>

                                                                <button
                                                                    type="button"
                                                                    onClick={() => promptDeleteDaySlots(dayIdx, dayName)}
                                                                    className="px-2.5 py-1.5 rounded-xl bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800/40 hover:bg-red-100 dark:hover:bg-red-950/60 text-xs font-medium transition-colors flex items-center gap-1 shrink-0"
                                                                    title={`Delete all ${dayName} recurring slots`}
                                                                >
                                                                    <Trash2 className="w-3.5 h-3.5" />
                                                                    <span>Delete Day</span>
                                                                </button>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        )}
                                    </form>
                                </>
                            )}
                        </div>
                    </MotionContainer>

                    {/* Right Column - Current Schedule - SORTED CLOSEST FIRST */}
                    <MotionContainer delay={0.2}>
                        <div className="bg-white dark:bg-slate-900/95 rounded-3xl shadow-card dark:shadow-card-dark border border-primary-500/10 dark:border-primary-500/20 p-6 sm:p-8 space-y-6 transition-all duration-300 relative">

                            <h2 className="text-xl font-display font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                <Clock className="w-5 h-5 text-primary-500 dark:text-primary-400" />
                                <span>Configured Schedule Slots</span>
                                <span className="ml-auto text-xs text-slate-500 dark:text-slate-400 font-normal">
                                    {schedule.length} slot{schedule.length !== 1 ? 's' : ''}
                                    <span className="block text-[10px] text-emerald-600 dark:text-emerald-400">
                                        📅 Sorted: Closest first
                                    </span>
                                </span>
                            </h2>

                            {loading ? (
                                <div className="py-8 text-center text-slate-500 dark:text-slate-400 text-sm flex items-center justify-center gap-2">
                                    <Loader2 className="w-4 h-4 animate-spin text-primary-500 dark:text-primary-400" />
                                    <span>Loading schedule...</span>
                                </div>
                            ) : schedule.length > 0 ? (
                                <div className="space-y-4 max-h-[450px] overflow-y-auto pr-2 custom-scrollbar">
                                    {sortedDates.map(dateKey => {
                                        const daySlots = groupedSchedule[dateKey] || [];
                                        const isPast = isPastDateString(dateKey);
                                        return (
                                            <div key={dateKey} className="space-y-2">
                                                <h3 className={`text-xs font-bold uppercase tracking-wider border-b pb-1.5 flex items-center justify-between ${isPast
                                                    ? 'text-slate-400 dark:text-slate-500 border-slate-300 dark:border-slate-600'
                                                    : 'text-primary-600 dark:text-primary-400 border-primary-500/20 dark:border-primary-500/30'
                                                    }`}>
                                                    <span className="flex items-center gap-2">
                                                        {formatDateDisplay(dateKey)}
                                                        {isPast && (
                                                            <span className="text-[10px] font-normal text-red-500 dark:text-red-400">
                                                                (Past)
                                                            </span>
                                                        )}
                                                        {isTodayString(dateKey) && (
                                                            <span className="text-[10px] font-normal text-emerald-500 dark:text-emerald-400">
                                                                (Today)
                                                            </span>
                                                        )}
                                                    </span>
                                                    <span className={`text-[10px] font-normal ${isPast ? 'text-slate-400 dark:text-slate-500' : 'text-slate-500 dark:text-slate-400'}`}>
                                                        {daySlots.length} slot{daySlots.length !== 1 ? 's' : ''}
                                                    </span>
                                                </h3>
                                                {daySlots.map((slot) => {
                                                    const isSlotTimePast = isTodayString(dateKey) && isPastTimeForToday(dateKey, slot.startTime);

                                                    return (
                                                        <div
                                                            key={slot._id}
                                                            className={`p-4 rounded-xl bg-white dark:bg-slate-900/95 border border-primary-500/10 dark:border-primary-500/20 shadow-card dark:shadow-card-dark transition-all duration-300 ${isSlotTimePast ? 'opacity-75 bg-red-50/30 dark:bg-red-950/20' : ''
                                                                }`}
                                                        >
                                                            <div className="flex items-center justify-between">
                                                                <div className="space-y-0.5">
                                                                    <p className="text-sm font-medium text-slate-900 dark:text-white">
                                                                        {formatTimeDisplay(slot.startTime)} - {formatTimeDisplay(slot.endTime)}
                                                                        {isSlotTimePast && (
                                                                            <span className="ml-2 text-[10px] text-red-500 dark:text-red-400 font-semibold">
                                                                                (Passed)
                                                                            </span>
                                                                        )}
                                                                    </p>
                                                                    {isSlotTimePast ? (
                                                                        <span className="text-xs font-semibold text-red-500 dark:text-red-400">
                                                                            ⏰ Time Passed
                                                                        </span>
                                                                    ) : (
                                                                        <span className={`text-xs font-medium ${slot.isAvailable
                                                                            ? 'text-emerald-600 dark:text-emerald-400'
                                                                            : 'text-red-500 dark:text-red-400'
                                                                            }`}>
                                                                            {slot.isAvailable ? '● Available' : '● Unavailable'}
                                                                        </span>
                                                                    )}
                                                                </div>
                                                                <div className="flex items-center gap-1.5">
                                                                    {!isSlotTimePast && (
                                                                        <button
                                                                            type="button"
                                                                            onClick={() => toggleAvailability(slot._id, slot.isAvailable)}
                                                                            className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${slot.isAvailable
                                                                                ? 'bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/50 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-950/50'
                                                                                : 'bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800/50 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-950/50'
                                                                                }`}
                                                                        >
                                                                            {slot.isAvailable ? 'Available' : 'Unavailable'}
                                                                        </button>
                                                                    )}
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => promptDeleteSlot(slot)}
                                                                        className="p-1.5 text-slate-400 dark:text-slate-500 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg transition-colors"
                                                                        aria-label="Delete slot"
                                                                    >
                                                                        <Trash2 className="w-3.5 h-3.5" />
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        );
                                    })}
                                </div>
                            ) : (
                                <div className="py-12 text-center text-slate-500 dark:text-slate-400 space-y-2">
                                    <Clock className="w-8 h-8 text-slate-400 dark:text-slate-600 mx-auto" />
                                    <p className="text-slate-700 dark:text-slate-300 font-semibold text-sm">No slots created yet</p>
                                    <p className="text-xs">Use the form to add your availability for future dates and times.</p>
                                </div>
                            )}
                        </div>
                    </MotionContainer>
                </div>
            </div>

            {/* Glassmorphism Custom Confirm Modal */}
            <ConfirmModal
                isOpen={deleteModalOpen}
                onClose={() => setDeleteModalOpen(false)}
                onConfirm={handleConfirmDeleteSlot}
                title="Delete Schedule Slot"
                message={
                    slotToDelete ? (
                        <span>
                            Are you sure you want to delete the schedule slot for{' '}
                            <strong className="text-slate-900 dark:text-white">{formatDateDisplay(slotToDelete.date)}</strong> from{' '}
                            <strong className="text-slate-900 dark:text-white">{formatTimeDisplay(slotToDelete.startTime)} to {formatTimeDisplay(slotToDelete.endTime)}</strong>?
                        </span>
                    ) : (
                        'Are you sure you want to delete this schedule slot?'
                    )
                }
                confirmText="Delete Slot"
                loading={deletingSlot}
            />
            {/* Glassmorphism Custom Confirm Modal - Bulk Delete */}
            <ConfirmModal
                isOpen={bulkDeleteModalOpen}
                onClose={() => setBulkDeleteModalOpen(false)}
                onConfirm={handleConfirmBulkDelete}
                title={bulkDeleteType === 'day' ? `Delete All ${targetDayName} Slots` : 'Delete All Schedule Slots'}
                message={
                    bulkDeleteType === 'day' ? (
                        <span>
                            Are you sure you want to delete <strong className="text-slate-900 dark:text-white">ALL slots for Every {targetDayName}</strong>? Slots with existing student appointments will be skipped.
                        </span>
                    ) : (
                        <span>
                            Are you sure you want to <strong className="text-red-600 dark:text-red-400">delete ALL schedule slots</strong>? Active appointments will be preserved.
                        </span>
                    )
                }
                confirmText={bulkDeleteType === 'day' ? `Delete ${targetDayName} Slots` : 'Delete All Slots'}
                loading={bulkDeleting}
            />
        </PageTransition>
    );
};

export default ManageSchedule;