const express = require('express');
const router = express.Router();
const movementPractices = require('../data/movementData');

router.get('/', (req, res) => {
  const cards = movementPractices.map(({ steps, ...card }) => card);
  res.status(200).json({ success: true, data: cards });
});

router.get('/:slug', (req, res) => {
  const practice = movementPractices.find(p => p.slug === req.params.slug);
  
  if (!practice) {
    return res.status(404).json({ success: false, error: 'Practice not found' });
  }

  res.status(200).json({
    success: true,
    data: {
      ...practice,
      totalSteps: practice.steps.length
    }
  });
});

module.exports = router;