const database = require('../config/database');
const Joi = require('joi');

class RestaurantController {
  // Validation schema
  restaurantSchema = Joi.object({
    name: Joi.string().max(100).required(),
    cuisine_type: Joi.string().max(50).optional(),
    address: Joi.string().max(255).optional(),
    city: Joi.string().max(50).optional(),
    state: Joi.string().max(50).optional(),
    zip_code: Joi.string().max(10).optional(),
    phone: Joi.string().max(20).optional(),
    website: Joi.string().uri().max(255).optional(),
    operating_hours: Joi.string().max(500).optional()
  });

  // Get all restaurants
  async getRestaurants(req, res) {
    try {
      const db = database.getDb();
      
      const sql = `
        SELECT * FROM restaurants
        ORDER BY name ASC
      `;

      db.all(sql, [], (err, restaurants) => {
        if (err) {
          console.error('Error fetching restaurants:', err);
          return res.status(500).json({ error: 'Failed to fetch restaurants' });
        }

        res.json({ restaurants: restaurants || [] });
      });
    } catch (error) {
      console.error('Error in getRestaurants:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Get a specific restaurant
  async getRestaurant(req, res) {
    try {
      const db = database.getDb();
      const restaurantId = req.params.id;

      const sql = 'SELECT * FROM restaurants WHERE id = ?';

      db.get(sql, [restaurantId], (err, restaurant) => {
        if (err) {
          console.error('Error fetching restaurant:', err);
          return res.status(500).json({ error: 'Failed to fetch restaurant' });
        }

        if (!restaurant) {
          return res.status(404).json({ error: 'Restaurant not found' });
        }

        res.json({ restaurant });
      });
    } catch (error) {
      console.error('Error in getRestaurant:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Create a new restaurant
  async createRestaurant(req, res) {
    try {
      // Validate request body
      const { error, value } = this.restaurantSchema.validate(req.body);
      if (error) {
        return res.status(400).json({ 
          error: 'Validation failed', 
          details: error.details.map(d => d.message) 
        });
      }

      const db = database.getDb();

      const insertSql = `
        INSERT INTO restaurants (
          name, cuisine_type, address, city, state, zip_code,
          phone, website, operating_hours
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;

      const values = [
        value.name,
        value.cuisine_type || null,
        value.address || null,
        value.city || null,
        value.state || null,
        value.zip_code || null,
        value.phone || null,
        value.website || null,
        value.operating_hours || null
      ];

      db.run(insertSql, values, function(err) {
        if (err) {
          console.error('Error creating restaurant:', err);
          return res.status(500).json({ error: 'Failed to create restaurant' });
        }

        res.status(201).json({
          message: 'Restaurant created successfully',
          restaurantId: this.lastID
        });
      });
    } catch (error) {
      console.error('Error in createRestaurant:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Get cuisine types
  async getCuisineTypes(req, res) {
    try {
      const db = database.getDb();
      
      const sql = `
        SELECT name FROM categories 
        WHERE type = 'cuisine'
        ORDER BY name ASC
      `;

      db.all(sql, [], (err, cuisines) => {
        if (err) {
          console.error('Error fetching cuisine types:', err);
          return res.status(500).json({ error: 'Failed to fetch cuisine types' });
        }

        const cuisineTypes = cuisines.map(c => c.name);
        res.json({ cuisineTypes });
      });
    } catch (error) {
      console.error('Error in getCuisineTypes:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Update a restaurant
  async updateRestaurant(req, res) {
    try {
      const restaurantId = req.params.id;

      // Validate request body
      const { error, value } = this.restaurantSchema.validate(req.body);
      if (error) {
        return res.status(400).json({ 
          error: 'Validation failed', 
          details: error.details.map(d => d.message) 
        });
      }

      const db = database.getDb();

      // Check if restaurant exists
      const checkSql = 'SELECT id FROM restaurants WHERE id = ?';
      db.get(checkSql, [restaurantId], (err, restaurant) => {
        if (err) {
          console.error('Error checking restaurant:', err);
          return res.status(500).json({ error: 'Failed to verify restaurant' });
        }

        if (!restaurant) {
          return res.status(404).json({ error: 'Restaurant not found' });
        }

        const updateSql = `
          UPDATE restaurants SET
            name = ?, cuisine_type = ?, address = ?, city = ?, state = ?,
            zip_code = ?, phone = ?, website = ?, operating_hours = ?,
            updated_at = CURRENT_TIMESTAMP
          WHERE id = ?
        `;

        const values = [
          value.name,
          value.cuisine_type || null,
          value.address || null,
          value.city || null,
          value.state || null,
          value.zip_code || null,
          value.phone || null,
          value.website || null,
          value.operating_hours || null,
          restaurantId
        ];

        db.run(updateSql, values, (err) => {
          if (err) {
            console.error('Error updating restaurant:', err);
            return res.status(500).json({ error: 'Failed to update restaurant' });
          }

          res.json({ message: 'Restaurant updated successfully' });
        });
      });
    } catch (error) {
      console.error('Error in updateRestaurant:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Delete a restaurant
  async deleteRestaurant(req, res) {
    try {
      const restaurantId = req.params.id;
      const db = database.getDb();

      // Check if restaurant exists
      const checkSql = 'SELECT id FROM restaurants WHERE id = ?';
      db.get(checkSql, [restaurantId], (err, restaurant) => {
        if (err) {
          console.error('Error checking restaurant:', err);
          return res.status(500).json({ error: 'Failed to verify restaurant' });
        }

        if (!restaurant) {
          return res.status(404).json({ error: 'Restaurant not found' });
        }

        // Delete the restaurant
        const deleteSql = 'DELETE FROM restaurants WHERE id = ?';
        db.run(deleteSql, [restaurantId], (err) => {
          if (err) {
            console.error('Error deleting restaurant:', err);
            return res.status(500).json({ error: 'Failed to delete restaurant' });
          }

          res.json({ message: 'Restaurant deleted successfully' });
        });
      });
    } catch (error) {
      console.error('Error in deleteRestaurant:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
}

module.exports = new RestaurantController();