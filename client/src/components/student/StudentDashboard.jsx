import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Clock, FileText, PlusCircle, List, Mail, ArrowRight, Sparkles, UserCheck, AlertCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import api from '../../utils/api';
import SpotlightCard from '../ui/SpotlightCard';
import Badge from '../ui/Badge';
import PageTransition, { MotionContainer } from '../ui/PageTransition';

const StudentDashboard = () => {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    upcoming: 0,
    completed: 0,
  });
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('📋 Fetching student appointments...');
      
      const response = await api.get('/appointments/student');
      console.log('✅ Appointments response:', response.data);
      
      const data = Array.isArray(response.data) ? response.data : response.data?.data || [];
      setAppointments(data);
      
      setStats({
        total: data.length,
        upcoming: data.filter(a => a.status === 'confirmed' || a.status === 'pending').length,
        completed: data.filter(a => a.status === 'completed').length,
      });
      
    } catch (error) {
      console.error('❌ Error fetching appointments:', error);
      setError('Failed to load appointments. Please refresh the page.');
      
      // Set mock data for testing
      const mockData = [
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
      icon: <PlusCircle className="w-6 h-6 text-indigo-400" />,
      title: 'Book Appointment',
      description: 'Schedule a new consultation slot with faculty',
      link: '/student/book-appointment',
      spotlight: 'rgba(99, 102, 241, 0.25)',
    },
    {
      icon: <List className="w-6 h-6 text-emerald-400" />,
      title: 'My Appointments',
      description: 'View, track, or manage your bookings',
      link: '/student/my-appointments',
      spotlight: 'rgba(16, 185, 129, 0.25)',
    },
    {
      icon: <Mail className="w-6 h-6 text-cyan-400" />,
      title: 'My Messages',
      description: 'View your contact messages and admin replies',
      link: '/user/messages',
      spotlight: 'rgba(6, 182, 212, 0.25)',
    },
  ];

  const upcomingList = appointments.filter(a => a.status === 'confirmed' || a.status === 'pending');

  // Format time for display
  const formatTimeDisplay = (time) => {
    if (!time) return '';
    const [hours, minutes] = time.split(':').map(Number);
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const hour12 = hours % 12 || 12;
    return `${hour12}:${String(minutes).padStart(2, '0')} ${ampm}`;
  };

  return (
    <PageTransition className="py-8 md:py-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
      {/* Header Banner */}
      <MotionContainer className="glass-panel p-8 relative overflow-hidden flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="space-y-2 z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            <span>Student Dashboard</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white">
            Welcome Back, <span className="animated-gradient-text">{user?.name || 'Student'}</span>!
          </h1>
          <p className="text-slate-400 text-sm">
            {user?.department ? `${user.department} Department` : 'East Delta University'} • ID: {user?.studentId || 'EDU-Student'}
          </p>
        </div>
        <div className="z-10 shrink-0">
          <Link
            to="/student/book-appointment"
            className="flex items-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold text-sm shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 border border-indigo-400/30"
          >
            <PlusCircle className="w-5 h-5" />
            <span>Book New Slot</span>
          </Link>
        </div>
      </MotionContainer>

      {/* Error Message */}
      {error && (
        <MotionContainer className="p-4 bg-rose-500/10 border border-rose-500/30 rounded-2xl text-rose-300 text-sm flex items-center gap-3">
          <AlertCircle className="w-5 h-5 shrink-0 text-rose-400" />
          <span>{error}</span>
        </MotionContainer>
      )}

      {/* Stats Cards */}
      <MotionContainer delay={0.1} className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <SpotlightCard spotlightColor="rgba(99, 102, 241, 0.25)" className="p-6">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-xs uppercase font-bold tracking-wider text-slate-400">Total Bookings</p>
              <p className="text-3xl font-extrabold text-white">{stats.total}</p>
            </div>
            <div className="p-3 bg-indigo-600/20 border border-indigo-500/30 rounded-2xl text-indigo-400">
              <Calendar className="w-6 h-6" />
            </div>
          </div>
        </SpotlightCard>

        <SpotlightCard spotlightColor="rgba(16, 185, 129, 0.25)" className="p-6">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-xs uppercase font-bold tracking-wider text-slate-400">Upcoming Consultations</p>
              <p className="text-3xl font-extrabold text-emerald-400">{stats.upcoming}</p>
            </div>
            <div className="p-3 bg-emerald-600/20 border border-emerald-500/30 rounded-2xl text-emerald-400">
              <Clock className="w-6 h-6" />
            </div>
          </div>
        </SpotlightCard>

        <SpotlightCard spotlightColor="rgba(168, 85, 247, 0.25)" className="p-6">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-xs uppercase font-bold tracking-wider text-slate-400">Completed Sessions</p>
              <p className="text-3xl font-extrabold text-purple-400">{stats.completed}</p>
            </div>
            <div className="p-3 bg-purple-600/20 border border-purple-500/30 rounded-2xl text-purple-400">
              <FileText className="w-6 h-6" />
            </div>
          </div>
        </SpotlightCard>
      </MotionContainer>

      {/* Quick Actions */}
      <MotionContainer delay={0.2} className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {quickActions.map((action, idx) => (
          <Link key={idx} to={action.link} className="block group">
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
          </Link>
        ))}
      </MotionContainer>

      {/* Upcoming Appointments */}
      <MotionContainer delay={0.3} className="glass-panel p-6 sm:p-8 space-y-6">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-2">
            <UserCheck className="w-5 h-5 text-indigo-400" />
            <h2 className="text-xl font-bold text-white">Upcoming Consultations</h2>
          </div>
          <Link to="/student/my-appointments" className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 flex items-center gap-1">
            <span>View All</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {loading ? (
          <div className="py-8 text-center text-slate-400 flex items-center justify-center gap-2">
            <div className="animate-spin rounded-full h-5 w-5 border-2 border-indigo-500 border-t-transparent"></div>
            <span>Loading appointments...</span>
          </div>
        ) : upcomingList.length > 0 ? (
          <div className="space-y-3">
            {upcomingList.slice(0, 4).map((appointment) => (
              <div key={appointment._id} className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 rounded-xl bg-slate-800/40 border border-slate-700/50 gap-4 hover:border-slate-600 transition-colors">
                <div className="space-y-1">
                  <p className="font-bold text-white">{appointment.facultyId?.name || 'Faculty Member'}</p>
                  <p className="text-xs text-slate-400">
                    📅 {new Date(appointment.date).toLocaleDateString()} at {formatTimeDisplay(appointment.startTime)} - {formatTimeDisplay(appointment.endTime)}
                  </p>
                  {appointment.purpose && (
                    <p className="text-xs text-slate-300 italic">"{appointment.purpose}"</p>
                  )}
                </div>
                <Badge status={appointment.status} />
              </div>
            ))}
          </div>
        ) : (
          <div className="py-12 text-center text-slate-400 space-y-3">
            <Calendar className="w-8 h-8 text-slate-600 mx-auto" />
            <p>No upcoming appointments found.</p>
            <Link to="/student/book-appointment">
              <span className="inline-flex items-center gap-1 text-sm text-indigo-400 font-semibold hover:underline">
                Book a consultation slot now →
              </span>
            </Link>
          </div>
        )}
      </MotionContainer>
    </PageTransition>
  );
};

export default StudentDashboard;