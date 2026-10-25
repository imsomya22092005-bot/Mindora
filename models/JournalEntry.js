const mongoose = require('mongoose');

const journalEntrySchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    title: {
      type: String,
      trim: true,
      default: 'A page from today', 
    },
    content: {
      type: String,
      required: [true, 'Journal content is required'],
      trim: true,
    },
    category: {
      type: String,
      default: 'daily reflection / diary', 
      trim: true,
    },
    dateText: {
      type: String, 
      default: () => {
        return new Date().toLocaleDateString('en-GB', {
          day: 'numeric',
          month: 'short',
          year: 'numeric'
        });
      }
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('JournalEntry', journalEntrySchema);