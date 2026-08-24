import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Clock, FileText, PlusCircle, List, Mail, ArrowRight, Sparkles, UserCheck, AlertCircle, GraduationCap } from 'lucide-react';
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
      const response = await api.get('/appointments/student');
      const data = Array.isArray(response.data) ? response.data : response.data?.data || [];
      setAppointments(data);
      
      setStats({
        total: data.length,
        upcoming: data.filter(a => a.status === 'confirmed' || a.status === 'pending').length,
        completed: data.filter(a => a.status === 'completed').length,
      });
      
    } catch (error) {
      console.error('Error fetching appointments:', error);
      setError('Failed to load appointments. Please refresh the page.');
      setAppointments([]);
    } finally {
      setLoading(false);
    }
  };

  const quickActions = [
    {
      icon: <PlusCircle className="w-6 h-6 text-primary-500" />,
      title: 'Book Appointment',
      description: 'Schedule a new consultation slot with faculty',
      link: '/student/book-appointment',
      spotlight: 'rgba(153, 0, 0, 0.08)',
    },
    {
      icon: <GraduationCap className="w-6 h-6 text-primary-500" />,
      title: 'Faculty Members',
      description: 'Explore academics by department and book slots',
      link: '/student/faculty-members',
      spotlight: 'rgba(153, 0, 0, 0.08)',
    },
    {
      icon: <List className="w-6 h-6 text-primary-500" />,
      title: 'My Appointments',
      description: 'View, track, or manage your bookings',
      link: '/student/my-appointments',
      spotlight: 'rgba(153, 0, 0, 0.08)',
    },
    {
      icon: <Mail className="w-6 h-6 text-primary-500" />,
      title: 'My Messages',
      description: 'View your contact messages and admin replies',
      link: '/user/messages',
      spotlight: 'rgba(153, 0, 0, 0.08)',
    },
  ];

  const upcomingList = appointments.filter(a => a.status === 'confirmed' || a.status === 'pending');

  const formatTimeDisplay = (time) => {
    if (!time) return '';
    const [hours, minutes] = time.split(':').map(Number);
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const hour12 = hours % 12 || 12;
    return `${hour12}:${String(minutes).padStart(2, '0')} ${ampm}`;
  };

  return (
    <PageTransition className="py-8 md:py-12 bg-slate-50/80 dark:bg-slate-950/80 pattern-dots">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Header Banner */}
        <MotionContainer className="bg-white dark:bg-slate-900/95 rounded-3xl shadow-card dark:shadow-card-dark border border-primary-500/10 dark:border-primary-500/20 p-8 relative overflow-hidden flex flex-col md:flex-row justify-between items-start md:items-center gap-6 transition-all duration-300">
          <div className="absolute top-0 inset-x-0 h-1 bg-primary-500 dark:shadow-[0_0_20px_rgba(153,0,0,0.3)]" />
          <div className="absolute -top-24 -right-24 w-48 h-48 bg-primary-500/5 dark:bg-primary-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="space-y-2 z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary-50 dark:bg-primary-950/30 border border-primary-500/20 dark:border-primary-500/30 text-primary-600 dark:text-primary-400 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5 text-primary-500 dark:text-primary-400" />
              <span>Student Dashboard</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-display font-bold text-slate-900 dark:text-white">
              Welcome Back, <span className="brand-text-gradient">{user?.name || 'Student'}</span>!
            </h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm">
              {user?.department ? `${user.department} Department` : 'East Delta University'} • ID: {user?.studentId || 'EDU-Student'}
            </p>
          </div>
          <div className="z-10 shrink-0">
            <Link
              to="/student/book-appointment"
              className="flex items-center gap-2 px-5 py-3 rounded-xl bg-primary-500 text-white font-semibold text-sm shadow-md shadow-primary-500/25 dark:shadow-primary-500/50 hover:shadow-primary-500/40 dark:hover:shadow-primary-500/70 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200"
            >
              <PlusCircle className="w-5 h-5" />
              <span>Book New Slot</span>
            </Link>
          </div>
        </MotionContainer>

        {/* Error Message */}
        {error && (
          <MotionContainer className="p-4 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800/50 rounded-2xl text-red-600 dark:text-red-400 text-sm flex items-center gap-3">
            <AlertCircle className="w-5 h-5 shrink-0 text-red-500 dark:text-red-400" />
            <span>{error}</span>
          </MotionContainer>
        )}

        {/* Stats Cards */}
        <MotionContainer delay={0.1} className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <SpotlightCard spotlightColor="rgba(153, 0, 0, 0.08)" className="p-6 bg-white dark:bg-slate-900/95 border-primary-500/10 dark:border-primary-500/20 shadow-card dark:shadow-card-dark transition-all duration-300">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-xs uppercase font-bold tracking-wider text-slate-500 dark:text-slate-400">Total Bookings</p>
                <p className="text-3xl font-extrabold text-slate-900 dark:text-white">{stats.total}</p>
              </div>
              <div className="p-3 bg-primary-50 dark:bg-primary-950/30 border border-primary-500/10 dark:border-primary-500/20 rounded-2xl text-primary-500 dark:text-primary-400">
                <Calendar className="w-6 h-6" />
              </div>
            </div>
          </SpotlightCard>

          <SpotlightCard spotlightColor="rgba(16, 185, 129, 0.08)" className="p-6 bg-white dark:bg-slate-900/95 border-primary-500/10 dark:border-primary-500/20 shadow-card dark:shadow-card-dark transition-all duration-300">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-xs uppercase font-bold tracking-wider text-slate-500 dark:text-slate-400">Upcoming Consultations</p>
                <p className="text-3xl font-extrabold text-emerald-600 dark:text-emerald-400">{stats.upcoming}</p>
              </div>
              <div className="p-3 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-500/10 dark:border-emerald-500/20 rounded-2xl text-emerald-500 dark:text-emerald-400">
                <Clock className="w-6 h-6" />
              </div>
            </div>
          </SpotlightCard>

          <SpotlightCard spotlightColor="rgba(139, 92, 246, 0.08)" className="p-6 bg-white dark:bg-slate-900/95 border-primary-500/10 dark:border-primary-500/20 shadow-card dark:shadow-card-dark transition-all duration-300">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-xs uppercase font-bold tracking-wider text-slate-500 dark:text-slate-400">Completed Sessions</p>
                <p className="text-3xl font-extrabold text-purple-600 dark:text-purple-400">{stats.completed}</p>
              </div>
              <div className="p-3 bg-purple-50 dark:bg-purple-950/30 border border-purple-500/10 dark:border-purple-500/20 rounded-2xl text-purple-500 dark:text-purple-400">
                <FileText className="w-6 h-6" />
              </div>
            </div>
          </SpotlightCard>
        </MotionContainer>

        {/* Quick Actions */}
        <MotionContainer delay={0.2} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {quickActions.map((action, idx) => (
            <Link key={idx} to={action.link} className="block group">
              <SpotlightCard spotlightColor={action.spotlight} className="p-6 h-full bg-white dark:bg-slate-900/95 border-primary-500/10 dark:border-primary-500/20 hover:border-primary-500/30 dark:hover:border-primary-500/40 shadow-card dark:shadow-card-dark hover:shadow-card-hover dark:hover:shadow-card-hover-dark transition-all duration-300">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-2xl group-hover:scale-110 transition-transform duration-300">
                    {action.icon}
                  </div>
                  <div className="min-w-0 flex-grow">
                    <h3 className="text-base font-bold text-slate-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors flex items-center justify-between">
                      <span>{action.title}</span>
                      <ArrowRight className="w-4 h-4 text-slate-400 dark:text-slate-500 group-hover:text-primary-500 dark:group-hover:text-primary-400 group-hover:translate-x-1 transition-all" />
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">{action.description}</p>
                  </div>
                </div>
              </SpotlightCard>
            </Link>
          ))}
        </MotionContainer>

        {/* Upcoming Appointments */}
        <MotionContainer delay={0.3} className="bg-white dark:bg-slate-900/95 rounded-3xl shadow-card dark:shadow-card-dark border border-primary-500/10 dark:border-primary-500/20 p-6 sm:p-8 space-y-6 transition-all duration-300">
          <div className="absolute top-0 inset-x-0 h-1 bg-primary-500 dark:shadow-[0_0_20px_rgba(153,0,0,0.3)]" />
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-700 pb-4">
            <div className="flex items-center gap-2">
              <UserCheck className="w-5 h-5 text-primary-500 dark:text-primary-400" />
              <h2 className="text-xl font-display font-bold text-slate-900 dark:text-white">Upcoming Consultations</h2>
            </div>
            <Link to="/student/my-appointments" className="text-xs font-semibold text-primary-500 dark:text-primary-400 hover:text-primary-600 dark:hover:text-primary-300 flex items-center gap-1">
              <span>View All</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {loading ? (
            <div className="py-8 text-center text-slate-500 dark:text-slate-400 flex items-center justify-center gap-2">
              <div className="animate-spin rounded-full h-5 w-5 border-2 border-primary-500 dark:border-primary-400 border-t-transparent"></div>
              <span>Loading appointments...</span>
            </div>
          ) : upcomingList.length > 0 ? (
            <div className="space-y-3">
              {upcomingList.slice(0, 4).map((appointment) => (
                <div key={appointment._id} className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 gap-4 hover:border-primary-500/30 dark:hover:border-primary-500/40 transition-colors">
                  <div className="space-y-1">
                    <p className="font-bold text-slate-900 dark:text-white">{appointment.facultyId?.name || 'Faculty Member'}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      📅 {new Date(appointment.date).toLocaleDateString()} at {formatTimeDisplay(appointment.startTime)} - {formatTimeDisplay(appointment.endTime)}
                    </p>
                    {appointment.purpose && (
                      <p className="text-xs text-slate-500 dark:text-slate-400 italic">"{appointment.purpose}"</p>
                    )}
                  </div>
                  <Badge status={appointment.status} />
                </div>
              ))}
            </div>
          ) : (
            <div className="py-12 text-center text-slate-500 dark:text-slate-400 space-y-3">
              <Calendar className="w-8 h-8 text-slate-400 dark:text-slate-600 mx-auto" />
              <p>No upcoming appointments found.</p>
              <Link to="/student/book-appointment">
                <span className="inline-flex items-center gap-1 text-sm text-primary-500 dark:text-primary-400 font-semibold hover:underline">
                  Book a consultation slot now →
                </span>
              </Link>
            </div>
          )}
        </MotionContainer>
      </div>
    </PageTransition>
  );
};

export default StudentDashboard;