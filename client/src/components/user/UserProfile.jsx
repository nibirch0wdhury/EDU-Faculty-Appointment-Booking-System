import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import PageTransition, { MotionContainer } from '../ui/PageTransition';
import { User, Mail, Building, Briefcase, MapPin, GraduationCap, Lock, ShieldCheck, Save, Sparkles, KeyRound, FileText, UserCheck } from 'lucide-react';
import { toast } from 'react-toastify';
import MagneticButton from '../ui/MagneticButton';

const UserProfile = () => {
  const { user, updateProfile } = useAuth();
  const [activeTab, setActiveTab] = useState('details');
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: '', email: '', department: '', designation: '', officeRoom: '',
    studentId: '', facultyId: '', bio: '', profileImage: ''
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '', newPassword: '', confirmPassword: ''
  });

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        department: user.department || '',
        designation: user.designation || 'Faculty Member',
        officeRoom: user.officeRoom || '',
        studentId: user.studentId || '',
        facultyId: user.facultyId || '',
        bio: user.bio || '',
        profileImage: user.profileImage || ''
      });
    }
  }, [user]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handlePasswordChange = (e) => {
    setPasswordData({ ...passwordData, [e.target.name]: e.target.value });
  };

  const handleSubmitProfile = async (e) => {
    e.preventDefault();
    setLoading(true);
    const result = await updateProfile(formData);
    setLoading(false);
  };

  const handleSubmitPassword = async (e) => {
    e.preventDefault();
    if (!passwordData.currentPassword) {
      toast.error('Please enter your current password');
      return;
    }
    if (passwordData.newPassword.length < 6) {
      toast.error('New password must be at least 6 characters');
      return;
    }
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }
    setLoading(true);
    const result = await updateProfile({
      currentPassword: passwordData.currentPassword,
      newPassword: passwordData.newPassword
    });
    setLoading(false);
    if (result.success) {
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    }
  };

  const getRoleBadge = (role) => {
    switch (role) {
      case 'admin': return 'bg-primary-100 text-primary-700 border-primary-200';
      case 'faculty': return 'bg-blue-50 text-blue-700 border-blue-200';
      default: return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    }
  };

  return (
    <PageTransition className="py-8 md:py-12 bg-slate-50/80 pattern-dots">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Profile Header */}
        <MotionContainer className="relative overflow-hidden rounded-3xl bg-white border border-primary-500/10 shadow-card p-6 md:p-8">
          <div className="absolute top-0 inset-x-0 h-1 bg-primary-500" />
          <div className="absolute -right-12 -bottom-12 w-64 h-64 bg-primary-500/5 rounded-full blur-3xl pointer-events-none" />
          
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 relative z-10">
            <div className="relative group">
              <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl bg-primary-500 p-1 shadow-lg shadow-primary-500/25">
                <div className="w-full h-full rounded-[14px] bg-white flex items-center justify-center overflow-hidden">
                  {formData.profileImage ? (
                    <img src={formData.profileImage} alt={formData.name} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-3xl font-display font-extrabold text-primary-500">
                      {user?.name?.[0]?.toUpperCase() || 'U'}
                    </span>
                  )}
                </div>
              </div>
              <div className="absolute -bottom-2 -right-2 p-1.5 rounded-xl bg-white border border-primary-500/20 text-primary-500">
                <UserCheck className="w-4 h-4" />
              </div>
            </div>

            <div className="flex-1 text-center sm:text-left space-y-2">
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                <h1 className="text-2xl sm:text-3xl font-display font-bold text-slate-900 tracking-tight">
                  {user?.name || 'User Profile'}
                </h1>
                <span className={`px-3 py-1 text-xs font-semibold rounded-full border capitalize ${getRoleBadge(user?.role)}`}>
                  {user?.role || 'Student'}
                </span>
              </div>
              <p className="text-slate-500 text-sm flex items-center justify-center sm:justify-start gap-2">
                <Mail className="w-4 h-4 text-primary-500 shrink-0" />
                <span>{user?.email}</span>
              </p>
              {user?.department && (
                <p className="text-slate-500 text-xs flex items-center justify-center sm:justify-start gap-2 pt-1">
                  <Building className="w-3.5 h-3.5 text-primary-500 shrink-0" />
                  <span>{user.department}</span>
                </p>
              )}
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex items-center gap-2 mt-8 pt-6 border-t border-slate-200">
            <button
              onClick={() => setActiveTab('details')}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                activeTab === 'details'
                  ? 'bg-primary-500 text-white shadow-md shadow-primary-500/25'
                  : 'bg-slate-50 text-slate-600 hover:text-primary-600 hover:bg-primary-50'
              }`}
            >
              <User className="w-4 h-4" />
              <span>Personal Details</span>
            </button>
            <button
              onClick={() => setActiveTab('security')}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                activeTab === 'security'
                  ? 'bg-primary-500 text-white shadow-md shadow-primary-500/25'
                  : 'bg-slate-50 text-slate-600 hover:text-primary-600 hover:bg-primary-50'
              }`}
            >
              <Lock className="w-4 h-4" />
              <span>Password & Security</span>
            </button>
          </div>
        </MotionContainer>

        {/* Tab: Personal Details */}
        {activeTab === 'details' && (
          <MotionContainer delay={0.1} className="bg-white rounded-3xl shadow-card border border-primary-500/10 p-6 sm:p-8 space-y-6">
            <div className="absolute top-0 inset-x-0 h-1 bg-primary-500" />
            <div className="flex items-center justify-between border-b border-slate-200 pb-4">
              <div>
                <h2 className="text-xl font-display font-bold text-slate-900 flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-primary-500" />
                  Edit Profile Information
                </h2>
                <p className="text-slate-500 text-xs mt-0.5">Update your personal account details</p>
              </div>
            </div>

            <form onSubmit={handleSubmitProfile} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-slate-600 uppercase tracking-wider flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-primary-500" />
                    Full Name
                  </label>
                  <input type="text" name="name" value={formData.name} onChange={handleChange} required className="input-field" placeholder="Enter your full name" />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-slate-600 uppercase tracking-wider flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-primary-500" />
                    Email Address
                  </label>
                  <input type="email" name="email" value={formData.email} onChange={handleChange} required className="input-field" placeholder="name@eastdelta.edu.bd" />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-slate-600 uppercase tracking-wider flex items-center gap-1.5">
                    <Building className="w-3.5 h-3.5 text-primary-500" />
                    Department
                  </label>
                  <input type="text" name="department" value={formData.department} onChange={handleChange} className="input-field" placeholder="e.g. Computer Science & Engineering" />
                </div>
                {user?.role === 'student' && (
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-slate-600 uppercase tracking-wider flex items-center gap-1.5">
                      <GraduationCap className="w-3.5 h-3.5 text-primary-500" />
                      Student ID
                    </label>
                    <input type="text" name="studentId" value={formData.studentId} onChange={handleChange} className="input-field" placeholder="e.g. 242021012" />
                  </div>
                )}
                {(user?.role === 'faculty' || user?.role === 'admin') && (
                  <>
                    <div className="space-y-2">
                      <label className="text-xs font-semibold text-slate-600 uppercase tracking-wider flex items-center gap-1.5">
                        <Briefcase className="w-3.5 h-3.5 text-primary-500" />
                        Designation / Title
                      </label>
                      <input type="text" name="designation" value={formData.designation} onChange={handleChange} className="input-field" placeholder="e.g. Assistant Professor" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-semibold text-slate-600 uppercase tracking-wider flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-primary-500" />
                        Office Room
                      </label>
                      <input type="text" name="officeRoom" value={formData.officeRoom} onChange={handleChange} className="input-field" placeholder="e.g. Room 402, Academic Building A" />
                    </div>
                  </>
                )}
                <div className="space-y-2 md:col-span-2">
                  <label className="text-xs font-semibold text-slate-600 uppercase tracking-wider flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5 text-primary-500" />
                    About / Bio
                  </label>
                  <textarea name="bio" value={formData.bio} onChange={handleChange} rows="3" className="input-field resize-none" placeholder="Write a brief intro about yourself..." />
                </div>
              </div>

              <div className="flex justify-end pt-4 border-t border-slate-200">
                <MagneticButton type="submit" disabled={loading} variant="primary" className="px-6 py-3">
                  <Save className="w-4 h-4" />
                  <span>{loading ? 'Saving Changes...' : 'Save Profile Changes'}</span>
                </MagneticButton>
              </div>
            </form>
          </MotionContainer>
        )}

        {/* Tab: Security */}
        {activeTab === 'security' && (
          <MotionContainer delay={0.1} className="bg-white rounded-3xl shadow-card border border-primary-500/10 p-6 sm:p-8 space-y-6">
            <div className="absolute top-0 inset-x-0 h-1 bg-primary-500" />
            <div className="flex items-center justify-between border-b border-slate-200 pb-4">
              <div>
                <h2 className="text-xl font-display font-bold text-slate-900 flex items-center gap-2">
                  <KeyRound className="w-5 h-5 text-primary-500" />
                  Change Account Password
                </h2>
                <p className="text-slate-500 text-xs mt-0.5">Ensure your account is using a strong security password</p>
              </div>
            </div>

            <form onSubmit={handleSubmitPassword} className="space-y-6 max-w-lg">
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-600 uppercase tracking-wider flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-primary-500" />
                  Current Password
                </label>
                <input type="password" name="currentPassword" value={passwordData.currentPassword} onChange={handlePasswordChange} required className="input-field" placeholder="Enter current password" />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-600 uppercase tracking-wider flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-primary-500" />
                  New Password
                </label>
                <input type="password" name="newPassword" value={passwordData.newPassword} onChange={handlePasswordChange} required minLength={6} className="input-field" placeholder="At least 6 characters" />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-600 uppercase tracking-wider flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-primary-500" />
                  Confirm New Password
                </label>
                <input type="password" name="confirmPassword" value={passwordData.confirmPassword} onChange={handlePasswordChange} required className="input-field" placeholder="Repeat new password" />
              </div>

              <div className="pt-4 border-t border-slate-200">
                <MagneticButton type="submit" disabled={loading} variant="primary" className="px-6 py-3">
                  <Lock className="w-4 h-4" />
                  <span>{loading ? 'Updating Password...' : 'Update Password'}</span>
                </MagneticButton>
              </div>
            </form>
          </MotionContainer>
        )}
      </div>
    </PageTransition>
  );
};

export default UserProfile;