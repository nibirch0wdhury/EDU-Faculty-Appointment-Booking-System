import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Clock, Users, CheckCircle2, PlusCircle, List, Mail, ArrowRight, Sparkles, Check, X } from 'lucide-react';
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
      icon: <PlusCircle className="w-6 h-6 text-indigo-400" />,
      title: 'Manage Schedule',
      description: 'Set your consultation hours & slots',
      link: '/faculty/manage-schedule',
      spotlight: 'rgba(99, 102, 241, 0.25)',
    },
    {
      icon: <List className="w-6 h-6 text-emerald-400" />,
      title: 'View Appointments',
      description: 'See all past & upcoming consultations',
      link: '/faculty/appointments',
      spotlight: 'rgba(16, 185, 129, 0.25)',
    },
    {
      icon: <Mail className="w-6 h-6 text-cyan-400" />,
      title: 'My Messages',
      description: 'Check student messages and contact replies',
      link: '/user/messages',
      spotlight: 'rgba(6, 182, 212, 0.25)',
    },
  ];

  const pendingAppointments = appointments.filter(a => a.status === 'pending').slice(0, 4);

  return (
    <PageTransition className="py-8 md:py-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
      {/* Header Banner */}
      <MotionContainer className="glass-panel p-8 relative overflow-hidden flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="space-y-2 z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            <span>Faculty Workspace</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white">
            Welcome Back, <span className="animated-gradient-text">Prof. {user?.name}</span>!
          </h1>
          <p className="text-slate-400 text-sm">
            {user?.department ? `${user.department} Department` : 'East Delta University Faculty'} • ID: {user?.facultyId || 'FAC-Member'}
          </p>
        </div>
        <div className="z-10 shrink-0">
          <Link
            to="/faculty/manage-schedule"
            className="flex items-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold text-sm shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 border border-indigo-400/30"
          >
            <PlusCircle className="w-5 h-5" />
            <span>Update Availability</span>
          </Link>
        </div>
      </MotionContainer>

      {/* Stats Grid */}
      <MotionContainer delay={0.1} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <SpotlightCard spotlightColor="rgba(99, 102, 241, 0.25)" className="p-6">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-xs uppercase font-bold tracking-wider text-slate-400">Total Consultations</p>
              <p className="text-3xl font-extrabold text-white">{stats.total}</p>
            </div>
            <div className="p-3 bg-indigo-600/20 border border-indigo-500/30 rounded-2xl text-indigo-400">
              <Calendar className="w-6 h-6" />
            </div>
          </div>
        </SpotlightCard>

        <SpotlightCard spotlightColor="rgba(245, 158, 11, 0.25)" className="p-6">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-xs uppercase font-bold tracking-wider text-slate-400">Pending Approval</p>
              <p className="text-3xl font-extrabold text-amber-400">{stats.pending}</p>
            </div>
            <div className="p-3 bg-amber-600/20 border border-amber-500/30 rounded-2xl text-amber-400">
              <Clock className="w-6 h-6" />
            </div>
          </div>
        </SpotlightCard>

        <SpotlightCard spotlightColor="rgba(16, 185, 129, 0.25)" className="p-6">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-xs uppercase font-bold tracking-wider text-slate-400">Confirmed Slots</p>
              <p className="text-3xl font-extrabold text-emerald-400">{stats.confirmed}</p>
            </div>
            <div className="p-3 bg-emerald-600/20 border border-emerald-500/30 rounded-2xl text-emerald-400">
              <CheckCircle2 className="w-6 h-6" />
            </div>
          </div>
        </SpotlightCard>

        <SpotlightCard spotlightColor="rgba(139, 92, 246, 0.25)" className="p-6">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-xs uppercase font-bold tracking-wider text-slate-400">Completed Sessions</p>
              <p className="text-3xl font-extrabold text-purple-400">{stats.completed}</p>
            </div>
            <div className="p-3 bg-purple-600/20 border border-purple-500/30 rounded-2xl text-purple-400">
              <Users className="w-6 h-6" />
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

      {/* Pending Requests Queue */}
      <MotionContainer delay={0.3} className="glass-panel p-6 sm:p-8 space-y-6">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-amber-400" />
            <h2 className="text-xl font-bold text-white">Pending Student Requests</h2>
          </div>
          <Link to="/faculty/appointments" className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 flex items-center gap-1">
            <span>View All</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {loading ? (
          <div className="py-8 text-center text-slate-400">Loading pending requests...</div>
        ) : pendingAppointments.length > 0 ? (
          <div className="space-y-4">
            {pendingAppointments.map((appointment) => (
              <div key={appointment._id} className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 rounded-xl bg-slate-800/40 border border-slate-700/50 gap-4 hover:border-slate-600 transition-colors">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <p className="font-bold text-white text-base">{appointment.studentId?.name || 'Student'}</p>
                    <span className="text-xs font-mono text-slate-400 bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                      {appointment.studentId?.studentId || 'ID'}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400">
                    📅 {new Date(appointment.date).toLocaleDateString()} at {appointment.startTime} - {appointment.endTime}
                  </p>
                  <p className="text-xs text-slate-300 italic">Purpose: "{appointment.purpose}"</p>
                </div>
                <div className="flex items-center gap-2.5 shrink-0 w-full sm:w-auto">
                  <MagneticButton
                    variant="emerald"
                    className="py-1.5 px-3 text-xs flex-1 sm:flex-none"
                    onClick={() => handleStatusUpdate(appointment._id, 'confirmed')}
                  >
                    <Check className="w-4 h-4" />
                    <span>Approve</span>
                  </MagneticButton>
                  <MagneticButton
                    variant="danger"
                    className="py-1.5 px-3 text-xs flex-1 sm:flex-none"
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
          <div className="py-12 text-center text-slate-400 space-y-2">
            <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto opacity-80" />
            <p className="text-slate-300 font-medium">All pending requests cleared!</p>
            <p className="text-xs">No pending student booking requests waiting for review.</p>
          </div>
        )}
      </MotionContainer>
    </PageTransition>
  );
};

export default FacultyDashboard;