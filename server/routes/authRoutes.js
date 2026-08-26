const express = require('express');
const router = express.Router();
const {
  registerUser,
  loginUser,
  getUserProfile,
  updateUserProfile
} = require('../controllers/authController');
const {
  sendRegistrationOTP,
  verifyOTP,
  resendOTP
} = require('../controllers/otpController');
const { protect } = require('../middleware/auth');

// ==================== OTP ROUTES ====================
router.post('/send-otp', sendRegistrationOTP);
router.post('/verify-otp', verifyOTP);
router.post('/resend-otp', resendOTP);

// ==================== AUTH ROUTES ====================
router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/profile', protect, getUserProfile);
router.put('/profile', protect, updateUserProfile);

module.exports = router;