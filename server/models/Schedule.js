const mongoose = require('mongoose');

const ScheduleSchema = new mongoose.Schema({
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
    validate: {
      validator: function(v) {
        return /^([0-1][0-9]|2[0-3]):[0-5][0-9]$/.test(v);
      },
      message: props => `${props.value} is not a valid time format! Use HH:MM format`
    }
  },
  endTime: {
    type: String,
    required: true,
    validate: {
      validator: function(v) {
        return /^([0-1][0-9]|2[0-3]):[0-5][0-9]$/.test(v);
      },
      message: props => `${props.value} is not a valid time format! Use HH:MM format`
    }
  },
  isAvailable: {
    type: Boolean,
    default: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// IMPORTANT: Remove old index and create new ones
// Drop the old index if it exists (will be handled by MongoDB)
// Create new indexes for date-based queries

// Index for unique faculty/date/time combination
ScheduleSchema.index({ facultyId: 1, date: 1, startTime: 1 }, { unique: true });

// Index for querying by date range
ScheduleSchema.index({ facultyId: 1, date: 1 });

// Index for querying availability
ScheduleSchema.index({ facultyId: 1, date: 1, isAvailable: 1 });

// Index for sorting by date
ScheduleSchema.index({ date: -1 });

// Update timestamp on save
ScheduleSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Validate that endTime is after startTime
ScheduleSchema.pre('validate', function(next) {
  if (this.startTime && this.endTime) {
    const [startHour, startMinute] = this.startTime.split(':').map(Number);
    const [endHour, endMinute] = this.endTime.split(':').map(Number);
    const startMinutes = startHour * 60 + startMinute;
    const endMinutes = endHour * 60 + endMinute;
    
    if (startMinutes >= endMinutes) {
      next(new Error('End time must be after start time'));
    } else if (endMinutes - startMinutes < 30) {
      next(new Error('Slot duration must be at least 30 minutes'));
    }
  }
  next();
});

// Ensure we're using the correct model name
module.exports = mongoose.model('Schedule', ScheduleSchema);