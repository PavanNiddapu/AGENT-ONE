const express = require('express');
const authMiddleware = require('../middleware/auth');

const router = express.Router();
router.use(authMiddleware);

// Visits routes (placeholder for now)
router.get('/', (req, res) => {
  res.json({ visits: [] });
});

module.exports = router;