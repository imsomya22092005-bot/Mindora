const mongoose = require('mongoose');

const copingFeedbackSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  activity_id: { type: String, required: true },
  action: { type: String, enum: ['completed', 'dropped', 'skipped'], required: true },
  rating: { type: Number, min: 1, max: 5 },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.models.CopingFeedback || mongoose.model('CopingFeedback', copingFeedbackSchema);