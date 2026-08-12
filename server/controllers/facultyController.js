const User = require('../models/User');
const Appointment = require('../models/Appointment');

// @desc    Get all faculties
// @route   GET /api/faculty/all
// @access  Public
const getAllFaculties = async (req, res) => {
  try {
    const faculties = await User.find({ role: 'faculty' })
      .select('-password')
      .sort({ name: 1 });
    
    if (!faculties || faculties.length === 0) {
      return res.status(404).json({ message: 'No faculties found' });
    }
    
    res.json(faculties);
  } catch (error) {
    console.error('Get faculties error:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get faculty by ID
// @route   GET /api/faculty/:id
// @access  Public
const getFacultyById = async (req, res) => {
  try {
    const faculty = await User.findById(req.params.id)
      .select('-password');
    
    if (!faculty) {
      return res.status(404).json({ message: 'Faculty not found' });
    }
    
    if (faculty.role !== 'faculty') {
      return res.status(400).json({ message: 'User is not a faculty member' });
    }
    
    res.json(faculty);
  } catch (error) {
    console.error('Get faculty error:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get faculty schedule
// @route   GET /api/faculty/:id/schedule
// @access  Public
const getFacultySchedule = async (req, res) => {
  try {
    // Mock schedule data - in real app, this would come from a Schedule model
    const schedule = [
      { 
        day: 'Monday', 
        slots: [
          { startTime: '09:00', endTime: '10:00', isAvailable: true },
          { startTime: '10:00', endTime: '11:00', isAvailable: true },
          { startTime: '11:00', endTime: '12:00', isAvailable: false },
        ]
      },
      { 
        day: 'Tuesday', 
        slots: [
          { startTime: '09:00', endTime: '10:00', isAvailable: true },
          { startTime: '14:00', endTime: '15:00', isAvailable: true },
          { startTime: '15:00', endTime: '16:00', isAvailable: true },
        ]
      },
      { 
        day: 'Wednesday', 
        slots: [
          { startTime: '10:00', endTime: '11:00', isAvailable: true },
          { startTime: '11:00', endTime: '12:00', isAvailable: false },
        ]
      },
    ];
    
    res.json(schedule);
  } catch (error) {
    console.error('Get schedule error:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get available slots for a specific date
// @route   GET /api/faculty/:id/slots
// @access  Public
const getAvailableSlots = async (req, res) => {
  try {
    const { date } = req.query;
    const facultyId = req.params.id;
    
    // Validate date
    if (!date) {
      return res.status(400).json({ message: 'Date is required' });
    }
    
    // Mock available slots based on day of week
    const selectedDate = new Date(date);
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const dayName = dayNames[selectedDate.getDay()];
    
    // Mock available time slots
    let availableSlots = [];
    
    if (dayName === 'Monday') {
      availableSlots = [
        { startTime: '09:00', endTime: '10:00' },
        { startTime: '10:00', endTime: '11:00' },
        { startTime: '11:00', endTime: '12:00' },
      ];
    } else if (dayName === 'Tuesday') {
      availableSlots = [
        { startTime: '09:00', endTime: '10:00' },
        { startTime: '14:00', endTime: '15:00' },
        { startTime: '15:00', endTime: '16:00' },
      ];
    } else if (dayName === 'Wednesday') {
      availableSlots = [
        { startTime: '10:00', endTime: '11:00' },
        { startTime: '11:00', endTime: '12:00' },
      ];
    } else {
      availableSlots = [];
    }
    
    // In real app, you would check for existing appointments and filter them out
    
    res.json(availableSlots);
  } catch (error) {
    console.error('Get slots error:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Search faculties
// @route   GET /api/faculty/search
// @access  Public
const searchFaculties = async (req, res) => {
  try {
    const { query } = req.query;
    
    if (!query) {
      return res.status(400).json({ message: 'Search query is required' });
    }
    
    const faculties = await User.find({
      role: 'faculty',
      $or: [
        { name: { $regex: query, $options: 'i' } },
        { department: { $regex: query, $options: 'i' } },
        { email: { $regex: query, $options: 'i' } },
      ]
    }).select('-password');
    
    res.json(faculties);
  } catch (error) {
    console.error('Search faculties error:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get faculties by department
// @route   GET /api/faculty/department/:department
// @access  Public
const getFacultiesByDepartment = async (req, res) => {
  try {
    const { department } = req.params;
    
    const faculties = await User.find({
      role: 'faculty',
      department: { $regex: department, $options: 'i' }
    }).select('-password');
    
    if (!faculties || faculties.length === 0) {
      return res.status(404).json({ 
        message: `No faculties found in ${department} department` 
      });
    }
    
    res.json(faculties);
  } catch (error) {
    console.error('Get by department error:', error);
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getAllFaculties,
  getFacultyById,
  getFacultySchedule,
  getAvailableSlots,
  searchFaculties,
  getFacultiesByDepartment,
};