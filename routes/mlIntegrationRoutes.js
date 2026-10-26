const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');

// Base URL for Coping Suggestions ML Model
const COPING_API_URL = (process.env.COPING_API_URL || 'https://mindora-1-2tup.onrender.com').replace(/\/$/, '');

const MOODS = ['stress', 'anxiety', 'frustration', 'sadness', 'low_energy', 'overwhelmed', 'loneliness', 'restlessness'];
const TIMES = ['morning', 'afternoon', 'evening', 'night'];

/**
 * Robust JSON forwarder with 45-second timeout for Render free-tier cold starts
 */
async function forwardJson(url, body, res) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 45000);

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
   2. PROTECTED RECOMMENDATION ROUTE
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

    // Build the exact payload schema for the ML model
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

/* =======================================================
   3. SAFETY WRAPPERS
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