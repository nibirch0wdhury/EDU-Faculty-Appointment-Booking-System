const OTP = require('../models/OTP');
const User = require('../models/User');
const { sendOTPEmail } = require('../services/emailService');

// Generate 6-digit OTP
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Get OTP expiry time (in minutes)
const getOTPExpiry = () => {
  const minutes = parseInt(process.env.OTP_EXPIRY_MINUTES) || 10;
  const expiryDate = new Date();
  expiryDate.setMinutes(expiryDate.getMinutes() + minutes);
  return expiryDate;
};

// @desc    Send OTP for registration
// @route   POST /api/auth/send-otp
// @access  Public
const sendRegistrationOTP = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email is required',
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'This email is already registered. Please login.',
      });
    }

    // Check for recent OTP (prevent spam - 2 minute cooldown)
    const recentOTP = await OTP.findOne({
      email,
      purpose: 'registration',
      verified: false,
      createdAt: { $gte: new Date(Date.now() - 2 * 60 * 1000) },
    });

    if (recentOTP) {
      return res.status(429).json({
        success: false,
        message: 'Please wait 2 minutes before requesting a new OTP',
        waitTime: 120,
      });
    }

    // Delete old unverified OTPs for this email
    await OTP.deleteMany({
      email,
      purpose: 'registration',
      verified: false,
    });

    // Generate new OTP
    const otp = generateOTP();
    const expiresAt = getOTPExpiry();

    // Save OTP to database
    await OTP.create({
      email,
      otp,
      purpose: 'registration',
      expiresAt,
      verified: false,
    });

    // Send OTP via email
    const emailResult = await sendOTPEmail(email, otp);

    if (!emailResult.success) {
      console.error('Email send failed:', emailResult.error);
      return res.status(500).json({
        success: false,
        message: 'Failed to send OTP email. Please try again.',
      });
    }

    res.status(200).json({
      success: true,
      message: 'OTP sent successfully to your email',
      expiresAt,
    });

  } catch (error) {
    console.error('Send OTP error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to send OTP',
    });
  }
};

// @desc    Verify OTP
// @route   POST /api/auth/verify-otp
// @access  Public
const verifyOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({
        success: false,
        message: 'Email and OTP are required',
      });
    }

    // Find OTP record
    const otpRecord = await OTP.findOne({
      email,
      otp,
      purpose: 'registration',
      verified: false,
    });

    if (!otpRecord) {
      return res.status(400).json({
        success: false,
        message: 'Invalid OTP. Please check and try again.',
      });
    }

    // Check if OTP is expired
    if (otpRecord.expiresAt < new Date()) {
      await OTP.deleteOne({ _id: otpRecord._id });
      return res.status(400).json({
        success: false,
        message: 'OTP has expired. Please request a new one.',
      });
    }

    // Mark OTP as verified
    otpRecord.verified = true;
    await otpRecord.save();

    res.status(200).json({
      success: true,
      message: 'OTP verified successfully',
      verified: true,
    });

  } catch (error) {
    console.error('Verify OTP error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to verify OTP',
    });
  }
};

// @desc    Resend OTP
// @route   POST /api/auth/resend-otp
// @access  Public
const resendOTP = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email is required',
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'This email is already registered.',
      });
    }

    // Delete old unverified OTPs
    await OTP.deleteMany({
      email,
      purpose: 'registration',
      verified: false,
    });

    // Generate new OTP
    const otp = generateOTP();
    const expiresAt = getOTPExpiry();

    await OTP.create({
      email,
      otp,
      purpose: 'registration',
      expiresAt,
      verified: false,
    });

    // Send OTP via email
    const emailResult = await sendOTPEmail(email, otp);

    if (!emailResult.success) {
      return res.status(500).json({
        success: false,
        message: 'Failed to send OTP. Please try again.',
      });
    }

    res.status(200).json({
      success: true,
      message: 'New OTP sent successfully',
      expiresAt,
    });

  } catch (error) {
    console.error('Resend OTP error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to resend OTP',
    });
  }
};

module.exports = {
  sendRegistrationOTP,
  verifyOTP,
  resendOTP,
};