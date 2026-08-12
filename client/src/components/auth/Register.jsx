// src/components/auth/Register.jsx
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { User, Mail, Lock, Building, Briefcase, UserCircle, BadgeCheck } from 'lucide-react';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'student',
    department: '',
    studentId: '',
    facultyId: '',
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Full name is required';
    }
    
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }
    
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    
    if (formData.role === 'student' && !formData.studentId) {
      newErrors.studentId = 'Student ID is required for students';
    }
    
    if (formData.role === 'faculty' && !formData.facultyId) {
      newErrors.facultyId = 'Faculty ID is required for faculty members';
    }
    
    if ((formData.role === 'student' || formData.role === 'faculty') && !formData.department) {
      newErrors.department = 'Department is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    
    const registerData = {
      name: formData.name,
      email: formData.email,
      password: formData.password,
      role: formData.role,
      department: formData.department,
      studentId: formData.role === 'student' ? formData.studentId : undefined,
      facultyId: formData.role === 'faculty' ? formData.facultyId : undefined,
    };

    try {
      const result = await register(registerData);
      if (result.success) {
        switch (formData.role) {
          case 'student':
            navigate('/student/dashboard');
            break;
          case 'faculty':
            navigate('/faculty/dashboard');
            break;
          case 'admin':
            navigate('/admin/dashboard');
            break;
          default:
            navigate('/');
        }
      }
    } catch (error) {
      console.error('Registration error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 card">
        <div>
          <h2 className="text-3xl font-bold text-center text-gray-900">Create Account</h2>
          <p className="mt-2 text-center text-gray-600">
            Join EDU Appointment System
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {/* Full Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Full Name
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className={`input-field pl-10 ${errors.name ? 'border-red-500' : ''}`}
                placeholder="John Doe"
              />
            </div>
            {errors.name && (
              <p className="mt-1 text-sm text-red-600">{errors.name}</p>
            )}
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className={`input-field pl-10 ${errors.email ? 'border-red-500' : ''}`}
                placeholder="you@example.com"
              />
            </div>
            {errors.email && (
              <p className="mt-1 text-sm text-red-600">{errors.email}</p>
            )}
          </div>

          {/* Role Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Role
            </label>
            <select
              name="role"
              value={formData.role}
              onChange={handleChange}
              className="input-field"
            >
              <option value="student">Student</option>
              <option value="faculty">Faculty</option>
              <option value="admin">Administrator</option>
            </select>
          </div>

          {/* Department */}
          {(formData.role === 'student' || formData.role === 'faculty') && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <Building className="inline-block w-4 h-4 mr-1" />
                Department
              </label>
              <select
                name="department"
                value={formData.department}
                onChange={handleChange}
                className={`input-field ${errors.department ? 'border-red-500' : ''}`}
              >
                <option value="">Select Department</option>
                <option value="Computer Science">Computer Science</option>
                <option value="Business Administration">Business Administration</option>
                <option value="Engineering">Engineering</option>
                <option value="Mathematics">Mathematics</option>
                <option value="Physics">Physics</option>
                <option value="Chemistry">Chemistry</option>
                <option value="Biology">Biology</option>
                <option value="Economics">Economics</option>
                <option value="Psychology">Psychology</option>
                <option value="Sociology">Sociology</option>
              </select>
              {errors.department && (
                <p className="mt-1 text-sm text-red-600">{errors.department}</p>
              )}
            </div>
          )}

          {/* Student ID */}
          {formData.role === 'student' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <BadgeCheck className="inline-block w-4 h-4 mr-1" />
                Student ID
              </label>
              <div className="relative">
                <UserCircle className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  name="studentId"
                  value={formData.studentId}
                  onChange={handleChange}
                  className={`input-field pl-10 ${errors.studentId ? 'border-red-500' : ''}`}
                  placeholder="e.g., EDU-2024-001"
                />
              </div>
              {errors.studentId && (
                <p className="mt-1 text-sm text-red-600">{errors.studentId}</p>
              )}
            </div>
          )}

          {/* Faculty ID */}
          {formData.role === 'faculty' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <Briefcase className="inline-block w-4 h-4 mr-1" />
                Faculty ID
              </label>
              <div className="relative">
                <Briefcase className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  name="facultyId"
                  value={formData.facultyId}
                  onChange={handleChange}
                  className={`input-field pl-10 ${errors.facultyId ? 'border-red-500' : ''}`}
                  placeholder="e.g., FAC-2024-001"
                />
              </div>
              {errors.facultyId && (
                <p className="mt-1 text-sm text-red-600">{errors.facultyId}</p>
              )}
            </div>
          )}

          {/* Password */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className={`input-field pl-10 ${errors.password ? 'border-red-500' : ''}`}
                placeholder="••••••••"
              />
            </div>
            {errors.password && (
              <p className="mt-1 text-sm text-red-600">{errors.password}</p>
            )}
            <p className="mt-1 text-xs text-gray-500">
              Password must be at least 6 characters
            </p>
          </div>

          {/* Confirm Password */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Confirm Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                className={`input-field pl-10 ${errors.confirmPassword ? 'border-red-500' : ''}`}
                placeholder="••••••••"
              />
            </div>
            {errors.confirmPassword && (
              <p className="mt-1 text-sm text-red-600">{errors.confirmPassword}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Creating Account...
              </span>
            ) : (
              'Create Account'
            )}
          </button>

          <p className="text-center text-sm text-gray-600">
            Already have an account?{' '}
            <Link to="/login" className="text-primary-600 hover:text-primary-700 font-medium">
              Sign in here
            </Link>
          </p>

          <div className="text-center text-xs text-gray-500">
            By creating an account, you agree to our Terms of Service and Privacy Policy
          </div>
        </form>
      </div>
    </div>
  );
};

export default Register;