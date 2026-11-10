const express = require('express');
const router = express.Router();
const CopingFeedback = require('../models/CopingFeedback');
const { protect } = require('../middleware/auth');

// Base URLs for ML Services
const EMOTION_API_URL = (process.env.EMOTION_API_URL || 'https://mindora-82go.onrender.com').replace(/\/$/, '');
const COPING_API_URL = (process.env.COPING_API_URL || 'https://mindora-1-2tup.onrender.com').replace(/\/$/, '');
const SLEEP_API_URL = (process.env.SLEEP_API_URL || 'https://sleepsync-cq8v.onrender.com').replace(/\/$/, '');
const STRESS_API_URL = (process.env.STRESS_API_URL || 'https://academic-stress-pattern-predictor3.onrender.com').replace(/\/$/, '');
const MINDCHECK_API_URL = (process.env.MINDCHECK_API_URL || 'https://mindcheck-api.onrender.com').replace(/\/$/, '');

const MOODS = ['stress', 'anxiety', 'frustration', 'sadness', 'low_energy', 'overwhelmed', 'loneliness', 'restlessness'];
const TIMES = ['morning', 'afternoon', 'evening', 'night'];

async function forwardJson(url, body, res, apiKey = null) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 60000);

  try {
    const headers = {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    };
    if (apiKey) headers['X-API-Key'] = apiKey;

    const upstream = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify(body || {}),
      signal: controller.signal
    });

    const raw = await upstream.text();
    let data;
    try {
      data = raw ? JSON.parse(raw) : {};
    } catch {
      data = { message: 'ML service returned non-JSON response.' };
    }

    if (!upstream.ok) {
      console.error(`[ML Error] ${upstream.status} from ${url}`);
      return res.status(upstream.status >= 500 ? 502 : upstream.status).json({
        success: false,
        error: data.error || data.message || 'ML upstream service error.'
      });
    }

    return res.status(200).json({ success: true, ...data });

  } catch (error) {
    const timedOut = error && error.name === 'AbortError';
    console.error(`[ML Forward Failure] URL: ${url} | ${error.message}`);
    return res.status(502).json({
      success: false,
      error: timedOut
        ? 'ML service wake-up timed out. Free-tier instance might still be booting up.'
        : 'ML service is temporarily unavailable.'
    });
  } finally {
    clearTimeout(timeout);
  }
}

/* =======================================================
   1. PUBLIC HEALTH CHECKS
   ======================================================= */

router.get('/emotion/health', async (req, res) => {
  try {
    const response = await fetch(`${EMOTION_API_URL}/health`);
    const data = await response.json();
    return res.status(200).json({ success: true, emotionML: data });
  } catch (err) {
    return res.status(502).json({ success: false, error: 'Emotion ML service is offline or sleeping.' });
  }
});

router.get('/coping/health', async (req, res) => {
  try {
    const response = await fetch(`${COPING_API_URL}/health`);
    const data = await response.json();
    return res.status(200).json({ success: true, copingML: data });
  } catch (err) {
    return res.status(502).json({ success: false, error: 'Coping ML service is offline or sleeping.' });
  }
});

router.get('/sleep/health', async (req, res) => {
  try {
    const response = await fetch(`${SLEEP_API_URL}/health`);
    const data = await response.json();
    return res.status(200).json({ success: true, sleepML: data });
  } catch (err) {
    return res.status(502).json({ success: false, error: 'SleepSync ML service is offline or sleeping.' });
  }
});

router.get('/stress/health', async (req, res) => {
  try {
    const response = await fetch(`${STRESS_API_URL}/health`);
    const data = await response.json();
    return res.status(200).json({ success: true, stressML: data });
  } catch (err) {
    return res.status(502).json({ success: false, error: 'Stress ML service is offline or sleeping.' });
  }
});

router.get('/mindcheck/health', async (req, res) => {
  try {
    const response = await fetch(`${MINDCHECK_API_URL}/health`);
    const data = await response.json();
    return res.status(200).json({ success: true, mindcheckML: data });
  } catch (err) {
    return res.status(502).json({ success: false, error: 'MindCheck ML service is offline or sleeping.' });
  }
});

/* =======================================================
   2. PROTECTED ROUTES (JWT Required)
   ======================================================= */
router.use(protect);

router.post('/coping/recommend', async (req, res) => {
  try {
    const body = req.body || {};
    const { mood, mood_intensity, energy_level, time_of_day, top_n, profile, history } = body;

    if (!mood || !MOODS.includes(mood.toLowerCase())) {
      return res.status(400).json({
        success: false,
        error: `Invalid mood. Allowed moods: ${MOODS.join(', ')}`
      });
    }

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
    return res.status(500).json({ success: false, error: 'Failed to process recommendation.' });
  }
});

router.post('/coping/feedback', async (req, res) => {
  try {
    const body = req.body || {};
    const { activity_id, action, rating, helpful, feedback_type } = body;

    if (!activity_id) {
      return res.status(400).json({ success: false, error: 'activity_id is required.' });
    }

    let finalAction = action || 'completed';
    let finalRating = rating ? Number(rating) : undefined;

    if (helpful === true || feedback_type === 'thumbs_up' || action === 'helpful') {
      finalAction = 'completed';
      finalRating = finalRating || 5;
    } else if (helpful === false || feedback_type === 'thumbs_down' || action === 'not_helpful') {
      finalAction = 'dropped';
      finalRating = finalRating || 1;
    }

    const feedback = await CopingFeedback.create({
      user: req.user?._id,
      activity_id: String(activity_id).slice(0, 200),
      action: finalAction,
      ...(finalRating !== undefined ? { rating: finalRating } : {})
    });

    return res.status(201).json({
      success: true,
      message: 'Feedback recorded successfully',
      feedback: {
        id: feedback._id,
        activity_id: feedback.activity_id,
        action: feedback.action,
        rating: feedback.rating,
        createdAt: feedback.createdAt
      }
    });
  } catch (error) {
    console.error('[Feedback Error]:', error.message);
    return res.status(500).json({ success: false, error: 'Could not record activity feedback.' });
  }
});

router.post('/emotion/chat', async (req, res) => {
  const { message } = req.body || {};
  if (!message || typeof message !== 'string') {
    return res.status(400).json({ success: false, error: 'message string field is required.' });
  }
  return forwardJson(`${EMOTION_API_URL}/chat`, req.body, res);
});

router.post('/emotion/analyze', async (req, res) => {
  return forwardJson(`${EMOTION_API_URL}/analyze`, req.body, res);
});

router.post('/emotion/reset', async (req, res) => {
  return forwardJson(`${EMOTION_API_URL}/reset`, req.body, res);
});


// sleepSync routes

router.get('/sleep/questions', async (req, res) => {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 60000);

  try {
    const response = await fetch(`${SLEEP_API_URL}/questions`, {
      signal: controller.signal
    });
    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({
        success: false,
        error: data.error || data.message || 'Failed to fetch SleepSync questions.'
      });
    }

    return res.status(200).json({ success: true, ...data });
  } catch (err) {
    const timedOut = err && err.name === 'AbortError';
    return res.status(502).json({
      success: false,
      error: timedOut
        ? 'SleepSync service wake-up timed out.'
        : 'SleepSync service is temporarily unavailable.'
    });
  } finally {
    clearTimeout(timeout);
  }
});

router.post('/sleep/predict', async (req, res) => {
  const body = req.body;
  if (!body || typeof body !== 'object' || Object.keys(body).length === 0) {
    return res.status(400).json({
      success: false,
      error: 'Request body with all 15 SleepSync input fields is required.'
    });
  }

  return forwardJson(`${SLEEP_API_URL}/predict`, body, res);
});


// Academic stress routes

router.get('/stress/features', async (req, res) => {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 60000);

  try {
    const response = await fetch(`${STRESS_API_URL}/api/features`, {
      signal: controller.signal
    });
    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({
        success: false,
        error: data.error || data.message || 'Failed to fetch stress model features.'
      });
    }

    return res.status(200).json({ success: true, ...data });
  } catch (err) {
    const timedOut = err && err.name === 'AbortError';
    return res.status(502).json({
      success: false,
      error: timedOut
        ? 'Stress ML service wake-up timed out.'
        : 'Stress ML service is temporarily unavailable.'
    });
  } finally {
    clearTimeout(timeout);
  }
});

router.post('/stress/predict', async (req, res) => {
  const body = req.body;
  if (!body || typeof body !== 'object' || Object.keys(body).length === 0) {
    return res.status(400).json({
      success: false,
      error: 'Request body with all 16 input features is required.'
    });
  }

  // Strip deprecated fields from the older 20-feature version if sent by mistake
  const {
    anxiety_level,
    self_esteem,
    depression,
    mental_health_history,
    ...cleanPayload
  } = body;

  return forwardJson(`${STRESS_API_URL}/api/predict`, cleanPayload, res);
});


// Mindcheck routes

router.post('/mindcheck/score', async (req, res) => {
  const { phq9_answers, gad7_answers } = req.body || {};

  if (!Array.isArray(phq9_answers) || phq9_answers.length !== 9) {
    return res.status(400).json({
      success: false,
      error: 'phq9_answers must be an array of exactly 9 integers (0-3).'
    });
  }

  if (!Array.isArray(gad7_answers) || gad7_answers.length !== 7) {
    return res.status(400).json({
      success: false,
      error: 'gad7_answers must be an array of exactly 7 integers (0-3).'
    });
  }

  return forwardJson(`${MINDCHECK_API_URL}/api/score`, { phq9_answers, gad7_answers }, res);
});

router.post('/mindcheck/predict', async (req, res) => {
  const body = req.body;
  if (!body || typeof body !== 'object' || Object.keys(body).length === 0) {
    return res.status(400).json({
      success: false,
      error: 'Request body with isi_answers, pss_answers, and demographic fields is required.'
    });
  }

  return forwardJson(`${MINDCHECK_API_URL}/api/predict`, body, res);
});

router.post('/mindcheck/screen', async (req, res) => {
  const { phq9_answers, gad7_answers } = req.body || {};

  if (!Array.isArray(phq9_answers) || phq9_answers.length !== 9 || !Array.isArray(gad7_answers) || gad7_answers.length !== 7) {
    return res.status(400).json({
      success: false,
      error: 'Valid phq9_answers (9 items) and gad7_answers (7 items) arrays are required.'
    });
  }

  return forwardJson(`${MINDCHECK_API_URL}/api/screen`, req.body, res);
});

module.exports = router;