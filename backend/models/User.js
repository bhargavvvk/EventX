const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
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

const bcrypt = require("bcryptjs");

userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};


module.exports = mongoose.model('User', userSchema);
