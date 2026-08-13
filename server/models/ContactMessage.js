const mongoose = require('mongoose');

const ContactMessageSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    trim: true,
    lowercase: true,
  },
  message: {
    type: String,
    required: true,
    trim: true,
  },
  status: {
    type: String,
    enum: ['unread', 'read', 'replied'],
    default: 'unread',
  },
  isRead: {
    type: Boolean,
    default: false,
  },
  repliedAt: {
    type: Date,
  },
  replyMessage: {
    type: String,
    default: '',
  },
  isReplyVisibleToUser: {
    type: Boolean,
    default: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Index for faster queries
ContactMessageSchema.index({ createdAt: -1 });
ContactMessageSchema.index({ status: 1 });
ContactMessageSchema.index({ isRead: 1 });
ContactMessageSchema.index({ email: 1 });

module.exports = mongoose.model('ContactMessage', ContactMessageSchema);