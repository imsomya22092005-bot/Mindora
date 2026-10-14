const mongoose = require('mongoose');

const burnoutSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null }, // Null for incognito
  sessionId: { type: String, required: true }, // Guest UUID for incognito tracking
  totalScore: { type: Number, required: true },
  burnoutRisk: { type: String, enum: ['Low', 'Moderate', 'High', 'Severe'], required: true },
  categoryScores: {
    exhaustion: Number,
    cynicism: Number,
    inefficacy: Number
  },
  recommendations: [{ type: String }]
}, { timestamps: true });

module.exports = mongoose.model('BurnoutCheckin', burnoutSchema);