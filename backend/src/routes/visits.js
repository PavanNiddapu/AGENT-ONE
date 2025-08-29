const express = require('express');
const authMiddleware = require('../middleware/auth');
const visitController = require('../controllers/visitController');

const router = express.Router();
router.use(authMiddleware);

// Visit routes
router.post('/', visitController.createVisit);
router.get('/', visitController.getVisits);
router.get('/:id', visitController.getVisit);
router.delete('/:id', visitController.deleteVisit);

module.exports = router;