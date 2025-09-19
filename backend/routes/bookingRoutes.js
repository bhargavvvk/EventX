const express = require('express');
const { body } = require('express-validator');
const {
  createBooking,
  getBookingById,
  getEventBookings,
  getUserBookings,
  getBookingStats
} = require('../controllers/bookingController');

const router = express.Router();

// Validation middleware for booking creation
const bookingValidation = [
  body('fullName')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Full name must be between 2 and 100 characters'),
  
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),
  
  body('phone')
    .matches(/^\d{10}$/)
    .withMessage('Phone number must be exactly 10 digits'),
  
  body('rollNumber')
    .trim()
    .isLength({ min: 1, max: 20 })
    .withMessage('Roll number is required and must be less than 20 characters'),
  
  body('degree')
    .isIn(['B.E/B.Tech', 'MBA', 'MTECH', 'MCA'])
    .withMessage('Please select a valid degree'),
  
  body('college')
    .isIn(['CBIT', 'Other'])
    .withMessage('Please select a valid college'),
  
  body('department')
    .isIn(['CSE', 'AIML', 'AIDS', 'EEE', 'ECE', 'MECH', 'CHEMICAL', 'CIVIL', 'BIOTECH', 'IT'])
    .withMessage('Please select a valid department'),
  
  body('section')
    .isInt({ min: 1 })
    .withMessage('Section must be a positive number'),
  
  body('year')
    .isIn(['1', '2', '3', '4'])
    .withMessage('Please select a valid year of study')
];

// Routes

// POST /api/bookings/event/:eventId - Create a new booking
router.post('/event/:eventId', bookingValidation, createBooking);

// GET /api/bookings/:bookingId - Get booking by booking ID
router.get('/:bookingId', getBookingById);

// GET /api/bookings/event/:eventId - Get event details (for booking page)
router.get('/event/:eventId', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Event booking endpoint ready'
  });
});

// GET /api/bookings/event/:eventId/all - Get all bookings for an event (Admin)
router.get('/event/:eventId/all', getEventBookings);

// GET /api/bookings/user - Get user's bookings
router.get('/user/bookings', getUserBookings);


// GET /api/bookings/event/:eventId/stats - Get booking statistics
router.get('/event/:eventId/stats', getBookingStats);

module.exports = router;
