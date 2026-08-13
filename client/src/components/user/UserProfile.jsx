import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import PageTransition, { MotionContainer } from '../ui/PageTransition';
import { 
  User, 
  Mail, 
  Building, 
  Briefcase, 
  MapPin, 
  GraduationCap, 
  Lock, 
  ShieldCheck, 
  Save, 
  Sparkles, 
  KeyRound,
  FileText,
  UserCheck
} from 'lucide-react';
import { toast } from 'react-toastify';

const UserProfile = () => {
  const { user, updateProfile } = useAuth();
  
  const [activeTab, setActiveTab] = useState('details');
  const [loading, setLoading] = useState(false);

  // Form states for profile details
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    department: '',
    designation: '',
    officeRoom: '',
    studentId: '',
    facultyId: '',
    bio: '',
    profileImage: ''
  });

  // Password change states
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
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
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handlePasswordChange = (e) => {
    setPasswordData({
      ...passwordData,
      [e.target.name]: e.target.value
    });
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
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
    }
  };

  const getRoleBadge = (role) => {
    switch (role) {
      case 'admin':
        return 'bg-purple-500/20 text-purple-300 border-purple-500/30';
      case 'faculty':
        return 'bg-blue-500/20 text-blue-300 border-blue-500/30';
      default:
        return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30';
    }
  };

  return (
    <PageTransition className="py-8 md:py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Profile Hero Header */}
        <MotionContainer className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950/60 to-slate-900 border border-slate-800 p-6 md:p-8 shadow-2xl">
          <div className="absolute -right-12 -bottom-12 w-64 h-64 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />
          
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 relative z-10">
            {/* Avatar Circle */}
            <div className="relative group">
              <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-pink-500 p-1 shadow-xl shadow-indigo-950/50">
                <div className="w-full h-full rounded-[14px] bg-slate-900 flex items-center justify-center overflow-hidden">
                  {formData.profileImage ? (
                    <img 
                      src={formData.profileImage} 
                      alt={formData.name} 
                      className="w-full h-full object-cover" 
                      onError={(e) => { e.target.onerror = null; e.target.src = ''; }}
                    />
                  ) : (
                    <span className="text-3xl font-extrabold text-white">
                      {user?.name?.[0]?.toUpperCase() || 'U'}
                    </span>
                  )}
                </div>
              </div>
              <div className="absolute -bottom-2 -right-2 p-1.5 rounded-xl bg-slate-800 border border-slate-700 text-indigo-400">
                <UserCheck className="w-4 h-4" />
              </div>
            </div>

            {/* Profile Info */}
            <div className="flex-1 text-center sm:text-left space-y-2">
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
                  {user?.name || 'User Profile'}
                </h1>
                <span className={`px-3 py-1 text-xs font-semibold rounded-full border capitalize ${getRoleBadge(user?.role)}`}>
                  {user?.role || 'Student'}
                </span>
              </div>

              <p className="text-slate-400 text-sm flex items-center justify-center sm:justify-start gap-2">
                <Mail className="w-4 h-4 text-indigo-400 shrink-0" />
                <span>{user?.email}</span>
              </p>

              {user?.department && (
                <p className="text-slate-400 text-xs flex items-center justify-center sm:justify-start gap-2 pt-1">
                  <Building className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                  <span>{user.department}</span>
                </p>
              )}
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex items-center gap-2 mt-8 pt-6 border-t border-slate-800/80">
            <button
              onClick={() => setActiveTab('details')}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                activeTab === 'details'
                  ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-500/25'
                  : 'bg-slate-800/50 text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <User className="w-4 h-4" />
              <span>Personal Details</span>
            </button>

            <button
              onClick={() => setActiveTab('security')}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                activeTab === 'security'
                  ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-500/25'
                  : 'bg-slate-800/50 text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Lock className="w-4 h-4" />
              <span>Password & Security</span>
            </button>
          </div>
        </MotionContainer>

        {/* Tab 1: Personal Details */}
        {activeTab === 'details' && (
          <MotionContainer delay={0.1} className="glass-panel p-6 sm:p-8 space-y-6">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div>
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-indigo-400" />
                  Edit Profile Information
                </h2>
                <p className="text-slate-400 text-xs mt-0.5">Update your personal account details</p>
              </div>
            </div>

            <form onSubmit={handleSubmitProfile} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Full Name */}
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-indigo-400" />
                    Full Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 rounded-xl bg-slate-900/80 border border-slate-700/80 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-sm transition-all"
                    placeholder="Enter your full name"
                  />
                </div>

                {/* Email (Read only notice) */}
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-indigo-400" />
                    Email Address
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 rounded-xl bg-slate-900/80 border border-slate-700/80 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-sm transition-all"
                    placeholder="name@eastdelta.edu.bd"
                  />
                </div>

                {/* Department */}
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                    <Building className="w-3.5 h-3.5 text-indigo-400" />
                    Department
                  </label>
                  <input
                    type="text"
                    name="department"
                    value={formData.department}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-xl bg-slate-900/80 border border-slate-700/80 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-sm transition-all"
                    placeholder="e.g. Computer Science & Engineering"
                  />
                </div>

                {/* Student specific: Student ID */}
                {user?.role === 'student' && (
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                      <GraduationCap className="w-3.5 h-3.5 text-indigo-400" />
                      Student ID
                    </label>
                    <input
                      type="text"
                      name="studentId"
                      value={formData.studentId}
                      onChange={handleChange}
                      className="w-full px-4 py-3 rounded-xl bg-slate-900/80 border border-slate-700/80 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-sm transition-all"
                      placeholder="e.g. 242021012"
                    />
                  </div>
                )}

                {/* Faculty specific: Designation & Office Room & Faculty ID */}
                {(user?.role === 'faculty' || user?.role === 'admin') && (
                  <>
                    <div className="space-y-2">
                      <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                        <Briefcase className="w-3.5 h-3.5 text-indigo-400" />
                        Designation / Title
                      </label>
                      <input
                        type="text"
                        name="designation"
                        value={formData.designation}
                        onChange={handleChange}
                        className="w-full px-4 py-3 rounded-xl bg-slate-900/80 border border-slate-700/80 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-sm transition-all"
                        placeholder="e.g. Assistant Professor, CSE"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-indigo-400" />
                        Office Room
                      </label>
                      <input
                        type="text"
                        name="officeRoom"
                        value={formData.officeRoom}
                        onChange={handleChange}
                        className="w-full px-4 py-3 rounded-xl bg-slate-900/80 border border-slate-700/80 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-sm transition-all"
                        placeholder="e.g. Room 402, Academic Building A"
                      />
                    </div>
                  </>
                )}

                {/* Profile Image URL */}
                <div className="space-y-2 md:col-span-2">
                  <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-indigo-400" />
                    Profile Picture URL (Optional)
                  </label>
                  <input
                    type="url"
                    name="profileImage"
                    value={formData.profileImage}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-xl bg-slate-900/80 border border-slate-700/80 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-sm transition-all"
                    placeholder="https://example.com/my-photo.jpg"
                  />
                </div>

                {/* Bio / About */}
                <div className="space-y-2 md:col-span-2">
                  <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5 text-indigo-400" />
                    About / Bio
                  </label>
                  <textarea
                    name="bio"
                    value={formData.bio}
                    onChange={handleChange}
                    rows="3"
                    className="w-full px-4 py-3 rounded-xl bg-slate-900/80 border border-slate-700/80 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-sm transition-all resize-none"
                    placeholder="Write a brief intro about yourself..."
                  />
                </div>
              </div>

              <div className="flex justify-end pt-4 border-t border-slate-800">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold text-sm shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 hover:scale-[1.01] active:scale-[0.99] transition-all disabled:opacity-50"
                >
                  <Save className="w-4 h-4" />
                  <span>{loading ? 'Saving Changes...' : 'Save Profile Changes'}</span>
                </button>
              </div>
            </form>
          </MotionContainer>
        )}

        {/* Tab 2: Security & Password */}
        {activeTab === 'security' && (
          <MotionContainer delay={0.1} className="glass-panel p-6 sm:p-8 space-y-6">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div>
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <KeyRound className="w-5 h-5 text-indigo-400" />
                  Change Account Password
                </h2>
                <p className="text-slate-400 text-xs mt-0.5">Ensure your account is using a strong security password</p>
              </div>
            </div>

            <form onSubmit={handleSubmitPassword} className="space-y-6 max-w-lg">
              {/* Current Password */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-indigo-400" />
                  Current Password
                </label>
                <input
                  type="password"
                  name="currentPassword"
                  value={passwordData.currentPassword}
                  onChange={handlePasswordChange}
                  required
                  className="w-full px-4 py-3 rounded-xl bg-slate-900/80 border border-slate-700/80 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-sm transition-all"
                  placeholder="Enter current password"
                />
              </div>

              {/* New Password */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-indigo-400" />
                  New Password
                </label>
                <input
                  type="password"
                  name="newPassword"
                  value={passwordData.newPassword}
                  onChange={handlePasswordChange}
                  required
                  minLength={6}
                  className="w-full px-4 py-3 rounded-xl bg-slate-900/80 border border-slate-700/80 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-sm transition-all"
                  placeholder="At least 6 characters"
                />
              </div>

              {/* Confirm New Password */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-indigo-400" />
                  Confirm New Password
                </label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={passwordData.confirmPassword}
                  onChange={handlePasswordChange}
                  required
                  className="w-full px-4 py-3 rounded-xl bg-slate-900/80 border border-slate-700/80 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-sm transition-all"
                  placeholder="Repeat new password"
                />
              </div>

              <div className="pt-4 border-t border-slate-800">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold text-sm shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 hover:scale-[1.01] active:scale-[0.99] transition-all disabled:opacity-50"
                >
                  <Lock className="w-4 h-4" />
                  <span>{loading ? 'Updating Password...' : 'Update Password'}</span>
                </button>
              </div>
            </form>
          </MotionContainer>
        )}
      </div>
    </PageTransition>
  );
};

export default UserProfile;
