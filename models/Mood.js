const mongoose = require('mongoose');

const moodSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  date: { type: String, required: true, match: /^\d{4}-\d{2}-\d{2}$/ },
  mood: { type: String, required: true, enum: ['terrible', 'bad', 'neutral', 'good', 'rad'] },
  intensity: { type: Number, min: 1, max: 5, default: 3 },
  note: { type: String, default: '' },
  tags: [{ type: String, trim: true }]
}, { timestamps: true });

moodSchema.index({ user: 1, date: 1 }, { unique: true });
module.exports = mongoose.model('Mood', moodSchema);