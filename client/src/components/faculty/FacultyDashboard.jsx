import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Clock, Users, CheckCircle, PlusCircle, List, Mail } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import api from '../../utils/api';
import { toast } from 'react-toastify';

const FacultyDashboard = () => {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    confirmed: 0,
    completed: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    try {
      const response = await api.get('/appointments/faculty');
      const data = response.data || [];
      setAppointments(data);
      setStats({
        total: data.length,
        pending: data.filter(a => a.status === 'pending').length,
        confirmed: data.filter(a => a.status === 'confirmed').length,
        completed: data.filter(a => a.status === 'completed').length,
      });
    } catch (error) {
      console.error('Error fetching appointments:', error);
      const mockData = [
        {
          _id: '1',
          studentId: { name: 'John Doe', studentId: 'EDU-2024-001' },
          date: new Date().toISOString(),
          startTime: '10:00',
          endTime: '11:00',
          purpose: 'Project discussion',
          status: 'pending'
        }
      ];
      setAppointments(mockData);
      setStats({
        total: mockData.length,
        pending: mockData.filter(a => a.status === 'pending').length,
        confirmed: mockData.filter(a => a.status === 'confirmed').length,
        completed: mockData.filter(a => a.status === 'completed').length,
      });
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
      toast.error('Failed to update appointment status');
    }
  };

  const quickActions = [
    {
      icon: <PlusCircle className="w-6 h-6" />,
      title: 'Manage Schedule',
      description: 'Update your availability',
      link: '/faculty/manage-schedule',
      color: 'bg-primary-500',
    },
    {
      icon: <List className="w-6 h-6" />,
      title: 'View Appointments',
      description: 'See all your bookings',
      link: '/faculty/appointments',
      color: 'bg-green-500',
    },
    {
      icon: <Mail className="w-6 h-6" />,
      title: 'My Messages',
      description: 'View your contact messages and replies',
      link: '/user/messages',
      color: 'bg-blue-500',
    },
  ];

  const pendingAppointments = appointments.filter(a => a.status === 'pending').slice(0, 3);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Faculty Dashboard</h1>
        <p className="text-gray-600">Welcome back, {user?.name}!</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex items-center">
            <div className="p-3 bg-primary-100 rounded-lg">
              <Calendar className="w-6 h-6 text-primary-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-600">Total</p>
              <p className="text-2xl font-bold">{stats.total}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex items-center">
            <div className="p-3 bg-yellow-100 rounded-lg">
              <Clock className="w-6 h-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-600">Pending</p>
              <p className="text-2xl font-bold">{stats.pending}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex items-center">
            <div className="p-3 bg-green-100 rounded-lg">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-600">Confirmed</p>
              <p className="text-2xl font-bold">{stats.confirmed}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex items-center">
            <div className="p-3 bg-blue-100 rounded-lg">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-600">Completed</p>
              <p className="text-2xl font-bold">{stats.completed}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {quickActions.map((action, index) => (
          <Link key={index} to={action.link} className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow cursor-pointer">
            <div className="flex items-center">
              <div className={`p-3 ${action.color} rounded-lg text-white`}>
                {action.icon}
              </div>
              <div className="ml-4">
                <h3 className="font-semibold">{action.title}</h3>
                <p className="text-sm text-gray-600">{action.description}</p>
              </div>
            </div>
          </Link>
        ))}
      </div>

      <div className="bg-white rounded-xl shadow-md p-6">
        <h2 className="text-xl font-semibold mb-4">Pending Requests</h2>
        {loading ? (
          <p className="text-gray-600">Loading...</p>
        ) : pendingAppointments.length > 0 ? (
          <div className="space-y-4">
            {pendingAppointments.map((appointment) => (
              <div key={appointment._id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium">{appointment.studentId?.name || 'Student'}</p>
                  <p className="text-sm text-gray-600">
                    {new Date(appointment.date).toLocaleDateString()} at {appointment.startTime}
                  </p>
                  <p className="text-sm text-gray-600">Purpose: {appointment.purpose}</p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleStatusUpdate(appointment._id, 'confirmed')}
                    className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600"
                  >
                    Accept
                  </button>
                  <button
                    onClick={() => handleStatusUpdate(appointment._id, 'cancelled')}
                    className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                  >
                    Reject
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-600">No pending requests.</p>
        )}
        <Link to="/faculty/appointments" className="text-primary-600 hover:text-primary-700 mt-4 inline-block">
          View all appointments →
        </Link>
      </div>
    </div>
  );
};

export default FacultyDashboard;