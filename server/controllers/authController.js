const User = require('../models/User');
const OTP = require('../models/OTP');
const Settings = require('../models/Settings');
const { sendWelcomeEmail } = require('../services/emailService');
const jwt = require('jsonwebtoken');

// Generate JWT Token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'secret', {
    expiresIn: '30d',
  });
};

// Email validation functions
const isValidStudentEmail = (email) => {
  return /^\d+@eastdelta\.edu\.bd$/.test(email);
};

const isValidFacultyAdminEmail = (email) => {
  const parts = email.split('@');
  if (parts.length !== 2) return false;
  const localPart = parts[0];
  return /@eastdelta\.edu\.bd$/.test(email) && /[a-zA-Z]/.test(localPart);
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password'
      });
    }

    // ✅ Check if system is in maintenance mode
    const settings = await Settings.findOne();
    
    if (settings?.maintenanceMode) {
      // Find user to check role
      const user = await User.findOne({ email });
      
      // If user exists and is NOT admin, block login
      if (user && user.role !== 'admin') {
        return res.status(503).json({
          success: false,
          message: '🚧 System is currently under maintenance. Please try again later.',
          maintenanceMode: true,
        });
      }
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // ✅ Final check - if maintenance mode is on and user is not admin
    if (settings?.maintenanceMode && user.role !== 'admin') {
      return res.status(503).json({
        success: false,
        message: '🚧 System is currently under maintenance. Please try again later.',
        maintenanceMode: true,
      });
    }

    res.json({
      success: true,
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      department: user.department,
      studentId: user.studentId || '',
      facultyId: user.facultyId || '',
      designation: user.designation || '',
      officeRoom: user.officeRoom || '',
      bio: user.bio || '',
      profileImage: user.profileImage || '',
      token: generateToken(user._id),
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Register a new user (with OTP verification)
// @route   POST /api/auth/register
// @access  Public
const registerUser = async (req, res) => {
  try {
    const { name, email, password, role, department, studentId, facultyId, otp } = req.body;

    // ✅ Check if system is in maintenance mode
    const settings = await Settings.findOne();
    if (settings?.maintenanceMode) {
      return res.status(503).json({
        success: false,
        message: '🚧 System is currently under maintenance. Registration is temporarily disabled.',
        maintenanceMode: true,
      });
    }

    // Validate required fields
    if (!name || !email || !password || !otp) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields including OTP'
      });
    }

    // Email validation
    const emailDomainRegex = /@eastdelta\.edu\.bd$/;
    if (!emailDomainRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: 'Only institutional emails (@eastdelta.edu.bd) are allowed'
      });
    }

    if (role === 'student') {
      if (!isValidStudentEmail(email)) {
        return res.status(400).json({
          success: false,
          message: 'Student email must be your Student ID followed by @eastdelta.edu.bd'
        });
      }
      const emailPrefix = email.split('@')[0];
      if (studentId && emailPrefix !== studentId.trim()) {
        return res.status(400).json({
          success: false,
          message: `Your email must match your Student ID: ${studentId}@eastdelta.edu.bd`
        });
      }
    } else if (role === 'faculty' || role === 'admin') {
      if (!isValidFacultyAdminEmail(email)) {
        return res.status(400).json({
          success: false,
          message: 'Faculty/Admin email must end with @eastdelta.edu.bd and include at least one letter before @'
        });
      }
      if (role === 'faculty') {
        if (!facultyId || !facultyId.trim()) {
          return res.status(400).json({ success: false, message: 'Faculty ID is required for faculty account' });
        }
        if (!/[a-zA-Z]/.test(facultyId.trim())) {
          return res.status(400).json({ success: false, message: 'Faculty ID must include at least one letter' });
        }
      }
    }

    // ✅ VERIFY OTP
    const otpRecord = await OTP.findOne({
      email,
      otp,
      purpose: 'registration',
      verified: true,
    });

    if (!otpRecord) {
      return res.status(400).json({
        success: false,
        message: 'Please verify your email first. Invalid or unverified OTP.',
      });
    }

    if (otpRecord.expiresAt < new Date()) {
      await OTP.deleteOne({ _id: otpRecord._id });
      return res.status(400).json({
        success: false,
        message: 'OTP has expired. Please request a new one.',
      });
    }

    // Check if user exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({
        success: false,
        message: 'User already exists'
      });
    }

    // ✅ CREATE USER
    const userData = {
      name,
      email,
      password,
      role: role || 'student',
      department: department || '',
    };

    if (role === 'student' && studentId) {
      userData.studentId = studentId.trim();
    }

    if (role === 'faculty' && facultyId) {
      userData.facultyId = facultyId.trim();
    }

    const user = await User.create(userData);

    if (user) {
      // ✅ Delete the used OTP
      await OTP.deleteOne({ _id: otpRecord._id });

      // Send welcome email (async)
      sendWelcomeEmail(email, name).catch(err =>
        console.error('Welcome email failed:', err)
      );

      // Generate token
      const token = generateToken(user._id);

      res.status(201).json({
        success: true,
        message: 'Registration successful! Welcome to EDU Meet.',
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        department: user.department,
        studentId: user.studentId || '',
        facultyId: user.facultyId || '',
        designation: user.designation || '',
        officeRoom: user.officeRoom || '',
        bio: user.bio || '',
        profileImage: user.profileImage || '',
        token,
      });
    } else {
      res.status(400).json({
        success: false,
        message: 'Invalid user data'
      });
    }
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get user profile
// @route   GET /api/auth/profile
// @access  Private
const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      department: user.department,
      studentId: user.studentId || '',
      facultyId: user.facultyId || '',
      designation: user.designation || '',
      officeRoom: user.officeRoom || '',
      bio: user.bio || '',
      profileImage: user.profileImage || '',
      isActive: user.isActive,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    });
  } catch (error) {
    console.error('Profile error:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
const updateUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (req.body.name) user.name = req.body.name;
    if (req.body.department !== undefined) user.department = req.body.department;
    if (req.body.designation !== undefined) user.designation = req.body.designation;
    if (req.body.officeRoom !== undefined) user.officeRoom = req.body.officeRoom;
    if (req.body.bio !== undefined) user.bio = req.body.bio;
    if (req.body.profileImage !== undefined) user.profileImage = req.body.profileImage;

    if (req.body.facultyId !== undefined && user.role === 'faculty') {
      user.facultyId = req.body.facultyId.trim();
    }

    // Password update
    if (req.body.newPassword) {
      if (req.body.currentPassword) {
        const isMatch = await user.matchPassword(req.body.currentPassword);
        if (!isMatch) {
          return res.status(400).json({ message: 'Current password is incorrect' });
        }
      }
      user.password = req.body.newPassword;
    } else if (req.body.password) {
      user.password = req.body.password;
    }

    const updatedUser = await user.save();

    res.json({
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      role: updatedUser.role,
      department: updatedUser.department,
      designation: updatedUser.designation,
      officeRoom: updatedUser.officeRoom,
      studentId: updatedUser.studentId || '',
      facultyId: updatedUser.facultyId || '',
      bio: updatedUser.bio || '',
      profileImage: updatedUser.profileImage || '',
      token: generateToken(updatedUser._id),
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  registerUser,
  loginUser,
  getUserProfile,
  updateUserProfile
};