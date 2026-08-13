const express = require('express');
const router = express.Router();
const { protect, faculty } = require('../middleware/auth');

// Import all controller functions
const {
  bookAppointment,
  getStudentAppointments,
  getFacultyAppointments,
  getAllAppointments,
  getAppointmentById,
  updateAppointmentStatus,
  cancelAppointment,
  getAppointmentsByDateRange,
  getUpcomingAppointments,
} = require('../controllers/appointmentController');

// ==================== STUDENT ROUTES ====================
// @route   POST /api/appointments/book
// @desc    Book a new appointment
// @access  Private (Student)
router.post('/book', protect, bookAppointment);

// @route   GET /api/appointments/student
// @desc    Get all appointments for the logged-in student
// @access  Private (Student)
router.get('/student', protect, getStudentAppointments);

// ==================== FACULTY ROUTES ====================
// @route   GET /api/appointments/faculty
// @desc    Get all appointments for the logged-in faculty
// @access  Private (Faculty)
router.get('/faculty', protect, getFacultyAppointments);

// ==================== ADMIN ROUTES ====================
// @route   GET /api/appointments/all
// @desc    Get all appointments (admin only)
// @access  Private (Admin)
router.get('/all', protect, getAllAppointments);

// ==================== GENERAL ROUTES ====================
// @route   GET /api/appointments/range
// @desc    Get appointments by date range
// @access  Private
router.get('/range', protect, getAppointmentsByDateRange);

// @route   GET /api/appointments/upcoming
// @desc    Get upcoming appointments
// @access  Private
router.get('/upcoming', protect, getUpcomingAppointments);

// @route   GET /api/appointments/:id
// @desc    Get appointment by ID
// @access  Private
router.get('/:id', protect, getAppointmentById);

// @route   PUT /api/appointments/:id/status
// @desc    Update appointment status
// @access  Private (Faculty/Admin)
router.put('/:id/status', protect, updateAppointmentStatus);

// @route   PUT /api/appointments/:id/cancel
// @desc    Cancel appointment
// @access  Private
router.put('/:id/cancel', protect, cancelAppointment);

module.exports = router;