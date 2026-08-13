import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { Plus, Trash2, Clock, Sparkles } from 'lucide-react';
import api from '../../utils/api';
import MagneticButton from '../ui/MagneticButton';
import SpotlightCard from '../ui/SpotlightCard';
import PageTransition, { MotionContainer } from '../ui/PageTransition';

const ManageSchedule = () => {
  const [schedule, setSchedule] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newSlot, setNewSlot] = useState({
    day: 'Monday',
    startTime: '09:00',
    endTime: '10:00',
  });

  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  useEffect(() => {
    fetchSchedule();
  }, []);

  const fetchSchedule = async () => {
    try {
      const response = await api.get('/faculty/schedule');
      setSchedule(response.data || []);
    } catch (error) {
      toast.error('Failed to load schedule');
    } finally {
      setLoading(false);
    }
  };

  const handleAddSlot = async (e) => {
    e.preventDefault();
    if (newSlot.startTime >= newSlot.endTime) {
      toast.error('Start time must be before end time');
      return;
    }

    try {
      await api.post('/faculty/schedule', newSlot);
      toast.success('Slot added successfully');
      fetchSchedule();
      setNewSlot({
        day: 'Monday',
        startTime: '09:00',
        endTime: '10:00',
      });
    } catch (error) {
      toast.error('Failed to add slot');
    }
  };

  const handleDeleteSlot = async (slotId) => {
    if (!window.confirm('Are you sure you want to delete this slot?')) return;

    try {
      await api.delete(`/faculty/schedule/${slotId}`);
      toast.success('Slot deleted successfully');
      fetchSchedule();
    } catch (error) {
      toast.error('Failed to delete slot');
    }
  };

  const toggleAvailability = async (slotId, currentStatus) => {
    try {
      await api.put(`/faculty/schedule/${slotId}/toggle`, {
        isAvailable: !currentStatus,
      });
      toast.success('Availability updated');
      fetchSchedule();
    } catch (error) {
      toast.error('Failed to update availability');
    }
  };

  return (
    <PageTransition className="py-8 md:py-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
      <MotionContainer className="space-y-1">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-xs font-semibold">
          <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
          <span>Faculty Schedule Manager</span>
        </div>
        <h1 className="text-3xl font-extrabold text-white">Manage Consultation Availability</h1>
      </MotionContainer>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Add New Slot Form */}
        <MotionContainer delay={0.1}>
          <div className="glass-panel p-6 sm:p-8 space-y-6">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Plus className="w-5 h-5 text-indigo-400" />
              <span>Add New Time Slot</span>
            </h2>

            <form onSubmit={handleAddSlot} className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-slate-200 mb-1.5">Day of Week</label>
                <select
                  value={newSlot.day}
                  onChange={(e) => setNewSlot({ ...newSlot, day: e.target.value })}
                  className="glass-input bg-slate-900"
                  required
                >
                  {days.map(day => (
                    <option key={day} value={day} className="bg-slate-900">{day}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-200 mb-1.5">Start Time</label>
                  <input
                    type="time"
                    value={newSlot.startTime}
                    onChange={(e) => setNewSlot({ ...newSlot, startTime: e.target.value })}
                    className="glass-input"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-200 mb-1.5">End Time</label>
                  <input
                    type="time"
                    value={newSlot.endTime}
                    onChange={(e) => setNewSlot({ ...newSlot, endTime: e.target.value })}
                    className="glass-input"
                    required
                  />
                </div>
              </div>

              <MagneticButton type="submit" variant="primary" className="w-full py-3">
                <Plus className="w-4 h-4" />
                <span>Add Consultation Slot</span>
              </MagneticButton>
            </form>
          </div>
        </MotionContainer>

        {/* Current Schedule */}
        <MotionContainer delay={0.2}>
          <div className="glass-panel p-6 sm:p-8 space-y-6">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Clock className="w-5 h-5 text-emerald-400" />
              <span>Configured Schedule Slots</span>
            </h2>

            {loading ? (
              <div className="py-8 text-center text-slate-400 text-sm">Loading schedule...</div>
            ) : schedule.length > 0 ? (
              <div className="space-y-3">
                {schedule.map((slot) => (
                  <SpotlightCard key={slot._id} spotlightColor="rgba(99, 102, 241, 0.15)" className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <p className="font-bold text-white text-sm">{slot.day}</p>
                        <p className="text-xs text-slate-400 flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-indigo-400" />
                          <span>{slot.startTime} - {slot.endTime}</span>
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => toggleAvailability(slot._id, slot.isAvailable)}
                          className={`px-3 py-1 rounded-full text-xs font-bold transition-all ${
                            slot.isAvailable
                              ? 'bg-emerald-500/15 border border-emerald-500/30 text-emerald-300'
                              : 'bg-rose-500/15 border border-rose-500/30 text-rose-300'
                          }`}
                        >
                          {slot.isAvailable ? 'Available' : 'Unavailable'}
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteSlot(slot._id)}
                          className="p-2 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-xl transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </SpotlightCard>
                ))}
              </div>
            ) : (
              <div className="py-12 text-center text-slate-400 space-y-2">
                <Clock className="w-8 h-8 text-slate-600 mx-auto" />
                <p className="text-slate-300 font-semibold text-sm">No slots created yet</p>
                <p className="text-xs">Use the form to add your weekly availability slots.</p>
              </div>
            )}
          </div>
        </MotionContainer>
      </div>
    </PageTransition>
  );
};

export default ManageSchedule;