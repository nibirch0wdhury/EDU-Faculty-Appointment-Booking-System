import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar as CalendarIcon, Clock, User, MapPin, FileText, Sparkles, Send, Loader2 } from 'lucide-react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
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

  useEffect(() => {
    fetchFaculties();
  }, []);

  useEffect(() => {
    if (selectedFaculty) {
      fetchAvailableSlots();
    }
  }, [selectedFaculty, selectedDate]);

  const fetchFaculties = async () => {
    try {
      const response = await api.get('/faculty/all');
      setFaculties(response.data || []);
    } catch (error) {
      console.error('Error fetching faculties:', error);
      setFaculties([
        { _id: '1', userId: { name: 'Dr. John Smith' }, department: 'Computer Science' },
        { _id: '2', userId: { name: 'Dr. Jane Doe' }, department: 'Mathematics' },
        { _id: '3', userId: { name: 'Prof. Robert Johnson' }, department: 'Physics' },
      ]);
    }
  };

  const fetchAvailableSlots = async () => {
    if (!selectedFaculty) return;
    setFetchingSlots(true);
    try {
      const response = await api.get(`/faculty/${selectedFaculty}/slots`, {
        params: { date: selectedDate.toISOString() }
      });
      setAvailableSlots(response.data || []);
    } catch (error) {
      console.error('Error fetching slots:', error);
      setAvailableSlots([
        { startTime: '09:00', endTime: '10:00' },
        { startTime: '10:00', endTime: '11:00' },
        { startTime: '11:00', endTime: '12:00' },
        { startTime: '14:00', endTime: '15:00' },
        { startTime: '15:00', endTime: '16:00' },
      ]);
    } finally {
      setFetchingSlots(false);
    }
  };

  const handleFacultySelect = async (e) => {
    const facultyId = e.target.value;
    setSelectedFaculty(facultyId);
    setSelectedTime('');
    setAvailableSlots([]);
    
    if (facultyId) {
      try {
        const response = await api.get(`/faculty/${facultyId}`);
        setFacultyDetails(response.data);
      } catch (error) {
        console.error('Error fetching faculty details:', error);
        setFacultyDetails({
          officeRoom: 'N/A',
          department: 'N/A',
          designation: 'Faculty Member'
        });
      }
    } else {
      setFacultyDetails(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!selectedFaculty) {
      toast.error('Please select a faculty member');
      return;
    }
    if (!selectedTime) {
      toast.error('Please select a time slot');
      return;
    }
    if (!purpose.trim()) {
      toast.error('Please enter the purpose of meeting');
      return;
    }

    setLoading(true);
    try {
      const appointmentData = {
        facultyId: selectedFaculty,
        date: selectedDate,
        startTime: selectedTime,
        purpose: purpose.trim(),
      };
      
      await api.post('/appointments/book', appointmentData);
      toast.success('Appointment booked successfully!');
      
      setTimeout(() => {
        navigate('/student/my-appointments');
      }, 500);
      
    } catch (error) {
      console.error('Error booking appointment:', error);
      toast.error(error.response?.data?.message || 'Failed to book appointment');
    } finally {
      setLoading(false);
    }
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
                </label>
                <select
                  value={selectedFaculty}
                  onChange={handleFacultySelect}
                  className="glass-input bg-slate-900"
                  required
                >
                  <option value="" className="bg-slate-900 text-slate-400">Choose a faculty member...</option>
                  {faculties.map((faculty) => (
                    <option key={faculty._id} value={faculty._id} className="bg-slate-900">
                      {faculty.userId?.name || faculty.name || 'Faculty'} - {faculty.department || 'N/A'}
                    </option>
                  ))}
                </select>
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
                <div>
                  <label className="block text-sm font-semibold text-slate-200 mb-2">
                    <CalendarIcon className="inline-block w-4 h-4 mr-2 text-indigo-400" />
                    Select Date
                  </label>
                  <div className="p-2 rounded-2xl bg-slate-950/60 border border-slate-800 flex justify-center text-slate-900">
                    <Calendar
                      onChange={setSelectedDate}
                      value={selectedDate}
                      minDate={new Date()}
                      className="rounded-xl border-none shadow-none text-xs"
                      tileDisabled={({ date }) => date.getDay() === 0 || date.getDay() === 6}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-200 mb-2">
                    <Clock className="inline-block w-4 h-4 mr-2 text-indigo-400" />
                    Available Time Slots
                  </label>
                  {fetchingSlots ? (
                    <div className="py-6 text-center text-xs text-slate-400">Loading slots...</div>
                  ) : availableSlots.length > 0 ? (
                    <div className="grid grid-cols-2 gap-2">
                      {availableSlots.map((slot, index) => {
                        const isSelected = selectedTime === slot.startTime;
                        return (
                          <button
                            key={index}
                            type="button"
                            onClick={() => setSelectedTime(slot.startTime)}
                            className={`p-3 rounded-xl text-xs font-semibold border transition-all duration-200 ${
                              isSelected
                                ? 'bg-gradient-to-r from-indigo-600 to-purple-600 border-indigo-400 text-white shadow-md shadow-indigo-500/25 scale-[1.02]'
                                : 'bg-slate-800/60 border-slate-700/60 text-slate-300 hover:bg-slate-700/60'
                            }`}
                          >
                            {slot.startTime} - {slot.endTime}
                          </button>
                        );
                      })}
                    </div>
                  ) : (
                    <p className="text-xs text-slate-400 py-4">No available slots for this date. Select another date.</p>
                  )}
                </div>
              </div>

              {/* Purpose */}
              <div>
                <label className="block text-sm font-semibold text-slate-200 mb-2">
                  <FileText className="inline-block w-4 h-4 mr-2 text-indigo-400" />
                  Purpose of Meeting
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
                disabled={loading || !selectedFaculty || !selectedTime}
                variant="primary"
                className="w-full py-3.5"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Confirming Booking...</span>
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

        {/* Sidebar Information */}
        <MotionContainer delay={0.2} className="space-y-6">
          <SpotlightCard spotlightColor="rgba(99, 102, 241, 0.25)" className="p-6">
            <h3 className="font-bold text-white text-base mb-3">Booking Guidelines</h3>
            <ul className="space-y-2.5 text-xs text-slate-300">
              <li className="flex items-start gap-2">
                <span className="text-indigo-400 font-bold">•</span>
                <span>Double-check professor consultation hours before selecting time slots.</span>
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
              If you experience issues booking or viewing faculty schedules, contact East Delta University support:
            </p>
            <div className="mt-3 text-xs text-slate-300 space-y-1">
              <p><strong>Email:</strong> support@eastdelta.edu.bd</p>
              <p><strong>Phone:</strong> +880 1234 567890</p>
            </div>
          </SpotlightCard>
        </MotionContainer>
      </div>
    </PageTransition>
  );
};

export default BookAppointment;