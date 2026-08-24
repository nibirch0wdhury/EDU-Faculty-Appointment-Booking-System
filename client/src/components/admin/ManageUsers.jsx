import React, { useState, useEffect } from 'react';
import { Search, Edit, Trash2, UserPlus, User, Mail, Calendar, Shield, Sparkles, X, Users } from 'lucide-react';
import { toast } from 'react-toastify';
import api from '../../utils/api';
import MagneticButton from '../ui/MagneticButton';
import PageTransition, { MotionContainer } from '../ui/PageTransition';
import SpotlightCard from '../ui/SpotlightCard';
import AdminNavTabs from './AdminNavTabs';
import ModalPortal from '../ui/ModalPortal';

// ✅ Updated Department List - Alphabetical Order
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

const ManageUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'student',
    department: '',
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await api.get('/admin/users');
      setUsers(response.data || []);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error('Failed to load users');
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (userId, userName) => {
    if (!window.confirm(`Are you sure you want to delete user "${userName}"? This action cannot be undone.`)) {
      return;
    }

    try {
      console.log(`🗑️ Attempting to delete user: ${userId}`);
      await api.delete(`/admin/users/${userId}`);
      toast.success(`✅ User "${userName}" deleted successfully!`);
      await fetchUsers();
    } catch (error) {
      console.error('❌ Delete user error:', error);
      
      if (error.response) {
        const errorMsg = error.response.data?.message || 'Failed to delete user';
        toast.error(`❌ ${errorMsg}`);
        if (error.response.status === 400) {
          toast.warning('⚠️ This user may have existing appointments or related data.');
        }
      } else if (error.request) {
        toast.error('❌ Server not responding. Please check your connection.');
      } else {
        toast.error('❌ Failed to delete user. Please try again.');
      }
    }
  };

  const handleRoleChange = async (userId, newRole) => {
    try {
      await api.put(`/admin/users/${userId}/role`, { role: newRole });
      toast.success(`✅ User role updated to ${newRole} successfully!`);
      await fetchUsers();
    } catch (error) {
      console.error('❌ Role update error:', error);
      const errorMsg = error.response?.data?.message || 'Failed to update user role';
      toast.error(`❌ ${errorMsg}`);
    }
  };

  const handleAddUser = async (e) => {
    e.preventDefault();
    try {
      await api.post('/auth/register', formData);
      toast.success('✅ User added successfully!');
      setShowAddModal(false);
      setFormData({ name: '', email: '', password: '', role: 'student', department: '' });
      await fetchUsers();
    } catch (error) {
      console.error('❌ Add user error:', error);
      const errorMsg = error.response?.data?.message || 'Failed to add user';
      toast.error(`❌ ${errorMsg}`);
    }
  };

  const handleEditUser = (user) => {
    setEditingUser(user);
    setFormData({
      name: user.name,
      email: user.email,
      password: '',
      role: user.role,
      department: user.department || '',
    });
  };

  const handleUpdateUser = async (e) => {
    e.preventDefault();
    try {
      await api.put(`/admin/users/${editingUser._id}`, formData);
      toast.success('✅ User updated successfully!');
      setEditingUser(null);
      setFormData({ name: '', email: '', password: '', role: 'student', department: '' });
      await fetchUsers();
    } catch (error) {
      console.error('❌ Update user error:', error);
      const errorMsg = error.response?.data?.message || 'Failed to update user';
      toast.error(`❌ ${errorMsg}`);
    }
  };

  const getRoleBadgeStyle = (role) => {
    switch(role) {
      case 'admin': return 'bg-primary-100 dark:bg-primary-950/40 text-primary-700 dark:text-primary-400 border-primary-200 dark:border-primary-800/50';
      case 'faculty': return 'bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-800/50';
      case 'student': return 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800/50';
      default: return 'bg-slate-100 dark:bg-slate-800/50 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700';
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          user.email?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filter === 'all' || user.role === filter;
    return matchesSearch && matchesFilter;
  });

  return (
    <PageTransition className="py-8 md:py-12 bg-slate-50/80 dark:bg-slate-950/80 pattern-dots">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <AdminNavTabs />
        <MotionContainer className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary-50 dark:bg-primary-950/30 border border-primary-500/20 dark:border-primary-500/30 text-primary-600 dark:text-primary-400 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5 text-primary-500 dark:text-primary-400" />
              <span>User Directory Management</span>
            </div>
            <h1 className="text-3xl font-display font-bold text-slate-900 dark:text-white">Manage Users</h1>
          </div>
          <MagneticButton variant="primary" onClick={() => setShowAddModal(true)} className="py-2.5 px-4 text-xs shadow-md shadow-primary-500/25 dark:shadow-primary-500/50">
            <UserPlus className="w-4 h-4" />
            <span>Add New User</span>
          </MagneticButton>
        </MotionContainer>

        {/* Filters */}
        <MotionContainer delay={0.1} className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 w-4 h-4" />
            <input
              type="text"
              placeholder="Search by name or email address..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input-field pl-10 text-xs"
            />
          </div>
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="input-field md:w-48 bg-white dark:bg-slate-900 text-xs"
          >
            <option value="all" className="bg-white dark:bg-slate-900">All System Roles</option>
            <option value="student" className="bg-white dark:bg-slate-900">Students</option>
            <option value="faculty" className="bg-white dark:bg-slate-900">Faculty Members</option>
            <option value="admin" className="bg-white dark:bg-slate-900">Administrators</option>
          </select>
        </MotionContainer>

        {/* Table */}
        <MotionContainer delay={0.2} className="bg-white dark:bg-slate-900/95 rounded-3xl shadow-card dark:shadow-card-dark border border-primary-500/10 dark:border-primary-500/20 overflow-hidden p-0 transition-all duration-300">
          {loading ? (
            <div className="text-center py-16 text-slate-500 dark:text-slate-400 text-sm flex items-center justify-center gap-2">
              <div className="animate-spin rounded-full h-5 w-5 border-2 border-primary-500 dark:border-primary-400 border-t-transparent"></div>
              <span>Loading user directory...</span>
            </div>
          ) : filteredUsers.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 uppercase tracking-wider font-bold border-b border-slate-200 dark:border-slate-700">
                  <tr>
                    <th className="py-4 px-6">User Name</th>
                    <th className="py-4 px-6">Email Address</th>
                    <th className="py-4 px-6">Role</th>
                    <th className="py-4 px-6">Department</th>
                    <th className="py-4 px-6">Registered</th>
                    <th className="py-4 px-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50 text-slate-600 dark:text-slate-400">
                  {filteredUsers.map((userItem) => (
                    <tr key={userItem._id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                      <td className="py-4 px-6 font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg bg-primary-50 dark:bg-primary-950/30 border border-primary-500/10 dark:border-primary-500/20 flex items-center justify-center font-bold text-xs overflow-hidden shrink-0">
                          {userItem.profileImage ? (
                            <img src={userItem.profileImage} alt={userItem.name} className="w-full h-full object-cover" />
                          ) : (
                            <span className="text-primary-500 dark:text-primary-400">{userItem.name?.[0]?.toUpperCase() || 'U'}</span>
                          )}
                        </div>
                        <span>{userItem.name}</span>
                      </td>
                      <td className="py-4 px-6 text-slate-600 dark:text-slate-400">{userItem.email}</td>
                      <td className="py-4 px-6">
                        <select
                          value={userItem.role}
                          onChange={(e) => handleRoleChange(userItem._id, e.target.value)}
                          className={`text-xs font-bold rounded-lg px-2.5 py-1 bg-white dark:bg-slate-900 border transition-all ${getRoleBadgeStyle(userItem.role)}`}
                        >
                          <option value="student" className="bg-white dark:bg-slate-900">Student</option>
                          <option value="faculty" className="bg-white dark:bg-slate-900">Faculty</option>
                          <option value="admin" className="bg-white dark:bg-slate-900">Admin</option>
                        </select>
                      </td>
                      <td className="py-4 px-6 text-slate-500 dark:text-slate-400">{userItem.department || 'N/A'}</td>
                      <td className="py-4 px-6 text-slate-500 dark:text-slate-400">
                        {userItem.createdAt ? new Date(userItem.createdAt).toLocaleDateString() : 'N/A'}
                      </td>
                      <td className="py-4 px-6 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => handleEditUser(userItem)}
                            className="p-1.5 rounded-lg text-slate-400 dark:text-slate-500 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-950/30 transition-colors"
                            title="Edit user"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(userItem._id, userItem.name)}
                            className="p-1.5 rounded-lg text-slate-400 dark:text-slate-500 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
                            title="Delete user"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-16 space-y-3">
              <User className="w-10 h-10 text-slate-400 dark:text-slate-600 mx-auto" />
              <p className="text-slate-500 dark:text-slate-400 text-sm">No users matched your search criteria.</p>
            </div>
          )}
        </MotionContainer>

        {/* Add Modal */}
        <ModalPortal isOpen={showAddModal}>
          <div className="fixed inset-0 bg-slate-950/80 dark:bg-slate-950/90 backdrop-blur-2xl flex items-center justify-center z-[9999] p-4 overflow-y-auto">
            <div className="bg-white dark:bg-slate-900/95 rounded-3xl shadow-2xl border border-primary-500/10 dark:border-primary-500/20 max-w-md w-full p-6 sm:p-8 space-y-6 relative transition-all duration-300 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-700 pb-3">
                <h2 className="text-lg font-display font-bold text-slate-900 dark:text-white">Add New User</h2>
                <button onClick={() => setShowAddModal(false)} className="text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleAddUser} className="space-y-4 text-xs">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Full Name</label>
                  <input type="text" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} className="input-field" required placeholder="John Doe" />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Email Address</label>
                  <input type="email" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} className="input-field" required placeholder="user@eastdelta.edu.bd" />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Password</label>
                  <input type="password" value={formData.password} onChange={(e) => setFormData({...formData, password: e.target.value})} className="input-field" required placeholder="••••••••" />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Role</label>
                  <select value={formData.role} onChange={(e) => setFormData({...formData, role: e.target.value})} className="input-field bg-white dark:bg-slate-900">
                    <option value="student" className="bg-white dark:bg-slate-900">Student</option>
                    <option value="faculty" className="bg-white dark:bg-slate-900">Faculty</option>
                    <option value="admin" className="bg-white dark:bg-slate-900">Admin</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Department</label>
                  <select 
                    value={formData.department} 
                    onChange={(e) => setFormData({...formData, department: e.target.value})}
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

                <div className="flex gap-3 pt-2">
                  <MagneticButton type="submit" variant="primary" className="flex-1 py-2.5 shadow-md shadow-primary-500/25 dark:shadow-primary-500/50">
                    <span>Create User</span>
                  </MagneticButton>
                  <MagneticButton type="button" variant="secondary" onClick={() => setShowAddModal(false)} className="flex-1 py-2.5">
                    <span>Cancel</span>
                  </MagneticButton>
                </div>
              </form>
            </div>
          </div>
        </ModalPortal>

        {/* Edit Modal */}
        <ModalPortal isOpen={Boolean(editingUser)}>
          <div className="fixed inset-0 bg-slate-950/80 dark:bg-slate-950/90 backdrop-blur-2xl flex items-center justify-center z-[9999] p-4 overflow-y-auto">
            <div className="bg-white dark:bg-slate-900/95 rounded-3xl shadow-2xl border border-primary-500/10 dark:border-primary-500/20 max-w-md w-full p-6 sm:p-8 space-y-6 relative transition-all duration-300 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-700 pb-3">
                <h2 className="text-lg font-display font-bold text-slate-900 dark:text-white">Edit User Profile</h2>
                <button onClick={() => setEditingUser(null)} className="text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleUpdateUser} className="space-y-4 text-xs">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Full Name</label>
                  <input type="text" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} className="input-field" required />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Email Address</label>
                  <input type="email" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} className="input-field" required />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Password (Leave blank to keep unchanged)</label>
                  <input type="password" value={formData.password} onChange={(e) => setFormData({...formData, password: e.target.value})} className="input-field" placeholder="New password (optional)" />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Role</label>
                  <select value={formData.role} onChange={(e) => setFormData({...formData, role: e.target.value})} className="input-field bg-white dark:bg-slate-900">
                    <option value="student" className="bg-white dark:bg-slate-900">Student</option>
                    <option value="faculty" className="bg-white dark:bg-slate-900">Faculty</option>
                    <option value="admin" className="bg-white dark:bg-slate-900">Admin</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Department</label>
                  <select 
                    value={formData.department} 
                    onChange={(e) => setFormData({...formData, department: e.target.value})}
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

                <div className="flex gap-3 pt-2">
                  <MagneticButton type="submit" variant="primary" className="flex-1 py-2.5 shadow-md shadow-primary-500/25 dark:shadow-primary-500/50">
                    <span>Save Changes</span>
                  </MagneticButton>
                  <MagneticButton type="button" variant="secondary" onClick={() => setEditingUser(null)} className="flex-1 py-2.5">
                    <span>Cancel</span>
                  </MagneticButton>
                </div>
              </form>
            </div>
          </div>
        </ModalPortal>
      </div>
    </PageTransition>
  );
};

export default ManageUsers;