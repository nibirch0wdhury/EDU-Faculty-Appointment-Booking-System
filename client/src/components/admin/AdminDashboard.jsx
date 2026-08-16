import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Users, Calendar, CheckCircle, XCircle, UserPlus, Settings, Clock, AlertCircle, Mail, Sparkles, Shield, ArrowRight } from 'lucide-react';
import api from '../../utils/api';
import { useAuth } from '../../context/AuthContext';
import SpotlightCard from '../ui/SpotlightCard';
import PageTransition, { MotionContainer } from '../ui/PageTransition';

const AdminDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalFaculties: 0,
    totalStudents: 0,
    totalAppointments: 0,
    pendingAppointments: 0,
    unreadMessages: 0,
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
      const response = await api.get('/admin/stats');
      setStats(response.data);
    } catch (error) {
      console.error('Error fetching stats:', error);
      setError('Could not fetch real-time server stats. Displaying demo overview.');
      setStats({
        totalUsers: 25,
        totalFaculties: 8,
        totalStudents: 17,
        totalAppointments: 45,
        pendingAppointments: 3,
        unreadMessages: 5,
      });
    } finally {
      setLoading(false);
    }
  };

  const quickActions = [
    {
      icon: <UserPlus className="w-6 h-6 text-indigo-400" />,
      title: 'Manage Users',
      description: 'View, edit, or create student & faculty accounts',
      link: '/admin/manage-users',
      spotlight: 'rgba(99, 102, 241, 0.25)',
      onClick: () => navigate('/admin/manage-users')
    },
    {
      icon: <Users className="w-6 h-6 text-emerald-400" />,
      title: 'Manage Faculties',
      description: 'Assign departments, schedules, and faculty data',
      link: '/admin/manage-faculties',
      spotlight: 'rgba(16, 185, 129, 0.25)',
      onClick: () => navigate('/admin/manage-faculties')
    },
    {
      icon: <Mail className="w-6 h-6 text-cyan-400" />,
      title: 'Contact Messages',
      description: 'Review and respond to incoming user inquiries',
      link: '/admin/contact-messages',
      spotlight: 'rgba(6, 182, 212, 0.25)',
      onClick: () => navigate('/admin/contact-messages')
    },
    {
      icon: <Settings className="w-6 h-6 text-purple-400" />,
      title: 'System Settings',
      description: 'Configure portal parameters & preferences',
      link: '/admin/settings',
      spotlight: 'rgba(168, 85, 247, 0.25)',
      onClick: () => navigate('/admin/settings')
    },
  ];

  if (loading) {
    return (
      <div className="py-24 max-w-7xl mx-auto px-4 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-indigo-500 border-t-transparent mx-auto"></div>
        <p className="mt-4 text-slate-400 text-sm">Loading admin system statistics...</p>
      </div>
    );
  }

  return (
    <PageTransition className="py-8 md:py-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
      {/* Header Banner */}
      <MotionContainer className="glass-panel p-8 relative overflow-hidden flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="space-y-2 z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-xs font-semibold">
            <Shield className="w-3.5 h-3.5 text-indigo-400" />
            <span>Administrator Portal</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white">
            System Control Center, <span className="animated-gradient-text">{user?.name || 'Admin'}</span>
          </h1>
          <p className="text-slate-400 text-sm">
            Monitor users, faculty schedules, system appointments, and support tickets in real-time.
          </p>
        </div>
      </MotionContainer>

      {error && (
        <MotionContainer>
          <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-2xl text-amber-300 text-xs font-medium flex items-center gap-3">
            <AlertCircle className="w-4 h-4 shrink-0 text-amber-400" />
            <span>{error}</span>
          </div>
        </MotionContainer>
      )}

      {/* Stats Cards */}
      <MotionContainer delay={0.1} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <SpotlightCard 
          spotlightColor="rgba(99, 102, 241, 0.25)" 
          className="p-5 cursor-pointer hover:border-indigo-500/50" 
          onClick={() => navigate('/admin/manage-users')}
        >
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs uppercase font-bold text-slate-400">Total Users</span>
              <Users className="w-5 h-5 text-indigo-400" />
            </div>
            <p className="text-3xl font-extrabold text-white">{stats.totalUsers}</p>
          </div>
        </SpotlightCard>

        <SpotlightCard 
          spotlightColor="rgba(16, 185, 129, 0.25)" 
          className="p-5 cursor-pointer hover:border-emerald-500/50" 
          onClick={() => navigate('/admin/manage-users?role=student')}
        >
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs uppercase font-bold text-slate-400">Students</span>
              <Users className="w-5 h-5 text-emerald-400" />
            </div>
            <p className="text-3xl font-extrabold text-emerald-400">{stats.totalStudents}</p>
          </div>
        </SpotlightCard>

        <SpotlightCard 
          spotlightColor="rgba(168, 85, 247, 0.25)" 
          className="p-5 cursor-pointer hover:border-purple-500/50" 
          onClick={() => navigate('/admin/manage-faculties')}
        >
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs uppercase font-bold text-slate-400">Faculties</span>
              <Users className="w-5 h-5 text-purple-400" />
            </div>
            <p className="text-3xl font-extrabold text-purple-400">{stats.totalFaculties}</p>
          </div>
        </SpotlightCard>

        <SpotlightCard 
          spotlightColor="rgba(6, 182, 212, 0.25)" 
          className="p-5 cursor-pointer hover:border-cyan-500/50" 
          onClick={() => navigate('/admin/appointments')}
        >
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs uppercase font-bold text-slate-400">Appointments</span>
              <Calendar className="w-5 h-5 text-cyan-400" />
            </div>
            <p className="text-3xl font-extrabold text-cyan-400">{stats.totalAppointments}</p>
          </div>
        </SpotlightCard>

        <SpotlightCard 
          spotlightColor="rgba(245, 158, 11, 0.25)" 
          className="p-5 cursor-pointer hover:border-amber-500/50" 
          onClick={() => navigate('/admin/appointments?status=pending')}
        >
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs uppercase font-bold text-slate-400">Pending</span>
              <Clock className="w-5 h-5 text-amber-400" />
            </div>
            <p className="text-3xl font-extrabold text-amber-400">{stats.pendingAppointments}</p>
          </div>
        </SpotlightCard>

        <SpotlightCard 
          spotlightColor="rgba(244, 63, 94, 0.25)" 
          className="p-5 cursor-pointer hover:border-rose-500/50" 
          onClick={() => navigate('/admin/contact-messages')}
        >
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs uppercase font-bold text-slate-400">Unread</span>
              <Mail className="w-5 h-5 text-rose-400" />
            </div>
            <p className="text-3xl font-extrabold text-rose-400">{stats.unreadMessages || 0}</p>
          </div>
        </SpotlightCard>
      </MotionContainer>

      {/* Quick Actions */}
      <MotionContainer delay={0.2} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {quickActions.map((action, idx) => (
          <div key={idx} onClick={action.onClick} className="cursor-pointer group">
            <SpotlightCard spotlightColor={action.spotlight} className="p-6 h-full hover:border-indigo-500/40">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-slate-900 border border-slate-700/60 rounded-2xl group-hover:scale-110 transition-transform duration-300">
                  {action.icon}
                </div>
                <div className="min-w-0 flex-grow">
                  <h3 className="text-base font-bold text-white group-hover:text-indigo-300 transition-colors flex items-center justify-between">
                    <span>{action.title}</span>
                    <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-indigo-400 group-hover:translate-x-1 transition-all" />
                  </h3>
                  <p className="text-xs text-slate-400 mt-1 leading-relaxed">{action.description}</p>
                </div>
              </div>
            </SpotlightCard>
          </div>
        ))}
      </MotionContainer>

      {/* System Overview */}
      <MotionContainer delay={0.3} className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="glass-panel p-6 space-y-4">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Users className="w-5 h-5 text-indigo-400" />
            <span>User Distribution Overview</span>
          </h2>
          <div className="space-y-3">
            <div className="flex justify-between items-center p-3.5 bg-slate-800/40 rounded-xl border border-slate-700/50">
              <span className="text-sm text-slate-300">Total System Accounts</span>
              <span className="font-extrabold text-indigo-400">{stats.totalUsers}</span>
            </div>
            <div className="flex justify-between items-center p-3.5 bg-slate-800/40 rounded-xl border border-slate-700/50">
              <span className="text-sm text-slate-300">Faculty Members</span>
              <span className="font-extrabold text-purple-400">{stats.totalFaculties}</span>
            </div>
            <div className="flex justify-between items-center p-3.5 bg-slate-800/40 rounded-xl border border-slate-700/50">
              <span className="text-sm text-slate-300">Registered Students</span>
              <span className="font-extrabold text-emerald-400">{stats.totalStudents}</span>
            </div>
          </div>
        </div>

        <div className="glass-panel p-6 space-y-4">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Calendar className="w-5 h-5 text-cyan-400" />
            <span>Appointment System Metrics</span>
          </h2>
          <div className="space-y-3">
            <div className="flex justify-between items-center p-3.5 bg-slate-800/40 rounded-xl border border-slate-700/50">
              <span className="text-sm text-slate-300">Pending Review</span>
              <span className="font-extrabold text-amber-400">{stats.pendingAppointments}</span>
            </div>
            <div className="flex justify-between items-center p-3.5 bg-slate-800/40 rounded-xl border border-slate-700/50">
              <span className="text-sm text-slate-300">Confirmed & Active</span>
              <span className="font-extrabold text-emerald-400">{stats.totalAppointments - stats.pendingAppointments}</span>
            </div>
            <div className="flex justify-between items-center p-3.5 bg-slate-800/40 rounded-xl border border-slate-700/50">
              <span className="text-sm text-slate-300">Total System Bookings</span>
              <span className="font-extrabold text-cyan-400">{stats.totalAppointments}</span>
            </div>
          </div>
        </div>
      </MotionContainer>
    </PageTransition>
  );
};

export default AdminDashboard;