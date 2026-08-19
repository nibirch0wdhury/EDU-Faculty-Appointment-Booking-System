import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar as CalendarIcon, Clock, User, MapPin, FileText, Sparkles, Send, Loader2, AlertCircle, ChevronLeft, ChevronRight } from 'lucide-react';
import { toast } from 'react-toastify';
import api from '../../utils/api';
import MagneticButton from '../ui/MagneticButton';
import SpotlightCard from '../ui/SpotlightCard';
import PageTransition, { MotionContainer } from '../ui/PageTransition';

const BookAppointment = () => {
  const navigate = useNavigate();
  const [faculties, setFaculties] = useState([]);
  const [selectedFaculty, setSelectedFaculty] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedTime, setSelectedTime] = useState('');
  const [purpose, setPurpose] = useState('');
  const [availableSlots, setAvailableSlots] = useState([]);
  const [loading, setLoading] = useState(false);
  const [facultyDetails, setFacultyDetails] = useState(null);
  const [fetchingSlots, setFetchingSlots] = useState(false);
  const [facultiesLoading, setFacultiesLoading] = useState(true);
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());

  const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  const days = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

  useEffect(() => { fetchFaculties(); }, []);
  useEffect(() => {
    if (selectedFaculty && selectedDate) {
      fetchAvailableSlots();
    }
  }, [selectedFaculty, selectedDate]);

  const fetchFaculties = async () => {
    try {
      setFacultiesLoading(true);
      const response = await api.get('/faculty/all');
      const facultiesData = Array.isArray(response.data) ? response.data : response.data?.data || [];
      setFaculties(facultiesData);
    } catch (error) {
      console.error('Error fetching faculties:', error);
      toast.error('Failed to load faculty list');
    } finally {
      setFacultiesLoading(false);
    }
  };

  const fetchAvailableSlots = async () => {
    if (!selectedFaculty) return;
    setFetchingSlots(true);
    setAvailableSlots([]);
    setSelectedTime('');
    try {
      const response = await api.get(`/faculty/${selectedFaculty}/slots`, {
        params: { date: selectedDate.toISOString() }
      });
      const slotsData = Array.isArray(response.data) ? response.data : response.data?.data || [];
      
      // ============================================
      // ✅ FRONTEND FILTER: Double-check past times
      // ============================================
      const now = new Date();
      const isToday = selectedDate.getDate() === now.getDate() &&
                      selectedDate.getMonth() === now.getMonth() &&
                      selectedDate.getFullYear() === now.getFullYear();
      
      let filteredSlots = slotsData;
      
      if (isToday) {
        const currentTimeMinutes = now.getHours() * 60 + now.getMinutes();
        filteredSlots = slotsData.filter(slot => {
          const [hours, minutes] = slot.startTime.split(':').map(Number);
          const slotTimeMinutes = hours * 60 + minutes;
          // Only show slots that start at least 30 minutes from now
          return slotTimeMinutes > currentTimeMinutes + 30;
        });
        
        if (filteredSlots.length < slotsData.length) {
          console.log(`🔍 Filtered out ${slotsData.length - filteredSlots.length} past slots for today`);
        }
      }
      
      setAvailableSlots(filteredSlots);
    } catch (error) {
      console.error('Error fetching slots:', error);
      setAvailableSlots([]);
    } finally {
      setFetchingSlots(false);
    }
  };

  const handleFacultySelect = async (e) => {
    const facultyId = e.target.value;
    setSelectedFaculty(facultyId);
    setSelectedTime('');
    setAvailableSlots([]);
    setFacultyDetails(null);
    if (facultyId) {
      try {
        const response = await api.get(`/faculty/${facultyId}`);
        const facultyData = response.data?.data || response.data;
        setFacultyDetails(facultyData);
      } catch (error) {
        const faculty = faculties.find(f => f._id === facultyId);
        if (faculty) setFacultyDetails(faculty);
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedFaculty) { toast.error('Please select a faculty member'); return; }
    if (!selectedTime) { toast.error('Please select a time slot'); return; }
    if (!purpose?.trim()) { toast.error('Please enter the purpose of the meeting'); return; }

    setLoading(true);
    try {
      await api.post('/appointments/book', {
        facultyId: selectedFaculty,
        date: selectedDate.toISOString(),
        startTime: selectedTime,
        purpose: purpose.trim(),
      });
      toast.success('🎉 Appointment booked successfully!');
      setTimeout(() => navigate('/student/my-appointments'), 1500);
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to book appointment';
      toast.error(`❌ ${message}`);
    } finally {
      setLoading(false);
    }
  };

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
    setSelectedDate(today);
  };

  const isToday = (date) => {
    const today = new Date();
    return date.getDate() === today.getDate() && date.getMonth() === today.getMonth() && date.getFullYear() === today.getFullYear();
  };

  const isSelected = (date) => {
    return date.getDate() === selectedDate.getDate() && date.getMonth() === selectedDate.getMonth() && date.getFullYear() === selectedDate.getFullYear();
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
    if (!isDateDisabled(newDate)) setSelectedDate(newDate);
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

  const formatTimeDisplay = (time) => {
    if (!time) return '';
    const [hours, minutes] = time.split(':').map(Number);
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const hour12 = hours % 12 || 12;
    return `${hour12}:${String(minutes).padStart(2, '0')} ${ampm}`;
  };

  const formatDateDisplay = (date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  // ============================================
  // ✅ Check if a slot time is in the past for today
  // ============================================
  const isSlotTimePast = (startTime) => {
    const now = new Date();
    const isTodayDate = selectedDate.getDate() === now.getDate() &&
                        selectedDate.getMonth() === now.getMonth() &&
                        selectedDate.getFullYear() === now.getFullYear();
    
    if (!isTodayDate) return false;
    
    const [hours, minutes] = startTime.split(':').map(Number);
    const slotTimeMinutes = hours * 60 + minutes;
    const currentTimeMinutes = now.getHours() * 60 + now.getMinutes();
    
    // Consider a slot "past" if it starts in less than 30 minutes from now
    return slotTimeMinutes <= currentTimeMinutes + 30;
  };

  // ============================================
  // ✅ Get current time for display
  // ============================================
  const getCurrentTimeStr = () => {
    const now = new Date();
    return now.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  return (
    <PageTransition className="py-8 md:py-12 bg-slate-50/80 dark:bg-slate-950/80 pattern-dots">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <MotionContainer className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary-50 dark:bg-primary-950/30 border border-primary-500/20 dark:border-primary-500/30 text-primary-600 dark:text-primary-400 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5 text-primary-500 dark:text-primary-400" />
            <span>New Consultation Slot</span>
          </div>
          <h1 className="text-3xl font-display font-bold text-slate-900 dark:text-white">Book an Appointment</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm">
            Select your faculty member, preferred date & time slot below.
            <span className="text-red-500 dark:text-red-400 font-semibold ml-2">
              * Past times for today are automatically hidden
            </span>
          </p>
        </MotionContainer>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <MotionContainer delay={0.1} className="lg:col-span-2">
            <div className="bg-white dark:bg-slate-900/95 rounded-3xl shadow-card dark:shadow-card-dark border border-primary-500/10 dark:border-primary-500/20 p-6 sm:p-8 transition-all duration-300 relative">
              <div className="absolute top-0 inset-x-0 h-1 bg-primary-500 dark:shadow-[0_0_20px_rgba(153,0,0,0.3)]" />
              
              {/* ⏰ Current Time Display */}
              <div className="mb-4 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 text-xs text-slate-500 dark:text-slate-400 flex items-center justify-between">
                <span>🕐 Current Time: <strong>{getCurrentTimeStr()}</strong></span>
                <span className="text-emerald-600 dark:text-emerald-400">✅ Only showing available future slots</span>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Faculty Selection */}
                <div>
                  <label className="input-label">
                    <User className="inline-block w-4 h-4 mr-2 text-primary-500 dark:text-primary-400" />
                    Select Faculty Member <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={selectedFaculty}
                    onChange={handleFacultySelect}
                    className="input-field bg-white dark:bg-slate-900"
                    required
                    disabled={facultiesLoading}
                  >
                    <option value="" className="text-slate-400 dark:text-slate-500">
                      {facultiesLoading ? 'Loading faculties...' : 'Choose a faculty member...'}
                    </option>
                    {faculties.map((faculty) => (
                      <option key={faculty._id} value={faculty._id}>
                        {faculty.name} - {faculty.department || 'N/A'}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Faculty Details */}
                {facultyDetails && (
                  <div className="p-4 rounded-xl bg-primary-50 dark:bg-primary-950/30 border border-primary-500/20 dark:border-primary-500/30 space-y-1">
                    <h3 className="font-bold text-sm text-primary-700 dark:text-primary-400">Faculty Details</h3>
                    <div className="text-xs text-slate-600 dark:text-slate-400 space-y-1">
                      <p><MapPin className="inline-block w-3.5 h-3.5 mr-1 text-primary-500 dark:text-primary-400" /> Office: {facultyDetails.officeRoom || 'N/A'}</p>
                      <p>Department: {facultyDetails.department || 'N/A'}</p>
                      <p>Designation: {facultyDetails.designation || 'Faculty Member'}</p>
                    </div>
                  </div>
                )}

                {/* Date & Time */}
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="input-label">
                      <CalendarIcon className="inline-block w-4 h-4 mr-2 text-primary-500 dark:text-primary-400" />
                      Select Date <span className="text-red-500">*</span>
                    </label>
                    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 p-4">
                      <div className="flex items-center justify-between mb-3">
                        <button type="button" onClick={goToPreviousMonth} className="p-1.5 rounded-lg hover:bg-primary-50 dark:hover:bg-primary-950/30 text-slate-400 dark:text-slate-500 hover:text-primary-500 dark:hover:text-primary-400 transition-colors">
                          <ChevronLeft className="w-4 h-4" />
                        </button>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold text-slate-900 dark:text-white">{months[currentMonth]} {currentYear}</span>
                          <button type="button" onClick={goToToday} className="text-[10px] font-medium px-2 py-0.5 rounded-lg bg-primary-50 dark:bg-primary-950/30 border border-primary-500/20 dark:border-primary-500/30 text-primary-600 dark:text-primary-400 hover:bg-primary-100 dark:hover:bg-primary-950/50 transition-colors">
                            Today
                          </button>
                        </div>
                        <button type="button" onClick={goToNextMonth} className="p-1.5 rounded-lg hover:bg-primary-50 dark:hover:bg-primary-950/30 text-slate-400 dark:text-slate-500 hover:text-primary-500 dark:hover:text-primary-400 transition-colors">
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
                        <span className="text-xs text-slate-500 dark:text-slate-400">Selected:</span>
                        <span className="text-xs font-semibold text-primary-600 dark:text-primary-400">{formatDateDisplay(selectedDate)}</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="input-label">
                      <Clock className="inline-block w-4 h-4 mr-2 text-primary-500 dark:text-primary-400" />
                      Available Time Slots <span className="text-red-500">*</span>
                    </label>
                    
                    {!fetchingSlots && selectedFaculty && (
                      <div className="mb-3">
                        {availableSlots.length === 0 ? (
                          <div className="p-3 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/50 rounded-xl text-amber-600 dark:text-amber-400 text-xs text-center flex items-center justify-center gap-2">
                            <AlertCircle className="w-4 h-4 inline-block" />
                            {isToday(selectedDate) ? (
                              <span>No available slots for today. Please select a future date or time.</span>
                            ) : (
                              <span>No available slots for this date. Please select another date.</span>
                            )}
                          </div>
                        ) : (
                          <div className="p-2 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/50 rounded-xl text-emerald-600 dark:text-emerald-400 text-xs text-center">
                            ✅ {availableSlots.length} slot{availableSlots.length !== 1 ? 's' : ''} available
                            {isToday(selectedDate) && (
                              <span className="block text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
                                * Past times for today are hidden
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    )}
                    
                    {fetchingSlots ? (
                      <div className="py-8 text-center text-xs text-slate-500 dark:text-slate-400">
                        <Loader2 className="w-5 h-5 animate-spin mx-auto mb-2 text-primary-500 dark:text-primary-400" />
                        Loading available slots...
                      </div>
                    ) : availableSlots.length > 0 ? (
                      <div className="grid grid-cols-2 gap-2 max-h-[250px] overflow-y-auto pr-1 custom-scrollbar">
                        {availableSlots.map((slot, index) => {
                          // ✅ Check if this slot time is past for today
                          const isPastTime = isSlotTimePast(slot.startTime);
                          return (
                            <button
                              key={index}
                              type="button"
                              onClick={() => {
                                if (!isPastTime) {
                                  setSelectedTime(slot.startTime);
                                }
                              }}
                              disabled={isPastTime}
                              className={`p-2.5 rounded-xl text-xs font-semibold border transition-all duration-200 ${
                                isPastTime ? (
                                  'opacity-40 cursor-not-allowed bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-400 dark:text-slate-500 line-through'
                                ) : selectedTime === slot.startTime ? (
                                  'bg-primary-500 border-primary-500 text-white shadow-md shadow-primary-500/25 dark:shadow-primary-500/50 scale-[1.02]'
                                ) : (
                                  'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-primary-500 dark:hover:border-primary-500 hover:bg-primary-50 dark:hover:bg-primary-950/30'
                                )
                              }`}
                            >
                              {formatTimeDisplay(slot.startTime)} - {formatTimeDisplay(slot.endTime)}
                              {isPastTime && (
                                <span className="block text-[8px] text-red-500 dark:text-red-400">(Passed)</span>
                              )}
                            </button>
                          );
                        })}
                      </div>
                    ) : selectedFaculty ? (
                      <div className="py-8 text-center text-slate-500 dark:text-slate-400 text-sm">
                        <Clock className="w-8 h-8 text-slate-400 dark:text-slate-600 mx-auto mb-2" />
                        {isToday(selectedDate) ? (
                          <>
                            <p>No available slots for today.</p>
                            <p className="text-xs text-amber-600 dark:text-amber-400 mt-1">
                              All slots have either passed or been booked for today.
                              <br />Please select a future date.
                            </p>
                          </>
                        ) : (
                          <>
                            <p>No available slots for this date.</p>
                            <p className="text-xs text-amber-600 dark:text-amber-400 mt-1">Please select another date.</p>
                          </>
                        )}
                      </div>
                    ) : (
                      <div className="py-8 text-center text-slate-500 dark:text-slate-400 text-sm">
                        <User className="w-8 h-8 text-slate-400 dark:text-slate-600 mx-auto mb-2" />
                        <p>Select a faculty to see available slots</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Purpose */}
                <div>
                  <label className="input-label">
                    <FileText className="inline-block w-4 h-4 mr-2 text-primary-500 dark:text-primary-400" />
                    Purpose of Meeting <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    value={purpose}
                    onChange={(e) => setPurpose(e.target.value)}
                    className="input-field"
                    rows="3"
                    placeholder="Briefly explain what you wish to discuss during consultation..."
                    required
                  />
                </div>

                <MagneticButton
                  type="submit"
                  disabled={loading || !selectedFaculty || !selectedTime || availableSlots.length === 0}
                  variant="primary"
                  className="w-full py-3.5 shadow-lg shadow-primary-500/25 dark:shadow-primary-500/50 hover:shadow-primary-500/40 dark:hover:shadow-primary-500/70"
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>Booking Appointment...</span>
                    </span>
                  ) : (
                    <span className="flex items-center justify-center gap-2">
                      <Send className="w-4 h-4" />
                      <span>Confirm & Book Appointment</span>
                    </span>
                  )}
                </MagneticButton>
              </form>
            </div>
          </MotionContainer>

          {/* Sidebar */}
          <MotionContainer delay={0.2} className="space-y-6">
            <SpotlightCard spotlightColor="rgba(153, 0, 0, 0.08)" className="p-6 bg-white dark:bg-slate-900/95 border-primary-500/10 dark:border-primary-500/20 shadow-card dark:shadow-card-dark transition-all duration-300">
              <h3 className="font-bold text-slate-900 dark:text-white text-base mb-3">Booking Guidelines</h3>
              <ul className="space-y-2.5 text-xs text-slate-600 dark:text-slate-400">
                <li className="flex items-start gap-2">
                  <span className="text-primary-500 dark:text-primary-400 font-bold">•</span>
                  <span>Slots are date-specific. Faculty sets availability for specific dates.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary-500 dark:text-primary-400 font-bold">•</span>
                  <span><strong className="text-red-500">Past times for today are automatically hidden.</strong></span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary-500 dark:text-primary-400 font-bold">•</span>
                  <span>If no slots are shown, the faculty is not available on this date.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary-500 dark:text-primary-400 font-bold">•</span>
                  <span>Write a clear meeting purpose so faculty can prepare in advance.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary-500 dark:text-primary-400 font-bold">•</span>
                  <span>Arrive at the faculty office at least 5 minutes prior.</span>
                </li>
              </ul>
            </SpotlightCard>

            <SpotlightCard spotlightColor="rgba(153, 0, 0, 0.08)" className="p-6 bg-white dark:bg-slate-900/95 border-primary-500/10 dark:border-primary-500/20 shadow-card dark:shadow-card-dark transition-all duration-300">
              <h3 className="font-bold text-slate-900 dark:text-white text-base mb-2">Need Support?</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">If you experience issues booking or viewing faculty schedules, contact support:</p>
              <div className="mt-3 text-xs text-slate-600 dark:text-slate-400 space-y-1">
                <p><strong>Email:</strong> support@eastdelta.edu.bd</p>
                <p><strong>Phone:</strong> +880 1234 567890</p>
              </div>
            </SpotlightCard>
          </MotionContainer>
        </div>
      </div>
    </PageTransition>
  );
};

export default BookAppointment;