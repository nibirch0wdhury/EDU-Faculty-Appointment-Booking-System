import React, { useState, useEffect } from 'react';
import { Search, Edit, Trash2, UserPlus, User, Mail, Building, MapPin, Briefcase, Calendar, Sparkles, X } from 'lucide-react';
import { toast } from 'react-toastify';
import api from '../../utils/api';
import MagneticButton from '../ui/MagneticButton';
import SpotlightCard from '../ui/SpotlightCard';
import PageTransition, { MotionContainer } from '../ui/PageTransition';
import AdminNavTabs from './AdminNavTabs';
import ModalPortal from '../ui/ModalPortal';

const ManageFaculties = () => {
  const [faculties, setFaculties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingFaculty, setEditingFaculty] = useState(null);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [selectedFaculty, setSelectedFaculty] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    department: '',
    designation: '',
    officeRoom: '',
    facultyId: '',
  });

  useEffect(() => {
    fetchFaculties();
  }, []);

  const fetchFaculties = async () => {
    try {
      setLoading(true);
      const response = await api.get('/admin/faculties');
      setFaculties(response.data || []);
    } catch (error) {
      console.error('Error fetching faculties:', error);
      toast.error('Failed to load faculties');
      setFaculties([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (facultyId) => {
    if (!window.confirm('Are you sure you want to delete this faculty member?')) return;
    try {
      await api.delete(`/admin/faculties/${facultyId}`);
      toast.success('Faculty member deleted successfully');
      fetchFaculties();
    } catch (error) {
      toast.error('Failed to delete faculty member');
    }
  };

  const handleAddFaculty = async (e) => {
    e.preventDefault();
    try {
      const userData = {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        role: 'faculty',
        department: formData.department,
        facultyId: formData.facultyId,
      };
      await api.post('/auth/register', userData);
      await api.post('/admin/faculties', {
        userId: userData._id,
        designation: formData.designation,
        officeRoom: formData.officeRoom,
      });
      toast.success('Faculty member added successfully');
      setShowAddModal(false);
      setFormData({ name: '', email: '', password: '', department: '', designation: '', officeRoom: '', facultyId: '' });
      fetchFaculties();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to add faculty member');
    }
  };

  const handleEditFaculty = (faculty) => {
    setEditingFaculty(faculty);
    setFormData({
      name: faculty.userId?.name || '',
      email: faculty.userId?.email || '',
      password: '',
      department: faculty.department || '',
      designation: faculty.designation || '',
      officeRoom: faculty.officeRoom || '',
      facultyId: faculty.facultyId || '',
    });
  };

  const handleUpdateFaculty = async (e) => {
    e.preventDefault();
    try {
      await api.put(`/admin/users/${editingFaculty.userId._id}`, {
        name: formData.name,
        email: formData.email,
        department: formData.department,
        ...(formData.password && { password: formData.password }),
      });
      await api.put(`/admin/faculties/${editingFaculty._id}`, {
        designation: formData.designation,
        officeRoom: formData.officeRoom,
        facultyId: formData.facultyId,
      });
      toast.success('Faculty member updated successfully');
      setEditingFaculty(null);
      setFormData({ name: '', email: '', password: '', department: '', designation: '', officeRoom: '', facultyId: '' });
      fetchFaculties();
    } catch (error) {
      toast.error('Failed to update faculty member');
    }
  };

  const viewSchedule = (faculty) => {
    setSelectedFaculty(faculty);
    setShowScheduleModal(true);
  };

  const filteredFaculties = faculties.filter(faculty => {
    const name = faculty.userId?.name || '';
    const department = faculty.department || '';
    const email = faculty.userId?.email || '';
    const searchLower = searchTerm.toLowerCase();
    return name.toLowerCase().includes(searchLower) ||
           department.toLowerCase().includes(searchLower) ||
           email.toLowerCase().includes(searchLower);
  });

  return (
    <PageTransition className="py-8 md:py-12 bg-slate-50/80 dark:bg-slate-950/80 pattern-dots">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <AdminNavTabs />
        <MotionContainer className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary-50 dark:bg-primary-950/30 border border-primary-500/20 dark:border-primary-500/30 text-primary-600 dark:text-primary-400 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5 text-primary-500 dark:text-primary-400" />
              <span>Academic Staff Management</span>
            </div>
            <h1 className="text-3xl font-display font-bold text-slate-900 dark:text-white">Manage Faculty Members</h1>
          </div>
          <MagneticButton variant="primary" onClick={() => setShowAddModal(true)} className="py-2.5 px-4 text-xs shadow-md shadow-primary-500/25 dark:shadow-primary-500/50">
            <UserPlus className="w-4 h-4" />
            <span>Add Faculty Member</span>
          </MagneticButton>
        </MotionContainer>

        {/* Search */}
        <MotionContainer delay={0.1}>
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 w-4 h-4" />
            <input
              type="text"
              placeholder="Search faculties by name, department, or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input-field pl-10 text-xs"
            />
          </div>
        </MotionContainer>

        {/* Grid */}
        {loading ? (
          <div className="py-16 text-center text-slate-500 dark:text-slate-400 text-sm flex items-center justify-center gap-2">
            <div className="animate-spin rounded-full h-5 w-5 border-2 border-primary-500 dark:border-primary-400 border-t-transparent"></div>
            <span>Loading faculty records...</span>
          </div>
        ) : filteredFaculties.length > 0 ? (
          <MotionContainer delay={0.2} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredFaculties.map((faculty) => (
              <SpotlightCard key={faculty._id} spotlightColor="rgba(153, 0, 0, 0.08)" className="p-6 bg-white dark:bg-slate-900/95 border-primary-500/10 dark:border-primary-500/20 shadow-card dark:shadow-card-dark transition-all duration-300">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-primary-50 dark:bg-primary-950/30 border border-primary-500/10 dark:border-primary-500/20 text-primary-500 dark:text-primary-400 flex items-center justify-center font-bold text-base">
                      {faculty.userId?.name?.[0]?.toUpperCase() || 'F'}
                    </div>
                    <div>
                      <h3 className="font-bold text-base text-slate-900 dark:text-white">{faculty.userId?.name || 'Unknown'}</h3>
                      <p className="text-xs text-primary-600 dark:text-primary-400 font-medium">{faculty.designation || 'Faculty Member'}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <button onClick={() => viewSchedule(faculty)} className="p-1.5 rounded-lg text-slate-400 dark:text-slate-500 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 transition-colors" title="View Schedule">
                      <Calendar className="w-4 h-4" />
                    </button>
                    <button onClick={() => handleEditFaculty(faculty)} className="p-1.5 rounded-lg text-slate-400 dark:text-slate-500 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-950/30 transition-colors" title="Edit Faculty">
                      <Edit className="w-4 h-4" />
                    </button>
                    <button onClick={() => handleDelete(faculty._id)} className="p-1.5 rounded-lg text-slate-400 dark:text-slate-500 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors" title="Delete Faculty">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <div className="mt-4 space-y-2 text-xs text-slate-600 dark:text-slate-400 border-t border-slate-200 dark:border-slate-700 pt-4">
                  <p className="flex items-center gap-2">
                    <Mail className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
                    <span>{faculty.userId?.email || 'No email'}</span>
                  </p>
                  <p className="flex items-center gap-2">
                    <Building className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
                    <span>{faculty.department || 'No department'}</span>
                  </p>
                  <p className="flex items-center gap-2">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
                    <span>Office: {faculty.officeRoom || 'N/A'}</span>
                  </p>
                  <p className="flex items-center gap-2">
                    <Briefcase className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
                    <span>ID: {faculty.facultyId || 'N/A'}</span>
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-slate-200 dark:border-slate-700 flex items-center justify-between text-[11px]">
                  <span className="text-slate-500 dark:text-slate-400">Joined {faculty.createdAt ? new Date(faculty.createdAt).toLocaleDateString() : 'N/A'}</span>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/50 text-emerald-600 dark:text-emerald-400 font-bold">Active</span>
                </div>
              </SpotlightCard>
            ))}
          </MotionContainer>
        ) : (
          <MotionContainer delay={0.2} className="bg-white dark:bg-slate-900/95 rounded-3xl shadow-card dark:shadow-card-dark border border-primary-500/10 dark:border-primary-500/20 p-12 text-center space-y-3 transition-all duration-300">
            <User className="w-12 h-12 text-slate-400 dark:text-slate-600 mx-auto" />
            <h3 className="text-lg font-display font-bold text-slate-900 dark:text-white">No Faculty Members Found</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">Try adjusting your search criteria.</p>
          </MotionContainer>
        )}

        {/* Add Modal */}
        <ModalPortal isOpen={showAddModal}>
          <div className="fixed inset-0 bg-slate-950/80 dark:bg-slate-950/90 backdrop-blur-2xl flex items-center justify-center z-[9999] p-4 overflow-y-auto">
            <div className="bg-white dark:bg-slate-900/95 rounded-3xl shadow-2xl border border-primary-500/10 dark:border-primary-500/20 max-w-md w-full p-6 sm:p-8 space-y-6 relative transition-all duration-300 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-700 pb-3">
                <h2 className="text-lg font-display font-bold text-slate-900 dark:text-white">Add Faculty Member</h2>
                <button onClick={() => setShowAddModal(false)} className="text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <form onSubmit={handleAddFaculty} className="space-y-4 text-xs">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Full Name</label>
                  <input type="text" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} className="input-field" required placeholder="Dr. John Smith" />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Email Address</label>
                  <input type="email" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} className="input-field" required placeholder="john.smith@edu.edu" />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Password</label>
                  <input type="password" value={formData.password} onChange={(e) => setFormData({...formData, password: e.target.value})} className="input-field" required placeholder="••••••••" />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Department</label>
                  <select value={formData.department} onChange={(e) => setFormData({...formData, department: e.target.value})} className="input-field bg-white dark:bg-slate-900" required>
                    <option value="" className="bg-white dark:bg-slate-900">Select Department...</option>
                    <option value="Computer Science">Computer Science</option>
                    <option value="Mathematics">Mathematics</option>
                    <option value="Physics">Physics</option>
                    <option value="Chemistry">Chemistry</option>
                    <option value="Business Administration">Business Administration</option>
                    <option value="Economics">Economics</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Designation</label>
                  <input type="text" value={formData.designation} onChange={(e) => setFormData({...formData, designation: e.target.value})} className="input-field" required placeholder="Professor, Associate Professor, etc." />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Office Room</label>
                    <input type="text" value={formData.officeRoom} onChange={(e) => setFormData({...formData, officeRoom: e.target.value})} className="input-field" required placeholder="CS-301" />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Faculty ID</label>
                    <input type="text" value={formData.facultyId} onChange={(e) => setFormData({...formData, facultyId: e.target.value})} className="input-field" required placeholder="FAC-2024-001" />
                  </div>
                </div>
                <div className="flex gap-3 pt-2">
                  <MagneticButton type="submit" variant="primary" className="flex-1 py-2.5 shadow-md shadow-primary-500/25 dark:shadow-primary-500/50">
                    <span>Add Faculty</span>
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
        <ModalPortal isOpen={Boolean(editingFaculty)}>
          <div className="fixed inset-0 bg-slate-950/80 dark:bg-slate-950/90 backdrop-blur-2xl flex items-center justify-center z-[9999] p-4 overflow-y-auto">
            <div className="bg-white dark:bg-slate-900/95 rounded-3xl shadow-2xl border border-primary-500/10 dark:border-primary-500/20 max-w-md w-full p-6 sm:p-8 space-y-6 relative transition-all duration-300 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-700 pb-3">
                <h2 className="text-lg font-display font-bold text-slate-900 dark:text-white">Edit Faculty Member</h2>
                <button onClick={() => setEditingFaculty(null)} className="text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <form onSubmit={handleUpdateFaculty} className="space-y-4 text-xs">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Full Name</label>
                  <input type="text" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} className="input-field" required />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Email Address</label>
                  <input type="email" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} className="input-field" required />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Designation</label>
                  <input type="text" value={formData.designation} onChange={(e) => setFormData({...formData, designation: e.target.value})} className="input-field" required />
                </div>
                <div className="flex gap-3 pt-2">
                  <MagneticButton type="submit" variant="primary" className="flex-1 py-2.5 shadow-md shadow-primary-500/25 dark:shadow-primary-500/50">
                    <span>Update Faculty</span>
                  </MagneticButton>
                  <MagneticButton type="button" variant="secondary" onClick={() => setEditingFaculty(null)} className="flex-1 py-2.5">
                    <span>Cancel</span>
                  </MagneticButton>
                </div>
              </form>
            </div>
          </div>
        </ModalPortal>

        {/* View Schedule Modal */}
        <ModalPortal isOpen={Boolean(showScheduleModal && selectedFaculty)}>
          <div className="fixed inset-0 bg-slate-950/80 dark:bg-slate-950/90 backdrop-blur-2xl flex items-center justify-center z-[9999] p-4 overflow-y-auto">
            <div className="bg-white dark:bg-slate-900/95 rounded-3xl shadow-2xl border border-primary-500/10 dark:border-primary-500/20 max-w-lg w-full p-6 sm:p-8 space-y-6 relative transition-all duration-300 max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center border-b border-slate-200 dark:border-slate-700 pb-3">
                <h2 className="text-lg font-display font-bold text-slate-900 dark:text-white">
                  Schedule - {selectedFaculty?.userId?.name || 'Faculty'}
                </h2>
                <button onClick={() => setShowScheduleModal(false)} className="text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="space-y-3 text-xs">
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 space-y-1">
                  <p className="font-bold text-slate-500 dark:text-slate-400">Department</p>
                  <p className="text-slate-900 dark:text-white font-medium">{selectedFaculty?.department}</p>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 space-y-1">
                  <p className="font-bold text-slate-500 dark:text-slate-400">Office Room</p>
                  <p className="text-slate-900 dark:text-white font-medium">{selectedFaculty?.officeRoom}</p>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 space-y-2">
                  <p className="font-bold text-slate-500 dark:text-slate-400">Weekly Office Hours</p>
                  <div className="space-y-1 text-slate-600 dark:text-slate-400">
                    {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'].map((day) => (
                      <div key={day} className="flex justify-between p-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-700">
                        <span>{day}</span>
                        <span className="font-mono text-primary-600 dark:text-primary-400">09:00 AM - 05:00 PM</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <MagneticButton variant="secondary" onClick={() => setShowScheduleModal(false)} className="w-full py-2.5 text-xs">
                <span>Close Schedule Window</span>
              </MagneticButton>
            </div>
          </div>
        </ModalPortal>
      </div>
    </PageTransition>
  );
};

export default ManageFaculties;