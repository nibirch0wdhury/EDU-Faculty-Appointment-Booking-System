import React, { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-toastify';
import { Plus, Trash2, Clock, Sparkles, Loader2, Calendar as CalendarIcon, RefreshCw, ChevronLeft, ChevronRight } from 'lucide-react';
import api from '../../utils/api';
import MagneticButton from '../ui/MagneticButton';
import SpotlightCard from '../ui/SpotlightCard';
import PageTransition, { MotionContainer } from '../ui/PageTransition';

// ============================================
// UTILITY FUNCTIONS - TIMEZONE SAFE
// ============================================

// Format date to YYYY-MM-DD without timezone shift
const formatDateToLocalString = (date) => {
  if (!date) return '';
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// Parse date string to Date object without timezone shift
const parseLocalDate = (dateString) => {
  if (!dateString) return null;
  const [year, month, day] = dateString.split('-').map(Number);
  return new Date(year, month - 1, day);
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
  if (!time) return '';
  const [hours, minutes] = time.split(':').map(Number);
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
  if (!startTime || !endTime) return false;
  const [startHour, startMinute] = startTime.split(':').map(Number);
  const [endHour, endMinute] = endTime.split(':').map(Number);
  if (isNaN(startHour) || isNaN(startMinute) || isNaN(endHour) || isNaN(endMinute)) return false;
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
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const checkDate = new Date(date);
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
  const today = new Date();
  return date.getDate() === today.getDate() &&
         date.getMonth() === today.getMonth() &&
         date.getFullYear() === today.getFullYear();
};

// Check if a date string is today
const isTodayString = (dateString) => {
  if (!dateString) return false;
  const date = parseLocalDate(dateString);
  if (!date) return false;
  return isToday(date);
};

// ============================================
// ✅ NEW: Check if time is in the past for today
// ============================================
const isPastTimeForToday = (dateString, startTime) => {
  if (!dateString || !startTime) return false;
  
  const date = parseLocalDate(dateString);
  if (!date) return false;
  
  const today = new Date();
  
  // Check if the date is today
  const isTodayDate = date.getDate() === today.getDate() &&
                      date.getMonth() === today.getMonth() &&
                      date.getFullYear() === today.getFullYear();
  
  if (!isTodayDate) return false;
  
  // Parse the start time
  const [hours, minutes] = startTime.split(':').map(Number);
  const slotStartTime = new Date(today);
  slotStartTime.setHours(hours, minutes, 0, 0);
  
  // Check if the slot start time is in the past
  return slotStartTime < today;
};

// ============================================
// MAIN COMPONENT
// ============================================

const ManageSchedule = () => {
  const [schedule, setSchedule] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // New slot form state - defaults to tomorrow
  const [newSlot, setNewSlot] = useState({
    date: getTomorrowString(),
    startTime: '09:00',
    endTime: '10:00',
  });

  // Calendar navigation state
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [selectedDate, setSelectedDate] = useState(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow;
  });

  // Error state for date validation
  const [dateError, setDateError] = useState('');

  const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  const days = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

  // Fetch schedule from backend
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

  // Calendar navigation
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

  // Handle date selection - COMPLETELY BLOCK PAST DATES
  const handleDateSelect = (day) => {
    const newDate = new Date(currentYear, currentMonth, day);
    
    // CHECK: Prevent selecting past dates
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

  // Get calendar days with past dates disabled
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
      
      // CHECK: Disable past dates
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

  // Check if date is selected
  const isSelected = (date) => {
    if (!selectedDate) return false;
    return date.getDate() === selectedDate.getDate() &&
           date.getMonth() === selectedDate.getMonth() &&
           date.getFullYear() === selectedDate.getFullYear();
  };

  // Handle refresh
  const handleRefresh = () => {
    setRefreshing(true);
    fetchSchedule(true);
  };

  // Handle time change
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

  // ============================================
  // ✅ ADD NEW SLOT - WITH PAST DATE & TIME VALIDATION
  // ============================================
  const handleAddSlot = async (e) => {
    e.preventDefault();
    setDateError('');

    // ✅ CHECK 1: Validate date is not in the past
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

    // ✅ CHECK 2: If today, time must be in the future
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

    // ✅ CHECK 3: Validate time
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

    // Check for duplicate slots
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

        // Reset form to tomorrow
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
      
      // Check if error is about past date or time
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

  // Delete slot
  const handleDeleteSlot = async (slotId) => {
    if (!window.confirm('Are you sure you want to delete this slot?')) return;
    try {
      await api.delete(`/faculty/schedule/${slotId}`);
      setSchedule(prev => prev.filter(slot => slot._id !== slotId));
      toast.success('✅ Slot deleted successfully');
      setTimeout(() => fetchSchedule(true), 300);
    } catch (error) {
      toast.error('❌ Failed to delete slot');
    }
  };

  // Toggle availability
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

  // Group schedule by date
  const groupedSchedule = schedule.reduce((acc, slot) => {
    if (!slot || !slot.date) return acc;
    const dateKey = formatDateToLocalString(new Date(slot.date));
    if (!acc[dateKey]) acc[dateKey] = [];
    acc[dateKey].push(slot);
    return acc;
  }, {});

  const sortedDates = Object.keys(groupedSchedule).sort((a, b) => b.localeCompare(a));

  // ============================================
  // ✅ Check states for UI
  // ============================================
  const isSelectedDatePast = newSlot.date && isPastDateString(newSlot.date);
  const isSelectedTimePast = newSlot.date && newSlot.startTime && isPastTimeForToday(newSlot.date, newSlot.startTime);
  const isFormInvalid = isSelectedDatePast || isSelectedTimePast;

  // Get current time for display
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
            Set your availability for specific dates <span className="text-red-500 dark:text-red-400 font-semibold">* Cannot schedule past dates or past times</span>
          </p>
        </MotionContainer>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Add New Slot Form */}
          <MotionContainer delay={0.1}>
            <div className="bg-white dark:bg-slate-900/95 rounded-3xl shadow-card dark:shadow-card-dark border border-primary-500/10 dark:border-primary-500/20 p-6 sm:p-8 space-y-6 transition-all duration-300 relative">
              <div className="absolute top-0 inset-x-0 h-1 bg-primary-500 dark:shadow-[0_0_20px_rgba(153,0,0,0.3)]" />

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

              {/* ⚠️ Past Date/Time Warning Banner */}
              <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/50 text-amber-700 dark:text-amber-400 text-xs flex items-center gap-2">
                <span className="text-lg">⏰</span>
                <span>
                  <strong>Note:</strong> You can only schedule slots for <strong>today</strong> or <strong>future dates</strong> with times that haven't passed yet.
                  <br />
                  <span className="text-[10px] opacity-80">Current time: <strong>{getCurrentTimeStr()}</strong></span>
                </span>
              </div>

              <form onSubmit={handleAddSlot} className="space-y-5">
                {/* Date Picker */}
                <div>
                  <label className="input-label">
                    <CalendarIcon className="inline-block w-4 h-4 mr-1.5 text-primary-500 dark:text-primary-400" />
                    Select Date <span className="text-red-500">*</span>
                  </label>
                  <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 p-4">
                    {/* Calendar Header */}
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

                    {/* Day Headers */}
                    <div className="grid grid-cols-7 gap-1 mb-2">
                      {days.map((day) => (
                        <div key={day} className="h-7 flex items-center justify-center text-[10px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                          {day}
                        </div>
                      ))}
                    </div>

                    {/* Calendar Days */}
                    <div className="grid grid-cols-7 gap-1">{renderCalendarDays()}</div>

                    {/* Calendar Footer */}
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

                  {/* Selected Date Display */}
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
                        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                          isPastTimeForToday(newSlot.date, newSlot.startTime)
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

                  {/* Date Error Message */}
                  {dateError && (
                    <p className="mt-2 text-xs text-red-600 dark:text-red-400 flex items-center gap-1.5">
                      <span className="text-lg">❌</span>
                      {dateError}
                    </p>
                  )}
                </div>

                {/* Time Inputs */}
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

                {/* ✅ Submit Button - DISABLED FOR PAST DATES & TIMES */}
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

                {/* Disabled reason helper */}
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
            </div>
          </MotionContainer>

          {/* Current Schedule */}
          <MotionContainer delay={0.2}>
            <div className="bg-white dark:bg-slate-900/95 rounded-3xl shadow-card dark:shadow-card-dark border border-primary-500/10 dark:border-primary-500/20 p-6 sm:p-8 space-y-6 transition-all duration-300 relative">
              <div className="absolute top-0 inset-x-0 h-1 bg-primary-500 dark:shadow-[0_0_20px_rgba(153,0,0,0.3)]" />

              <h2 className="text-xl font-display font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Clock className="w-5 h-5 text-primary-500 dark:text-primary-400" />
                <span>Configured Schedule Slots</span>
                <span className="ml-auto text-xs text-slate-500 dark:text-slate-400 font-normal">
                  {schedule.length} slot{schedule.length !== 1 ? 's' : ''}
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
                        <h3 className={`text-xs font-bold uppercase tracking-wider border-b pb-1.5 flex items-center justify-between ${
                          isPast 
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
                          // Check if this specific slot time has passed (if today)
                          const isSlotTimePast = isTodayString(dateKey) && isPastTimeForToday(dateKey, slot.startTime);
                          return (
                            <SpotlightCard key={slot._id} spotlightColor="rgba(153, 0, 0, 0.08)" className={`p-3 bg-white dark:bg-slate-900/95 border-primary-500/10 dark:border-primary-500/20 shadow-card dark:shadow-card-dark transition-all duration-300 ${
                              isSlotTimePast ? 'opacity-50' : ''
                            }`}>
                              <div className="flex items-center justify-between">
                                <div className="space-y-0.5">
                                  <p className="text-sm font-medium text-slate-900 dark:text-white">
                                    {formatTimeDisplay(slot.startTime)} - {formatTimeDisplay(slot.endTime)}
                                    {isSlotTimePast && (
                                      <span className="ml-2 text-[10px] text-red-500 dark:text-red-400 font-medium">
                                        (Passed)
                                      </span>
                                    )}
                                  </p>
                                  <span className={`text-xs font-medium ${
                                    slot.isAvailable 
                                      ? 'text-emerald-600 dark:text-emerald-400' 
                                      : 'text-red-500 dark:text-red-400'
                                  }`}>
                                    {slot.isAvailable ? '● Available' : '● Unavailable'}
                                  </span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                  <button
                                    type="button"
                                    onClick={() => toggleAvailability(slot._id, slot.isAvailable)}
                                    className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                                      slot.isAvailable
                                        ? 'bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/50 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-950/50'
                                        : 'bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800/50 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-950/50'
                                    }`}
                                  >
                                    {slot.isAvailable ? 'Available' : 'Unavailable'}
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleDeleteSlot(slot._id)}
                                    className="p-1.5 text-slate-400 dark:text-slate-500 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg transition-colors"
                                    aria-label="Delete slot"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </div>
                            </SpotlightCard>
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
    </PageTransition>
  );
};

export default ManageSchedule;