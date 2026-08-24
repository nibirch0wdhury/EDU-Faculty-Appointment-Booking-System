const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

// Generate JWT Token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'secret', {
    expiresIn: '30d',
  });
};

// ============================================
// ✅ EMAIL VALIDATION FUNCTIONS
// ============================================

// Check if email is a valid student email (starts with number)
const isValidStudentEmail = (email) => {
  return /^\d+@eastdelta\.edu\.bd$/.test(email);
};

// Check if email is a valid faculty/admin email (alphabet.number format)
const isValidFacultyAdminEmail = (email) => {
  return /^[a-zA-Z]+\.[a-zA-Z]+@eastdelta\.edu\.bd$/.test(email);
};

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
const registerUser = async (req, res) => {
  try {
    const { name, email, password, role, department, studentId, facultyId } = req.body;

    // Validate required fields
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Please provide all required fields' });
    }

    // ============================================
    // ✅ ROLE-BASED EMAIL VALIDATION
    // ============================================
    const emailDomainRegex = /@eastdelta\.edu\.bd$/;
    if (!emailDomainRegex.test(email)) {
      return res.status(400).json({ 
        message: 'Only institutional emails (@eastdelta.edu.bd) are allowed' 
      });
    }

    // Validate email format based on role
    if (role === 'student') {
      if (!isValidStudentEmail(email)) {
        return res.status(400).json({ 
          message: 'Student email must be your Student ID followed by @eastdelta.edu.bd' 
        });
      }
      // Verify email matches studentId
      const emailPrefix = email.split('@')[0];
      if (studentId && emailPrefix !== studentId.trim()) {
        return res.status(400).json({ 
          message: `Your email must match your Student ID: ${studentId}@eastdelta.edu.bd` 
        });
      }
    } else if (role === 'faculty' || role === 'admin') {
      if (!isValidFacultyAdminEmail(email)) {
        return res.status(400).json({ 
          message: 'Faculty/Admin emails must be in format: firstname.lastname@eastdelta.edu.bd' 
        });
      }
    }

    // Check if user exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // ============================================
    // ✅ CREATE USER WITH ALL FIELDS
    // ============================================
    const userData = {
      name,
      email,
      password,
      role: role || 'student',
      department: department || '',
    };

    // ✅ Store studentId for students
    if (role === 'student' && studentId) {
      userData.studentId = studentId.trim();
    }

    // ✅ Store facultyId for faculty
    if (role === 'faculty' && facultyId) {
      userData.facultyId = facultyId.trim();
    }

    const user = await User.create(userData);

    if (user) {
      // ✅ Return ALL user fields including studentId and bio
      res.status(201).json({
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
    } else {
      res.status(400).json({ message: 'Invalid user data' });
    }
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Please provide email and password' });
    }

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Check password
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // ✅ Return ALL user fields
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
      token: generateToken(user._id),
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: error.message });
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
    
    // ✅ Return ALL user fields
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

    // ============================================
    // ✅ UPDATE ONLY EDITABLE FIELDS
    // ============================================
    
    if (req.body.name) user.name = req.body.name;
    if (req.body.department !== undefined) user.department = req.body.department;
    if (req.body.designation !== undefined) user.designation = req.body.designation;
    if (req.body.officeRoom !== undefined) user.officeRoom = req.body.officeRoom;
    
    // ✅ Bio - CRITICAL FIX
    if (req.body.bio !== undefined) {
      user.bio = req.body.bio;
      console.log(`📝 Bio updated for ${user.email}: "${user.bio}"`);
    }
    
    if (req.body.profileImage !== undefined) user.profileImage = req.body.profileImage;
    
    // ✅ Faculty ID is editable for faculty
    if (req.body.facultyId !== undefined && user.role === 'faculty') {
      user.facultyId = req.body.facultyId.trim();
    }

    // ============================================
    // ❌ READ-ONLY FIELDS - IGNORE EVEN IF SENT
    // ============================================
    // Email and Student ID are READ-ONLY after account creation
    if (req.body.email) {
      console.log(`⚠️ Email update attempt ignored for ${user.email} (read-only)`);
    }
    if (req.body.studentId && user.role === 'student') {
      console.log(`⚠️ Student ID update attempt ignored for ${user.email} (read-only)`);
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
    
    console.log(`✅ Profile updated for ${updatedUser.email}`);
    console.log(`📝 Bio: "${updatedUser.bio}"`);
    console.log(`🆔 Student ID: "${updatedUser.studentId}"`);

    // ✅ Return ALL updated fields
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