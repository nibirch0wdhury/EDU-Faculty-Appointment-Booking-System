import { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-toastify';
import api from '../utils/api';

export const useFaculty = () => {
  const [faculties, setFaculties] = useState([]);
  const [selectedFaculty, setSelectedFaculty] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch all faculties
  const fetchFaculties = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get('/faculty/all');
      setFaculties(response.data);
      return response.data;
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to fetch faculties';
      setError(message);
      toast.error(message);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch faculty by ID
  const fetchFacultyById = useCallback(async (facultyId) => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get(`/faculty/${facultyId}`);
      setSelectedFaculty(response.data);
      return response.data;
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to fetch faculty details';
      setError(message);
      toast.error(message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch faculty schedule
  const fetchFacultySchedule = useCallback(async (facultyId) => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get(`/faculty/${facultyId}/schedule`);
      return response.data;
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to fetch schedule';
      setError(message);
      toast.error(message);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  // Get available slots for a specific date
  const getAvailableSlots = useCallback(async (facultyId, date) => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get(`/faculty/${facultyId}/slots`, {
        params: { date: date.toISOString() }
      });
      return response.data;
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to fetch available slots';
      setError(message);
      toast.error(message);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  // Add schedule slot (for faculty)
  const addScheduleSlot = useCallback(async (slotData) => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.post('/faculty/schedule', slotData);
      toast.success('Schedule slot added successfully');
      return response.data;
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to add schedule slot';
      setError(message);
      toast.error(message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // Update schedule slot (for faculty)
  const updateScheduleSlot = useCallback(async (slotId, slotData) => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.put(`/faculty/schedule/${slotId}`, slotData);
      toast.success('Schedule slot updated successfully');
      return response.data;
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to update schedule slot';
      setError(message);
      toast.error(message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // Delete schedule slot (for faculty)
  const deleteScheduleSlot = useCallback(async (slotId) => {
    setLoading(true);
    setError(null);
    try {
      await api.delete(`/faculty/schedule/${slotId}`);
      toast.success('Schedule slot deleted successfully');
      return true;
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to delete schedule slot';
      setError(message);
      toast.error(message);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  // Toggle slot availability (for faculty)
  const toggleSlotAvailability = useCallback(async (slotId, currentStatus) => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.put(`/faculty/schedule/${slotId}/toggle`, {
        isAvailable: !currentStatus
      });
      toast.success('Availability updated successfully');
      return response.data;
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to update availability';
      setError(message);
      toast.error(message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // Search faculties by department or name
  const searchFaculties = useCallback(async (searchTerm) => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get('/faculty/search', {
        params: { query: searchTerm }
      });
      return response.data;
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to search faculties';
      setError(message);
      toast.error(message);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  // Get faculty by department
  const getFacultiesByDepartment = useCallback(async (department) => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get(`/faculty/department/${department}`);
      return response.data;
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to fetch faculties by department';
      setError(message);
      toast.error(message);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  // Clear selected faculty
  const clearSelectedFaculty = useCallback(() => {
    setSelectedFaculty(null);
  }, []);

  // Reset error
  const resetError = useCallback(() => {
    setError(null);
  }, []);

  return {
    faculties,
    selectedFaculty,
    loading,
    error,
    fetchFaculties,
    fetchFacultyById,
    fetchFacultySchedule,
    getAvailableSlots,
    addScheduleSlot,
    updateScheduleSlot,
    deleteScheduleSlot,
    toggleSlotAvailability,
    searchFaculties,
    getFacultiesByDepartment,
    clearSelectedFaculty,
    resetError,
  };
};