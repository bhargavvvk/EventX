const mongoose = require('mongoose');

const BookingSchema = new mongoose.Schema({
  eventId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Event',
    required: true
  },
  // Personal Information
  fullName: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    trim: true,
    lowercase: true
  },
  phone: {
    type: String,
    required: true,
    trim: true
  },
  rollNumber: {
    type: String,
    required: true,
    trim: true
  },
  // Academic Information
  degree: {
    type: String,
    required: true,
    enum: ['B.E/B.Tech', 'MBA', 'MTECH', 'MCA']
  },
  college: {
    type: String,
    required: true,
    enum: ['CBIT', 'Other']
  },
  department: {
    type: String,
    required: true,
    enum: ['CSE', 'AIML', 'AIDS', 'EEE', 'ECE', 'MECH', 'CHEMICAL', 'CIVIL', 'BIOTECH', 'IT']
  },
  section: {
    type: Number,
    required: true,
    min: 1
  },
  year: {
    type: String,
    required: true,
    enum: ['1', '2', '3', '4']
  },
  // Booking Status
  bookingStatus: {
    type: String,
    enum: ['confirmed', 'pending', 'cancelled'],
    default: 'confirmed'
  },
  paymentStatus: {
    type: String,
    enum: ['paid', 'pending', 'failed'],
    default: 'pending'
  },
  bookingId: {
    type: String,
    required: true
  }
}, { timestamps: true });

// Create unique booking ID before saving
BookingSchema.pre('save', function(next) {
  if (!this.bookingId) {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substring(2, 8);
    this.bookingId = `BK${timestamp}${random}`.toUpperCase();
  }
  next();
});

// Index for faster queries
BookingSchema.index({ eventId: 1, email: 1 }, { unique: true }); // Prevent duplicate bookings
BookingSchema.index({ bookingId: 1 });
BookingSchema.index({ rollNumber: 1, eventId: 1 });

module.exports = mongoose.model('Booking', BookingSchema);
