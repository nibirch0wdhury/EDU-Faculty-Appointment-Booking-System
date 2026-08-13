const express = require('express');
const router = express.Router();
const { protect, faculty } = require('../middleware/auth');

// Get all faculties
router.get('/all', async (req, res) => {
  try {
    const User = require('../models/User');
    const faculties = await User.find({ role: 'faculty' }).select('-password');
    res.json(faculties);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get faculty by ID
router.get('/:id', async (req, res) => {
  try {
    const User = require('../models/User');
    const faculty = await User.findById(req.params.id).select('-password');
    if (!faculty) {
      return res.status(404).json({ message: 'Faculty not found' });
    }
    res.json(faculty);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get faculty schedule
router.get('/:id/schedule', async (req, res) => {
  try {
    // Mock schedule data
    res.json([
      { day: 'Monday', startTime: '09:00', endTime: '17:00', isAvailable: true },
      { day: 'Tuesday', startTime: '09:00', endTime: '17:00', isAvailable: true },
    ]);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get available slots
router.get('/:id/slots', async (req, res) => {
  try {
    // Mock available slots
    res.json([
      { startTime: '10:00', endTime: '11:00' },
      { startTime: '11:00', endTime: '12:00' },
      { startTime: '14:00', endTime: '15:00' },
    ]);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Add schedule slot (faculty only)
router.post('/schedule', protect, faculty, async (req, res) => {
  try {
    res.json({ 
      message: 'Schedule slot added successfully',
      slot: req.body 
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;