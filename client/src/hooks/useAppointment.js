import { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-toastify';
import api from '../utils/api';

export const useAppointment = () => {
  const [appointments, setAppointments] = useState([]);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    confirmed: 0,
    completed: 0,
    cancelled: 0,
  });

  // Fetch student appointments
  const fetchStudentAppointments = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get('/appointments/student');
      const data = response.data;
      setAppointments(data);
      updateStats(data);
      return data;
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to fetch appointments';
      setError(message);
      toast.error(message);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch faculty appointments
  const fetchFacultyAppointments = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get('/appointments/faculty');
      const data = response.data;
      setAppointments(data);
      updateStats(data);
      return data;
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to fetch appointments';
      setError(message);
      toast.error(message);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch all appointments (for admin)
  const fetchAllAppointments = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get('/appointments/all');
      const data = response.data;
      setAppointments(data);
      updateStats(data);
      return data;
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to fetch appointments';
      setError(message);
      toast.error(message);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  // Book a new appointment
  const bookAppointment = useCallback(async (appointmentData) => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.post('/appointments/book', appointmentData);
      toast.success('Appointment booked successfully!');
      return response.data;
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to book appointment';
      setError(message);
      toast.error(message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // Cancel an appointment
  const cancelAppointment = useCallback(async (appointmentId) => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.put(`/appointments/${appointmentId}/cancel`);
      toast.success('Appointment cancelled successfully');
      return response.data;
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to cancel appointment';
      setError(message);
      toast.error(message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // Update appointment status (for faculty/admin)
  const updateAppointmentStatus = useCallback(async (appointmentId, status) => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.put(`/appointments/${appointmentId}/status`, { status });
      toast.success(`Appointment ${status} successfully`);
      return response.data;
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to update appointment status';
      setError(message);
      toast.error(message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // Get appointment by ID
  const getAppointmentById = useCallback(async (appointmentId) => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get(`/appointments/${appointmentId}`);
      setSelectedAppointment(response.data);
      return response.data;
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to fetch appointment';
      setError(message);
      toast.error(message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // Get appointments by date range
  const getAppointmentsByDateRange = useCallback(async (startDate, endDate) => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get('/appointments/range', {
        params: {
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString(),
        }
      });
      return response.data;
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to fetch appointments';
      setError(message);
      toast.error(message);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  // Get upcoming appointments
  const getUpcomingAppointments = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get('/appointments/upcoming');
      return response.data;
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to fetch upcoming appointments';
      setError(message);
      toast.error(message);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  // Update stats helper function
  const updateStats = useCallback((data) => {
    if (data && data.length > 0) {
      setStats({
        total: data.length,
        pending: data.filter(a => a.status === 'pending').length,
        confirmed: data.filter(a => a.status === 'confirmed').length,
        completed: data.filter(a => a.status === 'completed').length,
        cancelled: data.filter(a => a.status === 'cancelled').length,
      });
    } else {
      setStats({
        total: 0,
        pending: 0,
        confirmed: 0,
        completed: 0,
        cancelled: 0,
      });
    }
  }, []);

  // Filter appointments by status
  const filterByStatus = useCallback((status) => {
    if (status === 'all') return appointments;
    return appointments.filter(app => app.status === status);
  }, [appointments]);

  // Filter appointments by date
  const filterByDate = useCallback((date) => {
    const targetDate = new Date(date);
    return appointments.filter(app => {
      const appDate = new Date(app.date);
      return appDate.toDateString() === targetDate.toDateString();
    });
  }, [appointments]);

  // Clear selected appointment
  const clearSelectedAppointment = useCallback(() => {
    setSelectedAppointment(null);
  }, []);

  // Reset error
  const resetError = useCallback(() => {
    setError(null);
  }, []);

  // Reset all
  const resetAll = useCallback(() => {
    setAppointments([]);
    setSelectedAppointment(null);
    setError(null);
    setStats({
      total: 0,
      pending: 0,
      confirmed: 0,
      completed: 0,
      cancelled: 0,
    });
  }, []);

  return {
    appointments,
    selectedAppointment,
    loading,
    error,
    stats,
    fetchStudentAppointments,
    fetchFacultyAppointments,
    fetchAllAppointments,
    bookAppointment,
    cancelAppointment,
    updateAppointmentStatus,
    getAppointmentById,
    getAppointmentsByDateRange,
    getUpcomingAppointments,
    filterByStatus,
    filterByDate,
    clearSelectedAppointment,
    resetError,
    resetAll,
  };
};