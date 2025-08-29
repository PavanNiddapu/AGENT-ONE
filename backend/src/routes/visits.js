const express = require('express');
const visitController = require('../controllers/visitController');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

// All visit routes require authentication
router.use(authMiddleware);

// Visit CRUD operations
router.get('/', visitController.getVisits.bind(visitController));
router.post('/', visitController.createVisit.bind(visitController));
router.get('/:id', visitController.getVisit.bind(visitController));
router.put('/:id', visitController.updateVisit.bind(visitController));
router.delete('/:id', visitController.deleteVisit.bind(visitController));

module.exports = router;