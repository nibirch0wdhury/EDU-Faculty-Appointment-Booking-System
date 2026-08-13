import React, { useState, useEffect } from 'react';
import { Search, Edit, Trash2, UserPlus, User, Mail, Building, MapPin, Briefcase, Calendar } from 'lucide-react';
import { toast } from 'react-toastify';
import api from '../../utils/api';

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
      setFaculties(response.data);
    } catch (error) {
      console.error('Error fetching faculties:', error);
      toast.error('Failed to load faculties');
      // Use mock data if API fails
      setFaculties([
        { 
          _id: '1', 
          userId: { name: 'Dr. John Smith', email: 'john.smith@edu.edu' },
          department: 'Computer Science',
          designation: 'Professor',
          officeRoom: 'CS-301',
          facultyId: 'FAC-2024-001',
          createdAt: new Date().toISOString()
        },
        { 
          _id: '2', 
          userId: { name: 'Dr. Jane Doe', email: 'jane.doe@edu.edu' },
          department: 'Mathematics',
          designation: 'Associate Professor',
          officeRoom: 'MATH-205',
          facultyId: 'FAC-2024-002',
          createdAt: new Date().toISOString()
        },
        { 
          _id: '3', 
          userId: { name: 'Prof. Robert Johnson', email: 'robert.j@edu.edu' },
          department: 'Physics',
          designation: 'Assistant Professor',
          officeRoom: 'PHY-102',
          facultyId: 'FAC-2024-003',
          createdAt: new Date().toISOString()
        },
      ]);
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
      console.error('Delete error:', error);
      toast.error('Failed to delete faculty member');
    }
  };

  const handleAddFaculty = async (e) => {
    e.preventDefault();
    try {
      // First register the user with faculty role
      const userData = {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        role: 'faculty',
        department: formData.department,
        facultyId: formData.facultyId,
      };
      
      await api.post('/auth/register', userData);
      
      // Then add faculty details
      await api.post('/admin/faculties', {
        userId: userData._id,
        designation: formData.designation,
        officeRoom: formData.officeRoom,
      });
      
      toast.success('Faculty member added successfully');
      setShowAddModal(false);
      setFormData({ 
        name: '', 
        email: '', 
        password: '', 
        department: '', 
        designation: '', 
        officeRoom: '',
        facultyId: '',
      });
      fetchFaculties();
    } catch (error) {
      console.error('Add faculty error:', error);
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
      // Update user info
      await api.put(`/admin/users/${editingFaculty.userId._id}`, {
        name: formData.name,
        email: formData.email,
        department: formData.department,
        ...(formData.password && { password: formData.password }),
      });
      
      // Update faculty details
      await api.put(`/admin/faculties/${editingFaculty._id}`, {
        designation: formData.designation,
        officeRoom: formData.officeRoom,
        facultyId: formData.facultyId,
      });
      
      toast.success('Faculty member updated successfully');
      setEditingFaculty(null);
      setFormData({ 
        name: '', 
        email: '', 
        password: '', 
        department: '', 
        designation: '', 
        officeRoom: '',
        facultyId: '',
      });
      fetchFaculties();
    } catch (error) {
      console.error('Update error:', error);
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
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Manage Faculties</h1>
        <button
          onClick={() => setShowAddModal(true)}
          className="btn-primary flex items-center gap-2"
        >
          <UserPlus className="w-4 h-4" />
          Add Faculty
        </button>
      </div>

      {/* Search */}
      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
        <input
          type="text"
          placeholder="Search faculties by name, department, or email..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="input-field pl-10"
        />
      </div>

      {/* Faculties Grid */}
      {loading ? (
        <div className="flex justify-center items-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary-600 border-t-transparent mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading faculties...</p>
          </div>
        </div>
      ) : filteredFaculties.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredFaculties.map((faculty) => (
            <div key={faculty._id} className="card hover:shadow-lg transition-shadow">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-primary-100 rounded-full">
                    <User className="w-6 h-6 text-primary-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">{faculty.userId?.name || 'Unknown'}</h3>
                    <p className="text-sm text-gray-600">{faculty.designation || 'Faculty Member'}</p>
                  </div>
                </div>
                <div className="flex gap-1">
                  <button
                    onClick={() => viewSchedule(faculty)}
                    className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                    title="View Schedule"
                  >
                    <Calendar className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleEditFaculty(faculty)}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    title="Edit Faculty"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(faculty._id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="Delete Faculty"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="mt-4 space-y-2 text-sm">
                <p className="flex items-center gap-2 text-gray-600">
                  <Mail className="w-4 h-4" />
                  {faculty.userId?.email || 'No email'}
                </p>
                <p className="flex items-center gap-2 text-gray-600">
                  <Building className="w-4 h-4" />
                  {faculty.department || 'No department'}
                </p>
                <p className="flex items-center gap-2 text-gray-600">
                  <MapPin className="w-4 h-4" />
                  Office: {faculty.officeRoom || 'N/A'}
                </p>
                <p className="flex items-center gap-2 text-gray-600">
                  <Briefcase className="w-4 h-4" />
                  ID: {faculty.facultyId || 'N/A'}
                </p>
              </div>

              <div className="mt-4 pt-4 border-t border-gray-100">
                <div className="flex justify-between items-center text-xs text-gray-500">
                  <span>Joined: {faculty.createdAt ? new Date(faculty.createdAt).toLocaleDateString() : 'N/A'}</span>
                  <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full">Active</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <User className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-700">No Faculties Found</h3>
          <p className="text-gray-600 mt-2">
            {searchTerm ? 'Try adjusting your search' : 'Add your first faculty member'}
          </p>
          {!searchTerm && (
            <button 
              onClick={() => setShowAddModal(true)}
              className="mt-4 btn-primary"
            >
              Add Faculty Member
            </button>
          )}
        </div>
      )}

      {/* Add Faculty Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 max-w-md w-full max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">Add Faculty Member</h2>
            <form onSubmit={handleAddFaculty} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="input-field"
                  required
                  placeholder="Dr. John Smith"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  className="input-field"
                  required
                  placeholder="john.smith@edu.edu"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                  className="input-field"
                  required
                  placeholder="••••••••"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
                <select
                  value={formData.department}
                  onChange={(e) => setFormData({...formData, department: e.target.value})}
                  className="input-field"
                  required
                >
                  <option value="">Select Department</option>
                  <option value="Computer Science">Computer Science</option>
                  <option value="Mathematics">Mathematics</option>
                  <option value="Physics">Physics</option>
                  <option value="Chemistry">Chemistry</option>
                  <option value="Biology">Biology</option>
                  <option value="Business Administration">Business Administration</option>
                  <option value="Economics">Economics</option>
                  <option value="Psychology">Psychology</option>
                  <option value="Sociology">Sociology</option>
                  <option value="Engineering">Engineering</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Designation</label>
                <input
                  type="text"
                  value={formData.designation}
                  onChange={(e) => setFormData({...formData, designation: e.target.value})}
                  className="input-field"
                  required
                  placeholder="Professor, Associate Professor, etc."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Office Room</label>
                <input
                  type="text"
                  value={formData.officeRoom}
                  onChange={(e) => setFormData({...formData, officeRoom: e.target.value})}
                  className="input-field"
                  required
                  placeholder="CS-301"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Faculty ID</label>
                <input
                  type="text"
                  value={formData.facultyId}
                  onChange={(e) => setFormData({...formData, facultyId: e.target.value})}
                  className="input-field"
                  required
                  placeholder="FAC-2024-001"
                />
              </div>
              <div className="flex gap-2 pt-2">
                <button type="submit" className="btn-primary flex-1">Add Faculty</button>
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="btn-secondary flex-1"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Faculty Modal */}
      {editingFaculty && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 max-w-md w-full max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">Edit Faculty Member</h2>
            <form onSubmit={handleUpdateFaculty} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="input-field"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  className="input-field"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Password (leave blank to keep current)</label>
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                  className="input-field"
                  placeholder="New password (optional)"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
                <select
                  value={formData.department}
                  onChange={(e) => setFormData({...formData, department: e.target.value})}
                  className="input-field"
                  required
                >
                  <option value="Computer Science">Computer Science</option>
                  <option value="Mathematics">Mathematics</option>
                  <option value="Physics">Physics</option>
                  <option value="Chemistry">Chemistry</option>
                  <option value="Biology">Biology</option>
                  <option value="Business Administration">Business Administration</option>
                  <option value="Economics">Economics</option>
                  <option value="Psychology">Psychology</option>
                  <option value="Sociology">Sociology</option>
                  <option value="Engineering">Engineering</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Designation</label>
                <input
                  type="text"
                  value={formData.designation}
                  onChange={(e) => setFormData({...formData, designation: e.target.value})}
                  className="input-field"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Office Room</label>
                <input
                  type="text"
                  value={formData.officeRoom}
                  onChange={(e) => setFormData({...formData, officeRoom: e.target.value})}
                  className="input-field"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Faculty ID</label>
                <input
                  type="text"
                  value={formData.facultyId}
                  onChange={(e) => setFormData({...formData, facultyId: e.target.value})}
                  className="input-field"
                  required
                />
              </div>
              <div className="flex gap-2 pt-2">
                <button type="submit" className="btn-primary flex-1">Update Faculty</button>
                <button
                  type="button"
                  onClick={() => setEditingFaculty(null)}
                  className="btn-secondary flex-1"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Schedule Modal */}
      {showScheduleModal && selectedFaculty && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">
                Schedule - {selectedFaculty.userId?.name || 'Faculty'}
              </h2>
              <button
                onClick={() => setShowScheduleModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>
            
            <div className="space-y-3">
              <div className="bg-gray-50 p-3 rounded-lg">
                <h3 className="font-semibold text-sm text-gray-700">Department</h3>
                <p className="text-gray-600">{selectedFaculty.department}</p>
              </div>
              <div className="bg-gray-50 p-3 rounded-lg">
                <h3 className="font-semibold text-sm text-gray-700">Office</h3>
                <p className="text-gray-600">{selectedFaculty.officeRoom}</p>
              </div>
              <div className="bg-gray-50 p-3 rounded-lg">
                <h3 className="font-semibold text-sm text-gray-700">Available Hours</h3>
                <div className="mt-2 space-y-1 text-sm text-gray-600">
                  <div className="flex justify-between p-2 bg-white rounded">
                    <span>Monday</span>
                    <span>9:00 AM - 5:00 PM</span>
                  </div>
                  <div className="flex justify-between p-2 bg-white rounded">
                    <span>Tuesday</span>
                    <span>9:00 AM - 5:00 PM</span>
                  </div>
                  <div className="flex justify-between p-2 bg-white rounded">
                    <span>Wednesday</span>
                    <span>9:00 AM - 5:00 PM</span>
                  </div>
                  <div className="flex justify-between p-2 bg-white rounded">
                    <span>Thursday</span>
                    <span>9:00 AM - 5:00 PM</span>
                  </div>
                  <div className="flex justify-between p-2 bg-white rounded">
                    <span>Friday</span>
                    <span>9:00 AM - 1:00 PM</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t">
              <button
                onClick={() => setShowScheduleModal(false)}
                className="btn-secondary w-full"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageFaculties; 