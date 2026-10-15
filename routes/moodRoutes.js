const express = require('express');
const router = express.Router();
const {
  saveMoodEntry,
  getMonthMoods,
  getYearHeatmap,
  deleteMoodEntry
} = require('../controllers/moodController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.post('/entry', saveMoodEntry);
router.get('/calendar', getMonthMoods);
router.get('/heatmap', getYearHeatmap);
router.delete('/entry/:date', deleteMoodEntry);

module.exports = router;