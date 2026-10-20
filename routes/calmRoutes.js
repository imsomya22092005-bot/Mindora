const express = require('express');
const router = express.Router();
const { logSession, getStats, getHistory } = require('../controllers/calmController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.post('/session', logSession);
router.get('/stats', getStats);
router.get('/history', getHistory);

module.exports = router;