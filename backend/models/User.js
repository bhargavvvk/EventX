const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true
  },
  role: {
    type: String,
    enum: ['user', 'club-admin'],
    default: 'user'
  },
  club: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Club',
    required: function () {
      return this.role === 'club-admin';
    }
  }
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
