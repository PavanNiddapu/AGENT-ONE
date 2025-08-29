const express = require('express');
const authMiddleware = require('../middleware/auth');

const router = express.Router();
router.use(authMiddleware);

// Food items routes (placeholder for now)
router.get('/', (req, res) => {
  res.json({ foodItems: [] });
});

module.exports = router;