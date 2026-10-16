const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, sparse: true, unique: true, lowercase: true, trim: true },
  password: { type: String, select: false },
  authProvider: { type: String, enum: ['guest', 'google', 'otp', 'password', 'local'], default: 'local' },
  isVerified: { type: Boolean, default: false },
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
