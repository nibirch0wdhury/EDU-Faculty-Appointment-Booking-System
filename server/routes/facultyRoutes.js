const express = require('express');
const router = express.Router();
const { protect, faculty } = require('../middleware/auth');
const Schedule = require('../models/Schedule');
const User = require('../models/User');
const Appointment = require('../models/Appointment');

// ============================================
// UTILITY: Check if date is in the past
// ============================================
const isPastDate = (date) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const checkDate = new Date(date);
  checkDate.setHours(0, 0, 0, 0);
  return checkDate < today;
};

// ============================================
// UTILITY: Check if time is in the past for today
// ============================================
const isPastTimeForToday = (date, startTime) => {
  const today = new Date();
  const slotDate = new Date(date);
  
  const isToday = slotDate.getDate() === today.getDate() &&
                  slotDate.getMonth() === today.getMonth() &&
                  slotDate.getFullYear() === today.getFullYear();
  
  if (!isToday) return false;
  
  const [hours, minutes] = startTime.split(':').map(Number);
  const slotStartTime = new Date(today);
  slotStartTime.setHours(hours, minutes, 0, 0);
  
  return slotStartTime < today;
};

// ============================================
// UTILITY: Parse a YYYY-MM-DD string as a local date
// ============================================
const parseLocalDateString = (dateStr) => {
  if (!dateStr || typeof dateStr !== 'string') return null;
  const parts = dateStr.split('T')[0].split('-').map(Number);
  if (parts.length !== 3 || parts.some(p => isNaN(p))) return null;
  const d = new Date(parts[0], parts[1] - 1, parts[2], 12, 0, 0, 0);
  return isNaN(d.getTime()) ? null : d;
};

// ==================== PUBLIC ROUTES ====================

/**
 * @swagger
 * /faculty/all:
 *   get:
 *     summary: Get all faculty members
 *     tags: [Faculty]
 *     responses:
 *       200:
 *         description: List of faculty members
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/User'
 *       404:
 *         description: No faculties found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
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

/**
 * @swagger
 * /faculty/search:
 *   get:
 *     summary: Search faculties
 *     tags: [Faculty]
 *     parameters:
 *       - in: query
 *         name: query
 *         required: true
 *         schema:
 *           type: string
 *         description: Search term (name, department, email)
 *     responses:
 *       200:
 *         description: Search results
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/User'
 *       400:
 *         description: Missing search query
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
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

/**
 * @swagger
 * /faculty/department/{department}:
 *   get:
 *     summary: Get faculties by department
 *     tags: [Faculty]
 *     parameters:
 *       - in: path
 *         name: department
 *         required: true
 *         schema:
 *           type: string
 *         description: Department name
 *     responses:
 *       200:
 *         description: List of faculties in department
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/User'
 *       404:
 *         description: No faculties found in department
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
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

// ==================== SPECIFIC ROUTES FIRST ====================

/**
 * @swagger
 * /faculty/my-schedule:
 *   get:
 *     summary: Get faculty's own schedule
 *     tags: [Faculty]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of schedule slots
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Schedule'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
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

/**
 * @swagger
 * /faculty/upcoming-slots:
 *   get:
 *     summary: Get faculty's upcoming slots
 *     tags: [Faculty]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of upcoming slots
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Schedule'
 */
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

/**
 * @swagger
 * /faculty/my-schedule/range:
 *   get:
 *     summary: Get slots by date range
 *     tags: [Faculty]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: startDate
 *         required: true
 *         schema:
 *           type: string
 *           format: date
 *         description: Start date (YYYY-MM-DD)
 *       - in: query
 *         name: endDate
 *         required: true
 *         schema:
 *           type: string
 *           format: date
 *         description: End date (YYYY-MM-DD)
 *     responses:
 *       200:
 *         description: List of slots in date range
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Schedule'
 *       400:
 *         description: Missing date parameters
 */
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

// ============================================
// ADD SCHEDULE SLOT WITH PAST DATE & TIME CHECK
// ============================================

/**
 * @swagger
 * /faculty/schedule:
 *   post:
 *     summary: Add a schedule slot
 *     tags: [Faculty]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - date
 *               - startTime
 *               - endTime
 *             properties:
 *               date:
 *                 type: string
 *                 format: date
 *                 example: "2024-01-15"
 *               startTime:
 *                 type: string
 *                 example: "09:00"
 *               endTime:
 *                 type: string
 *                 example: "10:00"
 *     responses:
 *       201:
 *         description: Slot added successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Schedule slot added successfully
 *                 data:
 *                   $ref: '#/components/schemas/Schedule'
 *       400:
 *         description: Validation error (past date, invalid time, duplicate, overlap)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Faculty only
 */
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
    
    // CHECK 1: Date must not be in the past
    const slotDate = parseLocalDateString(date);
    if (!slotDate) {
      return res.status(400).json({
        success: false,
        message: 'Invalid date format'
      });
    }
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const selectedDate = new Date(slotDate);
    selectedDate.setHours(0, 0, 0, 0);
    
    if (selectedDate < today) {
      console.warn(`⚠️ Blocked: Attempted to create slot on past date ${date}`);
      return res.status(400).json({
        success: false,
        message: '❌ Cannot create slots for past dates. Please select today or a future date.'
      });
    }
    
    // CHECK 2: If date is today, time must be in the future
    if (isPastTimeForToday(date, startTime)) {
      const currentTime = new Date();
      const currentTimeStr = currentTime.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      });
      
      console.warn(`⚠️ Blocked: Attempted to create slot at ${startTime} which is in the past`);
      return res.status(400).json({
        success: false,
        message: `❌ Cannot create slots for times that have already passed today. Current time is ${currentTimeStr}. Please select a future time.`
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
    
    res.status(201).json({
      success: true,
      message: 'Schedule slot added successfully',
      data: slot,
    });
  } catch (error) {
    console.error('❌ Add schedule error:', error);
    
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

/**
 * @swagger
 * /faculty/schedule/{id}:
 *   put:
 *     summary: Update a schedule slot
 *     tags: [Faculty]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Schedule slot ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               date:
 *                 type: string
 *                 format: date
 *               startTime:
 *                 type: string
 *                 example: "09:00"
 *               endTime:
 *                 type: string
 *                 example: "10:00"
 *               isAvailable:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Slot updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *       400:
 *         description: Validation error
 *       403:
 *         description: Not authorized
 *       404:
 *         description: Slot not found
 */
router.put('/schedule/:id', protect, faculty, async (req, res) => {
  try {
    const { date, startTime, endTime, isAvailable } = req.body;
    const slot = await Schedule.findById(req.params.id);
    
    if (!slot) {
      return res.status(404).json({ success: false, message: 'Slot not found' });
    }
    
    if (slot.facultyId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized to update this slot' });
    }
    
    if (date) {
      const newDate = new Date(date);
      if (isNaN(newDate.getTime())) {
        return res.status(400).json({ success: false, message: 'Invalid date format' });
      }
      
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const selectedDate = new Date(date);
      selectedDate.setHours(0, 0, 0, 0);
      
      if (selectedDate < today) {
        return res.status(400).json({
          success: false,
          message: '❌ Cannot update to a past date. Please select today or a future date.'
        });
      }
      
      if (startTime && isPastTimeForToday(date, startTime)) {
        const currentTime = new Date();
        const currentTimeStr = currentTime.toLocaleTimeString('en-US', {
          hour: '2-digit',
          minute: '2-digit',
          hour12: true
        });
        return res.status(400).json({
          success: false,
          message: `❌ Cannot update to a time that has already passed today. Current time is ${currentTimeStr}.`
        });
      }
      
      slot.date = newDate;
    }
    
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
      
      if (startTime) slot.startTime = startTime;
      if (endTime) slot.endTime = endTime;
    }
    
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

/**
 * @swagger
 * /faculty/schedule/delete-day:
 *   post:
 *     summary: Bulk delete slots for a specific day of the week
 *     tags: [Faculty]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               dayOfWeek:
 *                 type: integer
 *                 minimum: 0
 *                 maximum: 6
 *                 description: 0=Sunday, 1=Monday, ..., 6=Saturday
 *                 example: 6
 *     responses:
 *       200:
 *         description: Slots deleted successfully
 *       400:
 *         description: Invalid day or all slots have active appointments
 *       404:
 *         description: No slots found
 */
router.post('/schedule/delete-day', protect, faculty, async (req, res) => {
  try {
    const { dayOfWeek } = req.body;
    const targetDay = Number(dayOfWeek);

    if (isNaN(targetDay) || targetDay < 0 || targetDay > 6) {
      return res.status(400).json({ success: false, message: 'Invalid day of week selection' });
    }

    const slots = await Schedule.find({ facultyId: req.user._id });
    
    const slotsToDelete = slots.filter(slot => {
      const d = new Date(slot.date);
      return d.getDay() === targetDay;
    });

    if (slotsToDelete.length === 0) {
      return res.status(404).json({ success: false, message: 'No schedule slots found for the selected day' });
    }

    const slotIdsToDelete = [];
    let skippedCount = 0;

    for (const slot of slotsToDelete) {
      const startOfDay = new Date(slot.date);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(slot.date);
      endOfDay.setHours(23, 59, 59, 999);

      const activeApps = await Appointment.find({
        facultyId: req.user._id,
        date: { $gte: startOfDay, $lte: endOfDay },
        startTime: slot.startTime,
        status: { $in: ['pending', 'confirmed'] },
      });

      if (activeApps.length === 0) {
        slotIdsToDelete.push(slot._id);
      } else {
        skippedCount++;
      }
    }

    if (slotIdsToDelete.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'All slots for this day have active student appointments and cannot be deleted.'
      });
    }

    await Schedule.deleteMany({ _id: { $in: slotIdsToDelete } });

    res.json({
      success: true,
      message: `Successfully deleted ${slotIdsToDelete.length} slots for this day! ${skippedCount > 0 ? `(${skippedCount} skipped due to active appointments)` : ''}`,
      data: { deletedCount: slotIdsToDelete.length, skippedCount }
    });
  } catch (error) {
    console.error('❌ Delete day schedule error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * @swagger
 * /faculty/schedule/delete-all:
 *   post:
 *     summary: Delete all schedule slots for the faculty
 *     tags: [Faculty]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: All slots deleted
 *       400:
 *         description: Cannot delete slots with active appointments
 *       404:
 *         description: No slots found
 */
router.post('/schedule/delete-all', protect, faculty, async (req, res) => {
  try {
    const slots = await Schedule.find({ facultyId: req.user._id });

    if (slots.length === 0) {
      return res.status(404).json({ success: false, message: 'No schedule slots found to delete' });
    }

    const slotIdsToDelete = [];
    let skippedCount = 0;

    for (const slot of slots) {
      const startOfDay = new Date(slot.date);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(slot.date);
      endOfDay.setHours(23, 59, 59, 999);

      const activeApps = await Appointment.find({
        facultyId: req.user._id,
        date: { $gte: startOfDay, $lte: endOfDay },
        startTime: slot.startTime,
        status: { $in: ['pending', 'confirmed'] },
      });

      if (activeApps.length === 0) {
        slotIdsToDelete.push(slot._id);
      } else {
        skippedCount++;
      }
    }

    if (slotIdsToDelete.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'All schedule slots have active student appointments and cannot be deleted.'
      });
    }

    await Schedule.deleteMany({ _id: { $in: slotIdsToDelete } });

    res.json({
      success: true,
      message: `Successfully cleared ${slotIdsToDelete.length} schedule slots! ${skippedCount > 0 ? `(${skippedCount} skipped due to active appointments)` : ''}`,
      data: { deletedCount: slotIdsToDelete.length, skippedCount }
    });
  } catch (error) {
    console.error('❌ Delete all schedule error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * @swagger
 * /faculty/schedule/{id}:
 *   delete:
 *     summary: Delete a specific schedule slot
 *     tags: [Faculty]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Schedule slot ID
 *     responses:
 *       200:
 *         description: Slot deleted successfully
 *       400:
 *         description: Cannot delete slot with active appointments
 *       403:
 *         description: Not authorized
 *       404:
 *         description: Slot not found
 */
router.delete('/schedule/:id', protect, faculty, async (req, res) => {
  try {
    const slot = await Schedule.findById(req.params.id);
    
    if (!slot) {
      return res.status(404).json({ success: false, message: 'Slot not found' });
    }
    
    const slotFacultyId = (slot.facultyId._id || slot.facultyId).toString();
    const userFacultyId = (req.user._id || req.user.id).toString();

    if (slotFacultyId !== userFacultyId) {
      return res.status(403).json({ success: false, message: 'Not authorized to delete this slot' });
    }
    
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
    
    await Schedule.findByIdAndDelete(req.params.id);
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

/**
 * @swagger
 * /faculty/schedule/{id}/toggle:
 *   put:
 *     summary: Toggle slot availability
 *     tags: [Faculty]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Schedule slot ID
 *     responses:
 *       200:
 *         description: Availability toggled successfully
 *       400:
 *         description: Cannot make slot unavailable with active appointments
 *       403:
 *         description: Not authorized
 *       404:
 *         description: Slot not found
 */
router.put('/schedule/:id/toggle', protect, faculty, async (req, res) => {
  try {
    const slot = await Schedule.findById(req.params.id);
    
    if (!slot) {
      return res.status(404).json({ success: false, message: 'Slot not found' });
    }
    
    const slotFacultyId = (slot.facultyId._id || slot.facultyId).toString();
    const userFacultyId = (req.user._id || req.user.id).toString();

    if (slotFacultyId !== userFacultyId) {
      return res.status(403).json({ success: false, message: 'Not authorized to update this slot' });
    }
    
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
    
    if (slot.isAvailable && existingAppointments.length > 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot make this slot unavailable. It has ${existingAppointments.length} active appointment(s).`
      });
    }
    
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

// ==================== RECURRING SCHEDULE ROUTE ====================

/**
 * @swagger
 * /faculty/schedule/recurring:
 *   post:
 *     summary: Add recurring schedule slots
 *     tags: [Faculty]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - daysOfWeek
 *               - startTime
 *               - endTime
 *             properties:
 *               daysOfWeek:
 *                 type: array
 *                 items:
 *                   type: integer
 *                   minimum: 0
 *                   maximum: 6
 *                 description: 0=Sunday, 1=Monday, ..., 6=Saturday
 *                 example: [1, 3, 5]
 *               startTime:
 *                 type: string
 *                 example: "09:00"
 *               endTime:
 *                 type: string
 *                 example: "10:00"
 *               months:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 12
 *                 description: Number of months to repeat (default 1)
 *                 example: 3
 *               startDate:
 *                 type: string
 *                 format: date
 *                 description: Start date for recurring slots (default today)
 *                 example: "2024-01-15"
 *     responses:
 *       201:
 *         description: Recurring slots created
 *       400:
 *         description: Validation error
 */
router.post('/schedule/recurring', protect, faculty, async (req, res) => {
  try {
    const { daysOfWeek, startTime, endTime, months, startDate } = req.body;

    if (!daysOfWeek || !Array.isArray(daysOfWeek) || daysOfWeek.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Please select at least one day of the week'
      });
    }

    if (!startTime || !endTime) {
      return res.status(400).json({
        success: false,
        message: 'Please provide startTime and endTime'
      });
    }

    const timeRegex = /^([0-1][0-9]|2[0-3]):[0-5][0-9]$/;
    if (!timeRegex.test(startTime) || !timeRegex.test(endTime)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid time format. Please use HH:MM'
      });
    }

    const [sh, sm] = startTime.split(':').map(Number);
    const [eh, em] = endTime.split(':').map(Number);
    const startMinutes = sh * 60 + sm;
    const endMinutes = eh * 60 + em;

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

    const durationMonths = Math.min(Math.max(parseInt(months, 10) || 1, 1), 12);
    
    const validDays = daysOfWeek.map(d => Number(d)).filter(d => !isNaN(d) && d >= 0 && d <= 6);
    if (validDays.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Invalid day of week selection'
      });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let start;
    if (startDate && typeof startDate === 'string') {
      const parts = startDate.split('T')[0].split('-').map(Number);
      if (parts.length === 3 && parts.every(p => !isNaN(p))) {
        start = new Date(parts[0], parts[1] - 1, parts[2]);
      } else {
        start = new Date();
      }
    } else {
      start = new Date();
    }
    start.setHours(0, 0, 0, 0);

    const end = new Date(start);
    end.setMonth(end.getMonth() + durationMonths);

    const createdSlots = [];
    const skippedSlots = [];

    const curr = new Date(start);
    while (curr <= end) {
      const dayIndex = curr.getDay();
      if (validDays.includes(dayIndex)) {
        const year = curr.getFullYear();
        const month = String(curr.getMonth() + 1).padStart(2, '0');
        const day = String(curr.getDate()).padStart(2, '0');
        const dateStr = `${year}-${month}-${day}`;
        const slotDate = new Date(year, curr.getMonth(), curr.getDate());
        slotDate.setHours(12, 0, 0, 0);

        if (slotDate < today) {
          skippedSlots.push({ date: dateStr, reason: 'Past date' });
        }
        else if (isPastTimeForToday(dateStr, startTime)) {
          skippedSlots.push({ date: dateStr, reason: 'Time passed today' });
        }
        else {
          const startOfDay = new Date(slotDate);
          startOfDay.setHours(0, 0, 0, 0);
          const endOfDay = new Date(slotDate);
          endOfDay.setHours(23, 59, 59, 999);

          const existingSlot = await Schedule.findOne({
            facultyId: req.user._id,
            date: { $gte: startOfDay, $lte: endOfDay },
            $or: [
              { startTime: startTime },
              {
                startTime: { $lt: endTime },
                endTime: { $gt: startTime }
              }
            ]
          });

          if (existingSlot) {
            skippedSlots.push({ date: dateStr, reason: 'Conflict / duplicate slot' });
          } else {
            const slot = new Schedule({
              facultyId: req.user._id,
              date: slotDate,
              startTime,
              endTime,
              isAvailable: true,
            });
            await slot.save();
            createdSlots.push(slot);
          }
        }
      }
      curr.setDate(curr.getDate() + 1);
    }

    console.log(`✅ Recurring schedule: Created ${createdSlots.length}, Skipped ${skippedSlots.length}`);

    res.status(201).json({
      success: true,
      message: `Successfully created ${createdSlots.length} recurring slots! (${skippedSlots.length} skipped due to duplicates/past dates)`,
      data: {
        created: createdSlots,
        createdCount: createdSlots.length,
        skippedCount: skippedSlots.length,
        totalEvaluated: createdSlots.length + skippedSlots.length
      }
    });

  } catch (error) {
    console.error('❌ Recurring schedule error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to create recurring slots'
    });
  }
});

// ==================== DYNAMIC ROUTES LAST ====================

/**
 * @swagger
 * /faculty/{id}/schedule:
 *   get:
 *     summary: Get faculty schedule for a date range
 *     tags: [Faculty]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Faculty ID
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Start date (YYYY-MM-DD)
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *         description: End date (YYYY-MM-DD)
 *     responses:
 *       200:
 *         description: Faculty schedule
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Schedule'
 */
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

// ============================================
// ✅ UPDATED: Get available slots with past time filtering
// ============================================

/**
 * @swagger
 * /faculty/{id}/slots:
 *   get:
 *     summary: Get available slots for a specific date
 *     tags: [Faculty]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Faculty ID
 *       - in: query
 *         name: date
 *         required: true
 *         schema:
 *           type: string
 *           format: date
 *         description: Date to check availability (YYYY-MM-DD)
 *     responses:
 *       200:
 *         description: Available slots
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       startTime:
 *                         type: string
 *                         example: "09:00"
 *                       endTime:
 *                         type: string
 *                         example: "10:00"
 *       400:
 *         description: Date is required
 */
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
    
    const slots = await Schedule.find({
      facultyId,
      date: { $gte: startOfDay, $lte: endOfDay },
      isAvailable: true,
    }).sort({ startTime: 1 });
    
    const bookedAppointments = await Appointment.find({
      facultyId,
      date: { $gte: startOfDay, $lte: endOfDay },
      status: { $in: ['pending', 'confirmed'] },
    });
    
    const bookedTimes = bookedAppointments.map(a => a.startTime);
    let availableSlots = slots.filter(slot => !bookedTimes.includes(slot.startTime));
    
    // ============================================
    // ✅ FILTER OUT PAST TIMES IF DATE IS TODAY
    // ============================================
    const now = new Date();
    const isToday = selectedDate.getDate() === now.getDate() &&
                    selectedDate.getMonth() === now.getMonth() &&
                    selectedDate.getFullYear() === now.getFullYear();
    
    if (isToday) {
      const currentTimeMinutes = now.getHours() * 60 + now.getMinutes();
      
      availableSlots = availableSlots.filter(slot => {
        const [hours, minutes] = slot.startTime.split(':').map(Number);
        const slotTimeMinutes = hours * 60 + minutes;
        return slotTimeMinutes > currentTimeMinutes + 30;
      });
      
      console.log(`✅ Filtered out past slots for today. ${availableSlots.length} slots remaining`);
    }
    
    res.json({ success: true, data: availableSlots });
  } catch (error) {
    console.error('Get slots error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * @swagger
 * /faculty/{id}/availability:
 *   get:
 *     summary: Check faculty availability on a specific date
 *     tags: [Faculty]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Faculty ID
 *       - in: query
 *         name: date
 *         required: true
 *         schema:
 *           type: string
 *           format: date
 *         description: Date to check (YYYY-MM-DD)
 *     responses:
 *       200:
 *         description: Availability status
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     isAvailable:
 *                       type: boolean
 *                     availableSlots:
 *                       type: array
 *                       items:
 *                         type: object
 *                     totalSlots:
 *                       type: number
 *                     bookedCount:
 *                       type: number
 */
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

/**
 * @swagger
 * /faculty/{id}:
 *   get:
 *     summary: Get faculty by ID
 *     tags: [Faculty]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Faculty ID
 *     responses:
 *       200:
 *         description: Faculty details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/User'
 *       400:
 *         description: User is not a faculty member
 *       404:
 *         description: Faculty not found
 */
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

/**
 * @swagger
 * /faculty/schedule/bulk:
 *   post:
 *     summary: Bulk add schedule slots
 *     tags: [Faculty]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - slots
 *             properties:
 *               slots:
 *                 type: array
 *                 items:
 *                   type: object
 *                   required:
 *                     - date
 *                     - startTime
 *                     - endTime
 *                   properties:
 *                     date:
 *                       type: string
 *                       format: date
 *                     startTime:
 *                       type: string
 *                       example: "09:00"
 *                     endTime:
 *                       type: string
 *                       example: "10:00"
 *     responses:
 *       201:
 *         description: Bulk slots added
 *       400:
 *         description: Validation error
 */
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
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const now = new Date();
    
    for (const slotData of slots) {
      try {
        const { date, startTime, endTime } = slotData;
        
        if (!date || !startTime || !endTime) {
          errors.push({ slot: slotData, error: 'Missing required fields' });
          continue;
        }
        
        const slotDate = new Date(date);
        const selectedDate = new Date(date);
        selectedDate.setHours(0, 0, 0, 0);
        
        if (selectedDate < today) {
          errors.push({ slot: slotData, error: 'Cannot create slots for past dates' });
          continue;
        }
        
        if (isPastTimeForToday(date, startTime)) {
          const currentTimeStr = now.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
          });
          errors.push({ 
            slot: slotData, 
            error: `Cannot create slot at ${startTime} - time has already passed today (current time: ${currentTimeStr})` 
          });
          continue;
        }
        
        const timeRegex = /^([0-1][0-9]|2[0-3]):[0-5][0-9]$/;
        if (!timeRegex.test(startTime) || !timeRegex.test(endTime)) {
          errors.push({ slot: slotData, error: 'Invalid time format' });
          continue;
        }
        
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
        
        if (isNaN(slotDate.getTime())) {
          errors.push({ slot: slotData, error: 'Invalid date format' });
          continue;
        }
        
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