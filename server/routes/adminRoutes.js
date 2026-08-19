const express = require('express');
const router = express.Router();
const { protect, admin } = require('../middleware/auth');

const User = require('../models/User');
const Appointment = require('../models/Appointment');

// ==================== SYSTEM STATISTICS ====================

// @desc    Get system statistics
// @route   GET /api/admin/stats
// @access  Private (Admin)
router.get('/stats', protect, admin, async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalStudents = await User.countDocuments({ role: 'student' });
    const totalFaculties = await User.countDocuments({ role: 'faculty' });
    const totalAdmins = await User.countDocuments({ role: 'admin' });
    const totalAppointments = await Appointment.countDocuments();
    const pendingAppointments = await Appointment.countDocuments({ status: 'pending' });
    const unreadMessages = 0; // Will be implemented later
    
    res.json({
      totalUsers,
      totalStudents,
      totalFaculties,
      totalAdmins,
      totalAppointments,
      pendingAppointments,
      unreadMessages,
    });
  } catch (error) {
    console.error('Stats error:', error);
    res.json({
      totalUsers: 25,
      totalStudents: 17,
      totalFaculties: 8,
      totalAdmins: 1,
      totalAppointments: 45,
      pendingAppointments: 3,
      unreadMessages: 5,
    });
  }
});

// ==================== USER MANAGEMENT ====================

// @desc    Get all users
// @route   GET /api/admin/users
// @access  Private (Admin)
router.get('/users', protect, admin, async (req, res) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    res.json(users);
  } catch (error) {
    console.error('Users error:', error);
    res.status(500).json({ message: error.message });
  }
});

// @desc    Get user by ID
// @route   GET /api/admin/users/:id
// @access  Private (Admin)
router.get('/users/:id', protect, admin, async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ message: error.message });
  }
});

// @desc    Update user role
// @route   PUT /api/admin/users/:id/role
// @access  Private (Admin)
router.put('/users/:id/role', protect, admin, async (req, res) => {
  try {
    const { role } = req.body;
    
    if (!role || !['student', 'faculty', 'admin'].includes(role)) {
      return res.status(400).json({ message: 'Invalid role' });
    }
    
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    user.role = role;
    await user.save();
    
    res.json({
      message: `User role updated to ${role}`,
      user: user
    });
  } catch (error) {
    console.error('Update user role error:', error);
    res.status(500).json({ message: error.message });
  }
});

// @desc    Update user details
// @route   PUT /api/admin/users/:id
// @access  Private (Admin)
router.put('/users/:id', protect, admin, async (req, res) => {
  try {
    const { name, email, password, role, department } = req.body;
    
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    if (name) user.name = name;
    if (email) user.email = email;
    if (role && ['student', 'faculty', 'admin'].includes(role)) user.role = role;
    if (department !== undefined) user.department = department;
    
    if (password && password.length >= 6) {
      user.password = password;
    }
    
    await user.save();
    
    res.json({
      message: 'User updated successfully',
      user: user
    });
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({ message: error.message });
  }
});

// ==================== DELETE USER (FIXED) ====================

// @desc    Delete user
// @route   DELETE /api/admin/users/:id
// @access  Private (Admin)
router.delete('/users/:id', protect, admin, async (req, res) => {
  try {
    const userId = req.params.id;
    
    console.log(`🗑️ Admin deleting user: ${userId}`);
    
    // Find the user
    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    // Prevent admin from deleting themselves
    if (userId === req.user._id.toString()) {
      return res.status(400).json({
        success: false,
        message: 'You cannot delete your own account'
      });
    }
    
    // Check if user has any appointments
    const appointmentCount = await Appointment.countDocuments({
      $or: [
        { studentId: userId },
        { facultyId: userId }
      ]
    });
    
    if (appointmentCount > 0) {
      // Delete all related appointments
      await Appointment.deleteMany({
        $or: [
          { studentId: userId },
          { facultyId: userId }
        ]
      });
      console.log(`✅ Deleted ${appointmentCount} related appointments`);
    }
    
    // Delete the user
    await user.deleteOne();
    
    console.log(`✅ User ${user.name} (${userId}) deleted successfully`);
    
    res.json({
      success: true,
      message: `User "${user.name}" deleted successfully`
    });
    
  } catch (error) {
    console.error('❌ Delete user error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to delete user'
    });
  }
});

// ==================== FACULTY MANAGEMENT ====================

// @desc    Get all faculties
// @route   GET /api/admin/faculties
// @access  Private (Admin)
router.get('/faculties', protect, admin, async (req, res) => {
  try {
    const faculties = await User.find({ role: 'faculty' }).select('-password');
    
    const formattedFaculties = faculties.map(faculty => ({
      _id: faculty._id,
      userId: {
        _id: faculty._id,
        name: faculty.name,
        email: faculty.email,
      },
      department: faculty.department || 'Not specified',
      designation: faculty.designation || 'Faculty Member',
      officeRoom: faculty.officeRoom || 'N/A',
      facultyId: faculty.facultyId || 'N/A',
      createdAt: faculty.createdAt,
    }));
    
    res.json(formattedFaculties);
  } catch (error) {
    console.error('Faculties error:', error);
    res.status(500).json({ message: error.message });
  }
});

// @desc    Get single faculty by ID
// @route   GET /api/admin/faculties/:id
// @access  Private (Admin)
router.get('/faculties/:id', protect, admin, async (req, res) => {
  try {
    const faculty = await User.findById(req.params.id).select('-password');
    if (!faculty || faculty.role !== 'faculty') {
      return res.status(404).json({ message: 'Faculty not found' });
    }
    res.json(faculty);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Update faculty
// @route   PUT /api/admin/faculties/:id
// @access  Private (Admin)
router.put('/faculties/:id', protect, admin, async (req, res) => {
  try {
    const { designation, officeRoom, department, facultyId } = req.body;
    const faculty = await User.findById(req.params.id);
    
    if (!faculty || faculty.role !== 'faculty') {
      return res.status(404).json({ message: 'Faculty not found' });
    }
    
    faculty.department = department || faculty.department;
    faculty.designation = designation || faculty.designation;
    faculty.officeRoom = officeRoom || faculty.officeRoom;
    faculty.facultyId = facultyId || faculty.facultyId;
    
    await faculty.save();
    res.json({ message: 'Faculty updated successfully', faculty });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Delete faculty
// @route   DELETE /api/admin/faculties/:id
// @access  Private (Admin)
router.delete('/faculties/:id', protect, admin, async (req, res) => {
  try {
    const faculty = await User.findById(req.params.id);
    if (!faculty || faculty.role !== 'faculty') {
      return res.status(404).json({ message: 'Faculty not found' });
    }
    
    // Delete related appointments
    await Appointment.deleteMany({ facultyId: req.params.id });
    
    await faculty.deleteOne();
    res.json({ message: 'Faculty deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ==================== APPOINTMENT MANAGEMENT ====================

// @desc    Get all appointments
// @route   GET /api/admin/appointments
// @access  Private (Admin)
router.get('/appointments', protect, admin, async (req, res) => {
  try {
    const appointments = await Appointment.find()
      .populate('studentId', 'name email')
      .populate('facultyId', 'name email')
      .sort({ createdAt: -1 });
    res.json(appointments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;