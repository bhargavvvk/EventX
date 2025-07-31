const mongoose = require('mongoose');

const clubSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: String,
  logo: String
}, { timestamps: true });

module.exports = mongoose.model('Club', clubSchema); 