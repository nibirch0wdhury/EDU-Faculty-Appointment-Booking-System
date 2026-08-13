const ContactMessage = require('../models/ContactMessage');

// @desc    Submit contact message
// @route   POST /api/contact
// @access  Public
const submitContactMessage = async (req, res) => {
  try {
    const { name, email, message } = req.body;

    // Validate required fields
    if (!name || !email || !message) {
      return res.status(400).json({
        success: false,
        message: 'Please provide name, email, and message'
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid email address'
      });
    }

    // Save message to database
    const contactMessage = await ContactMessage.create({
      name,
      email,
      message,
      status: 'unread',
      isRead: false,
    });

    res.status(201).json({
      success: true,
      message: 'Your message has been sent successfully!',
      data: contactMessage,
    });

  } catch (error) {
    console.error('Contact message error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send message. Please try again later.',
    });
  }
};

// @desc    Get all contact messages (Admin only)
// @route   GET /api/contact/admin/messages
// @access  Private (Admin)
const getContactMessages = async (req, res) => {
  try {
    const { status, limit = 50, page = 1 } = req.query;
    
    const query = {};
    if (status && status !== 'all') {
      query.status = status;
    }

    const skip = (page - 1) * limit;

    const messages = await ContactMessage.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await ContactMessage.countDocuments(query);
    const unreadCount = await ContactMessage.countDocuments({ isRead: false });

    res.json({
      success: true,
      data: messages,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / limit),
      },
      unreadCount,
    });

  } catch (error) {
    console.error('Get messages error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch messages',
    });
  }
};

// @desc    Get user's own contact messages (Works for ALL users - Student, Faculty, Admin)
// @route   GET /api/contact/user/messages
// @access  Private (Any authenticated user)
const getUserContactMessages = async (req, res) => {
  try {
    // Get the logged-in user's email
    const userEmail = req.user.email;
    console.log('Fetching messages for user email:', userEmail);
    
    // Find all messages sent by this email
    const messages = await ContactMessage.find({ email: userEmail })
      .sort({ createdAt: -1 });

    console.log(`Found ${messages.length} messages for ${userEmail}`);

    res.json({
      success: true,
      data: messages,
    });

  } catch (error) {
    console.error('Get user messages error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch your messages',
    });
  }
};

// @desc    Get single contact message (Admin only)
// @route   GET /api/contact/admin/messages/:id
// @access  Private (Admin)
const getContactMessageById = async (req, res) => {
  try {
    const message = await ContactMessage.findById(req.params.id);
    
    if (!message) {
      return res.status(404).json({
        success: false,
        message: 'Message not found',
      });
    }

    // Mark as read if not already
    if (!message.isRead) {
      message.isRead = true;
      message.status = 'read';
      await message.save();
    }

    res.json({
      success: true,
      data: message,
    });

  } catch (error) {
    console.error('Get message error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch message',
    });
  }
};

// @desc    Mark message as read (Admin only)
// @route   PUT /api/contact/admin/messages/:id/read
// @access  Private (Admin)
const markMessageAsRead = async (req, res) => {
  try {
    const message = await ContactMessage.findById(req.params.id);
    
    if (!message) {
      return res.status(404).json({
        success: false,
        message: 'Message not found',
      });
    }

    message.isRead = true;
    message.status = 'read';
    await message.save();

    res.json({
      success: true,
      message: 'Message marked as read',
      data: message,
    });

  } catch (error) {
    console.error('Mark as read error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to mark message as read',
    });
  }
};

// @desc    Delete contact message (Admin only)
// @route   DELETE /api/contact/admin/messages/:id
// @access  Private (Admin)
const deleteContactMessage = async (req, res) => {
  try {
    const message = await ContactMessage.findById(req.params.id);
    
    if (!message) {
      return res.status(404).json({
        success: false,
        message: 'Message not found',
      });
    }

    await message.deleteOne();

    res.json({
      success: true,
      message: 'Message deleted successfully',
    });

  } catch (error) {
    console.error('Delete message error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete message',
    });
  }
};

// @desc    Reply to contact message (Admin only)
// @route   PUT /api/contact/admin/messages/:id/reply
// @access  Private (Admin)
const replyToContactMessage = async (req, res) => {
  try {
    const { replyMessage } = req.body;
    
    if (!replyMessage || !replyMessage.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a reply message'
      });
    }

    const message = await ContactMessage.findById(req.params.id);
    
    if (!message) {
      return res.status(404).json({
        success: false,
        message: 'Message not found',
      });
    }

    // Update the message with reply
    message.status = 'replied';
    message.replyMessage = replyMessage.trim();
    message.repliedAt = new Date();
    message.isReplyVisibleToUser = true;
    await message.save();

    console.log(`Reply sent to ${message.email}: ${replyMessage}`);

    res.json({
      success: true,
      message: 'Reply sent successfully',
      data: message,
    });

  } catch (error) {
    console.error('Reply error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send reply',
    });
  }
};

module.exports = {
  submitContactMessage,
  getContactMessages,
  getContactMessageById,
  markMessageAsRead,
  deleteContactMessage,
  replyToContactMessage,
  getUserContactMessages,
};