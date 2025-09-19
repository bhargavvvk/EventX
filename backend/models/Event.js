const mongoose = require('mongoose');

const EventSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  hostedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Club',
    required: true
  },
  description: {
    type: String,
    required: true
  },
  longDescription: {
    type: String,
    required: true
  },
  dateTime: {
    type: Date,
    required: true
  },
  location: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true
  },
  posterUrl: {
    type: String,
    required: true
  },
  posterPublicId: {
    type: String,
    required: true,
  },
  fileHash: {
    type: String,
    required: false, // Optional for backward compatibility
    index: true // Index for faster duplicate detection queries
  },
  coordinators: [
    {
      name: String,
      contact: String,
    }
  ]
}, { timestamps: true });

module.exports = mongoose.model('Event', EventSchema);
