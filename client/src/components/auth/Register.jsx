import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { User, Mail, Lock, Building, Briefcase, UserCircle, BadgeCheck, Eye, EyeOff, Sparkles, Loader2, ArrowRight } from 'lucide-react';
import MagneticButton from '../ui/MagneticButton';
import PageTransition, { MotionContainer } from '../ui/PageTransition';

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
  const [showPassword, setShowPassword] = useState(false);
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
      if (result?.success) {
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
    <PageTransition className="min-h-[calc(100vh-5rem)] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <MotionContainer className="max-w-xl w-full">
        <div className="glass-panel p-8 sm:p-10 space-y-8 relative overflow-hidden">
          {/* Subtle top glow line */}
          <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-emerald-400" />

          <div className="text-center space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
              <span>Join EDU Portal</span>
            </div>
            <h2 className="text-3xl font-extrabold text-white tracking-tight">Create Account</h2>
            <p className="text-slate-400 text-sm">Fill in your details to register as Student or Faculty</p>
          </div>

          <form className="space-y-5" onSubmit={handleSubmit}>
            {/* Role Switcher */}
            <div>
              <label className="block text-sm font-semibold text-slate-200 mb-2">Select Account Role</label>
              <div className="grid grid-cols-3 gap-2 bg-slate-950/60 p-1.5 rounded-xl border border-slate-800">
                {[
                  { id: 'student', label: 'Student' },
                  { id: 'faculty', label: 'Faculty' },
                  { id: 'admin', label: 'Admin' },
                ].map((roleItem) => (
                  <button
                    key={roleItem.id}
                    type="button"
                    onClick={() => {
                      setFormData(prev => ({ ...prev, role: roleItem.id }));
                      setErrors({});
                    }}
                    className={`py-2 text-xs font-bold rounded-lg transition-all duration-200 ${
                      formData.role === roleItem.id
                        ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {roleItem.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Name & Email */}
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-slate-200 mb-1.5">Full Name</label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className={`glass-input pl-11 ${errors.name ? 'border-rose-500' : ''}`}
                    placeholder="John Doe"
                  />
                </div>
                {errors.name && <p className="mt-1 text-xs text-rose-400">{errors.name}</p>}
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-200 mb-1.5">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className={`glass-input pl-11 ${errors.email ? 'border-rose-500' : ''}`}
                    placeholder="you@eastdelta.edu.bd"
                  />
                </div>
                {errors.email && <p className="mt-1 text-xs text-rose-400">{errors.email}</p>}
              </div>
            </div>

            {/* Department */}
            {(formData.role === 'student' || formData.role === 'faculty') && (
              <div>
                <label className="block text-sm font-semibold text-slate-200 mb-1.5">Academic Department</label>
                <div className="relative">
                  <Building className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5 pointer-events-none" />
                  <select
                    name="department"
                    value={formData.department}
                    onChange={handleChange}
                    className={`glass-input pl-11 bg-slate-900 ${errors.department ? 'border-rose-500' : ''}`}
                  >
                    <option value="" className="bg-slate-900 text-slate-400">Select Department</option>
                    <option value="Computer Science" className="bg-slate-900">Computer Science</option>
                    <option value="Business Administration" className="bg-slate-900">Business Administration</option>
                    <option value="Engineering" className="bg-slate-900">Engineering</option>
                    <option value="Mathematics" className="bg-slate-900">Mathematics</option>
                    <option value="Physics" className="bg-slate-900">Physics</option>
                    <option value="Chemistry" className="bg-slate-900">Chemistry</option>
                    <option value="Biology" className="bg-slate-900">Biology</option>
                    <option value="Economics" className="bg-slate-900">Economics</option>
                    <option value="Psychology" className="bg-slate-900">Psychology</option>
                    <option value="Sociology" className="bg-slate-900">Sociology</option>
                  </select>
                </div>
                {errors.department && <p className="mt-1 text-xs text-rose-400">{errors.department}</p>}
              </div>
            )}

            {/* ID Field */}
            {formData.role === 'student' && (
              <div>
                <label className="block text-sm font-semibold text-slate-200 mb-1.5">Student ID</label>
                <div className="relative">
                  <BadgeCheck className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                  <input
                    type="text"
                    name="studentId"
                    value={formData.studentId}
                    onChange={handleChange}
                    className={`glass-input pl-11 ${errors.studentId ? 'border-rose-500' : ''}`}
                    placeholder="e.g. EDU-2024-001"
                  />
                </div>
                {errors.studentId && <p className="mt-1 text-xs text-rose-400">{errors.studentId}</p>}
              </div>
            )}

            {formData.role === 'faculty' && (
              <div>
                <label className="block text-sm font-semibold text-slate-200 mb-1.5">Faculty ID</label>
                <div className="relative">
                  <Briefcase className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                  <input
                    type="text"
                    name="facultyId"
                    value={formData.facultyId}
                    onChange={handleChange}
                    className={`glass-input pl-11 ${errors.facultyId ? 'border-rose-500' : ''}`}
                    placeholder="e.g. FAC-2024-001"
                  />
                </div>
                {errors.facultyId && <p className="mt-1 text-xs text-rose-400">{errors.facultyId}</p>}
              </div>
            )}

            {/* Passwords */}
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-slate-200 mb-1.5">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    className={`glass-input pl-11 pr-11 ${errors.password ? 'border-rose-500' : ''}`}
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                {errors.password && <p className="mt-1 text-xs text-rose-400">{errors.password}</p>}
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-200 mb-1.5">Confirm Password</label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                  <input
                    type={showPassword ? "text" : "password"}
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className={`glass-input pl-11 ${errors.confirmPassword ? 'border-rose-500' : ''}`}
                    placeholder="••••••••"
                  />
                </div>
                {errors.confirmPassword && <p className="mt-1 text-xs text-rose-400">{errors.confirmPassword}</p>}
              </div>
            </div>

            <MagneticButton
              type="submit"
              disabled={loading}
              variant="primary"
              className="w-full py-3.5 mt-2"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Creating Account...</span>
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  <span>Complete Registration</span>
                  <ArrowRight className="w-4 h-4" />
                </span>
              )}
            </MagneticButton>

            <div className="text-center pt-2 border-t border-slate-800 space-y-2">
              <p className="text-sm text-slate-400">
                Already have an account?{' '}
                <Link to="/login" className="text-indigo-400 hover:text-indigo-300 font-semibold transition-colors">
                  Sign in here
                </Link>
              </p>
            </div>
          </form>
        </div>
      </MotionContainer>
    </PageTransition>
  );
};

export default Register;