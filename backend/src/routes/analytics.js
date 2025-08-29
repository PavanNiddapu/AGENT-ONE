const express = require('express');
const authMiddleware = require('../middleware/auth');

const router = express.Router();
router.use(authMiddleware);

// Analytics routes (placeholder for now)
router.get('/', (req, res) => {
  res.json({ analytics: [] });
});

module.exports = router;