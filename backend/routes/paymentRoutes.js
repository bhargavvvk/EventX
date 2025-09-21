const express = require('express');
const router = express.Router();
const { createOrder, verifyPayment } = require('../controllers/paymentController');
const { protect } = require('../middleware/authMiddleware');

// Create Razorpay order for event booking
router.post('/create-order/:eventId', protect, createOrder);

// Verify payment and create booking
router.post('/verify-payment/:eventId', protect, verifyPayment);

module.exports = router;
