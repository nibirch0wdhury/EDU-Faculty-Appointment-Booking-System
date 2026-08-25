import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Clock, Users, CheckCircle2, PlusCircle, List, Mail, ArrowRight, Check, X, Calendar as CalendarIcon, RefreshCw, GraduationCap } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import api from '../../utils/api';
import { toast } from 'react-toastify';
import SpotlightCard from '../ui/SpotlightCard';
import MagneticButton from '../ui/MagneticButton';
import Badge from '../ui/Badge';
import PageTransition, { MotionContainer } from '../ui/PageTransition';

const FacultyDashboard = () => {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [schedule, setSchedule] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    confirmed: 0,
    completed: 0,
  });
  const [loading, setLoading] = useState(true);
  const [scheduleLoading, setScheduleLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchAppointments();
    fetchSchedule();
  }, []);

  const fetchAppointments = async () => {
    try {
      const response = await api.get('/appointments/faculty');
      const data = response.data?.data || response.data || [];
      setAppointments(data);
      setStats({
        total: data.length,
        pending: data.filter(a => a.status === 'pending').length,
        confirmed: data.filter(a => a.status === 'confirmed').length,
        completed: data.filter(a => a.status === 'completed').length,
      });
    } catch (error) {
      console.error('Error fetching appointments:', error);
      toast.error('Failed to load appointments');
      setAppointments([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchSchedule = async (showToast = false) => {
    try {
      setScheduleLoading(true);
      const response = await api.get('/faculty/my-schedule');
      const data = response.data?.data || response.data || [];
      setSchedule(data);
      if (showToast) {
        toast.success(`Loaded ${data.length} schedule slots`);
      }
    } catch (error) {
      console.error('Error fetching schedule:', error);
      if (showToast) {
        toast.error('Failed to load schedule');
      }
      setSchedule([]);
    } finally {
      setScheduleLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchSchedule(true);
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
      icon: <PlusCircle className="w-6 h-6 text-primary-500" />,
      title: 'Manage Schedule',
      description: 'Set your consultation hours & slots',
      link: '/faculty/manage-schedule',
      spotlight: 'rgba(153, 0, 0, 0.08)',
    },
    {
      icon: <List className="w-6 h-6 text-primary-500" />,
      title: 'View Appointments',
      description: 'See all past & upcoming consultations',
      link: '/faculty/appointments',
      spotlight: 'rgba(153, 0, 0, 0.08)',
    },
    {
      icon: <Mail className="w-6 h-6 text-primary-500" />,
      title: 'My Messages',
      description: 'Check student messages and contact replies',
      link: '/user/messages',
      spotlight: 'rgba(153, 0, 0, 0.08)',
    },
  ];

  const pendingAppointments = appointments.filter(a => a.status === 'pending').slice(0, 4);

  const formatTimeDisplay = (time) => {
    if (!time) return '';
    const [hours, minutes] = time.split(':').map(Number);
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const hour12 = hours % 12 || 12;
    return `${hour12}:${String(minutes).padStart(2, '0')} ${ampm}`;
  };

  const formatDateDisplay = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const getUpcomingSlots = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return schedule
      .filter(slot => {
        const slotDate = new Date(slot.date);
        slotDate.setHours(0, 0, 0, 0);
        return slotDate >= today;
      })
      .sort((a, b) => new Date(a.date) - new Date(b.date))
      .slice(0, 10);
  };

  const upcomingSlots = getUpcomingSlots();

  return (
    <PageTransition className="py-8 md:py-12 bg-slate-50/80 dark:bg-slate-950/80 pattern-dots">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Header Banner */}
        <MotionContainer className="bg-white dark:bg-slate-900/95 rounded-3xl shadow-card dark:shadow-card-dark border border-primary-500/10 dark:border-primary-500/20 p-8 relative overflow-hidden flex flex-col md:flex-row justify-between items-start md:items-center gap-6 transition-all duration-300">
          <div className="absolute top-0 inset-x-0 h-1 bg-primary-500 dark:shadow-[0_0_20px_rgba(153,0,0,0.3)]" />
          <div className="absolute -top-24 -right-24 w-48 h-48 bg-primary-500/5 dark:bg-primary-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="space-y-2 z-10">
            <h1 className="text-3xl sm:text-4xl font-display font-bold text-slate-900 dark:text-white">
              Welcome Back, <span className="brand-text-gradient">{user?.name}</span>!
            </h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm">
              {user?.department ? `${user.department} Department` : 'East Delta University Faculty'} • ID: {user?.facultyId || 'FAC-Member'}
            </p>
          </div>
          <div className="z-10 shrink-0 flex items-center gap-3">
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:text-primary-500 dark:hover:text-primary-400 hover:border-primary-500 dark:hover:border-primary-500 hover:bg-primary-50 dark:hover:bg-primary-950/30 transition-all"
              title="Refresh dashboard"
            >
              <RefreshCw className={`w-5 h-5 ${refreshing ? 'animate-spin' : ''}`} />
            </button>
            <Link
              to="/faculty/manage-schedule"
              className="flex items-center gap-2 px-5 py-3 rounded-xl bg-primary-500 text-white font-semibold text-sm shadow-md shadow-primary-500/25 dark:shadow-primary-500/50 hover:shadow-primary-500/40 dark:hover:shadow-primary-500/70 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200"
            >
              <PlusCircle className="w-5 h-5" />
              <span>Update Availability</span>
            </Link>
          </div>
        </MotionContainer>

        {/* Stats Grid */}
        <MotionContainer delay={0.1} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <SpotlightCard spotlightColor="rgba(153, 0, 0, 0.08)" className="p-6 bg-white dark:bg-slate-900/95 border-primary-500/10 dark:border-primary-500/20 shadow-card dark:shadow-card-dark transition-all duration-300">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-xs uppercase font-bold tracking-wider text-slate-500 dark:text-slate-400">Total Consultations</p>
                <p className="text-3xl font-extrabold text-slate-900 dark:text-white">{stats.total}</p>
              </div>
              <div className="p-3 bg-primary-50 dark:bg-primary-950/30 border border-primary-500/10 dark:border-primary-500/20 rounded-2xl text-primary-500 dark:text-primary-400">
                <Calendar className="w-6 h-6" />
              </div>
            </div>
          </SpotlightCard>

          <SpotlightCard spotlightColor="rgba(245, 158, 11, 0.08)" className="p-6 bg-white dark:bg-slate-900/95 border-primary-500/10 dark:border-primary-500/20 shadow-card dark:shadow-card-dark transition-all duration-300">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-xs uppercase font-bold tracking-wider text-slate-500 dark:text-slate-400">Pending Approval</p>
                <p className="text-3xl font-extrabold text-amber-600 dark:text-amber-400">{stats.pending}</p>
              </div>
              <div className="p-3 bg-amber-50 dark:bg-amber-950/30 border border-amber-500/10 dark:border-amber-500/20 rounded-2xl text-amber-500 dark:text-amber-400">
                <Clock className="w-6 h-6" />
              </div>
            </div>
          </SpotlightCard>

          <SpotlightCard spotlightColor="rgba(16, 185, 129, 0.08)" className="p-6 bg-white dark:bg-slate-900/95 border-primary-500/10 dark:border-primary-500/20 shadow-card dark:shadow-card-dark transition-all duration-300">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-xs uppercase font-bold tracking-wider text-slate-500 dark:text-slate-400">Confirmed Slots</p>
                <p className="text-3xl font-extrabold text-emerald-600 dark:text-emerald-400">{stats.confirmed}</p>
              </div>
              <div className="p-3 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-500/10 dark:border-emerald-500/20 rounded-2xl text-emerald-500 dark:text-emerald-400">
                <CheckCircle2 className="w-6 h-6" />
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
                <Users className="w-6 h-6" />
              </div>
            </div>
          </SpotlightCard>
        </MotionContainer>

        {/* Quick Actions */}
        <MotionContainer delay={0.2} className="grid grid-cols-1 md:grid-cols-3 gap-6">
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

        {/* Upcoming Schedule Slots */}
        <MotionContainer delay={0.25} className="bg-white dark:bg-slate-900/95 rounded-3xl shadow-card dark:shadow-card-dark border border-primary-500/10 dark:border-primary-500/20 p-6 sm:p-8 space-y-6 transition-all duration-300">
          <div className="absolute top-0 inset-x-0 h-1 bg-primary-500 dark:shadow-[0_0_20px_rgba(153,0,0,0.3)]" />
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-700 pb-4">
            <div className="flex items-center gap-2">
              <CalendarIcon className="w-5 h-5 text-primary-500 dark:text-primary-400" />
              <h2 className="text-xl font-display font-bold text-slate-900 dark:text-white">Your Upcoming Availability</h2>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xs text-slate-500 dark:text-slate-400">
                {schedule.length} total slot{schedule.length !== 1 ? 's' : ''}
              </span>
              <Link to="/faculty/manage-schedule" className="text-xs font-semibold text-primary-500 dark:text-primary-400 hover:text-primary-600 dark:hover:text-primary-300 flex items-center gap-1">
                <span>Manage</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          {scheduleLoading ? (
            <div className="py-8 text-center text-slate-500 dark:text-slate-400 text-sm flex items-center justify-center gap-2">
              <div className="animate-spin rounded-full h-5 w-5 border-2 border-primary-500 dark:border-primary-400 border-t-transparent"></div>
              <span>Loading schedule...</span>
            </div>
          ) : schedule.length === 0 ? (
            <div className="py-8 text-center text-slate-500 dark:text-slate-400 space-y-3">
              <CalendarIcon className="w-12 h-12 text-slate-400 dark:text-slate-600 mx-auto" />
              <p className="text-slate-700 dark:text-slate-300 font-semibold text-base">No slots created yet</p>
              <p className="text-sm">Use the "Manage Schedule" button above to add your availability slots.</p>
              <Link to="/faculty/manage-schedule" className="inline-block mt-2">
                <MagneticButton variant="primary" className="py-2.5 px-5 text-sm shadow-md shadow-primary-500/25 dark:shadow-primary-500/50">
                  <PlusCircle className="w-4 h-4" />
                  <span>Create Your First Slot</span>
                </MagneticButton>
              </Link>
            </div>
          ) : upcomingSlots.length === 0 ? (
            <div className="py-8 text-center text-slate-500 dark:text-slate-400 space-y-2">
              <CalendarIcon className="w-8 h-8 text-slate-400 dark:text-slate-600 mx-auto" />
              <p className="text-slate-700 dark:text-slate-300 font-semibold text-sm">No upcoming slots</p>
              <p className="text-xs">All your slots are in the past. Create new slots for future dates.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {upcomingSlots.map((slot) => (
                <div key={slot._id} className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 hover:border-primary-500/30 dark:hover:border-primary-500/40 transition-colors">
                  <p className="text-sm font-medium text-slate-900 dark:text-white">{formatDateDisplay(slot.date)}</p>
                  <p className="text-xs text-primary-600 dark:text-primary-400">
                    {formatTimeDisplay(slot.startTime)} - {formatTimeDisplay(slot.endTime)}
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className={`text-[10px] font-medium ${slot.isAvailable ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-500 dark:text-red-400'}`}>
                      {slot.isAvailable ? '✅ Available' : '❌ Unavailable'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </MotionContainer>

        {/* Pending Requests Queue */}
        <MotionContainer delay={0.3} className="bg-white dark:bg-slate-900/95 rounded-3xl shadow-card dark:shadow-card-dark border border-primary-500/10 dark:border-primary-500/20 p-6 sm:p-8 space-y-6 transition-all duration-300">
          <div className="absolute top-0 inset-x-0 h-1 bg-primary-500 dark:shadow-[0_0_20px_rgba(153,0,0,0.3)]" />
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-700 pb-4">
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-amber-500 dark:text-amber-400" />
              <h2 className="text-xl font-display font-bold text-slate-900 dark:text-white">Pending Student Requests</h2>
              {pendingAppointments.length > 0 && (
                <span className="px-2 py-0.5 text-xs font-bold rounded-full bg-amber-100 dark:bg-amber-950/50 text-amber-700 dark:text-amber-400">
                  {pendingAppointments.length}
                </span>
              )}
            </div>
            <Link to="/faculty/appointments" className="text-xs font-semibold text-primary-500 dark:text-primary-400 hover:text-primary-600 dark:hover:text-primary-300 flex items-center gap-1">
              <span>View All</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {loading ? (
            <div className="py-8 text-center text-slate-500 dark:text-slate-400">Loading pending requests...</div>
          ) : pendingAppointments.length > 0 ? (
            <div className="space-y-4">
              {pendingAppointments.map((appointment) => (
                <div key={appointment._id} className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 gap-4 hover:border-primary-500/30 dark:hover:border-primary-500/40 transition-colors">
                  <div className="flex items-center gap-3 flex-grow min-w-0">
                    <div className="w-10 h-10 rounded-xl bg-primary-50 dark:bg-primary-950/30 border border-primary-500/10 dark:border-primary-500/20 flex items-center justify-center font-bold text-base shrink-0 overflow-hidden">
                      {appointment.studentId?.profileImage ? (
                        <img src={appointment.studentId.profileImage} alt={appointment.studentId?.name} className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-primary-500 dark:text-primary-400">{appointment.studentId?.name?.[0]?.toUpperCase() || 'S'}</span>
                      )}
                    </div>
                    <div className="space-y-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-bold text-slate-900 dark:text-white text-base">{appointment.studentId?.name || 'Student'}</p>
                        <span className="text-xs font-mono text-slate-500 dark:text-slate-400 bg-white dark:bg-slate-900 px-2 py-0.5 rounded border border-slate-200 dark:border-slate-700">
                          {appointment.studentId?.studentId || 'ID'}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        📅 {formatDateDisplay(appointment.date)} at {formatTimeDisplay(appointment.startTime)} - {formatTimeDisplay(appointment.endTime)}
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400 italic">Purpose: "{appointment.purpose}"</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2.5 shrink-0 w-full sm:w-auto">
                    <MagneticButton
                      variant="emerald"
                      className="py-1.5 px-3 text-xs flex-1 sm:flex-none shadow-md shadow-emerald-500/25 dark:shadow-emerald-500/50"
                      onClick={() => handleStatusUpdate(appointment._id, 'confirmed')}
                    >
                      <Check className="w-4 h-4" />
                      <span>Approve</span>
                    </MagneticButton>
                    <MagneticButton
                      variant="danger"
                      className="py-1.5 px-3 text-xs flex-1 sm:flex-none shadow-md shadow-red-500/25 dark:shadow-red-500/50"
                      onClick={() => handleStatusUpdate(appointment._id, 'cancelled')}
                    >
                      <X className="w-4 h-4" />
                      <span>Decline</span>
                    </MagneticButton>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-12 text-center text-slate-500 dark:text-slate-400 space-y-2">
              <CheckCircle2 className="w-8 h-8 text-emerald-500 dark:text-emerald-400 mx-auto opacity-80" />
              <p className="text-slate-700 dark:text-slate-300 font-medium">All pending requests cleared!</p>
              <p className="text-xs">No pending student booking requests waiting for review.</p>
            </div>
          )}
        </MotionContainer>
      </div>
    </PageTransition>
  );
};

export default FacultyDashboard;