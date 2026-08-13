const mongoose = require('mongoose');

const AppointmentSchema = new mongoose.Schema({
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  facultyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  date: {
    type: Date,
    required: true,
  },
  startTime: {
    type: String,
    required: true,
  },
  endTime: {
    type: String,
    required: true,
  },
  purpose: {
    type: String,
    required: true,
    trim: true,
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'cancelled', 'completed'],
    default: 'pending',
  },
  meetingLink: {
    type: String,
    default: '',
  },
  notes: {
    type: String,
    default: '',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Index for better query performance
AppointmentSchema.index({ facultyId: 1, date: 1 });
AppointmentSchema.index({ studentId: 1, date: 1 });
AppointmentSchema.index({ status: 1 });

module.exports = mongoose.model('Appointment', AppointmentSchema);