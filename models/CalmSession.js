const mongoose = require('mongoose');

const calmSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  activityType: { type: String, enum: ['box-breathing', '4-7-8', 'grounding-54321', 'body-scan'], required: true },
  durationSeconds: { type: Number, required: true },
  soundscape: { type: String, default: 'none', trim: true },
  reflectionNote: { type: String, trim: true, maxlength: 300, default: '' },
  completedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('CalmSession', calmSchema);