const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const CopingProfile = require('../models/CopingProfile');
const CopingFeedback = require('../models/CopingFeedback');

// Base URL for the Coping Suggestions ML Model
const COPING_API_URL = (process.env.COPING_API_URL || 'https://mindora-1-2tup.onrender.com').replace(/\/$/, '');

const MOODS = ['stress', 'anxiety', 'frustration', 'sadness', 'low_energy', 'overwhelmed', 'loneliness', 'restlessness'];
const TIMES = ['morning', 'afternoon', 'evening', 'night'];

/**
 * Robust JSON forwarder with 45-second timeout for Render free-tier wakeups
 */
async function forwardJson(url, body, res) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 45000); // 45s for cold start

  try {
    const upstream = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(body || {}),
      signal: controller.signal
    });

    const raw = await upstream.text();
    let data;
    try {
      data = raw ? JSON.parse(raw) : {};
    } catch {
      data = { message: 'ML service returned an unreadable response format.' };
    }

    if (!upstream.ok) {
      console.error(`[ML Upstream Error] Status: ${upstream.status} from ${url}`);
      return res.status(upstream.status >= 500 ? 502 : upstream.status).json({
        success: false,
        error: data.error || data.message || 'The ML service could not complete the request.'
      });
    }

    return res.status(200).json({ success: true, ...data });

  } catch (error) {
    const timedOut = error && error.name === 'AbortError';
    console.error(`[ML Fetch Exception] URL: ${url} | Message: ${error.message}`);
    return res.status(502).json({
      success: false,
      error: timedOut
        ? 'ML service wake-up timed out. Please retry in 10-15 seconds.'
        : 'The ML service is temporarily unavailable.'
    });
  } finally {
    clearTimeout(timeout);
  }
}

/* =======================================================
   1. PUBLIC HEALTH CHECKS
   ======================================================= */

// GET /api/ml/coping/health
router.get('/coping/health', async (req, res) => {
  try {
    const response = await fetch(`${COPING_API_URL}/health`);
    const data = await response.json();
    return res.status(200).json({ success: true, mlService: data });
  } catch (err) {
    return res.status(502).json({ success: false, error: 'ML service is asleep or offline.' });
  }
});

/* =======================================================
   2. PROTECTED ROUTES (Requires Bearer Token)
   ======================================================= */
router.use(protect);

// POST /api/ml/coping/recommend
router.post('/coping/recommend', async (req, res) => {
  try {
    const body = req.body || {};
    const { mood, mood_intensity, energy_level, time_of_day, top_n, profile, history } = body;

    // Validate mood
    if (!mood || !MOODS.includes(mood.toLowerCase())) {
      return res.status(400).json({
        success: false,
        error: `Invalid mood. Allowed moods are: ${MOODS.join(', ')}`
      });
    }

    // Build the exact schema required by https://mindora-1-2tup.onrender.com/recommend
    const payload = {
      user_id: req.user?._id?.toString() || undefined,
      mood: mood.toLowerCase(),
      mood_intensity: Number.isInteger(Number(mood_intensity)) ? Math.min(Math.max(Number(mood_intensity), 1), 5) : 3,
      energy_level: Number.isInteger(Number(energy_level)) ? Math.min(Math.max(Number(energy_level), 1), 5) : 3,
      time_of_day: TIMES.includes(time_of_day?.toLowerCase()) ? time_of_day.toLowerCase() : 'evening',
      top_n: Number.isInteger(Number(top_n)) ? Math.min(Math.max(Number(top_n), 1), 10) : 3,
      ...(profile ? { profile } : {}),
      ...(history ? { history } : {})
    };

    return forwardJson(`${COPING_API_URL}/recommend`, payload, res);
  } catch (error) {
    return res.status(500).json({ success: false, error: 'Internal error processing recommendation payload.' });
  }
});

// GET /api/ml/coping/profile
router.get('/coping/profile', async (req, res) => {
  try {
    const profile = await CopingProfile.findOne({ user: req.user._id }).lean();
    return res.json({ success: true, profile });
  } catch (error) {
    return res.status(500).json({ success: false, error: 'Could not load coping profile.' });
  }
});

// PUT /api/ml/coping/profile
router.put('/coping/profile', async (req, res) => {
  try {
    const body = req.body || {};
    const required = ['age_group', 'experience_level', 'pref_category_1', 'pref_category_2', 'max_duration_pref', 'usual_energy'];
    const missing = required.filter((key) => body[key] === undefined || body[key] === null || body[key] === '');
    
    if (missing.length) return res.status(400).json({ success: false, error: `Missing fields: ${missing.join(', ')}` });
    if (body.pref_category_1 === body.pref_category_2) {
      return res.status(400).json({ success: false, error: 'Choose two different activity categories.' });
    }

    const profile = await CopingProfile.findOneAndUpdate(
      { user: req.user._id },
      {
        user: req.user._id,
        age_group: body.age_group,
        experience_level: body.experience_level,
        pref_category_1: body.pref_category_1,
        pref_category_2: body.pref_category_2,
        max_duration_pref: Number(body.max_duration_pref),
        usual_energy: Number(body.usual_energy)
      },
      { upsert: true, new: true, runValidators: true, setDefaultsOnInsert: true }
    );
    return res.json({ success: true, profile });
  } catch (error) {
    return res.status(400).json({ success: false, error: error.message });
  }
});

// POST /api/ml/coping/feedback
router.post('/coping/feedback', async (req, res) => {
  try {
    const { activity_id, action, rating } = req.body || {};
    if (!activity_id || !['completed', 'dropped', 'skipped'].includes(action)) {
      return res.status(400).json({ success: false, error: 'activity_id and a valid action are required.' });
    }
    const parsedRating = rating === undefined || rating === null || rating === '' ? undefined : Number(rating);
    if (action === 'completed' && (!Number.isInteger(parsedRating) || parsedRating < 1 || parsedRating > 5)) {
      return res.status(400).json({ success: false, error: 'Rating 1-5 is required for completed activities.' });
    }

    const feedback = await CopingFeedback.create({
      user: req.user._id,
      activity_id: String(activity_id).slice(0, 200),
      action,
      ...(parsedRating !== undefined ? { rating: parsedRating } : {})
    });

    return res.status(201).json({ success: true, feedback });
  } catch (error) {
    return res.status(500).json({ success: false, error: 'Could not save feedback.' });
  }
});

/* =======================================================
   3. SAFETY WRAPPERS FOR OLD / OTHER ML PATHS
   ======================================================= */
// POST /api/ml/emotion/chat
router.post('/emotion/chat', async (req, res) => {
  const { message } = req.body || {};
  return res.status(200).json({
    success: true,
    reply: "I am here with you. Take a gentle breath. If you are feeling overwhelmed, you can request coping recommendations tailored for you.",
    receivedMessage: message || ""
  });
});

// POST /api/ml/emotion/analyze
router.post('/emotion/analyze', async (req, res) => {
  return res.status(200).json({
    success: true,
    sentiment: "neutral",
    detectedMood: "stress"
  });
});

module.exports = router;