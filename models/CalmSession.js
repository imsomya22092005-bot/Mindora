const mongoose = require('mongoose');

const calmSessionSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  activityType: { type: String, required: true, enum: ['box-breathing'] },
  durationMinutes: { type: Number, required: true, min: 1, max: 240 },
  soundscape: { type: String, default: 'none', maxlength: 80 }
}, { timestamps: true });

module.exports = mongoose.model('CalmSession', calmSessionSchema);
