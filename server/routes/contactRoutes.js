const express = require('express');
const router = express.Router();
const { protect, admin } = require('../middleware/auth');
const {
  submitContactMessage,
  getContactMessages,
  getContactMessageById,
  markMessageAsRead,
  deleteContactMessage,
  replyToContactMessage,
  getUserContactMessages,
} = require('../controllers/contactController');

// ==================== PUBLIC ROUTES ====================
// Anyone can submit a contact message
router.post('/', submitContactMessage);

// ==================== USER ROUTES (Any authenticated user) ====================
// Get messages for the logged-in user (Student, Faculty, or Admin)
router.get('/user/messages', protect, getUserContactMessages);

// ==================== ADMIN ROUTES ====================
// Get all messages (admin only)
router.get('/admin/messages', protect, admin, getContactMessages);

// Get single message by ID (admin only)
router.get('/admin/messages/:id', protect, admin, getContactMessageById);

// Mark message as read (admin only)
router.put('/admin/messages/:id/read', protect, admin, markMessageAsRead);

// Reply to message (admin only)
router.put('/admin/messages/:id/reply', protect, admin, replyToContactMessage);

// Delete message (admin only)
router.delete('/admin/messages/:id', protect, admin, deleteContactMessage);

module.exports = router;