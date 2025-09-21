const Booking = require('../models/Booking');

// Generate a unique booking ID
const generateBookingId = () => {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 8);
  return `BK${timestamp}${random}`.toUpperCase();
};

// Check for duplicate bookings
const checkForDuplicateBookings = async (eventId, userId, rollNumber) => {
  const [existingUserBooking, existingRollBooking] = await Promise.all([
    Booking.findOne({ eventId, userId }),
    Booking.findOne({ eventId, rollNumber })
  ]);

  if (existingUserBooking) {
    throw { 
      status: 409, 
      message: 'You have already booked this event',
      error: 'DUPLICATE_USER_BOOKING'
    };
  }

  if (existingRollBooking) {
    throw {
      status: 409,
      message: 'This roll number has already been used to book this event',
      error: 'DUPLICATE_ROLL_BOOKING'
    };
  }
};

// Create booking record
const createBooking = async ({
  eventId,
  userId,
  bookingData,
  payment = null
}) => {
  const booking = new Booking({
    eventId,
    userId,
    fullName: bookingData.fullName,
    email: bookingData.email,
    phone: bookingData.phone,
    rollNumber: bookingData.rollNumber,
    degree: bookingData.degree,
    college: bookingData.college,
    department: bookingData.department,
    section: bookingData.section,
    year: bookingData.year,
    // For free events, mark as confirmed with no payment needed
    // For paid events, mark as pending payment
    status: payment ? 'pending' : 'confirmed',
    paymentStatus: payment ? 'pending' : 'paid',
    paymentId: payment?.id || null,
    orderId: payment?.orderId || null,
    paymentAmount: payment ? payment.amount / 100 : 0,
    bookingDate: new Date(),
    bookingId: generateBookingId()
  });

  await booking.save();
  return booking;
};

module.exports = {
  generateBookingId,
  checkForDuplicateBookings,
  createBooking
};
