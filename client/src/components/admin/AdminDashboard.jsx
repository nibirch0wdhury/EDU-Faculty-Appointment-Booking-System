import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Users, Calendar, CheckCircle, XCircle, UserPlus, Settings, Clock, AlertCircle } from 'lucide-react';
import api from '../../utils/api';
import { useAuth } from '../../context/AuthContext';

const AdminDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalFaculties: 0,
    totalStudents: 0,
    totalAppointments: 0,
    pendingAppointments: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Try to fetch from API
      const response = await api.get('/admin/stats');
      console.log('Stats response:', response.data);
      setStats(response.data);
    } catch (error) {
      console.error('Error fetching stats:', error);
      setError('Could not fetch stats. Using demo data.');
      
      // Use demo data if API fails
      setStats({
        totalUsers: 25,
        totalFaculties: 8,
        totalStudents: 17,
        totalAppointments: 45,
        pendingAppointments: 3,
      });
    } finally {
      setLoading(false);
    }
  };

  const quickActions = [
    {
      icon: <UserPlus className="w-6 h-6" />,
      title: 'Manage Users',
      description: 'View and manage all users',
      link: '/admin/manage-users',
      color: 'bg-primary-500',
      onClick: () => navigate('/admin/manage-users')
    },
    {
      icon: <Users className="w-6 h-6" />,
      title: 'Manage Faculties',
      description: 'Manage faculty members',
      link: '/admin/manage-faculties',
      color: 'bg-green-500',
      onClick: () => navigate('/admin/manage-faculties')
    },
    {
      icon: <Settings className="w-6 h-6" />,
      title: 'System Settings',
      description: 'Configure system settings',
      link: '/admin/settings',
      color: 'bg-purple-500',
      onClick: () => navigate('/admin/settings')
    },
  ];

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center min-h-[60vh]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary-600 border-t-transparent mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="text-gray-600">Welcome back, {user?.name || 'Admin'}!</p>
        {error && (
          <div className="mt-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-yellow-700 text-sm flex items-center gap-2">
            <AlertCircle className="w-4 h-4" />
            {error}
          </div>
        )}
      </div>

      {/* Stats Cards - Clickable */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
        <div className="card hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate('/admin/manage-users')}>
          <div className="flex items-center">
            <div className="p-3 bg-primary-100 rounded-lg">
              <Users className="w-6 h-6 text-primary-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-600">Total Users</p>
              <p className="text-2xl font-bold">{stats.totalUsers}</p>
            </div>
          </div>
        </div>
        <div className="card hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate('/admin/manage-users?role=student')}>
          <div className="flex items-center">
            <div className="p-3 bg-green-100 rounded-lg">
              <Users className="w-6 h-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-600">Students</p>
              <p className="text-2xl font-bold">{stats.totalStudents}</p>
            </div>
          </div>
        </div>
        <div className="card hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate('/admin/manage-faculties')}>
          <div className="flex items-center">
            <div className="p-3 bg-purple-100 rounded-lg">
              <Users className="w-6 h-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-600">Faculties</p>
              <p className="text-2xl font-bold">{stats.totalFaculties}</p>
            </div>
          </div>
        </div>
        <div className="card hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate('/admin/appointments')}>
          <div className="flex items-center">
            <div className="p-3 bg-blue-100 rounded-lg">
              <Calendar className="w-6 h-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-600">Total Appointments</p>
              <p className="text-2xl font-bold">{stats.totalAppointments}</p>
            </div>
          </div>
        </div>
        <div className="card hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate('/admin/appointments?status=pending')}>
          <div className="flex items-center">
            <div className="p-3 bg-yellow-100 rounded-lg">
              <Clock className="w-6 h-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-600">Pending</p>
              <p className="text-2xl font-bold">{stats.pendingAppointments}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions - Now Clickable */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {quickActions.map((action, index) => (
          <div 
            key={index} 
            onClick={action.onClick}
            className="card hover:shadow-lg transition-shadow cursor-pointer hover:transform hover:-translate-y-1"
          >
            <div className="flex items-center">
              <div className={`p-3 ${action.color} rounded-lg text-white`}>
                {action.icon}
              </div>
              <div className="ml-4">
                <h3 className="font-semibold">{action.title}</h3>
                <p className="text-sm text-gray-600">{action.description}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* System Overview */}
      <div className="card">
        <h2 className="text-xl font-semibold mb-4">System Overview</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-medium mb-3">Quick Stats</h3>
            <div className="space-y-2">
              <div className="flex justify-between items-center p-2 bg-white rounded">
                <span className="text-sm text-gray-600">Total Users</span>
                <span className="font-semibold text-primary-600">{stats.totalUsers}</span>
              </div>
              <div className="flex justify-between items-center p-2 bg-white rounded">
                <span className="text-sm text-gray-600">Total Faculties</span>
                <span className="font-semibold text-purple-600">{stats.totalFaculties}</span>
              </div>
              <div className="flex justify-between items-center p-2 bg-white rounded">
                <span className="text-sm text-gray-600">Total Students</span>
                <span className="font-semibold text-green-600">{stats.totalStudents}</span>
              </div>
              <div className="flex justify-between items-center p-2 bg-white rounded">
                <span className="text-sm text-gray-600">Total Appointments</span>
                <span className="font-semibold text-blue-600">{stats.totalAppointments}</span>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-medium mb-3">Appointment Status</h3>
            <div className="space-y-2">
              <div className="flex justify-between items-center p-2 bg-white rounded">
                <span className="text-sm text-gray-600">Pending</span>
                <span className="font-semibold text-yellow-600">{stats.pendingAppointments}</span>
              </div>
              <div className="flex justify-between items-center p-2 bg-white rounded">
                <span className="text-sm text-gray-600">Confirmed</span>
                <span className="font-semibold text-green-600">{stats.totalAppointments - stats.pendingAppointments}</span>
              </div>
              <div className="flex justify-between items-center p-2 bg-white rounded">
                <span className="text-sm text-gray-600">Total</span>
                <span className="font-semibold text-blue-600">{stats.totalAppointments}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;