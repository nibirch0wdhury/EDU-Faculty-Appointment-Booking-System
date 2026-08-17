import React, { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-toastify';
import { Plus, Trash2, Clock, Sparkles, Loader2, Calendar as CalendarIcon, RefreshCw, ChevronLeft, ChevronRight } from 'lucide-react';
import api from '../../utils/api';
import MagneticButton from '../ui/MagneticButton';
import SpotlightCard from '../ui/SpotlightCard';
import PageTransition, { MotionContainer } from '../ui/PageTransition';

const isTimeValid = (startTime, endTime) => {
  if (!startTime || !endTime) return false;
  const [startHour, startMinute] = startTime.split(':').map(Number);
  const [endHour, endMinute] = endTime.split(':').map(Number);
  if (isNaN(startHour) || isNaN(startMinute) || isNaN(endHour) || isNaN(endMinute)) return false;
  return (startHour * 60 + startMinute) < (endHour * 60 + endMinute);
};

const getTodayString = () => {
  const today = new Date();
  return today.toISOString().split('T')[0];
};

const getTomorrowString = () => {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  return tomorrow.toISOString().split('T')[0];
};

const formatTimeDisplay = (time) => {
  if (!time) return '';
  const [hours, minutes] = time.split(':').map(Number);
  const ampm = hours >= 12 ? 'PM' : 'AM';
  const hour12 = hours % 12 || 12;
  return `${hour12}:${String(minutes).padStart(2, '0')} ${ampm}`;
};

const formatDateDisplay = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
};

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

const ManageSchedule = () => {
  const [schedule, setSchedule] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [newSlot, setNewSlot] = useState({
    date: getTomorrowString(),
    startTime: '09:00',
    endTime: '10:00',
  });

  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [selectedDate, setSelectedDate] = useState(new Date());

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
    if (currentMonth === 0) { setCurrentMonth(11); setCurrentYear(currentYear - 1); }
    else { setCurrentMonth(currentMonth - 1); }
  };

  const goToNextMonth = () => {
    if (currentMonth === 11) { setCurrentMonth(0); setCurrentYear(currentYear + 1); }
    else { setCurrentMonth(currentMonth + 1); }
  };

  const goToToday = () => {
    const today = new Date();
    setCurrentMonth(today.getMonth());
    setCurrentYear(today.getFullYear());
    const dateStr = today.toISOString().split('T')[0];
    setNewSlot(prev => ({ ...prev, date: dateStr }));
    setSelectedDate(today);
  };

  const clearDate = () => {
    setNewSlot(prev => ({ ...prev, date: '' }));
    setSelectedDate(null);
  };

  const isToday = (date) => {
    const today = new Date();
    return date.getDate() === today.getDate() && 
           date.getMonth() === today.getMonth() && 
           date.getFullYear() === today.getFullYear();
  };

  const isSelected = (date) => {
    if (!selectedDate) return false;
    return date.getDate() === selectedDate.getDate() && 
           date.getMonth() === selectedDate.getMonth() && 
           date.getFullYear() === selectedDate.getFullYear();
  };

  const isPastDate = (date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const checkDate = new Date(date);
    checkDate.setHours(0, 0, 0, 0);
    return checkDate < today;
  };

  const isDateDisabled = (date) => isPastDate(date);

  const handleDateSelect = (day) => {
    const newDate = new Date(currentYear, currentMonth, day);
    if (!isDateDisabled(newDate)) {
      const dateStr = newDate.toISOString().split('T')[0];
      setNewSlot(prev => ({ ...prev, date: dateStr }));
      setSelectedDate(newDate);
    }
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
      const disabled = isDateDisabled(date);
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
            ${disabled ? 'opacity-30 cursor-not-allowed text-slate-400 line-through' : 'hover:scale-105 cursor-pointer'}
            ${selected ? 'bg-primary-500 text-white shadow-md shadow-primary-500/25' : ''}
            ${today && !selected ? 'border-2 border-primary-500/50 text-primary-600' : ''}
            ${!disabled && !selected ? 'hover:bg-primary-50 text-slate-700' : ''}
          `}
        >
          {day}
        </button>
      );
    }

    return daysArray;
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
    if (!isTimeValid(newSlot.startTime, newSlot.endTime)) {
      toast.error('⚠️ End time must be after start time');
      return;
    }
    if (!newSlot.date) {
      toast.error('Please select a date');
      return;
    }

    const [sh, sm] = newSlot.startTime.split(':').map(Number);
    const [eh, em] = newSlot.endTime.split(':').map(Number);
    const duration = (eh * 60 + em) - (sh * 60 + sm);
    if (duration < 30) { toast.error('⚠️ Slot duration must be at least 30 minutes'); return; }
    if (duration > 240) { toast.error('⚠️ Slot duration cannot exceed 4 hours'); return; }

    const duplicate = schedule.some(slot => {
      const slotDate = new Date(slot.date).toISOString().split('T')[0];
      return slotDate === newSlot.date && slot.startTime === newSlot.startTime;
    });
    if (duplicate) { toast.error('⚠️ You already have a slot at this date and time'); return; }

    setSubmitting(true);
    try {
      const response = await api.post('/faculty/schedule', newSlot);
      const slotData = response.data?.data || response.data?.slot || response.data;
      if (slotData && slotData._id) {
        setSchedule(prev => [slotData, ...prev]);
        toast.success('✅ Slot added successfully!');
        setNewSlot({ date: getTomorrowString(), startTime: '09:00', endTime: '10:00' });
        setSelectedDate(new Date(getTomorrowString()));
        setTimeout(() => fetchSchedule(true), 500);
      }
    } catch (error) {
      console.error('Add slot error:', error);
      toast.error(`❌ ${error.response?.data?.message || 'Failed to add slot'}`);
    } finally {
      setSubmitting(false);
    }
  };

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

  const groupedSchedule = schedule.reduce((acc, slot) => {
    if (!slot || !slot.date) return acc;
    const dateKey = new Date(slot.date).toISOString().split('T')[0];
    if (!acc[dateKey]) acc[dateKey] = [];
    acc[dateKey].push(slot);
    return acc;
  }, {});

  const sortedDates = Object.keys(groupedSchedule).sort((a, b) => b.localeCompare(a));

  return (
    <PageTransition className="py-8 md:py-12 bg-slate-50/80 pattern-dots">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <MotionContainer className="space-y-1">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary-50 border border-primary-500/20 text-primary-600 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5 text-primary-500" />
            <span>Faculty Schedule Manager</span>
          </div>
          <h1 className="text-3xl font-display font-bold text-slate-900">Manage Consultation Availability</h1>
          <p className="text-slate-500 text-sm">Set your availability for specific dates</p>
        </MotionContainer>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Add New Slot Form */}
          <MotionContainer delay={0.1}>
            <div className="bg-white rounded-3xl shadow-card border border-primary-500/10 p-6 sm:p-8 space-y-6">
              <div className="absolute top-0 inset-x-0 h-1 bg-primary-500" />
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-display font-bold text-slate-900 flex items-center gap-2">
                  <Plus className="w-5 h-5 text-primary-500" />
                  <span>Add New Time Slot</span>
                </h2>
                <button
                  onClick={handleRefresh}
                  disabled={refreshing}
                  className="p-2 rounded-xl text-slate-400 hover:text-primary-500 hover:bg-primary-50 transition-colors"
                  title="Refresh schedule"
                >
                  <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
                </button>
              </div>

              <form onSubmit={handleAddSlot} className="space-y-5">
                <div>
                  <label className="input-label">
                    <CalendarIcon className="inline-block w-4 h-4 mr-1.5 text-primary-500" />
                    Select Date
                  </label>
                  <div className="bg-white rounded-2xl border border-slate-200 p-4">
                    <div className="flex items-center justify-between mb-3">
                      <button type="button" onClick={goToPreviousMonth} className="p-1.5 rounded-lg hover:bg-primary-50 text-slate-400 hover:text-primary-500 transition-colors">
                        <ChevronLeft className="w-4 h-4" />
                      </button>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-slate-900">{months[currentMonth]} {currentYear}</span>
                      </div>
                      <button type="button" onClick={goToNextMonth} className="p-1.5 rounded-lg hover:bg-primary-50 text-slate-400 hover:text-primary-500 transition-colors">
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="grid grid-cols-7 gap-1 mb-2">
                      {days.map((day) => (
                        <div key={day} className="h-7 flex items-center justify-center text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                          {day}
                        </div>
                      ))}
                    </div>
                    <div className="grid grid-cols-7 gap-1">{renderCalendarDays()}</div>
                    <div className="mt-3 pt-2 border-t border-slate-200 flex items-center justify-between">
                      <button type="button" onClick={clearDate} className="text-[10px] font-medium text-slate-400 hover:text-red-500 transition-colors">
                        Clear
                      </button>
                      <button type="button" onClick={goToToday} className="text-[10px] font-medium px-2 py-0.5 rounded-lg bg-primary-50 border border-primary-500/20 text-primary-600 hover:bg-primary-100 transition-colors">
                        Today
                      </button>
                    </div>
                  </div>
                  {newSlot.date && (
                    <p className="text-xs text-primary-600 mt-2 text-center">Selected: {formatDateDisplay(newSlot.date)}</p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="input-label">Start Time</label>
                    <input type="time" value={newSlot.startTime} onChange={(e) => handleTimeChange('startTime', e.target.value)} className="input-field" required disabled={submitting} step="300" />
                  </div>
                  <div>
                    <label className="input-label">End Time</label>
                    <input type="time" value={newSlot.endTime} onChange={(e) => handleTimeChange('endTime', e.target.value)} className="input-field" required disabled={submitting} step="300" />
                    <p className="text-[10px] text-slate-500 mt-1">
                      Duration: {newSlot.startTime && newSlot.endTime && isTimeValid(newSlot.startTime, newSlot.endTime) ? (
                        <span className="text-emerald-600">{getDurationString(newSlot.startTime, newSlot.endTime)}</span>
                      ) : (
                        <span className="text-red-500">⚠️ Invalid time range</span>
                      )}
                    </p>
                  </div>
                </div>

                <MagneticButton type="submit" variant="primary" className="w-full py-3" disabled={submitting || !isTimeValid(newSlot.startTime, newSlot.endTime) || !newSlot.date}>
                  {submitting ? (
                    <><Loader2 className="w-4 h-4 animate-spin" /><span>Adding Slot...</span></>
                  ) : (
                    <><Plus className="w-4 h-4" /><span>Add Consultation Slot</span></>
                  )}
                </MagneticButton>
              </form>
            </div>
          </MotionContainer>

          {/* Current Schedule */}
          <MotionContainer delay={0.2}>
            <div className="bg-white rounded-3xl shadow-card border border-primary-500/10 p-6 sm:p-8 space-y-6">
              <div className="absolute top-0 inset-x-0 h-1 bg-primary-500" />
              <h2 className="text-xl font-display font-bold text-slate-900 flex items-center gap-2">
                <Clock className="w-5 h-5 text-primary-500" />
                <span>Configured Schedule Slots</span>
                <span className="ml-auto text-xs text-slate-500 font-normal">
                  {schedule.length} slot{schedule.length !== 1 ? 's' : ''}
                </span>
              </h2>

              {loading ? (
                <div className="py-8 text-center text-slate-500 text-sm flex items-center justify-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin text-primary-500" />
                  <span>Loading schedule...</span>
                </div>
              ) : schedule.length > 0 ? (
                <div className="space-y-4 max-h-[450px] overflow-y-auto pr-2 custom-scrollbar">
                  {sortedDates.map(dateKey => {
                    const daySlots = groupedSchedule[dateKey] || [];
                    return (
                      <div key={dateKey} className="space-y-2">
                        <h3 className="text-xs font-bold uppercase tracking-wider text-primary-600 border-b border-primary-500/20 pb-1.5 flex items-center justify-between">
                          <span>{formatDateDisplay(dateKey)}</span>
                          <span className="text-slate-500 font-normal text-[10px]">
                            {daySlots.length} slot{daySlots.length !== 1 ? 's' : ''}
                          </span>
                        </h3>
                        {daySlots.map((slot) => (
                          <SpotlightCard key={slot._id} spotlightColor="rgba(153, 0, 0, 0.06)" className="p-3">
                            <div className="flex items-center justify-between">
                              <div className="space-y-0.5">
                                <p className="text-sm font-medium text-slate-900">
                                  {formatTimeDisplay(slot.startTime)} - {formatTimeDisplay(slot.endTime)}
                                </p>
                                <span className={`text-xs font-medium ${slot.isAvailable ? 'text-emerald-600' : 'text-red-500'}`}>
                                  {slot.isAvailable ? '● Available' : '● Unavailable'}
                                </span>
                              </div>
                              <div className="flex items-center gap-1.5">
                                <button type="button" onClick={() => toggleAvailability(slot._id, slot.isAvailable)} className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${slot.isAvailable ? 'bg-emerald-50 border border-emerald-200 text-emerald-600 hover:bg-emerald-100' : 'bg-red-50 border border-red-200 text-red-600 hover:bg-red-100'}`}>
                                  {slot.isAvailable ? 'Available' : 'Unavailable'}
                                </button>
                                <button type="button" onClick={() => handleDeleteSlot(slot._id)} className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors" aria-label="Delete slot">
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>
                          </SpotlightCard>
                        ))}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="py-12 text-center text-slate-500 space-y-2">
                  <Clock className="w-8 h-8 text-slate-400 mx-auto" />
                  <p className="text-slate-700 font-semibold text-sm">No slots created yet</p>
                  <p className="text-xs">Use the form to add your availability for specific dates.</p>
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