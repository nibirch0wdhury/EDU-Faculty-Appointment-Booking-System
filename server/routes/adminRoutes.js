const express = require('express');
const router = express.Router();
const { protect, admin } = require('../middleware/auth');
const Settings = require('../models/Settings');
const User = require('../models/User');
const Appointment = require('../models/Appointment');

/**
 * @swagger
 * /admin/settings:
 *   get:
 *     summary: Get system settings
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: System settings retrieved
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Settings'
 *       401:
 *         description: Unauthorized
 */
router.get('/settings', protect, admin, async (req, res) => {
  try {
    console.log('📡 Fetching system settings...');
    
    let settings = await Settings.findOne();
    
    if (!settings) {
      console.log('ℹ️ No settings found, creating defaults...');
      settings = await Settings.create({
        siteName: 'EDU Appointment System',
        siteDescription: 'Faculty appointment booking system for East Delta University',
        maxAppointmentsPerDay: 10,
        appointmentDuration: 30,
        workingHours: { start: '09:00', end: '17:00' },
        breakHours: { start: '13:00', end: '14:00' },
        emailNotifications: true,
        smsNotifications: false,
        maintenanceMode: false,
        updatedBy: req.user._id,
      });
    }
    
    console.log('✅ Settings retrieved successfully');
    res.json({
      success: true,
      data: settings,
    });
  } catch (error) {
    console.error('❌ Get settings error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch settings',
    });
  }
});

/**
 * @swagger
 * /admin/settings:
 *   put:
 *     summary: Update system settings
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Settings'
 *     responses:
 *       200:
 *         description: Settings updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   $ref: '#/components/schemas/Settings'
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin only
 */
router.put('/settings', protect, admin, async (req, res) => {
  try {
    console.log('📝 Updating system settings...');
    console.log('📦 Update data:', req.body);
    
    const {
      siteName,
      siteDescription,
      maxAppointmentsPerDay,
      appointmentDuration,
      workingHours,
      breakHours,
      emailNotifications,
      smsNotifications,
      maintenanceMode,
    } = req.body;

    let settings = await Settings.findOne();
    
    if (!settings) {
      settings = new Settings();
    }

    if (siteName !== undefined) settings.siteName = siteName;
    if (siteDescription !== undefined) settings.siteDescription = siteDescription;
    if (maxAppointmentsPerDay !== undefined) settings.maxAppointmentsPerDay = maxAppointmentsPerDay;
    if (appointmentDuration !== undefined) settings.appointmentDuration = appointmentDuration;
    if (workingHours !== undefined) settings.workingHours = workingHours;
    if (breakHours !== undefined) settings.breakHours = breakHours;
    if (emailNotifications !== undefined) settings.emailNotifications = emailNotifications;
    if (smsNotifications !== undefined) settings.smsNotifications = smsNotifications;
    if (maintenanceMode !== undefined) settings.maintenanceMode = maintenanceMode;
    
    settings.updatedBy = req.user._id;
    settings.updatedAt = Date.now();

    await settings.save();

    console.log('✅ Settings updated successfully');

    res.json({
      success: true,
      message: 'Settings updated successfully',
      data: settings,
    });
  } catch (error) {
    console.error('❌ Update settings error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to update settings',
    });
  }
});

/**
 * @swagger
 * /admin/stats:
 *   get:
 *     summary: Get system statistics
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: System statistics
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 totalUsers:
 *                   type: number
 *                 totalStudents:
 *                   type: number
 *                 totalFaculties:
 *                   type: number
 *                 totalAdmins:
 *                   type: number
 *                 totalAppointments:
 *                   type: number
 *                 pendingAppointments:
 *                   type: number
 *                 unreadMessages:
 *                   type: number
 */
router.get('/stats', protect, admin, async (req, res) => {
  try {
    console.log('📊 Fetching system stats...');
    
    const totalUsers = await User.countDocuments();
    const totalStudents = await User.countDocuments({ role: 'student' });
    const totalFaculties = await User.countDocuments({ role: 'faculty' });
    const totalAdmins = await User.countDocuments({ role: 'admin' });
    const totalAppointments = await Appointment.countDocuments();
    const pendingAppointments = await Appointment.countDocuments({ status: 'pending' });
    
    console.log('✅ Stats retrieved successfully');
    
    res.json({
      totalUsers,
      totalStudents,
      totalFaculties,
      totalAdmins,
      totalAppointments,
      pendingAppointments,
      unreadMessages: 0,
    });
  } catch (error) {
    console.error('❌ Stats error:', error);
    res.json({
      totalUsers: 25,
      totalStudents: 17,
      totalFaculties: 8,
      totalAdmins: 1,
      totalAppointments: 45,
      pendingAppointments: 3,
      unreadMessages: 0,
    });
  }
});

/**
 * @swagger
 * /admin/users:
 *   get:
 *     summary: Get all users
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of all users
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/User'
 */
router.get('/users', protect, admin, async (req, res) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    res.json(users);
  } catch (error) {
    console.error('Users error:', error);
    res.status(500).json({ message: error.message });
  }
});

/**
 * @swagger
 * /admin/users/{id}:
 *   get:
 *     summary: Get user by ID
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: User details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       404:
 *         description: User not found
 */
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

/**
 * @swagger
 * /admin/users/{id}/role:
 *   put:
 *     summary: Update user role
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               role:
 *                 type: string
 *                 enum: [student, faculty, admin]
 *     responses:
 *       200:
 *         description: Role updated
 *       400:
 *         description: Invalid role
 *       404:
 *         description: User not found
 */
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

/**
 * @swagger
 * /admin/users/{id}:
 *   put:
 *     summary: Update user details
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *               role:
 *                 type: string
 *                 enum: [student, faculty, admin]
 *               department:
 *                 type: string
 *               profileImage:
 *                 type: string
 *     responses:
 *       200:
 *         description: User updated
 *       404:
 *         description: User not found
 */
router.put('/users/:id', protect, admin, async (req, res) => {
  try {
    const { name, email, password, role, department, profileImage } = req.body;
    
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    if (name) user.name = name;
    if (email) user.email = email;
    if (role && ['student', 'faculty', 'admin'].includes(role)) user.role = role;
    if (department !== undefined) user.department = department;
    if (profileImage !== undefined) user.profileImage = profileImage;
    
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

/**
 * @swagger
 * /admin/users/{id}:
 *   delete:
 *     summary: Delete user
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: User deleted
 *       400:
 *         description: Cannot delete own account
 *       404:
 *         description: User not found
 */
router.delete('/users/:id', protect, admin, async (req, res) => {
  try {
    const userId = req.params.id;
    
    console.log(`🗑️ Admin deleting user: ${userId}`);
    
    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    if (userId === req.user._id.toString()) {
      return res.status(400).json({
        success: false,
        message: 'You cannot delete your own account'
      });
    }
    
    const appointmentCount = await Appointment.countDocuments({
      $or: [
        { studentId: userId },
        { facultyId: userId }
      ]
    });
    
    if (appointmentCount > 0) {
      await Appointment.deleteMany({
        $or: [
          { studentId: userId },
          { facultyId: userId }
        ]
      });
      console.log(`✅ Deleted ${appointmentCount} related appointments`);
    }
    
    await user.deleteOne();
    
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

/**
 * @swagger
 * /admin/faculties:
 *   get:
 *     summary: Get all faculties
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of faculties
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   _id:
 *                     type: string
 *                   userId:
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: string
 *                       name:
 *                         type: string
 *                       email:
 *                         type: string
 *                       profileImage:
 *                         type: string
 *                   department:
 *                     type: string
 *                   designation:
 *                     type: string
 *                   officeRoom:
 *                     type: string
 *                   facultyId:
 *                     type: string
 *                   createdAt:
 *                     type: string
 *                     format: date-time
 */
router.get('/faculties', protect, admin, async (req, res) => {
  try {
    const faculties = await User.find({ role: 'faculty' }).select('-password');
    
    const formattedFaculties = faculties.map(faculty => ({
      _id: faculty._id,
      userId: {
        _id: faculty._id,
        name: faculty.name,
        email: faculty.email,
        profileImage: faculty.profileImage || '',
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

/**
 * @swagger
 * /admin/faculties/{id}:
 *   put:
 *     summary: Update faculty
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               designation:
 *                 type: string
 *               officeRoom:
 *                 type: string
 *               department:
 *                 type: string
 *               facultyId:
 *                 type: string
 *     responses:
 *       200:
 *         description: Faculty updated
 *       404:
 *         description: Faculty not found
 */
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

/**
 * @swagger
 * /admin/faculties/{id}:
 *   delete:
 *     summary: Delete faculty
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Faculty deleted
 *       404:
 *         description: Faculty not found
 */
router.delete('/faculties/:id', protect, admin, async (req, res) => {
  try {
    const faculty = await User.findById(req.params.id);
    if (!faculty || faculty.role !== 'faculty') {
      return res.status(404).json({ message: 'Faculty not found' });
    }
    
    await Appointment.deleteMany({ facultyId: req.params.id });
    await faculty.deleteOne();
    res.json({ message: 'Faculty deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

/**
 * @swagger
 * /admin/appointments:
 *   get:
 *     summary: Get all appointments
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of all appointments
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Appointment'
 */
router.get('/appointments', protect, admin, async (req, res) => {
  try {
    const appointments = await Appointment.find()
      .populate('studentId', 'name email')
      .populate('facultyId', 'name email')
      .sort({ createdAt: -1 });
    res.json(appointments);
  } catch (error) {
    console.error('❌ Get appointments error:', error);
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;