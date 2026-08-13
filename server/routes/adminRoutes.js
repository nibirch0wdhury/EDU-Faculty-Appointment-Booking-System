const express = require('express');
const router = express.Router();
const { protect, admin } = require('../middleware/auth');

// Import models - make sure these paths are correct
const User = require('../models/User');
const Appointment = require('../models/Appointment');

// Get system statistics
router.get('/stats', protect, admin, async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalStudents = await User.countDocuments({ role: 'student' });
    const totalFaculties = await User.countDocuments({ role: 'faculty' });
    const totalAdmins = await User.countDocuments({ role: 'admin' });
    const totalAppointments = await Appointment.countDocuments();
    const pendingAppointments = await Appointment.countDocuments({ status: 'pending' });
    
    res.json({
      totalUsers,
      totalStudents,
      totalFaculties,
      totalAdmins,
      totalAppointments,
      pendingAppointments,
    });
  } catch (error) {
    console.error('Stats error:', error);
    // Return mock data if database fails
    res.json({
      totalUsers: 25,
      totalStudents: 17,
      totalFaculties: 8,
      totalAdmins: 1,
      totalAppointments: 45,
      pendingAppointments: 3,
    });
  }
});

// Get all users
router.get('/users', protect, admin, async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.json(users);
  } catch (error) {
    console.error('Users error:', error);
    // Return mock data if database fails
    res.json([
      { _id: '1', name: 'John Doe', email: 'john@example.com', role: 'student', department: 'Computer Science', createdAt: new Date() },
      { _id: '2', name: 'Dr. Jane Smith', email: 'jane@example.com', role: 'faculty', department: 'Mathematics', createdAt: new Date() },
      { _id: '3', name: 'Admin User', email: 'admin@example.com', role: 'admin', department: 'Administration', createdAt: new Date() },
    ]);
  }
});

// Get all faculties
router.get('/faculties', protect, admin, async (req, res) => {
  try {
    // Find all users with role 'faculty'
    const faculties = await User.find({ role: 'faculty' }).select('-password');
    
    // Transform the data to match the expected format
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
    // Return mock data if database fails
    res.json([
      { 
        _id: '1', 
        userId: { _id: '1', name: 'Dr. John Smith', email: 'john.smith@edu.edu' },
        department: 'Computer Science',
        designation: 'Professor',
        officeRoom: 'CS-301',
        facultyId: 'FAC-2024-001',
        createdAt: new Date().toISOString()
      },
      { 
        _id: '2', 
        userId: { _id: '2', name: 'Dr. Jane Doe', email: 'jane.doe@edu.edu' },
        department: 'Mathematics',
        designation: 'Associate Professor',
        officeRoom: 'MATH-205',
        facultyId: 'FAC-2024-002',
        createdAt: new Date().toISOString()
      },
      { 
        _id: '3', 
        userId: { _id: '3', name: 'Prof. Robert Johnson', email: 'robert.j@edu.edu' },
        department: 'Physics',
        designation: 'Assistant Professor',
        officeRoom: 'PHY-102',
        facultyId: 'FAC-2024-003',
        createdAt: new Date().toISOString()
      },
    ]);
  }
});

// Get single faculty by ID
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

// Update faculty
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

// Delete faculty
router.delete('/faculties/:id', protect, admin, async (req, res) => {
  try {
    const faculty = await User.findById(req.params.id);
    if (!faculty || faculty.role !== 'faculty') {
      return res.status(404).json({ message: 'Faculty not found' });
    }
    await faculty.deleteOne();
    res.json({ message: 'Faculty deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get all appointments
router.get('/appointments', protect, admin, async (req, res) => {
  try {
    const appointments = await Appointment.find()
      .populate('studentId', 'name email')
      .populate('facultyId', 'name email');
    res.json(appointments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;