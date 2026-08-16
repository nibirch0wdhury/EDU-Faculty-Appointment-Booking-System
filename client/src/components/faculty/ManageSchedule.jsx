import React, { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-toastify';
import { Plus, Trash2, Clock, Sparkles, Loader2, Calendar as CalendarIcon, RefreshCw, ChevronLeft, ChevronRight } from 'lucide-react';
import api from '../../utils/api';
import MagneticButton from '../ui/MagneticButton';
import SpotlightCard from '../ui/SpotlightCard';
import PageTransition, { MotionContainer } from '../ui/PageTransition';

// Helper function to compare time strings (HH:MM)
const isTimeValid = (startTime, endTime) => {
  if (!startTime || !endTime) return false;
  
  const [startHour, startMinute] = startTime.split(':').map(Number);
  const [endHour, endMinute] = endTime.split(':').map(Number);
  
  if (isNaN(startHour) || isNaN(startMinute) || isNaN(endHour) || isNaN(endMinute)) {
    return false;
  }
  
  const startMinutes = startHour * 60 + startMinute;
  const endMinutes = endHour * 60 + endMinute;
  
  return startMinutes < endMinutes;
};

// Helper to get today's date in YYYY-MM-DD format
const getTodayString = () => {
  const today = new Date();
  return today.toISOString().split('T')[0];
};

// Helper to get tomorrow's date in YYYY-MM-DD format
const getTomorrowString = () => {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  return tomorrow.toISOString().split('T')[0];
};

// Helper to format time for display (HH:MM -> 12-hour format)
const formatTimeDisplay = (time) => {
  if (!time) return '';
  const [hours, minutes] = time.split(':').map(Number);
  const ampm = hours >= 12 ? 'PM' : 'AM';
  const hour12 = hours % 12 || 12;
  return `${hour12}:${String(minutes).padStart(2, '0')} ${ampm}`;
};

// Helper to format date for display
const formatDateDisplay = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
};

// Helper to calculate duration string
const getDurationString = (startTime, endTime) => {
  if (!startTime || !endTime || !isTimeValid(startTime, endTime)) return null;
  
  const [startHour, startMinute] = startTime.split(':').map(Number);
  const [endHour, endMinute] = endTime.split(':').map(Number);
  
  const startMinutes = startHour * 60 + startMinute;
  const endMinutes = endHour * 60 + endMinute;
  const diff = endMinutes - startMinutes;
  
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

  // Calendar state
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [selectedDate, setSelectedDate] = useState(new Date());

  const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  const days = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

  // Fetch schedule from API
  const fetchSchedule = useCallback(async (showToast = false) => {
    try {
      setLoading(true);
      console.log('📋 Fetching schedule...');
      const response = await api.get('/faculty/my-schedule');
      console.log('✅ Schedule fetched:', response.data);
      
      const scheduleData = Array.isArray(response.data) 
        ? response.data 
        : response.data?.data || [];
      
      setSchedule(scheduleData);
      console.log(`📋 Set ${scheduleData.length} slots in state`);
      
      if (showToast) {
        toast.success(`Loaded ${scheduleData.length} schedule slots`);
      }
    } catch (error) {
      console.error('❌ Error fetching schedule:', error);
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

  // Calendar functions
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

  const isDateDisabled = (date) => {
    return isPastDate(date);
  };

  const handleDateSelect = (day) => {
    const newDate = new Date(currentYear, currentMonth, day);
    if (!isDateDisabled(newDate)) {
      const dateStr = newDate.toISOString().split('T')[0];
      setNewSlot(prev => ({ ...prev, date: dateStr }));
      setSelectedDate(newDate);
    }
  };

  const getDaysInMonth = () => {
    return new Date(currentYear, currentMonth + 1, 0).getDate();
  };

  const getFirstDayOfMonth = () => {
    return new Date(currentYear, currentMonth, 1).getDay();
  };

  const renderCalendarDays = () => {
    const daysInMonth = getDaysInMonth();
    const firstDay = getFirstDayOfMonth();
    const daysArray = [];

    // Empty cells
    for (let i = 0; i < firstDay; i++) {
      daysArray.push(<div key={`empty-${i}`} className="h-9 w-9"></div>);
    }

    // Actual days
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
            ${disabled ? 'opacity-30 cursor-not-allowed text-slate-500 line-through' : 'hover:scale-105 cursor-pointer'}
            ${selected ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-500/30 border border-indigo-400/30' : ''}
            ${today && !selected ? 'border-2 border-indigo-500/50 text-indigo-300' : ''}
            ${!disabled && !selected ? 'hover:bg-slate-700/50 text-slate-200 hover:border-indigo-500/30' : ''}
          `}
        >
          {day}
        </button>
      );
    }

    return daysArray;
  };

  // Handle refresh
  const handleRefresh = () => {
    setRefreshing(true);
    fetchSchedule(true);
  };

  // Handle time input change with validation
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
    
    console.log('📝 Adding slot with data:', newSlot);
    
    if (!isTimeValid(newSlot.startTime, newSlot.endTime)) {
      toast.error('⚠️ End time must be after start time');
      return;
    }

    if (!newSlot.date) {
      toast.error('Please select a date');
      return;
    }

    const [startHour, startMinute] = newSlot.startTime.split(':').map(Number);
    const [endHour, endMinute] = newSlot.endTime.split(':').map(Number);
    const startMinutes = startHour * 60 + startMinute;
    const endMinutes = endHour * 60 + endMinute;
    const durationMinutes = endMinutes - startMinutes;
    
    if (durationMinutes < 30) {
      toast.error('⚠️ Slot duration must be at least 30 minutes');
      return;
    }

    if (durationMinutes > 240) {
      toast.error('⚠️ Slot duration cannot exceed 4 hours');
      return;
    }

    const duplicate = schedule.some(slot => {
      const slotDate = new Date(slot.date).toISOString().split('T')[0];
      return slotDate === newSlot.date && slot.startTime === newSlot.startTime;
    });
    
    if (duplicate) {
      toast.error('⚠️ You already have a slot at this date and time');
      return;
    }

    setSubmitting(true);
    try {
      const response = await api.post('/faculty/schedule', newSlot);
      console.log('✅ API Response:', response.data);
      
      const slotData = response.data?.data || response.data?.slot || response.data;
      
      if (slotData && slotData._id) {
        setSchedule(prev => [slotData, ...prev]);
        toast.success('✅ Slot added successfully!');
        
        setNewSlot({
          date: getTomorrowString(),
          startTime: '09:00',
          endTime: '10:00',
        });
        setSelectedDate(new Date(getTomorrowString()));
        
        setTimeout(() => {
          fetchSchedule(true);
        }, 500);
      } else {
        console.error('Invalid response format:', response.data);
        toast.error('Failed to add slot - invalid response');
      }
    } catch (error) {
      console.error('❌ Add slot error:', error);
      const message = error.response?.data?.message || 'Failed to add slot';
      toast.error(`❌ ${message}`);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteSlot = async (slotId) => {
    if (!window.confirm('Are you sure you want to delete this slot?')) return;

    try {
      console.log('🗑️ Deleting slot:', slotId);
      await api.delete(`/faculty/schedule/${slotId}`);
      setSchedule(prev => prev.filter(slot => slot._id !== slotId));
      toast.success('✅ Slot deleted successfully');
      
      setTimeout(() => {
        fetchSchedule(true);
      }, 300);
    } catch (error) {
      console.error('❌ Delete error:', error);
      toast.error('❌ Failed to delete slot');
    }
  };

  const toggleAvailability = async (slotId, currentStatus) => {
    try {
      console.log(`🔄 Toggling slot ${slotId} from ${currentStatus}`);
      const response = await api.put(`/faculty/schedule/${slotId}/toggle`);
      
      const updatedSlot = response.data?.data || response.data?.slot || response.data;
      
      setSchedule(prev =>
        prev.map(slot =>
          slot._id === slotId
            ? { ...slot, isAvailable: updatedSlot?.isAvailable ?? !currentStatus }
            : slot
        )
      );
      toast.success(`✅ Slot ${!currentStatus ? 'available' : 'unavailable'} successfully`);
    } catch (error) {
      console.error('❌ Toggle error:', error);
      toast.error('❌ Failed to update availability');
    }
  };

  // Group schedule by date
  const groupedSchedule = schedule.reduce((acc, slot) => {
    if (!slot || !slot.date) return acc;
    const dateKey = new Date(slot.date).toISOString().split('T')[0];
    if (!acc[dateKey]) {
      acc[dateKey] = [];
    }
    acc[dateKey].push(slot);
    return acc;
  }, {});

  const sortedDates = Object.keys(groupedSchedule).sort((a, b) => b.localeCompare(a));

  return (
    <PageTransition className="py-8 md:py-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
      <MotionContainer className="space-y-1">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-xs font-semibold">
          <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
          <span>Faculty Schedule Manager</span>
        </div>
        <h1 className="text-3xl font-extrabold text-white">Manage Consultation Availability</h1>
        <p className="text-slate-400 text-sm">Set your availability for specific dates</p>
      </MotionContainer>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Add New Slot Form */}
        <MotionContainer delay={0.1}>
          <div className="glass-panel p-6 sm:p-8 space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <Plus className="w-5 h-5 text-indigo-400" />
                <span>Add New Time Slot</span>
              </h2>
              <button
                onClick={handleRefresh}
                disabled={refreshing}
                className="p-2 rounded-xl text-slate-400 hover:text-indigo-400 hover:bg-indigo-500/10 transition-colors"
                title="Refresh schedule"
              >
                <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
              </button>
            </div>

            <form onSubmit={handleAddSlot} className="space-y-5">
              {/* Date Selection with Themed Calendar */}
              <div>
                <label className="block text-sm font-semibold text-slate-200 mb-1.5">
                  <CalendarIcon className="inline-block w-4 h-4 mr-1.5 text-indigo-400" />
                  Select Date
                </label>
                
                {/* Themed Calendar */}
                <div className="glass-panel p-4 rounded-2xl bg-slate-900/60 border border-slate-700/60">
                  {/* Calendar Header */}
                  <div className="flex items-center justify-between mb-3">
                    <button
                      type="button"
                      onClick={goToPreviousMonth}
                      className="p-1.5 rounded-lg hover:bg-slate-700/50 text-slate-400 hover:text-white transition-colors"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-white">
                        {months[currentMonth]} {currentYear}
                      </span>
                    </div>
                    
                    <button
                      type="button"
                      onClick={goToNextMonth}
                      className="p-1.5 rounded-lg hover:bg-slate-700/50 text-slate-400 hover:text-white transition-colors"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Day Headers */}
                  <div className="grid grid-cols-7 gap-1 mb-2">
                    {days.map((day) => (
                      <div key={day} className="h-7 flex items-center justify-center text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                        {day}
                      </div>
                    ))}
                  </div>

                  {/* Calendar Grid */}
                  <div className="grid grid-cols-7 gap-1">
                    {renderCalendarDays()}
                  </div>

                  {/* Calendar Footer */}
                  <div className="mt-3 pt-2 border-t border-slate-700/50 flex items-center justify-between">
                    <button
                      type="button"
                      onClick={clearDate}
                      className="text-[10px] font-medium text-slate-400 hover:text-rose-400 transition-colors"
                    >
                      Clear
                    </button>
                    <button
                      type="button"
                      onClick={goToToday}
                      className="text-[10px] font-medium px-2 py-0.5 rounded-lg bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 hover:bg-indigo-500/30 transition-colors"
                    >
                      Today
                    </button>
                  </div>
                </div>

                {/* Selected Date Display */}
                {newSlot.date && (
                  <p className="text-xs text-indigo-300 mt-2 text-center">
                    Selected: {formatDateDisplay(newSlot.date)}
                  </p>
                )}
              </div>

              {/* Time Selection */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-200 mb-1.5">Start Time</label>
                  <input
                    type="time"
                    value={newSlot.startTime}
                    onChange={(e) => handleTimeChange('startTime', e.target.value)}
                    className="glass-input"
                    required
                    disabled={submitting}
                    step="300"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-200 mb-1.5">End Time</label>
                  <input
                    type="time"
                    value={newSlot.endTime}
                    onChange={(e) => handleTimeChange('endTime', e.target.value)}
                    className="glass-input"
                    required
                    disabled={submitting}
                    step="300"
                  />
                  <p className="text-[10px] text-slate-400 mt-1">
                    Duration: {newSlot.startTime && newSlot.endTime && isTimeValid(newSlot.startTime, newSlot.endTime) ? (
                      <span className="text-emerald-400">
                        {getDurationString(newSlot.startTime, newSlot.endTime)}
                      </span>
                    ) : (
                      <span className="text-rose-400">⚠️ Invalid time range</span>
                    )}
                  </p>
                </div>
              </div>

              <MagneticButton 
                type="submit" 
                variant="primary" 
                className="w-full py-3"
                disabled={submitting || !isTimeValid(newSlot.startTime, newSlot.endTime) || !newSlot.date}
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Adding Slot...</span>
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4" />
                    <span>Add Consultation Slot</span>
                  </>
                )}
              </MagneticButton>
            </form>
          </div>
        </MotionContainer>

        {/* Current Schedule */}
        <MotionContainer delay={0.2}>
          <div className="glass-panel p-6 sm:p-8 space-y-6">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Clock className="w-5 h-5 text-emerald-400" />
              <span>Configured Schedule Slots</span>
              <span className="ml-auto text-xs text-slate-400 font-normal">
                {schedule.length} slot{schedule.length !== 1 ? 's' : ''}
              </span>
            </h2>

            {loading ? (
              <div className="py-8 text-center text-slate-400 text-sm flex items-center justify-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Loading schedule...</span>
              </div>
            ) : schedule.length > 0 ? (
              <div className="space-y-4 max-h-[450px] overflow-y-auto pr-2 custom-scrollbar">
                {sortedDates.map(dateKey => {
                  const daySlots = groupedSchedule[dateKey] || [];
                  return (
                    <div key={dateKey} className="space-y-2">
                      <h3 className="text-xs font-bold uppercase tracking-wider text-indigo-300 border-b border-indigo-500/30 pb-1.5 flex items-center justify-between">
                        <span>{formatDateDisplay(dateKey)}</span>
                        <span className="text-slate-400 font-normal text-[10px]">
                          {daySlots.length} slot{daySlots.length !== 1 ? 's' : ''}
                        </span>
                      </h3>
                      {daySlots.map((slot) => (
                        <SpotlightCard key={slot._id} spotlightColor="rgba(99, 102, 241, 0.15)" className="p-3">
                          <div className="flex items-center justify-between">
                            <div className="space-y-0.5">
                              <p className="text-sm font-medium text-white">
                                {formatTimeDisplay(slot.startTime)} - {formatTimeDisplay(slot.endTime)}
                              </p>
                              <span className={`text-xs font-medium ${slot.isAvailable ? 'text-emerald-400' : 'text-rose-400'}`}>
                                {slot.isAvailable ? '● Available' : '● Unavailable'}
                              </span>
                            </div>

                            <div className="flex items-center gap-1.5">
                              <button
                                type="button"
                                onClick={() => toggleAvailability(slot._id, slot.isAvailable)}
                                className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                                  slot.isAvailable
                                    ? 'bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/25'
                                    : 'bg-rose-500/15 border border-rose-500/30 text-rose-300 hover:bg-rose-500/25'
                                }`}
                              >
                                {slot.isAvailable ? 'Available' : 'Unavailable'}
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDeleteSlot(slot._id)}
                                className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors"
                                aria-label="Delete slot"
                              >
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
              <div className="py-12 text-center text-slate-400 space-y-2">
                <Clock className="w-8 h-8 text-slate-600 mx-auto" />
                <p className="text-slate-300 font-semibold text-sm">No slots created yet</p>
                <p className="text-xs">Use the form to add your availability for specific dates.</p>
              </div>
            )}
          </div>
        </MotionContainer>
      </div>

      {/* Custom Scrollbar Styles */}
      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #4f46e5;
          border-radius: 9999px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #6366f1;
        }
      `}</style>
    </PageTransition>
  );
};

export default ManageSchedule;