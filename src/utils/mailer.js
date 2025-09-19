const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER, 
    pass: process.env.EMAIL_PASS, 
  },
});

async function sendBookingConfirmationEmail({ to, name, event, bookingId }) {
  const mailOptions = {
    from: '"EventX" <noreply.eventx@gmail.com>',
    to,
    subject: `Booking Confirmation - ${event.title}`,
    html: `
      <h2>Hi ${name},</h2>
      <p>Your booking has been confirmed!</p>
      <p><b>Booking ID:</b> ${bookingId}</p>
      <p><b>Event:</b> ${event.title}</p>
      <p><b>Date & Time:</b> ${new Date(event.dateTime).toLocaleString()}</p>
      <p><b>Location:</b> ${event.location}</p>
      <p><b>Price:</b> ₹${event.price}</p>
      <hr />
      <p>Thank you for registering with EventX!</p>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`Confirmation email sent to ${to}`);
  } catch (error) {
    console.error("Error sending confirmation email:", error);
  }
}

module.exports = { sendBookingConfirmationEmail };
