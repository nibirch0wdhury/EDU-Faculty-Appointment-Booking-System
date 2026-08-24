import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import PageTransition, { MotionContainer } from '../ui/PageTransition';
import { 
  User, Mail, Building, Briefcase, MapPin, GraduationCap, 
  Lock, ShieldCheck, Save, Sparkles, KeyRound, FileText, UserCheck, Info, Loader2, Image
} from 'lucide-react';
import { toast } from 'react-toastify';
import MagneticButton from '../ui/MagneticButton';

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

const UserProfile = () => {
  const { user, updateProfile, loading: authLoading, fetchUserProfile } = useAuth();
  const [activeTab, setActiveTab] = useState('details');
  const [loading, setLoading] = useState(false);
  const [isPageLoading, setIsPageLoading] = useState(true);
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
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const isStudent = user?.role === 'student';
  const isFaculty = user?.role === 'faculty';
  const isAdmin = user?.role === 'admin';

  // ============================================
  // ✅ FIX: Load user data when component mounts
  // ============================================
  useEffect(() => {
    const loadUserData = async () => {
      console.log('🔄 UserProfile mounted, loading user data...');
      setIsPageLoading(true);
      
      // If user is already loaded and has data, use it
      if (user && user._id && user.studentId !== undefined && user.bio !== undefined) {
        console.log('📝 User already loaded, using existing data:', user);
        setFormData({
          name: user.name || '',
          email: user.email || '',
          department: user.department || '',
          designation: user.designation || '',
          officeRoom: user.officeRoom || '',
          studentId: user.studentId || '',
          facultyId: user.facultyId || '',
          bio: user.bio || '',
          profileImage: user.profileImage || ''
        });
        setIsPageLoading(false);
        return;
      }
      
      // If we have a token but no user data, fetch it
      if (localStorage.getItem('token')) {
        try {
          console.log('🔄 Fetching user profile on mount...');
          await fetchUserProfile();
          console.log('✅ User profile fetched successfully');
        } catch (error) {
          console.error('Error fetching user profile:', error);
        }
      }
      
      setIsPageLoading(false);
    };
    
    loadUserData();
  }, []); // ✅ Empty dependency array - runs once on mount

  // ============================================
  // ✅ FIX: Update form data whenever user changes
  // ============================================
  useEffect(() => {
    if (user && user._id) {
      console.log('📝 User data updated, refreshing form:', user);
      setFormData({
        name: user.name || '',
        email: user.email || '',
        department: user.department || '',
        designation: user.designation || '',
        officeRoom: user.officeRoom || '',
        studentId: user.studentId || '',
        facultyId: user.facultyId || '',
        bio: user.bio || '',
        profileImage: user.profileImage || ''
      });
    }
  }, [user]); // ✅ Runs whenever user changes

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handlePasswordChange = (e) => {
    setPasswordData({ ...passwordData, [e.target.name]: e.target.value });
  };

  const handleSubmitProfile = async (e) => {
    e.preventDefault();
    
    const updateData = {
      name: formData.name,
      department: formData.department,
      bio: formData.bio,
      profileImage: formData.profileImage,
    };

    if (isFaculty) {
      updateData.designation = formData.designation;
      updateData.officeRoom = formData.officeRoom;
      updateData.facultyId = formData.facultyId;
    }
    
    if (isAdmin) {
      updateData.designation = formData.designation;
      updateData.officeRoom = formData.officeRoom;
    }

    console.log('📤 Submitting profile update:', updateData);
    
    setLoading(true);
    await updateProfile(updateData);
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
      case 'admin': 
        return 'bg-primary-100 dark:bg-primary-950/40 text-primary-700 dark:text-primary-400 border-primary-200 dark:border-primary-800/50';
      case 'faculty': 
        return 'bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-800/50';
      default: 
        return 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800/50';
    }
  };

  // ✅ Show loading spinner while data is being loaded
  if (isPageLoading || authLoading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center py-12 bg-slate-50/80 dark:bg-slate-950/80 pattern-dots">
        <Loader2 className="w-12 h-12 animate-spin text-primary-500 dark:text-primary-400" />
        <p className="mt-4 text-sm text-slate-500 dark:text-slate-400">Loading your profile...</p>
      </div>
    );
  }

  // ✅ If no user after loading, show error
  if (!user || !user._id) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center py-12 bg-slate-50/80 dark:bg-slate-950/80 pattern-dots">
        <div className="text-center">
          <User className="w-16 h-16 text-slate-400 dark:text-slate-600 mx-auto mb-4" />
          <h2 className="text-xl font-display font-bold text-slate-900 dark:text-white">No User Data</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">Please log in again to view your profile.</p>
          <button 
            onClick={() => window.location.href = '/login'}
            className="mt-4 px-6 py-2 rounded-xl bg-primary-500 text-white font-semibold hover:bg-primary-600 transition-colors"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <PageTransition className="w-full py-8 md:py-12 bg-slate-50/80 dark:bg-slate-950/80 pattern-dots">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        {/* Profile Header */}
        <div className="relative overflow-hidden rounded-3xl bg-white dark:bg-slate-900/95 border border-primary-500/10 dark:border-primary-500/20 shadow-card dark:shadow-card-dark p-6 md:p-8 transition-all duration-300 mb-8">
          <div className="absolute top-0 inset-x-0 h-1 bg-primary-500 dark:shadow-[0_0_20px_rgba(153,0,0,0.3)]" />
          <div className="absolute -right-12 -bottom-12 w-64 h-64 bg-primary-500/5 dark:bg-primary-500/10 rounded-full blur-3xl pointer-events-none" />
          
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 relative z-10">
            <div className="relative group">
              <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl bg-primary-500 p-1 shadow-lg shadow-primary-500/25 dark:shadow-primary-500/50">
                <div className="w-full h-full rounded-[14px] bg-white dark:bg-slate-900 flex items-center justify-center overflow-hidden">
                  {formData.profileImage ? (
                    <img src={formData.profileImage} alt={formData.name} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-3xl font-display font-extrabold text-primary-500 dark:text-primary-400">
                      {user?.name?.[0]?.toUpperCase() || 'U'}
                    </span>
                  )}
                </div>
              </div>
              <div className="absolute -bottom-2 -right-2 p-1.5 rounded-xl bg-white dark:bg-slate-900 border border-primary-500/20 dark:border-primary-500/30 text-primary-500 dark:text-primary-400">
                <UserCheck className="w-4 h-4" />
              </div>
            </div>

            <div className="flex-1 text-center sm:text-left space-y-2">
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                <h1 className="text-2xl sm:text-3xl font-display font-bold text-slate-900 dark:text-white tracking-tight">
                  {user?.name || 'User Profile'}
                </h1>
                <span className={`px-3 py-1 text-xs font-semibold rounded-full border capitalize ${getRoleBadge(user?.role)}`}>
                  {user?.role || 'Student'}
                </span>
              </div>
              <p className="text-slate-500 dark:text-slate-400 text-sm flex items-center justify-center sm:justify-start gap-2">
                <Mail className="w-4 h-4 text-primary-500 dark:text-primary-400 shrink-0" />
                <span>{user?.email}</span>
              </p>
              {user?.department && (
                <p className="text-slate-500 dark:text-slate-400 text-xs flex items-center justify-center sm:justify-start gap-2 pt-1">
                  <Building className="w-3.5 h-3.5 text-primary-500 dark:text-primary-400 shrink-0" />
                  <span>{user.department}</span>
                </p>
              )}
              {isStudent && user?.studentId && (
                <p className="text-slate-500 dark:text-slate-400 text-xs flex items-center justify-center sm:justify-start gap-2 pt-1">
                  <GraduationCap className="w-3.5 h-3.5 text-primary-500 dark:text-primary-400 shrink-0" />
                  <span>Student ID: <strong>{user.studentId}</strong></span>
                </p>
              )}
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex items-center gap-2 mt-8 pt-6 border-t border-slate-200 dark:border-slate-700 overflow-x-auto">
            <button
              onClick={() => setActiveTab('details')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 whitespace-nowrap ${
                activeTab === 'details'
                  ? 'bg-primary-500 text-white shadow-md dark:shadow-primary-500/50'
                  : 'bg-slate-50 dark:bg-slate-800/50 text-slate-600 dark:text-slate-400 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-950/30'
              }`}
            >
              <User className="w-4 h-4" />
              <span>Personal Details</span>
            </button>
            <button
              onClick={() => setActiveTab('security')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 whitespace-nowrap ${
                activeTab === 'security'
                  ? 'bg-primary-500 text-white shadow-md dark:shadow-primary-500/50'
                  : 'bg-slate-50 dark:bg-slate-800/50 text-slate-600 dark:text-slate-400 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-950/30'
              }`}
            >
              <Lock className="w-4 h-4" />
              <span>Password & Security</span>
            </button>
          </div>
        </div>

        {/* Tab Content - Personal Details */}
        {activeTab === 'details' && (
          <div className="relative bg-white dark:bg-slate-900/95 rounded-3xl shadow-card dark:shadow-card-dark border border-primary-500/10 dark:border-primary-500/20 p-6 sm:p-8 transition-all duration-300">
            <div className="absolute top-0 inset-x-0 h-1 bg-primary-500 dark:shadow-[0_0_20px_rgba(153,0,0,0.3)]" />
            
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-700 pb-4">
              <div>
                <h2 className="text-xl font-display font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-primary-500 dark:text-primary-400" />
                  Edit Profile Information
                </h2>
                <p className="text-slate-500 dark:text-slate-400 text-xs mt-0.5">
                  Update your personal account details
                  <span className="text-red-500 dark:text-red-400 ml-1">*</span>
                  <span className="text-xs text-slate-400 dark:text-slate-500 ml-1">Email and ID are read-only</span>
                </p>
              </div>
            </div>

            <form onSubmit={handleSubmitProfile} className="space-y-6 pt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Full Name */}
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-primary-500 dark:text-primary-400" />
                    Full Name
                  </label>
                  <input 
                    type="text" 
                    name="name" 
                    value={formData.name} 
                    onChange={handleChange} 
                    required 
                    className="input-field" 
                    placeholder="Enter your full name" 
                  />
                </div>

                {/* Email Address - READ-ONLY */}
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-primary-500 dark:text-primary-400" />
                    Email Address
                    <span className="text-[10px] text-red-500 dark:text-red-400 ml-1 font-normal">
                      (Read-only)
                    </span>
                  </label>
                  <input 
                    type="email" 
                    name="email" 
                    value={formData.email} 
                    disabled
                    className="input-field bg-slate-100 dark:bg-slate-800/50 cursor-not-allowed text-slate-500 dark:text-slate-400" 
                    placeholder="Email is read-only" 
                  />
                  <p className="mt-1 text-[10px] text-slate-400 dark:text-slate-500 flex items-center gap-1">
                    <Info className="w-3 h-3" />
                    <span>Email cannot be changed after account creation</span>
                  </p>
                </div>

                {/* Department */}
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Building className="w-3.5 h-3.5 text-primary-500 dark:text-primary-400" />
                    Department
                  </label>
                  <select 
                    name="department" 
                    value={formData.department} 
                    onChange={handleChange}
                    className="input-field bg-white dark:bg-slate-900"
                  >
                    <option value="" className="bg-white dark:bg-slate-900">Select Department...</option>
                    {DEPARTMENTS.map((dept) => (
                      <option key={dept} value={dept} className="bg-white dark:bg-slate-900">
                        {dept}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Student ID - READ-ONLY */}
                {isStudent && (
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                      <GraduationCap className="w-3.5 h-3.5 text-primary-500 dark:text-primary-400" />
                      Student ID
                      <span className="text-[10px] text-red-500 dark:text-red-400 ml-1 font-normal">
                        (Read-only)
                      </span>
                    </label>
                    <input 
                      type="text" 
                      name="studentId" 
                      value={formData.studentId} 
                      disabled
                      className="input-field bg-slate-100 dark:bg-slate-800/50 cursor-not-allowed text-slate-500 dark:text-slate-400" 
                      placeholder="Student ID is read-only" 
                    />
                    <p className="mt-1 text-[10px] text-slate-400 dark:text-slate-500 flex items-center gap-1">
                      <Info className="w-3 h-3" />
                      <span>Student ID cannot be changed after account creation</span>
                    </p>
                  </div>
                )}

                {/* Faculty Fields */}
                {isFaculty && (
                  <>
                    <div className="space-y-2">
                      <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                        <Briefcase className="w-3.5 h-3.5 text-primary-500 dark:text-primary-400" />
                        Designation / Title
                      </label>
                      <input 
                        type="text" 
                        name="designation" 
                        value={formData.designation} 
                        onChange={handleChange} 
                        className="input-field" 
                        placeholder="Enter your designation" 
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-primary-500 dark:text-primary-400" />
                        Office Room
                      </label>
                      <input 
                        type="text" 
                        name="officeRoom" 
                        value={formData.officeRoom} 
                        onChange={handleChange} 
                        className="input-field" 
                        placeholder="Enter office room" 
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                        <GraduationCap className="w-3.5 h-3.5 text-primary-500 dark:text-primary-400" />
                        Faculty ID
                      </label>
                      <input 
                        type="text" 
                        name="facultyId" 
                        value={formData.facultyId} 
                        onChange={handleChange} 
                        className="input-field" 
                        placeholder="Enter faculty ID" 
                      />
                    </div>
                  </>
                )}

                {/* Admin Fields */}
                {isAdmin && (
                  <>
                    <div className="space-y-2">
                      <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                        <Briefcase className="w-3.5 h-3.5 text-primary-500 dark:text-primary-400" />
                        Designation / Title
                      </label>
                      <input 
                        type="text" 
                        name="designation" 
                        value={formData.designation} 
                        onChange={handleChange} 
                        className="input-field" 
                        placeholder="Enter your designation" 
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-primary-500 dark:text-primary-400" />
                        Office Room
                      </label>
                      <input 
                        type="text" 
                        name="officeRoom" 
                        value={formData.officeRoom} 
                        onChange={handleChange} 
                        className="input-field" 
                        placeholder="Enter office room" 
                      />
                    </div>
                  </>
                )}

                {/* Bio */}
                <div className="space-y-2 md:col-span-2">
                  <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5 text-primary-500 dark:text-primary-400" />
                    About / Bio
                  </label>
                  <textarea 
                    name="bio" 
                    value={formData.bio} 
                    onChange={handleChange} 
                    rows="3" 
                    className="input-field resize-none" 
                    placeholder="Write a brief intro about yourself..." 
                  />
                </div>

                {/* Profile Image URL */}
                <div className="space-y-2 md:col-span-2 pt-2">
                  <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Image className="w-3.5 h-3.5 text-primary-500 dark:text-primary-400" />
                    Profile Image URL
                  </label>
                  <input 
                    type="url" 
                    name="profileImage" 
                    value={formData.profileImage} 
                    onChange={handleChange} 
                    className="input-field" 
                    placeholder="Paste an image URL (e.g., https://example.com/photo.jpg)" 
                  />
                  <p className="mt-1 text-[10px] text-slate-400 dark:text-slate-500 flex items-center gap-1">
                    <Info className="w-3 h-3" />
                    <span>Copy and paste an image address from the web</span>
                  </p>
                </div>
              </div>

              <div className="flex justify-end pt-4 border-t border-slate-200 dark:border-slate-700">
                <MagneticButton 
                  type="submit" 
                  disabled={loading} 
                  variant="primary" 
                  className="px-6 py-3 shadow-md shadow-primary-500/25 dark:shadow-primary-500/50"
                >
                  <Save className="w-4 h-4" />
                  <span>{loading ? 'Saving Changes...' : 'Save Profile Changes'}</span>
                </MagneticButton>
              </div>
            </form>
          </div>
        )}

        {/* Tab Content - Security */}
        {activeTab === 'security' && (
          <div className="relative bg-white dark:bg-slate-900/95 rounded-3xl shadow-card dark:shadow-card-dark border border-primary-500/10 dark:border-primary-500/20 p-6 sm:p-8 transition-all duration-300">
            <div className="absolute top-0 inset-x-0 h-1 bg-primary-500 dark:shadow-[0_0_20px_rgba(153,0,0,0.3)]" />
            
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-700 pb-4">
              <div>
                <h2 className="text-xl font-display font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <KeyRound className="w-5 h-5 text-primary-500 dark:text-primary-400" />
                  Change Account Password
                </h2>
                <p className="text-slate-500 dark:text-slate-400 text-xs mt-0.5">Ensure your account is using a strong security password</p>
              </div>
            </div>

            <form onSubmit={handleSubmitPassword} className="space-y-6 pt-6 max-w-lg">
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-primary-500 dark:text-primary-400" />
                  Current Password
                </label>
                <input 
                  type="password" 
                  name="currentPassword" 
                  value={passwordData.currentPassword} 
                  onChange={handlePasswordChange} 
                  required 
                  className="input-field" 
                  placeholder="Enter current password" 
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-primary-500 dark:text-primary-400" />
                  New Password
                </label>
                <input 
                  type="password" 
                  name="newPassword" 
                  value={passwordData.newPassword} 
                  onChange={handlePasswordChange} 
                  required 
                  minLength={6} 
                  className="input-field" 
                  placeholder="Enter new password" 
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-primary-500 dark:text-primary-400" />
                  Confirm New Password
                </label>
                <input 
                  type="password" 
                  name="confirmPassword" 
                  value={passwordData.confirmPassword} 
                  onChange={handlePasswordChange} 
                  required 
                  className="input-field" 
                  placeholder="Confirm new password" 
                />
              </div>

              <div className="pt-4 border-t border-slate-200 dark:border-slate-700">
                <MagneticButton 
                  type="submit" 
                  disabled={loading} 
                  variant="primary" 
                  className="px-6 py-3 shadow-md shadow-primary-500/25 dark:shadow-primary-500/50"
                >
                  <Lock className="w-4 h-4" />
                  <span>{loading ? 'Updating Password...' : 'Update Password'}</span>
                </MagneticButton>
              </div>
            </form>
          </div>
        )}
      </div>
    </PageTransition>
  );
};

export default UserProfile;