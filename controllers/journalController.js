const JournalEntry = require('../models/JournalEntry');

// GET /api/journal -> Fetch entries
exports.getJournalEntries = async (req, res) => {
  try {
    const userId = req.user?._id || req.user?.id;
    const entries = await JournalEntry.find({ user: userId })
      .sort({ createdAt: -1 })
      .lean();

    return res.status(200).json({ success: true, count: entries.length, data: entries });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
};

// POST /api/journal -> Save new entry
exports.createJournalEntry = async (req, res) => {
  try {
    const userId = req.user?._id || req.user?.id;
    const { title, content, category, dateText } = req.body;

    if (!content || !content.trim()) {
      return res.status(400).json({ success: false, error: 'Content is required' });
    }

    const entry = await JournalEntry.create({
      user: userId,
      title: title?.trim() || 'A page from today',
      content: content.trim(),
      category: category || 'daily reflection / diary',
      dateText: dateText || new Date().toLocaleDateString('en-GB', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
      }),
    });

    return res.status(201).json({ success: true, data: entry });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
};

// DELETE /api/journal/:id -> Delete entry (for the trash icon on the card)
exports.deleteJournalEntry = async (req, res) => {
  try {
    const userId = req.user?._id || req.user?.id;
    const entry = await JournalEntry.findOneAndDelete({ _id: req.params.id, user: userId });

    if (!entry) {
      return res.status(404).json({ success: false, error: 'Entry not found' });
    }

    return res.status(200).json({ success: true, message: 'Deleted successfully' });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
};