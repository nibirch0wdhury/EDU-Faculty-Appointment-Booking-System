import React, { useState, useEffect } from 'react';
import { Calendar, Clock, User, XCircle, RefreshCw, Sparkles, PlusCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../../utils/api';
import SpotlightCard from '../ui/SpotlightCard';
import MagneticButton from '../ui/MagneticButton';
import Badge from '../ui/Badge';
import PageTransition, { MotionContainer } from '../ui/PageTransition';
import ConfirmModal from '../ui/ConfirmModal';

const MyAppointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [refreshing, setRefreshing] = useState(false);

  // Cancel Modal State
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [appointmentToCancel, setAppointmentToCancel] = useState(null);
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async (showToast = false) => {
    try {
      setLoading(true);
      const response = await api.get('/appointments/student');
      const data = response.data?.data || response.data || [];
      setAppointments(data);
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

  const promptCancelAppointment = (appointment) => {
    setAppointmentToCancel(appointment);
    setCancelModalOpen(true);
  };

  const handleConfirmCancelAppointment = async () => {
    if (!appointmentToCancel) return;
    setCancelling(true);
    try {
      await api.put(`/appointments/${appointmentToCancel._id}/cancel`);
      toast.success('Appointment cancelled successfully');
      setCancelModalOpen(false);
      setAppointmentToCancel(null);
      fetchAppointments();
    } catch (error) {
      console.error('Error cancelling appointment:', error);
      const msg = error.response?.data?.message || 'Failed to cancel appointment';
      toast.error(msg);
    } finally {
      setCancelling(false);
    }
  };

  const filteredAppointments = appointments.filter(app => {
    if (filter === 'all') return true;
    return app.status === filter;
  });

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
        {/* Header */}
        <MotionContainer className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary-50 dark:bg-primary-950/30 border border-primary-500/20 dark:border-primary-500/30 text-primary-600 dark:text-primary-400 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5 text-primary-500 dark:text-primary-400" />
              <span>Consultation History</span>
            </div>
            <h1 className="text-3xl font-display font-bold text-slate-900 dark:text-white">My Appointments</h1>
          </div>

          <div className="flex items-center gap-3">
            <MagneticButton
              variant="secondary"
              onClick={handleRefresh}
              disabled={refreshing}
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </MagneticButton>

            <Link to="/student/book-appointment">
              <MagneticButton variant="primary" className="shadow-md shadow-primary-500/25 dark:shadow-primary-500/50">
                <PlusCircle className="w-4 h-4" />
                <span>Book New Slot</span>
              </MagneticButton>
            </Link>
          </div>
        </MotionContainer>

        {/* Filter Tabs */}
        <MotionContainer delay={0.1} className="flex gap-2 flex-wrap bg-white dark:bg-slate-900/95 p-2 rounded-2xl border border-primary-500/10 dark:border-primary-500/20 shadow-card dark:shadow-card-dark">
          {['all', 'pending', 'confirmed', 'completed', 'cancelled'].map((status) => {
            const count = appointments.filter(a => status === 'all' || a.status === status).length;
            const isActive = filter === status;
            return (
              <button
                key={status}
                onClick={() => setFilter(status)}
                className={`px-4 py-2 rounded-xl text-xs font-bold capitalize transition-all duration-200 ${
                  isActive
                    ? 'bg-primary-500 text-white shadow-md dark:shadow-primary-500/50'
                    : 'text-slate-600 dark:text-slate-400 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-950/30'
                }`}
              >
                {status} ({count})
              </button>
            );
          })}
        </MotionContainer>

        {/* List */}
        {loading ? (
          <div className="py-16 text-center text-slate-500 dark:text-slate-400 flex items-center justify-center gap-3">
            <div className="animate-spin rounded-full h-6 w-6 border-2 border-primary-500 dark:border-primary-400 border-t-transparent"></div>
            <span>Loading appointments...</span>
          </div>
        ) : filteredAppointments.length > 0 ? (
          <MotionContainer delay={0.2} className="space-y-4">
            {filteredAppointments.map((appointment) => (
              <SpotlightCard key={appointment._id} spotlightColor="rgba(153, 0, 0, 0.08)" className="p-6 bg-white dark:bg-slate-900/95 border-primary-500/10 dark:border-primary-500/20 shadow-card dark:shadow-card-dark transition-all duration-300">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                  <div className="space-y-3 flex-grow">
                    <div className="flex items-center gap-3">
                      <div className="p-3 bg-primary-50 dark:bg-primary-950/30 border border-primary-500/10 dark:border-primary-500/20 rounded-2xl text-primary-500 dark:text-primary-400">
                        <User className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="font-bold text-lg text-slate-900 dark:text-white">
                          {appointment.facultyId?.name || 'Faculty Member'}
                        </h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          {appointment.facultyId?.department || 'Academic Department'}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex flex-wrap gap-4 text-xs text-slate-600 dark:text-slate-400">
                      <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-800/50 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700">
                        <Calendar className="w-3.5 h-3.5 text-primary-500 dark:text-primary-400" />
                        <span>
                          {new Date(appointment.date).toLocaleDateString('en-US', {
                            weekday: 'short',
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric'
                          })}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-800/50 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700">
                        <Clock className="w-3.5 h-3.5 text-primary-500 dark:text-primary-400" />
                        <span>{formatTimeDisplay(appointment.startTime)} - {formatTimeDisplay(appointment.endTime)}</span>
                      </div>
                    </div>

                    <p className="text-xs text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl border border-slate-200 dark:border-slate-700">
                      <strong className="text-slate-700 dark:text-slate-300">Purpose:</strong> {appointment.purpose}
                    </p>
                  </div>

                  <div className="flex flex-row md:flex-col items-center md:items-end justify-between gap-4 border-t md:border-t-0 border-slate-200 dark:border-slate-700 pt-3 md:pt-0">
                    <Badge status={appointment.status} />

                    {appointment.status !== 'cancelled' && appointment.status !== 'completed' && (
                      <button
                        onClick={() => promptCancelAppointment(appointment)}
                        className="text-xs font-semibold text-red-500 dark:text-red-400 hover:text-red-600 dark:hover:text-red-300 flex items-center gap-1 hover:underline transition-all"
                      >
                        <XCircle className="w-3.5 h-3.5" />
                        <span>Cancel Booking</span>
                      </button>
                    )}
                  </div>
                </div>
              </SpotlightCard>
            ))}
          </MotionContainer>
        ) : (
          <MotionContainer delay={0.2} className="bg-white dark:bg-slate-900/95 rounded-3xl shadow-card dark:shadow-card-dark border border-primary-500/10 dark:border-primary-500/20 p-12 text-center space-y-4 transition-all duration-300">
            <Calendar className="w-12 h-12 text-slate-400 dark:text-slate-600 mx-auto" />
            <h3 className="text-lg font-display font-bold text-slate-900 dark:text-white">No Appointments Found</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
              {filter === 'all' 
                ? "You haven't scheduled any consultations with faculty members yet."
                : `No appointments marked as "${filter}".`}
            </p>
            {filter === 'all' && (
              <Link to="/student/book-appointment" className="inline-block pt-2">
                <MagneticButton variant="primary" className="py-2.5 px-6 text-xs shadow-md shadow-primary-500/25 dark:shadow-primary-500/50">
                  <span>Book Your First Slot</span>
                </MagneticButton>
              </Link>
            )}
          </MotionContainer>
        )}
      </div>

      {/* Glassmorphism Custom Confirm Modal */}
      <ConfirmModal
        isOpen={cancelModalOpen}
        onClose={() => setCancelModalOpen(false)}
        onConfirm={handleConfirmCancelAppointment}
        title="Cancel Appointment"
        message={
          appointmentToCancel ? (
            <span>
              Are you sure you want to cancel your appointment with{' '}
              <strong className="text-slate-900 dark:text-white">{appointmentToCancel.facultyId?.name || 'Faculty Member'}</strong> for{' '}
              <strong className="text-slate-900 dark:text-white">
                {new Date(appointmentToCancel.date).toLocaleDateString('en-US', {
                  weekday: 'short',
                  month: 'short',
                  day: 'numeric'
                })}
              </strong>?
            </span>
          ) : (
            'Are you sure you want to cancel this appointment?'
          )
        }
        confirmText="Yes, Cancel Booking"
        loading={cancelling}
      />
    </PageTransition>
  );
};

export default MyAppointments;