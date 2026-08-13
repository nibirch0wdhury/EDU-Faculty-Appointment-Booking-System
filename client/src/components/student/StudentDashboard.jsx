import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Clock, User, FileText, PlusCircle, List } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import api from '../../utils/api';

const StudentDashboard = () => {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    upcoming: 0,
    completed: 0,
  });

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    try {
      const response = await api.get('/appointments/student');
      const data = response.data || [];
      setAppointments(data);
      setStats({
        total: data.length,
        upcoming: data.filter(a => a.status === 'confirmed' || a.status === 'pending').length,
        completed: data.filter(a => a.status === 'completed').length,
      });
    } catch (error) {
      console.error('Error fetching appointments:', error);
      // Use mock data if API fails
      const mockData = [
        {
          _id: '1',
          facultyId: { name: 'Dr. John Smith', department: 'Computer Science' },
          date: new Date(Date.now() + 86400000).toISOString(),
          startTime: '10:00',
          endTime: '11:00',
          purpose: 'Project discussion',
          status: 'confirmed'
        }
      ];
      setAppointments(mockData);
      setStats({
        total: mockData.length,
        upcoming: mockData.filter(a => a.status === 'confirmed' || a.status === 'pending').length,
        completed: mockData.filter(a => a.status === 'completed').length,
      });
    } finally {
      setLoading(false);
    }
  };

  const quickActions = [
    {
      icon: <PlusCircle className="w-6 h-6" />,
      title: 'Book Appointment',
      description: 'Schedule a meeting with faculty',
      link: '/student/book-appointment',
      color: 'bg-primary-500',
    },
    {
      icon: <List className="w-6 h-6" />,
      title: 'My Appointments',
      description: 'View all your bookings',
      link: '/student/my-appointments',
      color: 'bg-green-500',
    },
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Student Dashboard</h1>
        <p className="text-gray-600">Welcome back, {user?.name || 'Student'}!</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="card">
          <div className="flex items-center">
            <div className="p-3 bg-primary-100 rounded-lg">
              <Calendar className="w-6 h-6 text-primary-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-600">Total Appointments</p>
              <p className="text-2xl font-bold">{stats.total}</p>
            </div>
          </div>
        </div>
        <div className="card">
          <div className="flex items-center">
            <div className="p-3 bg-green-100 rounded-lg">
              <Clock className="w-6 h-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-600">Upcoming</p>
              <p className="text-2xl font-bold">{stats.upcoming}</p>
            </div>
          </div>
        </div>
        <div className="card">
          <div className="flex items-center">
            <div className="p-3 bg-purple-100 rounded-lg">
              <FileText className="w-6 h-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-600">Completed</p>
              <p className="text-2xl font-bold">{stats.completed}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {quickActions.map((action, index) => (
          <Link key={index} to={action.link} className="card hover:shadow-lg transition-shadow cursor-pointer">
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

      {/* Upcoming Appointments */}
      <div className="card">
        <h2 className="text-xl font-semibold mb-4">Upcoming Appointments</h2>
        {loading ? (
          <p className="text-gray-600">Loading...</p>
        ) : appointments.filter(a => a.status === 'confirmed' || a.status === 'pending').length > 0 ? (
          <div className="space-y-4">
            {appointments.filter(a => a.status === 'confirmed' || a.status === 'pending').slice(0, 3).map((appointment) => (
              <div key={appointment._id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium">{appointment.facultyId?.name || 'Faculty'}</p>
                  <p className="text-sm text-gray-600">
                    {new Date(appointment.date).toLocaleDateString()} at {appointment.startTime}
                  </p>
                </div>
                <span className={`px-3 py-1 rounded-full text-sm ${
                  appointment.status === 'confirmed' ? 'bg-green-100 text-green-700' :
                  appointment.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                  'bg-gray-100 text-gray-700'
                }`}>
                  {appointment.status}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-600">No upcoming appointments.</p>
        )}
        <Link to="/student/my-appointments" className="text-primary-600 hover:text-primary-700 mt-4 inline-block">
          View all appointments →
        </Link>
      </div>
    </div>
  );
};

export default StudentDashboard;