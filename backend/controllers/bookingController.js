const mongoose = require('mongoose');
const Booking = require('../models/Booking');
const Event = require('../models/Event');
const { validationResult } = require('express-validator');
const { sendBookingConfirmationEmail } = require('../utils/mailer'); // ✅ added mailer import
const ExcelJS = require('exceljs');

// Create a new booking
const createBooking = async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { eventId } = req.params;
    const {
      fullName,
      email,
      phone,
      rollNumber,
      degree,
      college,
      department,
      section,
      year
    } = req.body;

    // Check if event exists (validate ObjectId first)
    if (!mongoose.Types.ObjectId.isValid(eventId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid event ID format'
      });
    }

    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }

    // Get user ID from authenticated user
    const userId = req.user?._id || req.body.userId; // Fallback to body if needed for testing
    
    // Debug log (remove in production)
    console.log('User from request:', { 
      user: req.user, 
      userId,
      headers: req.headers,
      body: req.body 
    });

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required. Please log in to book an event.',
        error: 'MISSING_USER_ID'
      });
    }

    // Check if user already booked this event using userId
    try {
      const existingBooking = await Booking.findOne({ eventId, userId });
      if (existingBooking) {
        return res.status(409).json({
          success: false,
          message: 'You have already booked this event',
          error: 'DUPLICATE_BOOKING',
          bookingId: existingBooking.bookingId
        });
      }
    } catch (error) {
      console.error('Error checking for existing booking:', error);
      return res.status(500).json({
        success: false,
        message: 'Error checking booking status',
        error: 'BOOKING_CHECK_ERROR'
      });
    }

    // Check if roll number already booked this event
    const existingRollBooking = await Booking.findOne({ eventId, rollNumber });
    if (existingRollBooking) {
      return res.status(409).json({
        success: false,
        message: 'This roll number has already been used to book this event'
      });
    }

    // Generate booking ID
    const generateBookingId = () => {
      const timestamp = Date.now().toString(36);
      const random = Math.random().toString(36).substring(2, 8);
      return `BK${timestamp}${random}`.toUpperCase();
    };

    // Create new booking with user reference
    const booking = new Booking({
      eventId,
      userId, // Add user reference
      fullName,
      email,
      phone,
      rollNumber,
      degree,
      college,
      department,
      section,
      year,
      status: 'confirmed',
      bookingDate: new Date(),
      bookingId: generateBookingId() // Explicitly set bookingId
    });

    try {
      await booking.save();
    } catch (saveError) {
      console.error('Booking save error:', saveError);
      
      // Handle different types of duplicate key errors
      if (saveError.code === 11000) {
        if (saveError.keyPattern && saveError.keyPattern.bookingId) {
          // Duplicate bookingId (very rare), retry once
          booking.bookingId = generateBookingId();
          await booking.save();
        } else if (saveError.keyPattern && saveError.keyPattern.eventId && saveError.keyPattern.userId) {
          // Duplicate user booking for this event
          return res.status(409).json({
            success: false,
            message: 'You have already booked this event',
            error: 'DUPLICATE_USER_BOOKING'
          });
        } else if (saveError.keyPattern && saveError.keyPattern.eventId && saveError.keyPattern.email) {
          // Duplicate email booking for this event (legacy index)
          return res.status(409).json({
            success: false,
            message: 'This email address has already been used to book this event',
            error: 'DUPLICATE_EMAIL_BOOKING'
          });
        } else if (saveError.keyPattern && saveError.keyPattern.rollNumber && saveError.keyPattern.eventId) {
          // Duplicate roll number for this event
          return res.status(409).json({
            success: false,
            message: 'This roll number has already been used to book this event',
            error: 'DUPLICATE_ROLL_NUMBER'
          });
        } else {
          // Other duplicate key error
          return res.status(409).json({
            success: false,
            message: 'Duplicate booking detected',
            error: 'DUPLICATE_BOOKING_ERROR'
          });
        }
      } else {
        throw saveError;
      }
    }

    // ✅ Send booking confirmation email
    await sendBookingConfirmationEmail({
      to: booking.email,
      name: booking.fullName,
      event: event,
      bookingId: booking.bookingId
    });

    // Populate event details for response
    await booking.populate('eventId', 'title dateTime location price');

    res.status(201).json({
      success: true,
      message: 'Booking created successfully',
      data: {
        booking: {
          bookingId: booking.bookingId,
          eventTitle: booking.eventId.title,
          studentName: booking.fullName,
          email: booking.email,
          rollNumber: booking.rollNumber,
          bookingStatus: booking.bookingStatus,
          createdAt: booking.createdAt
        }
      }
    });

  } catch (error) {
    console.error('Error creating booking:', error);
    console.error('Stack trace:', error.stack);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Get booking by booking ID
const getBookingById = async (req, res) => {
  try {
    const { bookingId } = req.params;

    const booking = await Booking.findOne({ bookingId }).populate('eventId');
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    res.status(200).json({
      success: true,
      data: { booking }
    });

  } catch (error) {
    console.error('Error fetching booking:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Get all bookings for an event (Admin only)
const getEventBookings = async (req, res) => {
  try {
    const { eventId } = req.params;
    const { export: exportType } = req.query;

    const bookings = await Booking.find({ eventId })
      .populate('eventId', 'title dateTime location')
      .sort({ createdAt: -1 });

    if (exportType === 'excel') {
      const workbook = new ExcelJS.Workbook();
      const sheet = workbook.addWorksheet('Bookings');

      // Add headers
      sheet.addRow([
        'Booking ID', 'Full Name', 'Email', 'Phone', 'Roll Number',
        'College', 'Department', 'Section', 'Year', 'Created At'
      ]);

      // Add data rows
      bookings.forEach(b => {
        sheet.addRow([
          b.bookingId, b.fullName, b.email, b.phone, b.rollNumber,
          b.college, b.department, b.section, b.year,
          b.createdAt.toLocaleString()
        ]);
      });

      // Send as download
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', 'attachment; filename=bookings.xlsx');

      await workbook.xlsx.write(res);
      return res.end();
    }

    // Normal JSON response
    res.status(200).json({ success: true, data: { bookings } });

  } catch (error) {
    console.error('Error fetching event bookings:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// Get user's bookings
const getUserBookings = async (req, res) => {
  try {
    // Get user ID from authenticated user
    const userId = req.user?._id;
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'User not authenticated'
      });
    }

    const bookings = await Booking.find({ userId })
      .populate('eventId', 'title dateTime location price posterUrl')
      .sort({ bookingDate: -1 });

    res.status(200).json({
      success: true,
      count: bookings.length,
      data: bookings
    });
  } catch (error) {
    console.error('Error fetching user bookings:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching bookings',
      error: error.message
    });
  }
};

// Get booking statistics for an event
const getBookingStats = async (req, res) => {
  try {
    const { eventId } = req.params;

    const stats = await Booking.aggregate([
      { $match: { eventId: new mongoose.Types.ObjectId(eventId) } },
      {
        $group: {
          _id: null,
          totalBookings: { $sum: 1 },
          confirmedBookings: {
            $sum: { $cond: [{ $eq: ['$bookingStatus', 'confirmed'] }, 1, 0] }
          },
          collegeBreakdown: {
            $push: '$college'
          },
          departmentBreakdown: {
            $push: '$department'
          }
        }
      }
    ]);

    res.status(200).json({
      success: true,
      data: { stats: stats[0] || {} }
    });

  } catch (error) {
    console.error('Error fetching booking stats:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

module.exports = {
  createBooking,
  getBookingById,
  getEventBookings,
  getUserBookings,
  getBookingStats
};
