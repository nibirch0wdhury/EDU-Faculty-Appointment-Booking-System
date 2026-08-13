import React, { useState, useEffect } from 'react';
import { Calendar, Clock, User, FileText, CheckCircle2, XCircle, AlertCircle, Sparkles, Check, X } from 'lucide-react';
import { toast } from 'react-toastify';
import api from '../../utils/api';
import SpotlightCard from '../ui/SpotlightCard';
import MagneticButton from '../ui/MagneticButton';
import Badge from '../ui/Badge';
import PageTransition, { MotionContainer } from '../ui/PageTransition';

const FacultyAppointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    try {
      const response = await api.get('/appointments/faculty');
      setAppointments(response.data || []);
    } catch (error) {
      toast.error('Failed to load appointments');
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
      toast.error('Failed to update appointment');
    }
  };

  const filteredAppointments = appointments.filter(app => {
    if (filter === 'all') return true;
    return app.status === filter;
  });

  return (
    <PageTransition className="py-8 md:py-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
      {/* Header */}
      <MotionContainer className="space-y-1">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-xs font-semibold">
          <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
          <span>Faculty Consultation Schedule</span>
        </div>
        <h1 className="text-3xl font-extrabold text-white">Student Consultations</h1>
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

      {/* Appointment List */}
      {loading ? (
        <div className="py-16 text-center text-slate-400">Loading consultations...</div>
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
                        {appointment.studentId?.name || 'Student Name'}
                      </h3>
                      <p className="text-xs font-mono text-slate-400">
                        Student ID: {appointment.studentId?.studentId || 'N/A'}
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
                      <span>{appointment.startTime} - {appointment.endTime || 'End Slot'}</span>
                    </div>
                  </div>

                  <p className="text-xs text-slate-300 bg-slate-800/30 p-3 rounded-xl border border-slate-700/40">
                    <strong className="text-slate-200">Meeting Purpose:</strong> "{appointment.purpose}"
                  </p>
                </div>

                <div className="flex flex-col items-end gap-4 border-t md:border-t-0 border-slate-800 pt-3 md:pt-0 shrink-0">
                  <Badge status={appointment.status} />

                  {appointment.status === 'pending' && (
                    <div className="flex gap-2">
                      <MagneticButton
                        variant="emerald"
                        className="py-1.5 px-3 text-xs"
                        onClick={() => handleStatusUpdate(appointment._id, 'confirmed')}
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>Accept</span>
                      </MagneticButton>
                      <MagneticButton
                        variant="danger"
                        className="py-1.5 px-3 text-xs"
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
                      className="py-1.5 px-4 text-xs"
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
        <MotionContainer delay={0.2} className="glass-panel p-12 text-center space-y-3">
          <Calendar className="w-12 h-12 text-slate-600 mx-auto" />
          <h3 className="text-lg font-bold text-white">No Consultations Found</h3>
          <p className="text-xs text-slate-400">
            {filter === 'all' 
              ? "You don't have any student consultation requests recorded yet."
              : `No appointments currently marked as "${filter}".`}
          </p>
        </MotionContainer>
      )}
    </PageTransition>
  );
};

export default FacultyAppointments;