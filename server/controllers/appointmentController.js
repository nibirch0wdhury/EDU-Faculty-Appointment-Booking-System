const Appointment = require('../models/Appointment');
const User = require('../models/User');

// @desc    Book a new appointment
// @route   POST /api/appointments/book
// @access  Private (Student)
const bookAppointment = async (req, res) => {
  try {
    const { facultyId, date, startTime, purpose } = req.body;
    
    console.log('📝 Booking appointment with data:', { facultyId, date, startTime, purpose });
    console.log('👤 Student ID:', req.user._id);
    
    // Validate required fields
    if (!facultyId || !date || !startTime || !purpose) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields: facultyId, date, startTime, purpose'
      });
    }
    
    // Check if faculty exists
    const faculty = await User.findById(facultyId);
    if (!faculty) {
      return res.status(404).json({
        success: false,
        message: 'Faculty not found'
      });
    }
    
    if (faculty.role !== 'faculty') {
      return res.status(400).json({
        success: false,
        message: 'Selected user is not a faculty member'
      });
    }
    
    // Check if student has any conflicting appointments on the same date and time
    const appointmentDate = new Date(date);
    const startOfDay = new Date(appointmentDate);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(appointmentDate);
    endOfDay.setHours(23, 59, 59, 999);
    
    const existingAppointment = await Appointment.findOne({
      studentId: req.user._id,
      date: {
        $gte: startOfDay,
        $lte: endOfDay
      },
      startTime: startTime,
      status: { $in: ['pending', 'confirmed'] }
    });
    
    if (existingAppointment) {
      return res.status(400).json({
        success: false,
        message: 'You already have an appointment at this time on this date'
      });
    }
    
    // Calculate end time (30 minutes after start)
    const [hours, minutes] = startTime.split(':').map(Number);
    const endMinutes = minutes + 30;
    const endHours = hours + Math.floor(endMinutes / 60);
    const finalMinutes = endMinutes % 60;
    const endTime = `${String(endHours).padStart(2, '0')}:${String(finalMinutes).padStart(2, '0')}`;
    
    // CREATE APPOINTMENT IN DATABASE
    const appointment = await Appointment.create({
      studentId: req.user._id,
      facultyId: facultyId,
      date: new Date(date),
      startTime: startTime,
      endTime: endTime,
      purpose: purpose.trim(),
      status: 'pending',
    });
    
    console.log('✅ Appointment created in database:', appointment._id);
    
    // Populate the appointment with user details
    const populatedAppointment = await Appointment.findById(appointment._id)
      .populate('studentId', 'name email studentId')
      .populate('facultyId', 'name email department');
    
    res.status(201).json({
      success: true,
      message: 'Appointment booked successfully',
      data: populatedAppointment
    });
    
  } catch (error) {
    console.error('❌ Book appointment error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to book appointment'
    });
  }
};

// @desc    Get student's appointments
// @route   GET /api/appointments/student
// @access  Private (Student)
const getStudentAppointments = async (req, res) => {
  try {
    console.log('📋 Fetching appointments for student:', req.user._id);
    
    // GET APPOINTMENTS FROM DATABASE
    const appointments = await Appointment.find({ studentId: req.user._id })
      .populate('facultyId', 'name email department designation')
      .sort({ date: -1, startTime: 1 });
    
    console.log(`✅ Found ${appointments.length} appointments in database`);
    res.json({ success: true, data: appointments });
    
  } catch (error) {
    console.error('❌ Get student appointments error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch appointments'
    });
  }
};

// @desc    Get faculty's appointments
// @route   GET /api/appointments/faculty
// @access  Private (Faculty)
const getFacultyAppointments = async (req, res) => {
  try {
    console.log('📋 Fetching appointments for faculty:', req.user._id);
    
    const appointments = await Appointment.find({ facultyId: req.user._id })
      .populate('studentId', 'name email studentId')
      .sort({ date: -1, startTime: 1 });
    
    console.log(`✅ Found ${appointments.length} appointments`);
    res.json({ success: true, data: appointments });
    
  } catch (error) {
    console.error('❌ Get faculty appointments error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch appointments'
    });
  }
};

// @desc    Get all appointments (Admin)
// @route   GET /api/appointments/all
// @access  Private (Admin)
const getAllAppointments = async (req, res) => {
  try {
    const appointments = await Appointment.find()
      .populate('studentId', 'name email studentId')
      .populate('facultyId', 'name email department')
      .sort({ date: -1, startTime: 1 });
    
    res.json({ success: true, data: appointments });
  } catch (error) {
    console.error('❌ Get all appointments error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch appointments'
    });
  }
};

// @desc    Get appointment by ID
// @route   GET /api/appointments/:id
// @access  Private
const getAppointmentById = async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id)
      .populate('studentId', 'name email studentId')
      .populate('facultyId', 'name email department');
    
    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found'
      });
    }
    
    // Check if user is authorized to view this appointment
    if (req.user.role !== 'admin' &&
        req.user._id.toString() !== appointment.studentId._id.toString() &&
        req.user._id.toString() !== appointment.facultyId._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this appointment'
      });
    }
    
    res.json({ success: true, data: appointment });
  } catch (error) {
    console.error('❌ Get appointment error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch appointment'
    });
  }
};

// @desc    Update appointment status
// @route   PUT /api/appointments/:id/status
// @access  Private (Faculty/Admin)
const updateAppointmentStatus = async (req, res) => {
  try {
    const { status } = req.body;
    
    if (!status || !['pending', 'confirmed', 'cancelled', 'completed'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status value. Allowed values: pending, confirmed, cancelled, completed'
      });
    }
    
    const appointment = await Appointment.findById(req.params.id);
    
    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found'
      });
    }
    
    // Check if user is authorized
    if (req.user.role !== 'admin' &&
        req.user._id.toString() !== appointment.facultyId.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this appointment'
      });
    }
    
    appointment.status = status;
    await appointment.save();
    
    const updatedAppointment = await Appointment.findById(req.params.id)
      .populate('studentId', 'name email studentId')
      .populate('facultyId', 'name email department');
    
    res.json({
      success: true,
      message: `Appointment ${status} successfully`,
      data: updatedAppointment
    });
  } catch (error) {
    console.error('❌ Update appointment status error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to update appointment status'
    });
  }
};

// @desc    Cancel appointment
// @route   PUT /api/appointments/:id/cancel
// @access  Private
const cancelAppointment = async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id);
    
    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found'
      });
    }
    
    // Check if user is authorized to cancel
    if (req.user.role !== 'admin' &&
        req.user._id.toString() !== appointment.studentId.toString() &&
        req.user._id.toString() !== appointment.facultyId.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to cancel this appointment'
      });
    }
    
    // Check if appointment is already completed or cancelled
    if (appointment.status === 'completed') {
      return res.status(400).json({
        success: false,
        message: 'Cannot cancel a completed appointment'
      });
    }
    
    if (appointment.status === 'cancelled') {
      return res.status(400).json({
        success: false,
        message: 'Appointment is already cancelled'
      });
    }
    
    appointment.status = 'cancelled';
    await appointment.save();
    
    res.json({
      success: true,
      message: 'Appointment cancelled successfully',
      data: appointment
    });
  } catch (error) {
    console.error('❌ Cancel appointment error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to cancel appointment'
    });
  }
};

// @desc    Get appointments by date range
// @route   GET /api/appointments/range
// @access  Private
const getAppointmentsByDateRange = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    if (!startDate || !endDate) {
      return res.status(400).json({
        success: false,
        message: 'Start date and end date are required'
      });
    }
    
    const query = {
      date: {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      }
    };
    
    // If user is student, only show their appointments
    if (req.user.role === 'student') {
      query.studentId = req.user._id;
    }
    // If user is faculty, only show their appointments
    else if (req.user.role === 'faculty') {
      query.facultyId = req.user._id;
    }
    
    const appointments = await Appointment.find(query)
      .populate('studentId', 'name email studentId')
      .populate('facultyId', 'name email department')
      .sort({ date: 1, startTime: 1 });
    
    res.json({ success: true, data: appointments });
  } catch (error) {
    console.error('❌ Get appointments by range error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch appointments'
    });
  }
};

// @desc    Get upcoming appointments
// @route   GET /api/appointments/upcoming
// @access  Private
const getUpcomingAppointments = async (req, res) => {
  try {
    const now = new Date();
    
    const query = {
      date: { $gte: now },
      status: { $in: ['pending', 'confirmed'] }
    };
    
    // If user is student, only show their appointments
    if (req.user.role === 'student') {
      query.studentId = req.user._id;
    }
    // If user is faculty, only show their appointments
    else if (req.user.role === 'faculty') {
      query.facultyId = req.user._id;
    }
    
    const appointments = await Appointment.find(query)
      .populate('studentId', 'name email studentId')
      .populate('facultyId', 'name email department')
      .sort({ date: 1, startTime: 1 })
      .limit(10);
    
    res.json({ success: true, data: appointments });
  } catch (error) {
    console.error('❌ Get upcoming appointments error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch upcoming appointments'
    });
  }
};

module.exports = {
  bookAppointment,
  getStudentAppointments,
  getFacultyAppointments,
  getAllAppointments,
  getAppointmentById,
  updateAppointmentStatus,
  cancelAppointment,
  getAppointmentsByDateRange,
  getUpcomingAppointments,
};