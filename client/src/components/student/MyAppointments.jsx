import React, { useState, useEffect } from 'react';
import { Calendar, Clock, User, XCircle, RefreshCw, Sparkles, PlusCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../../utils/api';
import SpotlightCard from '../ui/SpotlightCard';
import MagneticButton from '../ui/MagneticButton';
import Badge from '../ui/Badge';
import PageTransition, { MotionContainer } from '../ui/PageTransition';

const MyAppointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async (showToast = false) => {
    try {
      setLoading(true);
      const response = await api.get('/appointments/student');
      setAppointments(response.data || []);
      if (showToast) {
        toast.success(`Loaded ${response.data?.length || 0} appointments`);
      }
    } catch (error) {
      console.error('Error fetching appointments:', error);
      const savedAppointments = localStorage.getItem('appointments');
      if (savedAppointments) {
        try {
          setAppointments(JSON.parse(savedAppointments));
        } catch (e) {
          setAppointments([]);
        }
      } else {
        setAppointments([
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
        ]);
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchAppointments(true);
  };

  const handleCancel = async (appointmentId) => {
    if (!window.confirm('Are you sure you want to cancel this appointment?')) return;

    try {
      await api.put(`/appointments/${appointmentId}/cancel`);
      toast.success('Appointment cancelled successfully');
      fetchAppointments();
    } catch (error) {
      console.error('Error cancelling appointment:', error);
      setAppointments(prev => 
        prev.map(app => 
          app._id === appointmentId 
            ? { ...app, status: 'cancelled' } 
            : app
        )
      );
      toast.success('Appointment cancelled (Demo)');
    }
  };

  const filteredAppointments = appointments.filter(app => {
    if (filter === 'all') return true;
    return app.status === filter;
  });

  return (
    <PageTransition className="py-8 md:py-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
      {/* Header */}
      <MotionContainer className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            <span>Consultation History</span>
          </div>
          <h1 className="text-3xl font-extrabold text-white">My Appointments</h1>
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

          <Link to="/student/book-appointment">
            <MagneticButton variant="primary" className="py-2.5 px-4 text-xs">
              <PlusCircle className="w-4 h-4" />
              <span>Book New Slot</span>
            </MagneticButton>
          </Link>
        </div>
      </MotionContainer>

      {/* Filter Tabs */}
      <MotionContainer delay={0.1} className="flex gap-2 flex-wrap bg-slate-950/60 p-2 rounded-2xl border border-slate-800">
        {['all', 'pending', 'confirmed', 'completed', 'cancelled'].map((status) => {
          const count = appointments.filter(a => status === 'all' || a.status === status).length;
          const isActive = filter === status;
          return (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-4 py-2 rounded-xl text-xs font-bold capitalize transition-all duration-200 ${
                isActive
                  ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              {status} ({count})
            </button>
          );
        })}
      </MotionContainer>

      {/* List */}
      {loading ? (
        <div className="py-16 text-center text-slate-400">Loading appointments...</div>
      ) : filteredAppointments.length > 0 ? (
        <MotionContainer delay={0.2} className="space-y-4">
          {filteredAppointments.map((appointment) => (
            <SpotlightCard key={appointment._id} spotlightColor="rgba(99, 102, 241, 0.2)" className="p-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="space-y-3 flex-grow">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-indigo-600/20 border border-indigo-500/30 rounded-2xl text-indigo-400">
                      <User className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-bold text-lg text-white">
                        {appointment.facultyId?.name || 'Faculty Member'}
                      </h3>
                      <p className="text-xs text-slate-400">
                        {appointment.facultyId?.department || 'Academic Department'}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap gap-4 text-xs text-slate-300">
                    <div className="flex items-center gap-1.5 bg-slate-900/60 px-3 py-1.5 rounded-lg border border-slate-800">
                      <Calendar className="w-3.5 h-3.5 text-indigo-400" />
                      <span>
                        {new Date(appointment.date).toLocaleDateString('en-US', {
                          weekday: 'short',
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric'
                        })}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 bg-slate-900/60 px-3 py-1.5 rounded-lg border border-slate-800">
                      <Clock className="w-3.5 h-3.5 text-purple-400" />
                      <span>{appointment.startTime} - {appointment.endTime || 'Slot End'}</span>
                    </div>
                  </div>

                  <p className="text-xs text-slate-300 bg-slate-800/30 p-3 rounded-xl border border-slate-700/40">
                    <strong className="text-slate-200">Purpose:</strong> {appointment.purpose}
                  </p>
                </div>

                <div className="flex flex-row md:flex-col items-center md:items-end justify-between gap-4 border-t md:border-t-0 border-slate-800 pt-3 md:pt-0">
                  <Badge status={appointment.status} />

                  {appointment.status !== 'cancelled' && appointment.status !== 'completed' && (
                    <button
                      onClick={() => handleCancel(appointment._id)}
                      className="text-xs font-semibold text-rose-400 hover:text-rose-300 flex items-center gap-1 hover:underline transition-all"
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
        <MotionContainer delay={0.2} className="glass-panel p-12 text-center space-y-4">
          <Calendar className="w-12 h-12 text-slate-600 mx-auto" />
          <h3 className="text-lg font-bold text-white">No Appointments Found</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            {filter === 'all' 
              ? "You haven't scheduled any consultations with faculty members yet."
              : `No appointments marked as "${filter}".`}
          </p>
          {filter === 'all' && (
            <Link to="/student/book-appointment" className="inline-block pt-2">
              <MagneticButton variant="primary" className="py-2.5 px-6 text-xs">
                <span>Book Your First Slot</span>
              </MagneticButton>
            </Link>
          )}
        </MotionContainer>
      )}
    </PageTransition>
  );
};

export default MyAppointments;