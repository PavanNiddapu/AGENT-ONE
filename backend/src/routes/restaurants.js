const express = require('express');
const restaurantController = require('../controllers/restaurantController');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

// All restaurant routes require authentication
router.use(authMiddleware);

// Restaurant CRUD operations
router.post('/', restaurantController.createRestaurant.bind(restaurantController));
router.get('/', restaurantController.getRestaurants.bind(restaurantController));
router.get('/cuisine-types', restaurantController.getCuisineTypes.bind(restaurantController));
router.get('/:id', restaurantController.getRestaurant.bind(restaurantController));
router.put('/:id', restaurantController.updateRestaurant.bind(restaurantController));
router.delete('/:id', restaurantController.deleteRestaurant.bind(restaurantController));

module.exports = router;