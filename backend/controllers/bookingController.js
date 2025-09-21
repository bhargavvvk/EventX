const mongoose = require('mongoose');
const Booking = require('../models/Booking');
const Event = require('../models/Event');
const { validationResult } = require('express-validator');
const { sendBookingConfirmationEmail } = require('../utils/mailer');
const { checkForDuplicateBookings, createBooking: createBookingUtil } = require('../utils/bookingUtils');
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
      year,
      paymentId = null,
      orderId = null,
      paymentAmount = 0
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
    const userId = req.user?._id;
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required. Please log in to book an event.',
        error: 'UNAUTHORIZED'
      });
    }

    // Prepare booking data
    const bookingData = {
      fullName,
      email,
      phone,
      rollNumber,
      degree,
      college,
      department,
      section: parseInt(section),
      year
    };

    try {
      // Check for duplicate bookings
      await checkForDuplicateBookings(eventId, userId, rollNumber);

      // Create booking
      const booking = await createBookingUtil({
        eventId,
        userId,
        bookingData,
        payment: paymentId ? {
          id: paymentId,
          orderId,
          amount: paymentAmount
        } : null
      });

      // Send booking confirmation email
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
            paymentStatus: booking.paymentStatus,
            bookingStatus: booking.status,
            amountPaid: booking.paymentAmount,
            createdAt: booking.createdAt
          }
        }
      });
    } catch (error) {
      console.error('Error in createBooking:', error);
      
      // Handle known error types
      if (error.status === 409) {
        return res.status(409).json({
          success: false,
          message: error.message,
          error: error.error
        });
      }
      
      // Handle other errors
      res.status(500).json({
        success: false,
        message: 'Failed to create booking',
        error: error.message
      });
    }

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
