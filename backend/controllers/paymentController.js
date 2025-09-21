const crypto = require('crypto');
const Razorpay = require('razorpay');
const Event = require('../models/Event');
const { createBooking, checkForDuplicateBookings } = require('../utils/bookingUtils');
const { sendBookingConfirmationEmail, sendPaymentReceiptEmail } = require('../utils/mailer');

// Initialize Razorpay with error handling
let razorpay;
try {
  if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
    throw new Error('Razorpay API keys are not configured in environment variables');
  }
  
  razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
  });
  
  console.log('✅ Razorpay initialized successfully');
} catch (error) {
  console.error('❌ Failed to initialize Razorpay:', error.message);
  if (error.error) {
    console.error('Razorpay error details:', error.error);
  }
  if (process.env.NODE_ENV !== 'production') {
    process.exit(1);
  }
}

// Create Razorpay Order
const createOrder = async (req, res) => {
  console.log('🔔 Creating order for event:', req.params.eventId);
  
  try {
    const { eventId } = req.params;
    const { bookingData } = req.body;

    if (!eventId) {
      console.warn('❌ Event ID is missing in request');
      return res.status(400).json({
        success: false,
        message: 'Event ID is required',
        error: 'EVENT_ID_MISSING'
      });
    }

    if (!bookingData) {
      console.warn('❌ Booking data is missing in request');
      return res.status(400).json({
        success: false,
        message: 'Booking data is required',
        error: 'BOOKING_DATA_MISSING'
      });
    }

    // Validate event exists
    const event = await Event.findById(eventId);
    if (!event) {
      console.warn(`❌ Event not found with ID: ${eventId}`);
      return res.status(404).json({ 
        success: false, 
        message: 'Event not found',
        error: 'EVENT_NOT_FOUND'
      });
    }

    // Check for duplicate bookings before proceeding
    try {
      await checkForDuplicateBookings(
        eventId, 
        req.user._id, 
        bookingData.rollNumber
      );
    } catch (error) {
      // If duplicate found, return error immediately
      console.warn('❌ Duplicate booking detected:', error.message);
      return res.status(error.status || 409).json({
        success: false,
        message: error.message,
        error: error.error || 'DUPLICATE_BOOKING'
      });
    }

    // For free events, directly create booking
    if (event.price === 0) {
      console.log('ℹ️ Processing free event booking');
      try {
        // Create booking without payment
        const booking = await createBooking({
          eventId,
          userId: req.user._id,
          bookingData,
          payment: null
        });

        console.log('✅ Free event booking created:', booking.bookingId);
        
        // Send booking confirmation email for free event
        try {
          await sendBookingConfirmationEmail({
            to: bookingData.email,
            name: bookingData.fullName,
            event: {
              title: event.title,
              dateTime: event.dateTime,
              location: event.location,
              price: event.price
            },
            bookingId: booking.bookingId
          });
        } catch (emailError) {
          console.error('⚠️ Failed to send confirmation email:', emailError);
          // Don't fail the request if email fails
        }

        return res.status(201).json({
          success: true,
          message: 'Free event booking successful',
          data: {
            bookingId: booking.bookingId,
            paymentRequired: false
          }
        });
      } catch (error) {
        console.error('❌ Error in free event booking:', error);
        return res.status(error.status || 500).json({
          success: false,
          message: error.message || 'Error creating booking',
          error: error.error || 'BOOKING_ERROR'
        });
      }
    }

    // For paid events, create Razorpay order
    console.log(`💰 Creating Razorpay order for amount: ${event.price} INR`);
    
    const options = {
      amount: Math.round(event.price * 100), // Convert to paisa and ensure integer
      currency: 'INR',
      // Generate a shorter receipt ID using last 6 chars of event ID and timestamp
      receipt: `evt_${eventId.toString().slice(-6)}_${Date.now().toString().slice(-6)}`,
      notes: {
        eventId: eventId.toString(),
        eventTitle: event.title,
        studentName: bookingData.fullName,
        studentEmail: bookingData.email,
        rollNumber: bookingData.rollNumber
      },
      payment_capture: 1 // Auto-capture payment
    };

    // Validate amount is valid (minimum 1 INR)
    if (options.amount < 100) { // 100 paisa = 1 INR
      console.warn('❌ Invalid amount for Razorpay order:', options.amount);
      return res.status(400).json({
        success: false,
        message: 'Invalid amount for payment',
        error: 'INVALID_AMOUNT'
      });
    }

    try {
      const order = await razorpay.orders.create(options);
      console.log('✅ Razorpay order created:', order.id);
      
      res.status(200).json({
        success: true,
        data: {
          orderId: order.id,
          amount: order.amount,
          currency: order.currency,
          keyId: process.env.RAZORPAY_KEY_ID,
          eventTitle: event.title,
          eventPrice: event.price,
          paymentRequired: true
        }
      });
    } catch (razorpayError) {
      console.error('❌ Razorpay API Error:', {
        message: razorpayError.message,
        status: razorpayError.statusCode,
        error: razorpayError.error,
        stack: razorpayError.stack
      });
      
      // Handle specific Razorpay errors
      let errorMessage = 'Failed to create payment order';
      let errorCode = 'PAYMENT_ERROR';
      
      if (razorpayError.error) {
        if (razorpayError.error.description) {
          errorMessage = razorpayError.error.description;
        }
        if (razorpayError.error.code) {
          errorCode = razorpayError.error.code;
        }
      }
      
      res.status(razorpayError.statusCode || 500).json({
        success: false,
        message: errorMessage,
        error: errorCode,
        details: process.env.NODE_ENV === 'development' ? razorpayError.error : undefined
      });
    }
  } catch (error) {
    console.error('❌ Unexpected error in createOrder:', {
      message: error.message,
      stack: error.stack,
      ...(error.response?.data && { response: error.response.data })
    });
    
    res.status(500).json({
      success: false,
      message: 'An unexpected error occurred while creating the order',
      error: 'INTERNAL_SERVER_ERROR',
      ...(process.env.NODE_ENV === 'development' && { details: error.message })
    });
  }
};

// Verify Payment and Create Booking
const verifyPayment = async (req, res) => {
  console.log('🔍 Verifying payment...');
  
  try {
    const { eventId } = req.params;
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      bookingData
    } = req.body;

    // Validate required fields
    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      console.warn('❌ Missing payment verification data');
      return res.status(400).json({
        success: false,
        message: 'Missing payment verification data',
        error: 'MISSING_PAYMENT_DATA'
      });
    }

    // Verify signature
    const body = `${razorpay_order_id}|${razorpay_payment_id}`;
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(body)
      .digest('hex');

    if (expectedSignature !== razorpay_signature) {
      console.warn('❌ Invalid payment signature');
      return res.status(400).json({
        success: false,
        message: 'Invalid payment signature',
        error: 'INVALID_SIGNATURE'
      });
    }

    // Get payment details from Razorpay
    console.log(`🔍 Fetching payment details for: ${razorpay_payment_id}`);
    let payment;
    try {
      payment = await razorpay.payments.fetch(razorpay_payment_id);
      console.log('✅ Payment details retrieved:', {
        paymentId: payment.id,
        status: payment.status,
        amount: payment.amount,
        currency: payment.currency
      });
    } catch (fetchError) {
      console.error('❌ Failed to fetch payment details:', fetchError);
      return res.status(400).json({
        success: false,
        message: 'Failed to verify payment status',
        error: 'PAYMENT_VERIFICATION_FAILED',
        details: process.env.NODE_ENV === 'development' ? fetchError.message : undefined
      });
    }
    
    if (payment.status !== 'captured') {
      console.warn(`❌ Payment not captured. Status: ${payment.status}`);
      return res.status(400).json({
        success: false,
        message: 'Payment not captured',
        error: 'PAYMENT_NOT_CAPTURED',
        paymentStatus: payment.status
      });
    }

    // Check if event exists
    const event = await Event.findById(eventId);
    if (!event) {
      console.warn(`❌ Event not found: ${eventId}`);
      return res.status(404).json({
        success: false,
        message: 'Event not found',
        error: 'EVENT_NOT_FOUND'
      });
    }

    // Create booking with payment details
    console.log('📝 Creating booking record...');
    const booking = await createBooking({
      eventId,
      userId: req.user._id,
      bookingData,
      payment: {
        id: razorpay_payment_id,
        orderId: razorpay_order_id,
        amount: payment.amount,
        currency: payment.currency,
        status: payment.status,
        method: payment.method,
        bank: payment.bank,
        vpa: payment.vpa,
        cardId: payment.card_id
      }
    });

    // Populate event details for response
    await booking.populate('eventId', 'title dateTime location price');
    
    console.log('✅ Booking created successfully:', booking.bookingId);

    // Send booking confirmation email for paid event
    try {
      await sendBookingConfirmationEmail({
        to: bookingData.email,
        name: bookingData.fullName,
        event: {
          title: booking.eventId.title,
          dateTime: booking.eventId.dateTime,
          location: booking.eventId.location,
          price: booking.eventId.price
        },
        bookingId: booking.bookingId,
        paymentId: razorpay_payment_id,
        amount: (payment.amount / 100).toFixed(2) // Convert back to rupees
      });
    } catch (emailError) {
      console.error('⚠️ Failed to send confirmation email:', emailError);
      // Don't fail the request if email fails
    }

    // Send payment receipt email
    try {
      await sendPaymentReceiptEmail({
        to: bookingData.email,
        name: bookingData.fullName,
        paymentId: razorpay_payment_id,
        amount: (payment.amount / 100).toFixed(2), // Convert back to rupees
        paymentMethod: payment.method,
        bank: payment.bank,
        transactionId: payment.id
      });
    } catch (emailError) {
      console.error('⚠️ Failed to send payment receipt email:', emailError);
      // Don't fail the request if email fails
    }

    res.status(201).json({
      success: true,
      message: 'Payment verified and booking created successfully',
      data: {
        bookingId: booking.bookingId,
        eventTitle: booking.eventId.title,
        studentName: booking.fullName,
        email: booking.email,
        rollNumber: booking.rollNumber,
        paymentStatus: booking.paymentStatus,
        paymentId: booking.paymentId,
        amount: payment.amount,
        currency: payment.currency,
        createdAt: booking.createdAt
      }
    });

  } catch (error) {
    console.error('❌ Error in verifyPayment:', {
      message: error.message,
      stack: error.stack,
      ...(error.response?.data && { response: error.response.data })
    });
    
    const status = error.status || 500;
    const message = error.message || 'Payment verification failed';
    
    res.status(status).json({
      success: false,
      message,
      error: error.error || 'PAYMENT_VERIFICATION_ERROR',
      ...(process.env.NODE_ENV === 'development' && { details: error })
    });
  }
};

module.exports = {
  createOrder,
  verifyPayment
};
