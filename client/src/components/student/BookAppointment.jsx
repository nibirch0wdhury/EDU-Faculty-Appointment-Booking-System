import React, { useState, useEffect, useCallback } from 'react';
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

  // Fetch faculties on component mount
  useEffect(() => {
    fetchFaculties();
  }, []);

  // Fetch slots when faculty or date changes
  useEffect(() => {
    if (selectedFaculty && selectedDate) {
      fetchAvailableSlots();
    }
  }, [selectedFaculty, selectedDate]);

  const fetchFaculties = async () => {
    try {
      setFacultiesLoading(true);
      console.log('📋 Fetching faculties...');
      const response = await api.get('/faculty/all');
      console.log('✅ Faculties response:', response.data);
      
      const facultiesData = Array.isArray(response.data) 
        ? response.data 
        : response.data?.data || [];
      
      setFaculties(facultiesData);
      
      if (facultiesData.length === 0) {
        toast.warning('No faculty members found. Please contact administrator.');
      }
    } catch (error) {
      console.error('❌ Error fetching faculties:', error);
      toast.error('Failed to load faculty list. Please refresh the page.');
      
      setFaculties([
        { _id: '1', name: 'Dr. John Smith', department: 'Computer Science', designation: 'Professor' },
        { _id: '2', name: 'Dr. Jane Doe', department: 'Mathematics', designation: 'Associate Professor' },
        { _id: '3', name: 'Prof. Robert Johnson', department: 'Physics', designation: 'Assistant Professor' },
      ]);
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
      const dateStr = selectedDate.toISOString().split('T')[0];
      console.log(`🔍 Fetching slots for faculty ${selectedFaculty} on ${dateStr}`);
      
      const response = await api.get(`/faculty/${selectedFaculty}/slots`, {
        params: { date: selectedDate.toISOString() }
      });
      
      console.log('✅ Slots response:', response.data);
      
      const slotsData = Array.isArray(response.data) 
        ? response.data 
        : response.data?.data || [];
      
      setAvailableSlots(slotsData);
      console.log(`📋 Found ${slotsData.length} available slots`);
    } catch (error) {
      console.error('❌ Error fetching slots:', error);
      
      // Mock data for testing
      const mockSlots = [
        { startTime: '09:00', endTime: '10:00' },
        { startTime: '10:00', endTime: '11:00' },
        { startTime: '11:00', endTime: '12:00' },
        { startTime: '14:00', endTime: '15:00' },
        { startTime: '15:00', endTime: '16:00' },
      ];
      setAvailableSlots(mockSlots);
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
        console.log(`🔍 Fetching faculty details for ${facultyId}`);
        const response = await api.get(`/faculty/${facultyId}`);
        console.log('✅ Faculty details:', response.data);
        
        const facultyData = response.data?.data || response.data;
        setFacultyDetails(facultyData);
      } catch (error) {
        console.error('❌ Error fetching faculty details:', error);
        const faculty = faculties.find(f => f._id === facultyId);
        if (faculty) {
          setFacultyDetails(faculty);
        }
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    console.log('📝 Submitting appointment:', { selectedFaculty, selectedDate, selectedTime, purpose });
    
    if (!selectedFaculty) {
      toast.error('Please select a faculty member');
      return;
    }
    
    if (!selectedTime) {
      toast.error('Please select a time slot');
      return;
    }
    
    if (!purpose || !purpose.trim()) {
      toast.error('Please enter the purpose of the meeting');
      return;
    }

    setLoading(true);
    try {
      const appointmentData = {
        facultyId: selectedFaculty,
        date: selectedDate.toISOString(),
        startTime: selectedTime,
        purpose: purpose.trim(),
      };
      
      console.log('📤 Sending appointment data:', appointmentData);
      
      const response = await api.post('/appointments/book', appointmentData);
      console.log('✅ Booking response:', response.data);
      
      toast.success('🎉 Appointment booked successfully!');
      
      setTimeout(() => {
        navigate('/student/my-appointments');
      }, 1500);
      
    } catch (error) {
      console.error('❌ Error booking appointment:', error);
      
      if (error.response) {
        const message = error.response.data?.message || 'Failed to book appointment';
        toast.error(`❌ ${message}`);
      } else if (error.request) {
        toast.error('❌ Server not responding. Please try again.');
      } else {
        toast.error(`❌ ${error.message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  // ==================== CUSTOM CALENDAR FUNCTIONS ====================
  
  const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  const days = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];

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
    setSelectedDate(today);
  };

  const isToday = (date) => {
    const today = new Date();
    return date.getDate() === today.getDate() && 
           date.getMonth() === today.getMonth() && 
           date.getFullYear() === today.getFullYear();
  };

  const isSelected = (date) => {
    return date.getDate() === selectedDate.getDate() && 
           date.getMonth() === selectedDate.getMonth() && 
           date.getFullYear() === selectedDate.getFullYear();
  };

  // ONLY BLOCK PAST DATES - Weekends are now selectable
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

    // Empty cells for days before the first day of the month
    for (let i = 0; i < firstDay; i++) {
      daysArray.push(<div key={`empty-${i}`} className="h-10 w-10"></div>);
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
          onClick={() => handleDateSelect(day)}
          disabled={disabled}
          className={`
            h-10 w-10 rounded-xl text-sm font-medium transition-all duration-200
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

  // Format time for display
  const formatTimeDisplay = (time) => {
    if (!time) return '';
    const [hours, minutes] = time.split(':').map(Number);
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const hour12 = hours % 12 || 12;
    return `${hour12}:${String(minutes).padStart(2, '0')} ${ampm}`;
  };

  // Format date for display
  const formatDateDisplay = (date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <PageTransition className="py-8 md:py-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
      <MotionContainer className="space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-xs font-semibold">
          <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
          <span>New Consultation Slot</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white">Book an Appointment</h1>
        <p className="text-slate-400 text-sm">Select your faculty member, preferred date & time slot below.</p>
      </MotionContainer>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Booking Form */}
        <MotionContainer delay={0.1} className="lg:col-span-2">
          <div className="glass-panel p-6 sm:p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Faculty Selection */}
              <div>
                <label className="block text-sm font-semibold text-slate-200 mb-2">
                  <User className="inline-block w-4 h-4 mr-2 text-indigo-400" />
                  Select Faculty Member
                  <span className="text-rose-400 ml-1">*</span>
                </label>
                <select
                  value={selectedFaculty}
                  onChange={handleFacultySelect}
                  className="glass-input bg-slate-900"
                  required
                  disabled={facultiesLoading}
                >
                  <option value="" className="bg-slate-900 text-slate-400">
                    {facultiesLoading ? 'Loading faculties...' : 'Choose a faculty member...'}
                  </option>
                  {faculties.map((faculty) => (
                    <option key={faculty._id} value={faculty._id} className="bg-slate-900">
                      {faculty.name} - {faculty.department || 'N/A'}
                    </option>
                  ))}
                </select>
                {faculties.length === 0 && !facultiesLoading && (
                  <p className="text-xs text-amber-400 mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    No faculty members available. Please contact administrator.
                  </p>
                )}
              </div>

              {/* Faculty Details Card */}
              {facultyDetails && (
                <div className="p-4 rounded-xl bg-indigo-500/10 border border-indigo-500/20 space-y-1">
                  <h3 className="font-bold text-sm text-indigo-300">Faculty Details</h3>
                  <div className="text-xs text-slate-300 space-y-1">
                    <p><MapPin className="inline-block w-3.5 h-3.5 mr-1 text-indigo-400" /> Office: {facultyDetails.officeRoom || 'N/A'}</p>
                    <p>Department: {facultyDetails.department || 'N/A'}</p>
                    <p>Designation: {facultyDetails.designation || 'Faculty Member'}</p>
                  </div>
                </div>
              )}

              {/* Date & Time Grid */}
              <div className="grid md:grid-cols-2 gap-6">
                {/* Custom Themed Calendar */}
                <div>
                  <label className="block text-sm font-semibold text-slate-200 mb-2">
                    <CalendarIcon className="inline-block w-4 h-4 mr-2 text-indigo-400" />
                    Select Date
                    <span className="text-rose-400 ml-1">*</span>
                  </label>
                  
                  <div className="glass-panel p-4 rounded-2xl bg-slate-900/60 border border-slate-700/60">
                    {/* Calendar Header */}
                    <div className="flex items-center justify-between mb-4">
                      <button
                        type="button"
                        onClick={goToPreviousMonth}
                        className="p-1.5 rounded-lg hover:bg-slate-700/50 text-slate-400 hover:text-white transition-colors"
                      >
                        <ChevronLeft className="w-5 h-5" />
                      </button>
                      
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-bold text-white">
                          {months[currentMonth]} {currentYear}
                        </span>
                        <button
                          type="button"
                          onClick={goToToday}
                          className="text-[10px] font-semibold px-2 py-0.5 rounded-lg bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 hover:bg-indigo-500/30 transition-colors"
                        >
                          Today
                        </button>
                      </div>
                      
                      <button
                        type="button"
                        onClick={goToNextMonth}
                        className="p-1.5 rounded-lg hover:bg-slate-700/50 text-slate-400 hover:text-white transition-colors"
                      >
                        <ChevronRight className="w-5 h-5" />
                      </button>
                    </div>

                    {/* Day Headers */}
                    <div className="grid grid-cols-7 gap-1 mb-2">
                      {days.map((day) => (
                        <div key={day} className="h-8 flex items-center justify-center text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                          {day}
                        </div>
                      ))}
                    </div>

                    {/* Calendar Grid */}
                    <div className="grid grid-cols-7 gap-1">
                      {renderCalendarDays()}
                    </div>

                    {/* Selected Date Display */}
                    <div className="mt-4 pt-3 border-t border-slate-700/50 flex items-center justify-between">
                      <span className="text-xs text-slate-400">Selected:</span>
                      <span className="text-xs font-semibold text-indigo-300">
                        {formatDateDisplay(selectedDate)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Time Slots */}
                <div>
                  <label className="block text-sm font-semibold text-slate-200 mb-2">
                    <Clock className="inline-block w-4 h-4 mr-2 text-indigo-400" />
                    Available Time Slots
                    <span className="text-rose-400 ml-1">*</span>
                  </label>
                  
                  {/* Availability Status */}
                  {!fetchingSlots && selectedFaculty && (
                    <div className="mb-3">
                      {availableSlots.length === 0 ? (
                        <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl text-amber-300 text-xs text-center flex items-center justify-center gap-2">
                          <AlertCircle className="w-4 h-4 inline-block" />
                          No available slots for this date. Please select another date.
                        </div>
                      ) : (
                        <div className="p-2 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-300 text-xs text-center">
                          ✅ {availableSlots.length} slot{availableSlots.length !== 1 ? 's' : ''} available
                        </div>
                      )}
                    </div>
                  )}
                  
                  {fetchingSlots ? (
                    <div className="py-8 text-center text-xs text-slate-400">
                      <Loader2 className="w-5 h-5 animate-spin mx-auto mb-2 text-indigo-400" />
                      Loading available slots...
                    </div>
                  ) : availableSlots.length > 0 ? (
                    <div className="grid grid-cols-2 gap-2 max-h-[250px] overflow-y-auto pr-1 custom-scrollbar">
                      {availableSlots.map((slot, index) => (
                        <button
                          key={index}
                          type="button"
                          onClick={() => setSelectedTime(slot.startTime)}
                          className={`p-2.5 rounded-xl text-xs font-semibold border transition-all duration-200 ${
                            selectedTime === slot.startTime
                              ? 'bg-gradient-to-r from-indigo-600 to-purple-600 border-indigo-400 text-white shadow-md shadow-indigo-500/25 scale-[1.02]'
                              : 'bg-slate-800/60 border-slate-700/60 text-slate-300 hover:bg-slate-700/60 hover:border-indigo-500/50'
                          }`}
                        >
                          {formatTimeDisplay(slot.startTime)} - {formatTimeDisplay(slot.endTime)}
                        </button>
                      ))}
                    </div>
                  ) : selectedFaculty ? (
                    <div className="py-8 text-center text-slate-400 text-sm">
                      <Clock className="w-8 h-8 text-slate-600 mx-auto mb-2" />
                      <p>No available slots for this date.</p>
                      <p className="text-xs text-amber-400/70 mt-1">Please select another date.</p>
                    </div>
                  ) : (
                    <div className="py-8 text-center text-slate-400 text-sm">
                      <User className="w-8 h-8 text-slate-600 mx-auto mb-2" />
                      <p>Select a faculty to see available slots</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Purpose */}
              <div>
                <label className="block text-sm font-semibold text-slate-200 mb-2">
                  <FileText className="inline-block w-4 h-4 mr-2 text-indigo-400" />
                  Purpose of Meeting
                  <span className="text-rose-400 ml-1">*</span>
                </label>
                <textarea
                  value={purpose}
                  onChange={(e) => setPurpose(e.target.value)}
                  className="glass-input"
                  rows="3"
                  placeholder="Briefly explain what you wish to discuss during consultation..."
                  required
                />
              </div>

              <MagneticButton
                type="submit"
                disabled={loading || !selectedFaculty || !selectedTime || availableSlots.length === 0}
                variant="primary"
                className="w-full py-3.5"
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
              
              {(!selectedFaculty || !selectedTime) && availableSlots.length === 0 && selectedFaculty && (
                <p className="text-xs text-amber-400 text-center">
                  Please select a time slot to enable booking.
                </p>
              )}
            </form>
          </div>
        </MotionContainer>

        {/* Sidebar Information */}
        <MotionContainer delay={0.2} className="space-y-6">
          <SpotlightCard spotlightColor="rgba(99, 102, 241, 0.25)" className="p-6">
            <h3 className="font-bold text-white text-base mb-3">Booking Guidelines</h3>
            <ul className="space-y-2.5 text-xs text-slate-300">
              <li className="flex items-start gap-2">
                <span className="text-indigo-400 font-bold">•</span>
                <span>Slots are date-specific. Faculty sets availability for specific dates.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-indigo-400 font-bold">•</span>
                <span>If no slots are shown, the faculty is not available on this date.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-indigo-400 font-bold">•</span>
                <span>Write a clear meeting purpose so faculty can prepare in advance.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-indigo-400 font-bold">•</span>
                <span>Arrive at the faculty office at least 5 minutes prior.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-indigo-400 font-bold">•</span>
                <span>If unable to attend, cancel at least 1 hour early.</span>
              </li>
            </ul>
          </SpotlightCard>

          <SpotlightCard spotlightColor="rgba(16, 185, 129, 0.25)" className="p-6">
            <h3 className="font-bold text-white text-base mb-2">Need Support?</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              If you experience issues booking or viewing faculty schedules, contact support:
            </p>
            <div className="mt-3 text-xs text-slate-300 space-y-1">
              <p><strong>Email:</strong> support@eastdelta.edu.bd</p>
              <p><strong>Phone:</strong> +880 1234 567890</p>
            </div>
          </SpotlightCard>
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

export default BookAppointment;