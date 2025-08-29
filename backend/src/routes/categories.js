const express = require('express');
const authMiddleware = require('../middleware/auth');

const router = express.Router();
router.use(authMiddleware);

// Categories routes (placeholder for now)
router.get('/', (req, res) => {
  res.json({ categories: [] });
});

module.exports = router;