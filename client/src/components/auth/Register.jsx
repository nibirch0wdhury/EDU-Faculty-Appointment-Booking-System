import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { User, Mail, Lock, Building, Briefcase, UserCircle, BadgeCheck, Eye, EyeOff, Sparkles, Loader2, ArrowRight, GraduationCap, Info, AlertCircle } from 'lucide-react';
import MagneticButton from '../ui/MagneticButton';
import PageTransition, { MotionContainer } from '../ui/PageTransition';

const DEPARTMENTS = [
  'Business Administration',
  'Computer Science & Engineering',
  'Digitalization, Innovation and Entrepreneurship',
  'Economics',
  'Electrical & Electronic Engineering',
  'Electronics & Telecommunication Engineering',
  'English',
  'Public Leadership, Management and Governance'
];

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
    setFormData(prev => ({ ...prev, [name]: value }));
    
    if (name === 'studentId' && formData.role === 'student') {
      const cleanId = value.trim();
      if (cleanId) {
        setFormData(prev => ({
          ...prev,
          studentId: cleanId,
          email: `${cleanId}@eastdelta.edu.bd`
        }));
      } else {
        setFormData(prev => ({
          ...prev,
          studentId: '',
          email: ''
        }));
      }
    }
    
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleEmailChange = (e) => {
    const { value } = e.target;
    setFormData(prev => ({ ...prev, email: value }));
    if (errors.email) {
      setErrors(prev => ({ ...prev, email: '' }));
    }
  };

  const validateEmail = (email, role) => {
    const domainRegex = /@eastdelta\.edu\.bd$/;
    
    if (!domainRegex.test(email)) {
      return 'Only institutional emails (@eastdelta.edu.bd) are allowed';
    }
    
    if (role === 'student') {
      if (!/^\d+@eastdelta\.edu\.bd$/.test(email)) {
        return 'Student email must be your Student ID followed by @eastdelta.edu.bd';
      }
      const emailPrefix = email.split('@')[0];
      if (emailPrefix !== formData.studentId.trim()) {
        return `Email must match your Student ID: ${formData.studentId}@eastdelta.edu.bd`;
      }
    } else if (role === 'faculty' || role === 'admin') {
      const emailPrefix = email.split('@')[0];
      if (!/[a-zA-Z]/.test(emailPrefix)) {
        return 'Faculty/Admin email cannot be numbers-only before @; it must include at least one letter';
      }
    }
    
    return null;
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) newErrors.name = 'Full name is required';
    
    if (formData.role === 'student') {
      if (!formData.studentId.trim()) {
        newErrors.studentId = 'Student ID is required';
      } else {
        const autoEmail = `${formData.studentId.trim()}@eastdelta.edu.bd`;
        if (!/^\d+@eastdelta\.edu\.bd$/.test(autoEmail)) {
          newErrors.studentId = 'Student ID must contain only numbers';
        }
        setFormData(prev => ({
          ...prev,
          email: autoEmail
        }));
      }
    } else {
      if (!formData.email.trim()) {
        newErrors.email = 'Email is required';
      } else {
        const emailError = validateEmail(formData.email, formData.role);
        if (emailError) newErrors.email = emailError;
      }
    }
    
    if (!formData.password) newErrors.password = 'Password is required';
    else if (formData.password.length < 6) newErrors.password = 'Password must be at least 6 characters';
    if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = 'Passwords do not match';
    
    if (formData.role === 'faculty' && !formData.facultyId) newErrors.facultyId = 'Faculty ID is required';
    if ((formData.role === 'student' || formData.role === 'faculty') && !formData.department) {
      newErrors.department = 'Department is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const getEmailHint = (role) => {
    if (role === 'student') {
      return 'Your email will be automatically generated from your Student ID';
    } else if (role === 'faculty' || role === 'admin') {
      return 'Use any @eastdelta.edu.bd email with at least one letter before @';
    }
    return '';
  };

  const getEmailDisplay = (role) => {
    if (role === 'student') {
      return formData.studentId ? `${formData.studentId}@eastdelta.edu.bd` : 'Enter Student ID above to generate email';
    }
    return formData.email || '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

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
          case 'student': navigate('/student/dashboard'); break;
          case 'faculty': navigate('/faculty/dashboard'); break;
          case 'admin': navigate('/admin/dashboard'); break;
          default: navigate('/');
        }
      }
    } catch (error) {
      console.error('Registration error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageTransition className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-slate-50/80 dark:bg-slate-950/80 pattern-dots">
      <MotionContainer className="max-w-xl w-full">
        <div className="bg-white dark:bg-slate-900/95 rounded-3xl shadow-card dark:shadow-card-dark border border-primary-500/10 dark:border-primary-500/20 p-8 sm:p-10 space-y-8 relative overflow-hidden transition-all duration-300">
          <div className="absolute top-0 inset-x-0 h-1 bg-primary-500 dark:shadow-[0_0_20px_rgba(153,0,0,0.3)]" />
          <div className="absolute -top-24 -right-24 w-48 h-48 bg-primary-500/5 dark:bg-primary-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-primary-500/5 dark:bg-primary-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="text-center space-y-2 relative z-10">
            <div className="flex justify-center">
              <div className="w-16 h-16 rounded-2xl bg-primary-500 text-white flex items-center justify-center shadow-lg shadow-primary-500/25 dark:shadow-primary-500/50">
                <GraduationCap className="w-8 h-8" />
              </div>
            </div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary-50 dark:bg-primary-950/30 border border-primary-500/20 dark:border-primary-500/30 text-primary-600 dark:text-primary-400 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5 text-primary-500 dark:text-primary-400" />
              <span>Join EDU Portal</span>
            </div>
            <h2 className="text-3xl font-display font-bold text-slate-900 dark:text-white">Create Account</h2>
            <p className="text-slate-500 dark:text-slate-400 text-sm">Fill in your details to register as Student or Faculty</p>
          </div>

          <form className="space-y-5 relative z-10" onSubmit={handleSubmit}>
            <div>
              <label className="input-label">Select Account Role</label>
              <div className="grid grid-cols-3 gap-2 bg-slate-50 dark:bg-slate-800/50 p-1.5 rounded-xl border border-slate-200 dark:border-slate-700">
                {[
                  { id: 'student', label: 'Student' },
                  { id: 'faculty', label: 'Faculty' },
                  { id: 'admin', label: 'Admin' },
                ].map((roleItem) => (
                  <button
                    key={roleItem.id}
                    type="button"
                    onClick={() => {
                      setFormData(prev => ({ 
                        ...prev, 
                        role: roleItem.id,
                        email: roleItem.id === 'student' ? '' : prev.email
                      }));
                      setErrors({});
                    }}
                    className={`py-2 text-xs font-bold rounded-lg transition-all duration-200 ${
                      formData.role === roleItem.id
                        ? 'bg-primary-500 text-white shadow-md dark:shadow-primary-500/50'
                        : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
                    }`}
                  >
                    {roleItem.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="input-label">Full Name</label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 w-5 h-5" />
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className={`input-field pl-11 ${errors.name ? 'input-field-error' : ''}`}
                    placeholder="John Doe"
                  />
                </div>
                {errors.name && <p className="mt-1 text-xs text-red-500">{errors.name}</p>}
              </div>

              <div>
                <label className="input-label">
                  Email Address
                  {formData.role === 'student' && (
                    <span className="text-[10px] text-emerald-600 dark:text-emerald-400 ml-1 font-normal">
                      (Auto-generated)
                    </span>
                  )}
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 w-5 h-5" />
                  <input
                    type="email"
                    name="email"
                    value={formData.role === 'student' ? getEmailDisplay('student') : formData.email}
                    onChange={handleEmailChange}
                    disabled={formData.role === 'student'}
                    className={`input-field pl-11 ${errors.email ? 'input-field-error' : ''} ${formData.role === 'student' ? 'bg-slate-100 dark:bg-slate-800/50 cursor-not-allowed' : ''}`}
                    placeholder={formData.role === 'student' ? 'Auto-generated from Student ID' : 'john12@eastdelta.edu.bd'}
                  />
                </div>
                <p className="mt-1 text-[10px] text-slate-400 dark:text-slate-500 flex items-center gap-1">
                  <Info className="w-3 h-3" />
                  <span>{getEmailHint(formData.role)}</span>
                </p>
                {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email}</p>}
              </div>
            </div>

            {(formData.role === 'student' || formData.role === 'faculty') && (
              <div>
                <label className="input-label">Academic Department</label>
                <div className="relative">
                  <Building className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 w-5 h-5 pointer-events-none" />
                  <select
                    name="department"
                    value={formData.department}
                    onChange={handleChange}
                    className={`input-field pl-11 bg-white dark:bg-slate-900 ${errors.department ? 'input-field-error' : ''}`}
                  >
                    <option value="" className="text-slate-400 dark:text-slate-500">Select Department</option>
                    {DEPARTMENTS.map((dept) => (
                      <option key={dept} value={dept} className="bg-white dark:bg-slate-900">
                        {dept}
                      </option>
                    ))}
                  </select>
                </div>
                {errors.department && <p className="mt-1 text-xs text-red-500">{errors.department}</p>}
              </div>
            )}

            {formData.role === 'student' && (
              <div>
                <label className="input-label">
                  <BadgeCheck className="inline-block w-4 h-4 mr-1.5 text-primary-500 dark:text-primary-400" />
                  Student ID <span className="text-red-500">*</span>
                  <span className="text-[10px] text-emerald-600 dark:text-emerald-400 ml-1 font-normal">
                    (Your email will be: ID@eastdelta.edu.bd)
                  </span>
                </label>
                <div className="relative">
                  <BadgeCheck className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 w-5 h-5" />
                  <input
                    type="text"
                    name="studentId"
                    value={formData.studentId}
                    onChange={handleChange}
                    className={`input-field pl-11 ${errors.studentId ? 'input-field-error' : ''}`}
                    placeholder="242021012"
                  />
                </div>
                {formData.studentId && (
                  <p className="mt-1 text-[11px] text-primary-600 dark:text-primary-400 flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5" />
                    <span>Your email will be: <strong>{formData.studentId}@eastdelta.edu.bd</strong></span>
                  </p>
                )}
                {errors.studentId && <p className="mt-1 text-xs text-red-500">{errors.studentId}</p>}
              </div>
            )}

            {formData.role === 'faculty' && (
              <div>
                <label className="input-label">Faculty ID</label>
                <div className="relative">
                  <Briefcase className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 w-5 h-5" />
                  <input
                    type="text"
                    name="facultyId"
                    value={formData.facultyId}
                    onChange={handleChange}
                    className={`input-field pl-11 ${errors.facultyId ? 'input-field-error' : ''}`}
                    placeholder="FAC-2024-001"
                  />
                </div>
                {errors.facultyId && <p className="mt-1 text-xs text-red-500">{errors.facultyId}</p>}
              </div>
            )}

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="input-label">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 w-5 h-5" />
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    className={`input-field pl-11 pr-11 ${errors.password ? 'input-field-error' : ''}`}
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                {errors.password && <p className="mt-1 text-xs text-red-500">{errors.password}</p>}
              </div>

              <div>
                <label className="input-label">Confirm Password</label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 w-5 h-5" />
                  <input
                    type={showPassword ? "text" : "password"}
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className={`input-field pl-11 ${errors.confirmPassword ? 'input-field-error' : ''}`}
                    placeholder="••••••••"
                  />
                </div>
                {errors.confirmPassword && <p className="mt-1 text-xs text-red-500">{errors.confirmPassword}</p>}
              </div>
            </div>

            <MagneticButton
              type="submit"
              disabled={loading}
              variant="primary"
              className="w-full py-3.5 mt-2 shadow-lg shadow-primary-500/25 dark:shadow-primary-500/50 hover:shadow-primary-500/40 dark:hover:shadow-primary-500/70"
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

            <div className="text-center pt-2 border-t border-slate-200 dark:border-slate-700 space-y-2">
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Already have an account?{' '}
                <Link to="/login" className="text-primary-500 dark:text-primary-400 hover:text-primary-600 dark:hover:text-primary-300 font-semibold transition-colors">
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