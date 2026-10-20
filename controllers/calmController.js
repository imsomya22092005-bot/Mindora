const CalmSession = require('../models/CalmSession');

exports.logSession = async (req, res) => {
  try {
    const { activityType, durationMinutes, soundscape, reflectionNote, completedAt } = req.body;

    if (!activityType || !durationMinutes) {
      return res.status(400).json({
        success: false,
        message: 'activityType and durationMinutes are required.'
      });
    }

    const session = await CalmSession.create({
      userId: req.user._id,
      activityType,
      durationMinutes,
      soundscape: soundscape || 'none',
      reflectionNote: reflectionNote || '',
      completedAt: completedAt || Date.now()
    });

    return res.status(201).json({
      success: true,
      message: 'Session recorded successfully',
      data: session
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Server error saving calm session',
      error: error.message
    });
  }
};

exports.getStats = async (req, res) => {
  try {
    const userId = req.user._id;

    const stats = await CalmSession.aggregate([
      { $match: { userId } },
      {
        $group: {
          _id: '$activityType',
          totalMinutes: { $sum: '$durationMinutes' },
          count: { $sum: 1 }
        }
      }
    ]);

    const totalMinutesOverall = stats.reduce((acc, curr) => acc + curr.totalMinutes, 0);
    const totalSessionsOverall = stats.reduce((acc, curr) => acc + curr.count, 0);

    return res.status(200).json({
      success: true,
      data: {
        totalMinutes: totalMinutesOverall,
        totalSessions: totalSessionsOverall,
        activityBreakdown: stats
      }
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Server error calculating calm stats',
      error: error.message
    });
  }
};

exports.getHistory = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit, 10) || 10;
    const history = await CalmSession.find({ userId: req.user._id })
      .sort({ completedAt: -1 })
      .limit(limit);

    return res.status(200).json({
      success: true,
      count: history.length,
      data: history
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Server error fetching calm history',
      error: error.message
    });
  }
};