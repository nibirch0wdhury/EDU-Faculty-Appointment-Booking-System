import React, { useState, useEffect } from 'react';
import { Calendar, Clock, User, FileText, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { toast } from 'react-toastify';
import api from '../../utils/api';

const FacultyAppointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    try {
      const response = await api.get('/appointments/faculty');
      setAppointments(response.data);
    } catch (error) {
      toast.error('Failed to load appointments');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (appointmentId, status) => {
    try {
      await api.put(`/appointments/${appointmentId}/status`, { status });
      toast.success(`Appointment ${status} successfully`);
      fetchAppointments();
    } catch (error) {
      toast.error('Failed to update appointment');
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
      <h1 className="text-3xl font-bold mb-8">Faculty Appointments</h1>

      {/* Filters */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {['all', 'pending', 'confirmed', 'completed', 'cancelled'].map((status) => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            className={`px-4 py-2 rounded-lg capitalize ${
              filter === status
                ? 'bg-primary-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            {status}
          </button>
        ))}
      </div>

      {loading ? (
        <p className="text-gray-600">Loading appointments...</p>
      ) : filteredAppointments.length > 0 ? (
        <div className="space-y-4">
          {filteredAppointments.map((appointment) => (
            <div key={appointment._id} className="card hover:shadow-lg transition-shadow">
              <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-primary-100 rounded-lg">
                      <User className="w-5 h-5 text-primary-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg">
                        {appointment.studentId?.name || 'Student'}
                      </h3>
                      <p className="text-sm text-gray-600">
                        Student ID: {appointment.studentId?.studentId || 'N/A'}
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
                    <FileText className="inline-block w-4 h-4 mr-1" />
                    <strong>Purpose:</strong> {appointment.purpose}
                  </p>
                </div>

                <div className="flex flex-col items-end gap-3">
                  {getStatusBadge(appointment.status)}
                  {appointment.status === 'pending' && (
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleStatusUpdate(appointment._id, 'confirmed')}
                        className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 text-sm"
                      >
                        Accept
                      </button>
                      <button
                        onClick={() => handleStatusUpdate(appointment._id, 'cancelled')}
                        className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 text-sm"
                      >
                        Reject
                      </button>
                    </div>
                  )}
                  {appointment.status === 'confirmed' && (
                    <button
                      onClick={() => handleStatusUpdate(appointment._id, 'completed')}
                      className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 text-sm"
                    >
                      Mark Completed
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
              ? "You don't have any appointments yet."
              : `No ${filter} appointments.`}
          </p>
        </div>
      )}
    </div>
  );
};

export default FacultyAppointments;