import React, { createContext, useState, useContext, useEffect } from 'react';
import api from '../utils/api';
import { toast } from 'react-toastify';

export const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      fetchUserProfile();
    } else {
      setLoading(false);
    }
  }, []);

  const fetchUserProfile = async () => {
    try {
      console.log('🔄 Fetching user profile...');
      const response = await api.get('/auth/profile');
      if (response.data && typeof response.data === 'object' && response.data._id) {
        const userData = {
          _id: response.data._id,
          name: response.data.name || '',
          email: response.data.email || '',
          role: response.data.role || 'student',
          department: response.data.department || '',
          studentId: response.data.studentId || '',
          facultyId: response.data.facultyId || '',
          designation: response.data.designation || '',
          officeRoom: response.data.officeRoom || '',
          bio: response.data.bio || '',
          profileImage: response.data.profileImage || '',
          isActive: response.data.isActive,
          createdAt: response.data.createdAt,
          updatedAt: response.data.updatedAt,
        };
        console.log('✅ User profile loaded:', userData);
        setUser(userData);
      } else {
        throw new Error('Invalid profile response');
      }
    } catch (error) {
      console.error('❌ Fetch profile error:', error);
      
      // ✅ Check if maintenance mode
      if (error.response?.data?.maintenanceMode) {
        toast.warning('🚧 System is under maintenance. Please try again later.');
      }
      
      localStorage.removeItem('token');
      if (error.code !== 'ERR_CONNECTION_REFUSED') {
        toast.error('Session expired. Please login again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      const response = await api.post('/auth/login', { email, password });
      
      // ✅ Check if maintenance mode
      if (response.data?.maintenanceMode) {
        toast.error('🚧 System is under maintenance. Please try again later.');
        return { success: false, maintenanceMode: true };
      }
      
      if (!response.data || typeof response.data !== 'object' || !response.data.token) {
        toast.error('Invalid server response.');
        return { success: false };
      }

      const { token, ...userData } = response.data;
      localStorage.setItem('token', token);

      let hydratedUserData = userData;
      try {
        const profileResponse = await api.get('/auth/profile');
        if (profileResponse.data && typeof profileResponse.data === 'object' && profileResponse.data._id) {
          hydratedUserData = profileResponse.data;
        }
      } catch (profileError) {
        console.warn('⚠️ Could not hydrate profile after login:', profileError?.message || profileError);
      }

      setUser({
        _id: hydratedUserData._id,
        name: hydratedUserData.name || '',
        email: hydratedUserData.email || '',
        role: hydratedUserData.role || 'student',
        department: hydratedUserData.department || '',
        studentId: hydratedUserData.studentId || '',
        facultyId: hydratedUserData.facultyId || '',
        designation: hydratedUserData.designation || '',
        officeRoom: hydratedUserData.officeRoom || '',
        bio: hydratedUserData.bio || '',
        profileImage: hydratedUserData.profileImage || '',
      });
      
      toast.success('Login successful!');
      return { success: true, user: hydratedUserData };
    } catch (error) {
      console.error('Login error:', error);
      
      // ✅ Handle maintenance mode error
      if (error.response?.data?.maintenanceMode) {
        toast.error('🚧 System is under maintenance. Please try again later.');
        return { success: false, maintenanceMode: true };
      }
      
      if (error.code === 'ERR_CONNECTION_REFUSED') {
        toast.error('Cannot connect to server. Please try again later.');
      } else {
        const errorMsg = typeof error.response?.data?.message === 'string'
          ? error.response.data.message
          : 'Invalid email or password';
        toast.error(errorMsg);
      }
      return { success: false };
    }
  };

  const register = async (userData) => {
    try {
      const response = await api.post('/auth/register', userData);
      
      if (!response.data || typeof response.data !== 'object' || !response.data.token) {
        toast.error('Invalid server response.');
        return { success: false };
      }

      const { token, ...user } = response.data;
      localStorage.setItem('token', token);
      
      setUser({
        _id: user._id,
        name: user.name || '',
        email: user.email || '',
        role: user.role || 'student',
        department: user.department || '',
        studentId: user.studentId || '',
        facultyId: user.facultyId || '',
        designation: user.designation || '',
        officeRoom: user.officeRoom || '',
        bio: user.bio || '',
        profileImage: user.profileImage || '',
      });
      
      toast.success('Registration successful!');
      return { success: true, user };
    } catch (error) {
      console.error('Registration error:', error);
      
      // ✅ Handle maintenance mode error
      if (error.response?.data?.maintenanceMode) {
        toast.error('🚧 System is under maintenance. Registration is disabled.');
        return { success: false, maintenanceMode: true };
      }
      
      if (error.code === 'ERR_CONNECTION_REFUSED') {
        toast.error('Cannot connect to server. Please try again later.');
      } else {
        const errorMsg = typeof error.response?.data?.message === 'string'
          ? error.response.data.message
          : 'Registration failed';
        toast.error(errorMsg);
      }
      return { success: false };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
    toast.info('Logged out successfully');
  };

  const updateProfile = async (profileData) => {
    try {
      console.log('📤 Updating profile with data:', profileData);
      
      const response = await api.put('/auth/profile', profileData);
      
      if (!response.data || typeof response.data !== 'object') {
        throw new Error('Invalid update response');
      }

      const { token, ...updatedUserData } = response.data;
      
      if (token) {
        localStorage.setItem('token', token);
      }
      
      setUser({
        _id: updatedUserData._id,
        name: updatedUserData.name || '',
        email: updatedUserData.email || '',
        role: updatedUserData.role || 'student',
        department: updatedUserData.department || '',
        studentId: updatedUserData.studentId || '',
        facultyId: updatedUserData.facultyId || '',
        designation: updatedUserData.designation || '',
        officeRoom: updatedUserData.officeRoom || '',
        bio: updatedUserData.bio || '',
        profileImage: updatedUserData.profileImage || '',
      });
      
      console.log('✅ Profile updated successfully:', updatedUserData);
      toast.success('Profile updated successfully!');
      return { success: true, data: updatedUserData };
    } catch (error) {
      console.error('❌ Update profile error:', error);
      const errorMsg = typeof error.response?.data?.message === 'string'
        ? error.response.data.message
        : 'Failed to update profile';
      toast.error(errorMsg);
      return { success: false, error: errorMsg };
    }
  };

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    updateProfile,
    fetchUserProfile,
    isAuthenticated: !!user,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};