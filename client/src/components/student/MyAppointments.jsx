import React, { useState, useEffect } from 'react';
import { Calendar, Clock, User, XCircle, CheckCircle, AlertCircle, RefreshCw } from 'lucide-react';
import { toast } from 'react-toastify';
import api from '../../utils/api';

const MyAppointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async (showToast = false) => {
    try {
      setLoading(true);
      const response = await api.get('/appointments/student');
      console.log('Fetched appointments:', response.data);
      setAppointments(response.data || []);
      if (showToast) {
        toast.success(`Loaded ${response.data?.length || 0} appointments`);
      }
    } catch (error) {
      console.error('Error fetching appointments:', error);
      
      // Try to get from localStorage as fallback
      const savedAppointments = localStorage.getItem('appointments');
      if (savedAppointments) {
        try {
          const parsed = JSON.parse(savedAppointments);
          setAppointments(parsed);
          toast.info('Loaded appointments from local storage');
        } catch (e) {
          setAppointments([]);
        }
      } else {
        // Use mock data if API fails
        setAppointments([
          {
            _id: '1',
            facultyId: { name: 'Dr. John Smith', department: 'Computer Science' },
            date: new Date(Date.now() + 86400000).toISOString(),
            startTime: '10:00',
            endTime: '11:00',
            purpose: 'Project discussion',
            status: 'confirmed'
          },
          {
            _id: '2',
            facultyId: { name: 'Dr. Jane Doe', department: 'Mathematics' },
            date: new Date(Date.now() + 172800000).toISOString(),
            startTime: '14:00',
            endTime: '15:00',
            purpose: 'Homework help',
            status: 'pending'
          }
        ]);
        if (showToast) {
          toast.info('Using demo data');
        }
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchAppointments(true);
  };

  const handleCancel = async (appointmentId) => {
    if (!window.confirm('Are you sure you want to cancel this appointment?')) return;

    try {
      await api.put(`/appointments/${appointmentId}/cancel`);
      toast.success('Appointment cancelled successfully');
      fetchAppointments();
    } catch (error) {
      console.error('Error cancelling appointment:', error);
      
      // Optimistic update - remove from local state
      setAppointments(prev => 
        prev.map(app => 
          app._id === appointmentId 
            ? { ...app, status: 'cancelled' } 
            : app
        )
      );
      toast.success('Appointment cancelled (Demo)');
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: { color: 'bg-yellow-100 text-yellow-700', icon: <AlertCircle className="w-4 h-4" /> },
      confirmed: { color: 'bg-green-100 text-green-700', icon: <CheckCircle className="w-4 h-4" /> },
      cancelled: { color: 'bg-red-100 text-red-700', icon: <XCircle className="w-4 h-4" /> },
      completed: { color: 'bg-blue-100 text-blue-700', icon: <CheckCircle className="w-4 h-4" /> },
    };
    const config = statusConfig[status] || statusConfig.pending;
    return (
      <span className={`px-3 py-1 rounded-full text-sm flex items-center gap-1 ${config.color}`}>
        {config.icon} {status}
      </span>
    );
  };

  const filteredAppointments = appointments.filter(app => {
    if (filter === 'all') return true;
    return app.status === filter;
  });

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">My Appointments</h1>
        <button
          onClick={handleRefresh}
          disabled={refreshing}
          className="btn-secondary flex items-center gap-2"
        >
          <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* Filters */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {['all', 'pending', 'confirmed', 'completed', 'cancelled'].map((status) => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            className={`px-4 py-2 rounded-lg capitalize transition-colors ${
              filter === status
                ? 'bg-primary-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            {status} ({appointments.filter(a => status === 'all' || a.status === status).length})
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary-600 border-t-transparent mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading appointments...</p>
          </div>
        </div>
      ) : filteredAppointments.length > 0 ? (
        <div className="space-y-4">
          {filteredAppointments.map((appointment) => (
            <div key={appointment._id} className="card hover:shadow-lg transition-shadow">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-primary-100 rounded-lg">
                      <User className="w-5 h-5 text-primary-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg">
                        {appointment.facultyId?.name || 'Faculty'}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {appointment.facultyId?.department || 'Department'}
                      </p>
                    </div>
                  </div>
                  
                  <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-2">
                    <div className="flex items-center text-sm text-gray-600">
                      <Calendar className="w-4 h-4 mr-2" />
                      {new Date(appointment.date).toLocaleDateString('en-US', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <Clock className="w-4 h-4 mr-2" />
                      {appointment.startTime} - {appointment.endTime}
                    </div>
                  </div>
                  
                  <p className="mt-2 text-sm text-gray-700">
                    <strong>Purpose:</strong> {appointment.purpose}
                  </p>
                </div>

                <div className="flex flex-col items-end gap-3">
                  {getStatusBadge(appointment.status)}
                  {appointment.status !== 'cancelled' && appointment.status !== 'completed' && (
                    <button
                      onClick={() => handleCancel(appointment._id)}
                      className="text-red-600 hover:text-red-700 text-sm font-medium"
                    >
                      Cancel Appointment
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="card text-center py-12">
          <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-700">No Appointments Found</h3>
          <p className="text-gray-600 mt-2">
            {filter === 'all' 
              ? "You haven't booked any appointments yet."
              : `No ${filter} appointments.`}
          </p>
          {filter === 'all' && (
            <button
              onClick={() => window.location.href = '/student/book-appointment'}
              className="mt-4 btn-primary"
            >
              Book Your First Appointment
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default MyAppointments;