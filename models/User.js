const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, sparse: true, unique: true, lowercase: true, trim: true },
  authProvider: { type: String, enum: ['guest', 'google', 'otp'], default: 'local' },
  isVerified: { type: Boolean, default: false },
}, { timestamps: true });


module.exports = mongoose.model('User', userSchema);