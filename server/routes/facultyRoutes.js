const express = require('express');
const router = express.Router();
const { protect, faculty } = require('../middleware/auth');
const Schedule = require('../models/Schedule');
const User = require('../models/User');
const Appointment = require('../models/Appointment');

// ==================== PUBLIC ROUTES ====================

// @desc    Get all faculties
// @route   GET /api/faculty/all
// @access  Public
router.get('/all', async (req, res) => {
  try {
    const faculties = await User.find({ role: 'faculty' })
      .select('-password')
      .sort({ name: 1 });
    
    if (!faculties || faculties.length === 0) {
      return res.status(404).json({ success: false, message: 'No faculties found' });
    }
    
    res.json({ success: true, data: faculties });
  } catch (error) {
    console.error('Get faculties error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// @desc    Search faculties
// @route   GET /api/faculty/search
// @access  Public
router.get('/search', async (req, res) => {
  try {
    const { query } = req.query;
    
    if (!query) {
      return res.status(400).json({ success: false, message: 'Search query is required' });
    }
    
    const faculties = await User.find({
      role: 'faculty',
      $or: [
        { name: { $regex: query, $options: 'i' } },
        { department: { $regex: query, $options: 'i' } },
        { email: { $regex: query, $options: 'i' } },
      ]
    }).select('-password');
    
    res.json({ success: true, data: faculties });
  } catch (error) {
    console.error('Search faculties error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// @desc    Get faculties by department
// @route   GET /api/faculty/department/:department
// @access  Public
router.get('/department/:department', async (req, res) => {
  try {
    const { department } = req.params;
    
    const faculties = await User.find({
      role: 'faculty',
      department: { $regex: department, $options: 'i' }
    }).select('-password');
    
    if (!faculties || faculties.length === 0) {
      return res.status(404).json({
        success: false,
        message: `No faculties found in ${department} department`
      });
    }
    
    res.json({ success: true, data: faculties });
  } catch (error) {
    console.error('Get by department error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// ==================== IMPORTANT: SPECIFIC ROUTES FIRST ====================
// These must come BEFORE the /:id route to avoid conflicts

// @desc    Get faculty's own schedule
// @route   GET /api/faculty/my-schedule
// @access  Private (Faculty only)
router.get('/my-schedule', protect, faculty, async (req, res) => {
  try {
    console.log(`📋 Fetching schedule for faculty: ${req.user.name} (${req.user._id})`);
    
    const schedule = await Schedule.find({ facultyId: req.user._id })
      .sort({ date: -1, startTime: 1 });
    
    console.log(`✅ Found ${schedule.length} schedule slots`);
    res.json({ success: true, data: schedule });
  } catch (error) {
    console.error('❌ Get my schedule error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// @desc    Get upcoming slots (faculty's own)
// @route   GET /api/faculty/upcoming-slots
// @access  Private (Faculty only)
router.get('/upcoming-slots', protect, faculty, async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const slots = await Schedule.find({
      facultyId: req.user._id,
      date: { $gte: today },
      isAvailable: true,
    }).sort({ date: 1, startTime: 1 })
      .limit(20);
    
    res.json({ success: true, data: slots });
  } catch (error) {
    console.error('❌ Get upcoming slots error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// @desc    Get slots by date range (faculty's own)
// @route   GET /api/faculty/my-schedule/range
// @access  Private (Faculty only)
router.get('/my-schedule/range', protect, faculty, async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    if (!startDate || !endDate) {
      return res.status(400).json({
        success: false,
        message: 'Start date and end date are required'
      });
    }
    
    const start = new Date(startDate);
    start.setHours(0, 0, 0, 0);
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999);
    
    const schedule = await Schedule.find({
      facultyId: req.user._id,
      date: { $gte: start, $lte: end },
    }).sort({ date: 1, startTime: 1 });
    
    res.json({ success: true, data: schedule });
  } catch (error) {
    console.error('❌ Get schedule range error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// @desc    Add schedule slot (date-specific)
// @route   POST /api/faculty/schedule
// @access  Private (Faculty only)
router.post('/schedule', protect, faculty, async (req, res) => {
  try {
    const { date, startTime, endTime } = req.body;
    
    console.log(`📝 Adding schedule slot for faculty ${req.user.name}:`, { date, startTime, endTime });
    
    // Validate required fields
    if (!date || !startTime || !endTime) {
      return res.status(400).json({ 
        success: false,
        message: 'Please provide date, startTime, and endTime' 
      });
    }
    
    // Validate time format (HH:MM)
    const timeRegex = /^([0-1][0-9]|2[0-3]):[0-5][0-9]$/;
    if (!timeRegex.test(startTime) || !timeRegex.test(endTime)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid time format. Please use HH:MM format (e.g., 09:00, 14:30)'
      });
    }
    
    // Convert to minutes for comparison
    const [startHour, startMinute] = startTime.split(':').map(Number);
    const [endHour, endMinute] = endTime.split(':').map(Number);
    
    // Validate hour range (0-23)
    if (startHour < 0 || startHour > 23 || endHour < 0 || endHour > 23) {
      return res.status(400).json({
        success: false,
        message: 'Hours must be between 00 and 23'
      });
    }
    
    // Validate minute range (0-59)
    if (startMinute < 0 || startMinute > 59 || endMinute < 0 || endMinute > 59) {
      return res.status(400).json({
        success: false,
        message: 'Minutes must be between 00 and 59'
      });
    }
    
    const startMinutes = startHour * 60 + startMinute;
    const endMinutes = endHour * 60 + endMinute;
    
    // Check if end time is after start time
    if (startMinutes >= endMinutes) {
      return res.status(400).json({
        success: false,
        message: 'End time must be after start time'
      });
    }
    
    // Check minimum duration (30 minutes)
    const durationMinutes = endMinutes - startMinutes;
    if (durationMinutes < 30) {
      return res.status(400).json({
        success: false,
        message: 'Slot duration must be at least 30 minutes'
      });
    }
    
    // Check maximum duration (4 hours)
    if (durationMinutes > 240) {
      return res.status(400).json({
        success: false,
        message: 'Slot duration cannot exceed 4 hours'
      });
    }
    
    // Parse date
    const slotDate = new Date(date);
    if (isNaN(slotDate.getTime())) {
      return res.status(400).json({
        success: false,
        message: 'Invalid date format'
      });
    }
    
    // Check if date is in the past (allow today)
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const selectedDate = new Date(slotDate);
    selectedDate.setHours(0, 0, 0, 0);
    
    if (selectedDate < today) {
      return res.status(400).json({
        success: false,
        message: 'Cannot create slots for past dates'
      });
    }
    
    // Check for duplicate slot on same date and time
    const startOfDay = new Date(slotDate);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(slotDate);
    endOfDay.setHours(23, 59, 59, 999);
    
    const existingSlot = await Schedule.findOne({
      facultyId: req.user._id,
      date: { $gte: startOfDay, $lte: endOfDay },
      startTime: startTime,
    });
    
    if (existingSlot) {
      return res.status(400).json({
        success: false,
        message: 'You already have a slot at this date and time'
      });
    }
    
    // Check for overlapping slots on the same date
    const overlappingSlot = await Schedule.findOne({
      facultyId: req.user._id,
      date: { $gte: startOfDay, $lte: endOfDay },
      $or: [
        {
          startTime: { $lt: endTime },
          endTime: { $gt: startTime }
        }
      ]
    });
    
    if (overlappingSlot) {
      return res.status(400).json({
        success: false,
        message: `This slot overlaps with an existing slot (${overlappingSlot.startTime} - ${overlappingSlot.endTime})`
      });
    }
    
    // Create new slot
    const slot = new Schedule({
      facultyId: req.user._id,
      date: slotDate,
      startTime,
      endTime,
      isAvailable: true,
    });
    
    await slot.save();
    console.log(`✅ Slot saved successfully with ID: ${slot._id}`);
    
    // Return the saved slot
    res.status(201).json({
      success: true,
      message: 'Schedule slot added successfully',
      data: slot,
    });
  } catch (error) {
    console.error('❌ Add schedule error:', error);
    
    // Handle duplicate key error specifically
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'You already have a slot at this date and time. Please check your schedule.'
      });
    }
    
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to add schedule slot'
    });
  }
});

// @desc    Update schedule slot
// @route   PUT /api/faculty/schedule/:id
// @access  Private (Faculty only)
router.put('/schedule/:id', protect, faculty, async (req, res) => {
  try {
    const { date, startTime, endTime, isAvailable } = req.body;
    const slot = await Schedule.findById(req.params.id);
    
    if (!slot) {
      return res.status(404).json({ success: false, message: 'Slot not found' });
    }
    
    // Check ownership
    if (slot.facultyId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized to update this slot' });
    }
    
    // Validate time if provided
    if (startTime && endTime) {
      const timeRegex = /^([0-1][0-9]|2[0-3]):[0-5][0-9]$/;
      if (!timeRegex.test(startTime) || !timeRegex.test(endTime)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid time format. Please use HH:MM format'
        });
      }
      
      const [startHour, startMinute] = startTime.split(':').map(Number);
      const [endHour, endMinute] = endTime.split(':').map(Number);
      
      const startMinutes = startHour * 60 + startMinute;
      const endMinutes = endHour * 60 + endMinute;
      
      if (startMinutes >= endMinutes) {
        return res.status(400).json({
          success: false,
          message: 'End time must be after start time'
        });
      }
      
      if (endMinutes - startMinutes < 30) {
        return res.status(400).json({
          success: false,
          message: 'Slot duration must be at least 30 minutes'
        });
      }
    }
    
    // Update fields
    if (date) {
      const newDate = new Date(date);
      if (isNaN(newDate.getTime())) {
        return res.status(400).json({ success: false, message: 'Invalid date format' });
      }
      slot.date = newDate;
    }
    if (startTime) slot.startTime = startTime;
    if (endTime) slot.endTime = endTime;
    if (isAvailable !== undefined) slot.isAvailable = isAvailable;
    slot.updatedAt = Date.now();
    
    await slot.save();
    
    console.log(`✅ Slot updated successfully: ${slot._id}`);
    
    res.json({
      success: true,
      message: 'Schedule slot updated successfully',
      data: slot,
    });
  } catch (error) {
    console.error('❌ Update schedule error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// @desc    Delete schedule slot
// @route   DELETE /api/faculty/schedule/:id
// @access  Private (Faculty only)
router.delete('/schedule/:id', protect, faculty, async (req, res) => {
  try {
    const slot = await Schedule.findById(req.params.id);
    
    if (!slot) {
      return res.status(404).json({ success: false, message: 'Slot not found' });
    }
    
    // Check ownership
    if (slot.facultyId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized to delete this slot' });
    }
    
    // Check if there are any pending/confirmed appointments for this slot
    const startOfDay = new Date(slot.date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(slot.date);
    endOfDay.setHours(23, 59, 59, 999);
    
    const existingAppointments = await Appointment.find({
      facultyId: req.user._id,
      date: { $gte: startOfDay, $lte: endOfDay },
      startTime: slot.startTime,
      status: { $in: ['pending', 'confirmed'] },
    });
    
    if (existingAppointments.length > 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete this slot. It has ${existingAppointments.length} active appointment(s).`
      });
    }
    
    await slot.deleteOne();
    console.log(`🗑️ Slot deleted successfully: ${req.params.id}`);
    
    res.json({
      success: true,
      message: 'Schedule slot deleted successfully',
    });
  } catch (error) {
    console.error('❌ Delete schedule error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// @desc    Toggle slot availability
// @route   PUT /api/faculty/schedule/:id/toggle
// @access  Private (Faculty only)
router.put('/schedule/:id/toggle', protect, faculty, async (req, res) => {
  try {
    const slot = await Schedule.findById(req.params.id);
    
    if (!slot) {
      return res.status(404).json({ success: false, message: 'Slot not found' });
    }
    
    // Check ownership
    if (slot.facultyId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized to update this slot' });
    }
    
    // Check if there are any pending/confirmed appointments for this slot
    const startOfDay = new Date(slot.date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(slot.date);
    endOfDay.setHours(23, 59, 59, 999);
    
    const existingAppointments = await Appointment.find({
      facultyId: req.user._id,
      date: { $gte: startOfDay, $lte: endOfDay },
      startTime: slot.startTime,
      status: { $in: ['pending', 'confirmed'] },
    });
    
    // If trying to make unavailable, check for appointments
    if (slot.isAvailable && existingAppointments.length > 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot make this slot unavailable. It has ${existingAppointments.length} active appointment(s).`
      });
    }
    
    // Toggle availability
    slot.isAvailable = !slot.isAvailable;
    slot.updatedAt = Date.now();
    await slot.save();
    
    console.log(`🔄 Slot ${slot._id} toggled to ${slot.isAvailable ? 'available' : 'unavailable'}`);
    
    res.json({
      success: true,
      message: `Slot ${slot.isAvailable ? 'available' : 'unavailable'} successfully`,
      data: slot,
    });
  } catch (error) {
    console.error('❌ Toggle schedule error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// ==================== IMPORTANT: DYNAMIC ROUTES LAST ====================
// These must come AFTER all specific routes

// @desc    Get faculty schedule for a specific date or date range
// @route   GET /api/faculty/:id/schedule
// @access  Public
router.get('/:id/schedule', async (req, res) => {
  try {
    const facultyId = req.params.id;
    const { startDate, endDate } = req.query;
    
    let query = { facultyId };
    
    if (startDate && endDate) {
      query.date = {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      };
    } else if (startDate) {
      const start = new Date(startDate);
      const end = new Date(startDate);
      end.setHours(23, 59, 59, 999);
      query.date = { $gte: start, $lte: end };
    }
    
    const schedule = await Schedule.find(query)
      .sort({ date: 1, startTime: 1 });
    
    res.json({ success: true, data: schedule });
  } catch (error) {
    console.error('Get schedule error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// @desc    Get available slots for a specific date
// @route   GET /api/faculty/:id/slots
// @access  Public
router.get('/:id/slots', async (req, res) => {
  try {
    const facultyId = req.params.id;
    const { date } = req.query;
    
    if (!date) {
      return res.status(400).json({ success: false, message: 'Date is required' });
    }
    
    const selectedDate = new Date(date);
    const startOfDay = new Date(selectedDate);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(selectedDate);
    endOfDay.setHours(23, 59, 59, 999);
    
    // Get all slots for this faculty on this specific date
    const slots = await Schedule.find({
      facultyId,
      date: { $gte: startOfDay, $lte: endOfDay },
      isAvailable: true,
    }).sort({ startTime: 1 });
    
    // Get booked appointments for this date
    const bookedAppointments = await Appointment.find({
      facultyId,
      date: { $gte: startOfDay, $lte: endOfDay },
      status: { $in: ['pending', 'confirmed'] },
    });
    
    // Filter out slots that are already booked
    const bookedTimes = bookedAppointments.map(a => a.startTime);
    const availableSlots = slots.filter(slot => !bookedTimes.includes(slot.startTime));
    
    res.json({ success: true, data: availableSlots });
  } catch (error) {
    console.error('Get slots error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// @desc    Check if faculty is available on a specific date
// @route   GET /api/faculty/:id/availability
// @access  Public
router.get('/:id/availability', async (req, res) => {
  try {
    const facultyId = req.params.id;
    const { date } = req.query;
    
    if (!date) {
      return res.status(400).json({ success: false, message: 'Date is required' });
    }
    
    const selectedDate = new Date(date);
    const startOfDay = new Date(selectedDate);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(selectedDate);
    endOfDay.setHours(23, 59, 59, 999);
    
    const slots = await Schedule.find({
      facultyId,
      date: { $gte: startOfDay, $lte: endOfDay },
      isAvailable: true,
    });
    
    // Get booked appointments
    const bookedAppointments = await Appointment.find({
      facultyId,
      date: { $gte: startOfDay, $lte: endOfDay },
      status: { $in: ['pending', 'confirmed'] },
    });
    
    const bookedTimes = bookedAppointments.map(a => a.startTime);
    const availableSlots = slots.filter(slot => !bookedTimes.includes(slot.startTime));
    
    res.json({
      success: true,
      data: {
        isAvailable: availableSlots.length > 0,
        availableSlots: availableSlots,
        totalSlots: slots.length,
        bookedCount: bookedAppointments.length,
      }
    });
  } catch (error) {
    console.error('Check availability error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// @desc    Get faculty by ID
// @route   GET /api/faculty/:id
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const faculty = await User.findById(req.params.id).select('-password');
    
    if (!faculty) {
      return res.status(404).json({ success: false, message: 'Faculty not found' });
    }
    
    if (faculty.role !== 'faculty') {
      return res.status(400).json({ success: false, message: 'User is not a faculty member' });
    }
    
    res.json({ success: true, data: faculty });
  } catch (error) {
    console.error('Get faculty error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// ==================== BULK ROUTE ====================

// @desc    Bulk add schedule slots
// @route   POST /api/faculty/schedule/bulk
// @access  Private (Faculty only)
router.post('/schedule/bulk', protect, faculty, async (req, res) => {
  try {
    const { slots } = req.body;
    
    if (!slots || !Array.isArray(slots) || slots.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Please provide an array of slots'
      });
    }
    
    const createdSlots = [];
    const errors = [];
    
    for (const slotData of slots) {
      try {
        const { date, startTime, endTime } = slotData;
        
        // Validate required fields
        if (!date || !startTime || !endTime) {
          errors.push({ slot: slotData, error: 'Missing required fields' });
          continue;
        }
        
        // Validate time format
        const timeRegex = /^([0-1][0-9]|2[0-3]):[0-5][0-9]$/;
        if (!timeRegex.test(startTime) || !timeRegex.test(endTime)) {
          errors.push({ slot: slotData, error: 'Invalid time format' });
          continue;
        }
        
        // Convert to minutes for comparison
        const [startHour, startMinute] = startTime.split(':').map(Number);
        const [endHour, endMinute] = endTime.split(':').map(Number);
        const startMinutes = startHour * 60 + startMinute;
        const endMinutes = endHour * 60 + endMinute;
        
        if (startMinutes >= endMinutes) {
          errors.push({ slot: slotData, error: 'End time must be after start time' });
          continue;
        }
        
        if (endMinutes - startMinutes < 30) {
          errors.push({ slot: slotData, error: 'Slot duration must be at least 30 minutes' });
          continue;
        }
        
        // Parse date
        const slotDate = new Date(date);
        if (isNaN(slotDate.getTime())) {
          errors.push({ slot: slotData, error: 'Invalid date format' });
          continue;
        }
        
        // Create slot
        const slot = await Schedule.create({
          facultyId: req.user._id,
          date: slotDate,
          startTime,
          endTime,
          isAvailable: true,
        });
        
        createdSlots.push(slot);
      } catch (error) {
        errors.push({ slot: slotData, error: error.message });
      }
    }
    
    console.log(`✅ Bulk added ${createdSlots.length} slots, ${errors.length} errors`);
    
    res.status(201).json({
      success: true,
      message: `Added ${createdSlots.length} slots successfully`,
      data: {
        created: createdSlots,
        errors: errors,
        total: slots.length,
        successCount: createdSlots.length,
        errorCount: errors.length,
      }
    });
  } catch (error) {
    console.error('❌ Bulk add schedule error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;