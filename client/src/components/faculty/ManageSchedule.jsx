import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { Plus, Trash2, Clock, Calendar as CalendarIcon } from 'lucide-react';
import api from '../../utils/api';

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
      setSchedule(response.data);
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
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Manage Schedule</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Add New Slot Form */}
        <div className="card">
          <h2 className="text-xl font-semibold mb-4">Add New Time Slot</h2>
          <form onSubmit={handleAddSlot} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Day</label>
              <select
                value={newSlot.day}
                onChange={(e) => setNewSlot({ ...newSlot, day: e.target.value })}
                className="input-field"
                required
              >
                {days.map(day => (
                  <option key={day} value={day}>{day}</option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Start Time</label>
                <input
                  type="time"
                  value={newSlot.startTime}
                  onChange={(e) => setNewSlot({ ...newSlot, startTime: e.target.value })}
                  className="input-field"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">End Time</label>
                <input
                  type="time"
                  value={newSlot.endTime}
                  onChange={(e) => setNewSlot({ ...newSlot, endTime: e.target.value })}
                  className="input-field"
                  required
                />
              </div>
            </div>

            <button type="submit" className="w-full btn-primary">
              <Plus className="inline-block w-4 h-4 mr-2" />
              Add Slot
            </button>
          </form>
        </div>

        {/* Current Schedule */}
        <div className="card">
          <h2 className="text-xl font-semibold mb-4">Current Schedule</h2>
          {loading ? (
            <p className="text-gray-600">Loading schedule...</p>
          ) : schedule.length > 0 ? (
            <div className="space-y-4">
              {schedule.map((slot) => (
                <div key={slot._id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium">{slot.day}</p>
                    <p className="text-sm text-gray-600">
                      <Clock className="inline-block w-4 h-4 mr-1" />
                      {slot.startTime} - {slot.endTime}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => toggleAvailability(slot._id, slot.isAvailable)}
                      className={`px-3 py-1 rounded text-sm ${
                        slot.isAvailable
                          ? 'bg-green-100 text-green-700 hover:bg-green-200'
                          : 'bg-red-100 text-red-700 hover:bg-red-200'
                      }`}
                    >
                      {slot.isAvailable ? 'Available' : 'Unavailable'}
                    </button>
                    <button
                      onClick={() => handleDeleteSlot(slot._id)}
                      className="p-2 text-red-600 hover:bg-red-100 rounded"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-600">No schedule slots added yet.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default ManageSchedule;