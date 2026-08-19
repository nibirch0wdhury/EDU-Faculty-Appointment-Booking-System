import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Clock, User, FileText, CheckCircle2, XCircle, AlertCircle, Sparkles, Check, X, RefreshCw, Loader2 } from 'lucide-react';
import { toast } from 'react-toastify';
import api from '../../utils/api';
import SpotlightCard from '../ui/SpotlightCard';
import MagneticButton from '../ui/MagneticButton';
import Badge from '../ui/Badge';
import PageTransition, { MotionContainer } from '../ui/PageTransition';

const FacultyAppointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState('all');
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    confirmed: 0,
    completed: 0,
    cancelled: 0,
  });

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async (showToast = false) => {
    try {
      setLoading(true);
      const response = await api.get('/appointments/faculty');
      const data = Array.isArray(response.data) ? response.data : response.data?.data || [];
      setAppointments(data);
      
      setStats({
        total: data.length,
        pending: data.filter(a => a.status === 'pending').length,
        confirmed: data.filter(a => a.status === 'confirmed').length,
        completed: data.filter(a => a.status === 'completed').length,
        cancelled: data.filter(a => a.status === 'cancelled').length,
      });
      
      if (showToast) {
        toast.success(`Loaded ${data.length} appointments`);
      }
    } catch (error) {
      console.error('Error fetching appointments:', error);
      toast.error('Failed to load appointments');
      setAppointments([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchAppointments(true);
  };

  const handleStatusUpdate = async (appointmentId, status) => {
    try {
      await api.put(`/appointments/${appointmentId}/status`, { status });
      toast.success(`Appointment ${status} successfully`);
      fetchAppointments();
    } catch (error) {
      console.error('Status update error:', error);
      toast.error('Failed to update appointment status');
    }
  };

  const getFilteredAppointments = () => {
    if (filter === 'all') return appointments;
    return appointments.filter(app => app.status === filter);
  };

  const filteredAppointments = getFilteredAppointments();

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

  const getStatusBorderColor = (status) => {
    switch(status) {
      case 'pending': return 'border-l-amber-500';
      case 'confirmed': return 'border-l-emerald-500';
      case 'completed': return 'border-l-primary-500';
      case 'cancelled': return 'border-l-red-500';
      default: return 'border-l-slate-300 dark:border-l-slate-600';
    }
  };

  const filterTabs = [
    { key: 'all', label: 'All', count: stats.total },
    { key: 'pending', label: 'Pending', count: stats.pending },
    { key: 'confirmed', label: 'Confirmed', count: stats.confirmed },
    { key: 'completed', label: 'Completed', count: stats.completed },
    { key: 'cancelled', label: 'Cancelled', count: stats.cancelled },
  ];

  return (
    <PageTransition className="py-8 md:py-12 bg-slate-50/80 dark:bg-slate-950/80 pattern-dots">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Header */}
        <MotionContainer className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary-50 dark:bg-primary-950/30 border border-primary-500/20 dark:border-primary-500/30 text-primary-600 dark:text-primary-400 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5 text-primary-500 dark:text-primary-400" />
              <span>Faculty Consultation Schedule</span>
            </div>
            <h1 className="text-3xl font-display font-bold text-slate-900 dark:text-white">Student Consultations</h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm">View and manage all student appointment requests</p>
          </div>

          <div className="flex items-center gap-3">
            <MagneticButton
              variant="secondary"
              onClick={handleRefresh}
              disabled={refreshing}
              className="py-2.5 px-4 text-xs"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </MagneticButton>
          </div>
        </MotionContainer>

        {/* Stats Cards */}
        <MotionContainer delay={0.05} className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          <SpotlightCard spotlightColor="rgba(153, 0, 0, 0.08)" className="p-4 bg-white dark:bg-slate-900/95 border-primary-500/10 dark:border-primary-500/20 shadow-card dark:shadow-card-dark transition-all duration-300">
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Total</p>
            <p className="text-2xl font-extrabold text-slate-900 dark:text-white">{stats.total}</p>
          </SpotlightCard>
          <SpotlightCard 
            spotlightColor="rgba(245, 158, 11, 0.08)" 
            className={`p-4 cursor-pointer hover:border-amber-500/30 dark:hover:border-amber-500/40 transition-colors ${filter === 'pending' ? 'border-amber-500/30 dark:border-amber-500/40' : ''} bg-white dark:bg-slate-900/95 border-primary-500/10 dark:border-primary-500/20 shadow-card dark:shadow-card-dark`}
            onClick={() => setFilter('pending')}
          >
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Pending</p>
            <p className="text-2xl font-extrabold text-amber-600 dark:text-amber-400">{stats.pending}</p>
          </SpotlightCard>
          <SpotlightCard 
            spotlightColor="rgba(16, 185, 129, 0.08)" 
            className={`p-4 cursor-pointer hover:border-emerald-500/30 dark:hover:border-emerald-500/40 transition-colors ${filter === 'confirmed' ? 'border-emerald-500/30 dark:border-emerald-500/40' : ''} bg-white dark:bg-slate-900/95 border-primary-500/10 dark:border-primary-500/20 shadow-card dark:shadow-card-dark`}
            onClick={() => setFilter('confirmed')}
          >
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Confirmed</p>
            <p className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400">{stats.confirmed}</p>
          </SpotlightCard>
          <SpotlightCard 
            spotlightColor="rgba(139, 92, 246, 0.08)" 
            className={`p-4 cursor-pointer hover:border-purple-500/30 dark:hover:border-purple-500/40 transition-colors ${filter === 'completed' ? 'border-purple-500/30 dark:border-purple-500/40' : ''} bg-white dark:bg-slate-900/95 border-primary-500/10 dark:border-primary-500/20 shadow-card dark:shadow-card-dark`}
            onClick={() => setFilter('completed')}
          >
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Completed</p>
            <p className="text-2xl font-extrabold text-purple-600 dark:text-purple-400">{stats.completed}</p>
          </SpotlightCard>
          <SpotlightCard 
            spotlightColor="rgba(244, 63, 94, 0.08)" 
            className={`p-4 cursor-pointer hover:border-red-500/30 dark:hover:border-red-500/40 transition-colors ${filter === 'cancelled' ? 'border-red-500/30 dark:border-red-500/40' : ''} bg-white dark:bg-slate-900/95 border-primary-500/10 dark:border-primary-500/20 shadow-card dark:shadow-card-dark`}
            onClick={() => setFilter('cancelled')}
          >
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Cancelled</p>
            <p className="text-2xl font-extrabold text-red-600 dark:text-red-400">{stats.cancelled}</p>
          </SpotlightCard>
        </MotionContainer>

        {/* Filter Tabs */}
        <MotionContainer delay={0.1}>
          <div className="flex gap-2 flex-wrap bg-white dark:bg-slate-900/95 p-2 rounded-2xl border border-primary-500/10 dark:border-primary-500/20 shadow-card dark:shadow-card-dark">
            {filterTabs.map((tab) => {
              const isActive = filter === tab.key;
              return (
                <button
                  key={tab.key}
                  onClick={() => setFilter(tab.key)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold capitalize transition-all duration-200 ${
                    isActive
                      ? 'bg-primary-500 text-white shadow-md dark:shadow-primary-500/50'
                      : 'text-slate-600 dark:text-slate-400 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-950/30'
                  }`}
                >
                  {tab.label} ({tab.count})
                </button>
              );
            })}
          </div>
        </MotionContainer>

        {/* Appointment List */}
        {loading ? (
          <div className="py-16 text-center text-slate-500 dark:text-slate-400 flex items-center justify-center gap-3">
            <Loader2 className="w-6 h-6 animate-spin text-primary-500 dark:text-primary-400" />
            <span>Loading consultations...</span>
          </div>
        ) : filteredAppointments.length > 0 ? (
          <MotionContainer delay={0.2} className="space-y-4">
            {filteredAppointments.map((appointment) => (
              <SpotlightCard 
                key={appointment._id} 
                spotlightColor="rgba(153, 0, 0, 0.08)" 
                className={`p-6 border-l-4 ${getStatusBorderColor(appointment.status)} bg-white dark:bg-slate-900/95 border-r border-t border-b border-primary-500/10 dark:border-primary-500/20 shadow-card dark:shadow-card-dark transition-all duration-300`}
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                  <div className="space-y-3 flex-grow">
                    <div className="flex items-center gap-3">
                      <div className="p-3 bg-primary-50 dark:bg-primary-950/30 border border-primary-500/10 dark:border-primary-500/20 rounded-2xl text-primary-500 dark:text-primary-400">
                        <User className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="font-bold text-lg text-slate-900 dark:text-white">
                          {appointment.studentId?.name || 'Student Name'}
                        </h3>
                        <p className="text-xs font-mono text-slate-500 dark:text-slate-400">
                          Student ID: {appointment.studentId?.studentId || 'N/A'}
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-4 text-xs text-slate-600 dark:text-slate-400">
                      <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-800/50 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700">
                        <Calendar className="w-3.5 h-3.5 text-primary-500 dark:text-primary-400" />
                        <span>{formatDateDisplay(appointment.date)}</span>
                      </div>
                      <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-800/50 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700">
                        <Clock className="w-3.5 h-3.5 text-primary-500 dark:text-primary-400" />
                        <span>{formatTimeDisplay(appointment.startTime)} - {formatTimeDisplay(appointment.endTime)}</span>
                      </div>
                    </div>

                    <p className="text-xs text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl border border-slate-200 dark:border-slate-700">
                      <strong className="text-slate-700 dark:text-slate-300">Meeting Purpose:</strong> "{appointment.purpose || 'Not specified'}"
                    </p>
                  </div>

                  <div className="flex flex-col items-end gap-4 border-t md:border-t-0 border-slate-200 dark:border-slate-700 pt-3 md:pt-0 shrink-0">
                    <Badge status={appointment.status} />

                    {appointment.status === 'pending' && (
                      <div className="flex gap-2">
                        <MagneticButton
                          variant="emerald"
                          className="py-1.5 px-3 text-xs shadow-md shadow-emerald-500/25 dark:shadow-emerald-500/50"
                          onClick={() => handleStatusUpdate(appointment._id, 'confirmed')}
                        >
                          <Check className="w-3.5 h-3.5" />
                          <span>Accept</span>
                        </MagneticButton>
                        <MagneticButton
                          variant="danger"
                          className="py-1.5 px-3 text-xs shadow-md shadow-red-500/25 dark:shadow-red-500/50"
                          onClick={() => handleStatusUpdate(appointment._id, 'cancelled')}
                        >
                          <X className="w-3.5 h-3.5" />
                          <span>Decline</span>
                        </MagneticButton>
                      </div>
                    )}

                    {appointment.status === 'confirmed' && (
                      <MagneticButton
                        variant="primary"
                        className="py-1.5 px-4 text-xs shadow-md shadow-primary-500/25 dark:shadow-primary-500/50"
                        onClick={() => handleStatusUpdate(appointment._id, 'completed')}
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Mark Completed</span>
                      </MagneticButton>
                    )}
                  </div>
                </div>
              </SpotlightCard>
            ))}
          </MotionContainer>
        ) : (
          <MotionContainer delay={0.2}>
            <div className="bg-white dark:bg-slate-900/95 rounded-3xl shadow-card dark:shadow-card-dark border border-primary-500/10 dark:border-primary-500/20 p-12 text-center space-y-4 transition-all duration-300">
              {filter === 'pending' ? (
                <>
                  <CheckCircle2 className="w-12 h-12 text-emerald-500 dark:text-emerald-400 mx-auto opacity-80" />
                  <h3 className="text-lg font-display font-bold text-slate-900 dark:text-white">All Clear!</h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
                    You have no pending appointment requests. Great job keeping up with your schedule!
                  </p>
                  <button
                    onClick={() => setFilter('all')}
                    className="text-xs text-primary-500 dark:text-primary-400 hover:text-primary-600 dark:hover:text-primary-300 font-semibold inline-flex items-center gap-1"
                  >
                    <span>View all appointments</span>
                    <span>→</span>
                  </button>
                </>
              ) : filter === 'confirmed' ? (
                <>
                  <Calendar className="w-12 h-12 text-slate-400 dark:text-slate-600 mx-auto" />
                  <h3 className="text-lg font-display font-bold text-slate-900 dark:text-white">No Confirmed Appointments</h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
                    You don't have any confirmed appointments yet.
                  </p>
                  <button
                    onClick={() => setFilter('all')}
                    className="text-xs text-primary-500 dark:text-primary-400 hover:text-primary-600 dark:hover:text-primary-300 font-semibold inline-flex items-center gap-1"
                  >
                    <span>View all appointments</span>
                    <span>→</span>
                  </button>
                </>
              ) : filter === 'completed' ? (
                <>
                  <CheckCircle2 className="w-12 h-12 text-slate-400 dark:text-slate-600 mx-auto" />
                  <h3 className="text-lg font-display font-bold text-slate-900 dark:text-white">No Completed Appointments</h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
                    You haven't completed any appointments yet.
                  </p>
                  <button
                    onClick={() => setFilter('all')}
                    className="text-xs text-primary-500 dark:text-primary-400 hover:text-primary-600 dark:hover:text-primary-300 font-semibold inline-flex items-center gap-1"
                  >
                    <span>View all appointments</span>
                    <span>→</span>
                  </button>
                </>
              ) : filter === 'cancelled' ? (
                <>
                  <XCircle className="w-12 h-12 text-slate-400 dark:text-slate-600 mx-auto" />
                  <h3 className="text-lg font-display font-bold text-slate-900 dark:text-white">No Cancelled Appointments</h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
                    You have no cancelled appointments.
                  </p>
                  <button
                    onClick={() => setFilter('all')}
                    className="text-xs text-primary-500 dark:text-primary-400 hover:text-primary-600 dark:hover:text-primary-300 font-semibold inline-flex items-center gap-1"
                  >
                    <span>View all appointments</span>
                    <span>→</span>
                  </button>
                </>
              ) : (
                <>
                  <Calendar className="w-12 h-12 text-slate-400 dark:text-slate-600 mx-auto" />
                  <h3 className="text-lg font-display font-bold text-slate-900 dark:text-white">No Consultations Found</h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
                    You don't have any student consultation requests yet.
                  </p>
                  <Link to="/faculty/manage-schedule" className="inline-block">
                    <MagneticButton variant="primary" className="py-2.5 px-6 text-xs shadow-md shadow-primary-500/25 dark:shadow-primary-500/50">
                      <span>Manage Your Schedule</span>
                    </MagneticButton>
                  </Link>
                </>
              )}
            </div>
          </MotionContainer>
        )}
      </div>
    </PageTransition>
  );
};

export default FacultyAppointments;