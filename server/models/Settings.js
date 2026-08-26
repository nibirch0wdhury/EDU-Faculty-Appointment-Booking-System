const mongoose = require('mongoose');

const SettingsSchema = new mongoose.Schema({
  siteName: {
    type: String,
    default: 'EDU Appointment System',
  },
  siteDescription: {
    type: String,
    default: 'Faculty appointment booking system for East Delta University',
  },
  maxAppointmentsPerDay: {
    type: Number,
    default: 10,
    min: 1,
    max: 50,
  },
  appointmentDuration: {
    type: Number,
    default: 30,
    enum: [15, 30, 45, 60],
  },
  workingHours: {
    start: { type: String, default: '09:00' },
    end: { type: String, default: '17:00' },
  },
  breakHours: {
    start: { type: String, default: '13:00' },
    end: { type: String, default: '14:00' },
  },
  emailNotifications: {
    type: Boolean,
    default: true,
  },
  smsNotifications: {
    type: Boolean,
    default: false,
  },
  maintenanceMode: {
    type: Boolean,
    default: false,
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Update timestamp on save
SettingsSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Settings', SettingsSchema);