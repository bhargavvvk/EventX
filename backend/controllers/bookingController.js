const mongoose = require('mongoose');
const Booking = require('../models/Booking');
const Event = require('../models/Event');
const { validationResult } = require('express-validator');

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

    // Check if user already booked this event
    const existingBooking = await Booking.findOne({ eventId, email });
    if (existingBooking) {
      return res.status(409).json({
        success: false,
        message: 'You have already booked this event'
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

    // Create new booking
    const booking = new Booking({
      eventId,
      fullName,
      email,
      phone,
      rollNumber,
      degree,
      college,
      department,
      section,
      year,
      bookingId: generateBookingId() // Explicitly set bookingId
    });

    try {
      await booking.save();
    } catch (saveError) {
      // If save fails due to duplicate bookingId (very rare), retry once
      if (saveError.code === 11000 && saveError.keyPattern && saveError.keyPattern.bookingId) {
        booking.bookingId = generateBookingId();
        await booking.save();
      } else {
        throw saveError;
      }
    }

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
    const { page = 1, limit = 10 } = req.query;

    const bookings = await Booking.find({ eventId })
      .populate('eventId', 'title dateTime location')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Booking.countDocuments({ eventId });

    res.status(200).json({
      success: true,
      data: {
        bookings,
        totalPages: Math.ceil(total / limit),
        currentPage: page,
        total
      }
    });

  } catch (error) {
    console.error('Error fetching event bookings:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Get user's bookings
const getUserBookings = async (req, res) => {
  try {
    const { email } = req.query;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email is required'
      });
    }

    const bookings = await Booking.find({ email })
      .populate('eventId')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: { bookings }
    });

  } catch (error) {
    console.error('Error fetching user bookings:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
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
