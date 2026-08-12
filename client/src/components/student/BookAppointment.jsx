import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar as CalendarIcon, Clock, User, MapPin, FileText, AlertCircle } from 'lucide-react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import { toast } from 'react-toastify';
import api from '../../utils/api';

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
      // Mock data if API fails
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
      // Mock slots if API fails
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
      
      console.log('Booking appointment with data:', appointmentData);
      
      const response = await api.post('/appointments/book', appointmentData);
      console.log('Booking response:', response.data);
      
      toast.success('Appointment booked successfully!');
      
      // Wait a moment before navigating
      setTimeout(() => {
        navigate('/student/my-appointments');
      }, 500);
      
    } catch (error) {
      console.error('Error booking appointment:', error);
      
      // Show detailed error message
      if (error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        toast.error(error.response.data?.message || 'Failed to book appointment');
      } else if (error.request) {
        // The request was made but no response was received
        toast.error('No response from server. Please check your connection.');
      } else {
        // Something happened in setting up the request that triggered an Error
        toast.error(error.message || 'Failed to book appointment');
      }
      
      setLoading(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Book an Appointment</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Booking Form */}
        <div className="card">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Faculty Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <User className="inline-block w-4 h-4 mr-2" />
                Select Faculty
              </label>
              <select
                value={selectedFaculty}
                onChange={handleFacultySelect}
                className="input-field"
                required
              >
                <option value="">Choose a faculty member</option>
                {faculties.map((faculty) => (
                  <option key={faculty._id} value={faculty._id}>
                    {faculty.userId?.name || faculty.name || 'Faculty'} - {faculty.department || 'N/A'}
                  </option>
                ))}
              </select>
            </div>

            {/* Faculty Details */}
            {facultyDetails && (
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-semibold mb-2">Faculty Details</h3>
                <p className="text-sm text-gray-600">
                  <MapPin className="inline-block w-4 h-4 mr-1" />
                  Office: {facultyDetails.officeRoom || 'N/A'}
                </p>
                <p className="text-sm text-gray-600">
                  Department: {facultyDetails.department || 'N/A'}
                </p>
                <p className="text-sm text-gray-600">
                  Designation: {facultyDetails.designation || 'Faculty Member'}
                </p>
              </div>
            )}

            {/* Date Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <CalendarIcon className="inline-block w-4 h-4 mr-2" />
                Select Date
              </label>
              <Calendar
                onChange={setSelectedDate}
                value={selectedDate}
                minDate={new Date()}
                className="w-full border rounded-lg"
                tileDisabled={({ date }) => date.getDay() === 0 || date.getDay() === 6}
              />
            </div>

            {/* Time Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Clock className="inline-block w-4 h-4 mr-2" />
                Select Time
              </label>
              {fetchingSlots ? (
                <p className="text-gray-600">Loading available slots...</p>
              ) : availableSlots.length > 0 ? (
                <select
                  value={selectedTime}
                  onChange={(e) => setSelectedTime(e.target.value)}
                  className="input-field"
                  required
                >
                  <option value="">Choose a time slot</option>
                  {availableSlots.map((slot, index) => (
                    <option key={index} value={slot.startTime}>
                      {slot.startTime} - {slot.endTime}
                    </option>
                  ))}
                </select>
              ) : (
                <p className="text-gray-600">No available slots for this date. Please select another date.</p>
              )}
            </div>

            {/* Purpose */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <FileText className="inline-block w-4 h-4 mr-2" />
                Purpose of Meeting
              </label>
              <textarea
                value={purpose}
                onChange={(e) => setPurpose(e.target.value)}
                className="input-field"
                rows="3"
                placeholder="Briefly describe the purpose of your meeting..."
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading || !selectedFaculty || !selectedTime}
              className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Booking...' : 'Book Appointment'}
            </button>
          </form>
        </div>

        {/* Information Sidebar */}
        <div className="space-y-6">
          <div className="card bg-primary-50">
            <h3 className="font-semibold text-primary-800 mb-2">Tips for Booking</h3>
            <ul className="space-y-2 text-sm text-gray-700">
              <li>• Check faculty availability before booking</li>
              <li>• Be specific about the purpose of your meeting</li>
              <li>• Arrive on time for your appointment</li>
              <li>• Cancel if you cannot make it</li>
            </ul>
          </div>

          <div className="card">
            <h3 className="font-semibold mb-2">Need Help?</h3>
            <p className="text-sm text-gray-600">
              If you're having trouble booking an appointment, please contact:
            </p>
            <p className="text-sm text-gray-600 mt-2">
              <strong>Email:</strong> support@edu.edu
            </p>
            <p className="text-sm text-gray-600">
              <strong>Phone:</strong> +880 1234 567890
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookAppointment;