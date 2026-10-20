const Mood = require('../models/Mood');

exports.saveMoodEntry = async (req, res) => {
  try {
    const { date, mood, intensity, note, tags } = req.body;
    const userId = req.user._id;

    if (!date || !mood) {
      return res.status(400).json({ error: 'Date (YYYY-MM-DD) and mood are required.' });
    }

    date = typeof date === 'string' ? date.trim().split('T')[0] : date;

    const entry = await Mood.findOneAndUpdate(
      { user: userId, date },
      { 
        mood, 
        intensity: intensity || 3, 
        note: note || '', 
        tags: Array.isArray(tags) ? tags : [] 
      },
      { returnDocument: 'after', upsert: true, runValidators: true }
    );

    return res.status(200).json({
      success: true,
      message: 'Mood saved successfully',
      data: entry
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

exports.getMonthMoods = async (req, res) => {
  try {
    const { year, month } = req.query;
    const userId = req.user._id;

    if (!year || !month) {
      return res.status(400).json({ error: 'Year and month are required query parameters (e.g. ?year=2026&month=10)' });
    }

    const formattedMonth = month.toString().padStart(2, '0');
    const regexPattern = `^${year}-${formattedMonth}`;

    const entries = await Mood.find({
      user: userId,
      date: { $regex: regexPattern }
    }).sort({ date: 1 });

    return res.status(200).json({
      success: true,
      count: entries.length,
      data: entries
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

exports.getYearHeatmap = async (req, res) => {
  try {
    const { year = new Date().getFullYear().toString() } = req.query;
    const userId = req.user._id;

    const entries = await Mood.find({
      user: userId,
      date: { $regex: `^${year}` }
    }).select('date mood intensity');

    const heatmap = {};
    entries.forEach((e) => {
      heatmap[e.date] = {
        mood: e.mood,
        intensity: e.intensity
      };
    });

    return res.status(200).json({
      success: true,
      year,
      totalEntries: entries.length,
      data: heatmap
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

exports.deleteMoodEntry = async (req, res) => {
  try {
    const { date } = req.params;
    const userId = req.user._id;

    const deleted = await Mood.findOneAndDelete({ user: userId, date });
    if (!deleted) {
      return res.status(404).json({ error: 'No entry found for this date' });
    }

    return res.status(200).json({
      success: true,
      message: 'Mood entry deleted successfully'
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};