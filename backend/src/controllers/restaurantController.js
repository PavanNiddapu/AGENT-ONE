const Joi = require('joi');
const database = require('../config/database');

// Validation schemas
const restaurantSchema = Joi.object({
  name: Joi.string().max(100).required(),
  cuisineType: Joi.string().max(50).optional(),
  address: Joi.string().optional(),
  city: Joi.string().max(50).optional(),
  state: Joi.string().max(50).optional(),
  zipCode: Joi.string().max(10).optional(),
  phone: Joi.string().max(20).optional(),
  website: Joi.string().uri().optional(),
  operatingHours: Joi.object().optional()
});

class RestaurantController {
  async createRestaurant(req, res) {
    try {
      const { error, value } = restaurantSchema.validate(req.body);
      if (error) {
        return res.status(400).json({ error: error.details[0].message });
      }

      const {
        name, cuisineType, address, city, state, zipCode,
        phone, website, operatingHours
      } = value;

      const db = database.getDb();

      const restaurantId = await new Promise((resolve, reject) => {
        db.run(
          `INSERT INTO restaurants (
            name, cuisine_type, address, city, state, zip_code,
            phone, website, operating_hours
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            name, cuisineType, address, city, state, zipCode,
            phone, website, operatingHours ? JSON.stringify(operatingHours) : null
          ],
          function(err) {
            if (err) reject(err);
            else resolve(this.lastID);
          }
        );
      });

      const restaurant = await this.getRestaurantById(restaurantId);
      
      res.status(201).json({
        message: 'Restaurant created successfully',
        restaurant
      });
    } catch (error) {
      console.error('Create restaurant error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  async getRestaurants(req, res) {
    try {
      const { 
        page = 1, 
        limit = 10, 
        search, 
        cuisineType, 
        city, 
        minRating,
        sortBy = 'name',
        sortOrder = 'ASC'
      } = req.query;

      const offset = (page - 1) * limit;
      const db = database.getDb();

      // Build WHERE clause
      let whereClause = '1 = 1';
      const params = [];

      if (search) {
        whereClause += ' AND (name LIKE ? OR address LIKE ?)';
        params.push(`%${search}%`, `%${search}%`);
      }

      if (cuisineType) {
        whereClause += ' AND cuisine_type = ?';
        params.push(cuisineType);
      }

      if (city) {
        whereClause += ' AND city = ?';
        params.push(city);
      }

      if (minRating) {
        whereClause += ' AND avg_rating >= ?';
        params.push(parseFloat(minRating));
      }

      // Validate sort parameters
      const validSortColumns = ['name', 'avg_rating', 'total_reviews', 'created_at'];
      const validSortOrders = ['ASC', 'DESC'];
      
      const sortColumn = validSortColumns.includes(sortBy) ? sortBy : 'name';
      const sortDirection = validSortOrders.includes(sortOrder.toUpperCase()) ? sortOrder.toUpperCase() : 'ASC';

      const query = `
        SELECT * FROM restaurants 
        WHERE ${whereClause}
        ORDER BY ${sortColumn} ${sortDirection}
        LIMIT ? OFFSET ?
      `;

      params.push(parseInt(limit), parseInt(offset));

      const restaurants = await new Promise((resolve, reject) => {
        db.all(query, params, (err, rows) => {
          if (err) reject(err);
          else resolve(rows);
        });
      });

      // Get total count for pagination
      const countQuery = `SELECT COUNT(*) as total FROM restaurants WHERE ${whereClause}`;
      const countParams = params.slice(0, -2); // Remove limit and offset

      const totalCount = await new Promise((resolve, reject) => {
        db.get(countQuery, countParams, (err, row) => {
          if (err) reject(err);
          else resolve(row.total);
        });
      });

      // Format restaurants
      const formattedRestaurants = restaurants.map(restaurant => ({
        ...restaurant,
        operating_hours: restaurant.operating_hours ? JSON.parse(restaurant.operating_hours) : null
      }));

      res.json({
        restaurants: formattedRestaurants,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(totalCount / limit),
          totalCount,
          hasNext: offset + restaurants.length < totalCount,
          hasPrev: page > 1
        }
      });
    } catch (error) {
      console.error('Get restaurants error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  async getRestaurantById(id) {
    const db = database.getDb();
    
    return new Promise((resolve, reject) => {
      db.get('SELECT * FROM restaurants WHERE id = ?', [id], (err, row) => {
        if (err) reject(err);
        else if (row) {
          resolve({
            ...row,
            operating_hours: row.operating_hours ? JSON.parse(row.operating_hours) : null
          });
        } else {
          resolve(null);
        }
      });
    });
  }

  async getRestaurant(req, res) {
    try {
      const { id } = req.params;
      const restaurant = await this.getRestaurantById(id);

      if (!restaurant) {
        return res.status(404).json({ error: 'Restaurant not found' });
      }

      res.json({ restaurant });
    } catch (error) {
      console.error('Get restaurant error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  async updateRestaurant(req, res) {
    try {
      const { id } = req.params;
      const { error, value } = restaurantSchema.validate(req.body);
      
      if (error) {
        return res.status(400).json({ error: error.details[0].message });
      }

      const restaurant = await this.getRestaurantById(id);
      if (!restaurant) {
        return res.status(404).json({ error: 'Restaurant not found' });
      }

      const {
        name, cuisineType, address, city, state, zipCode,
        phone, website, operatingHours
      } = value;

      const db = database.getDb();

      await new Promise((resolve, reject) => {
        db.run(
          `UPDATE restaurants SET 
           name = ?, cuisine_type = ?, address = ?, city = ?, state = ?, 
           zip_code = ?, phone = ?, website = ?, operating_hours = ?,
           updated_at = CURRENT_TIMESTAMP
           WHERE id = ?`,
          [
            name, cuisineType, address, city, state, zipCode,
            phone, website, operatingHours ? JSON.stringify(operatingHours) : null, id
          ],
          (err) => {
            if (err) reject(err);
            else resolve();
          }
        );
      });

      const updatedRestaurant = await this.getRestaurantById(id);
      
      res.json({
        message: 'Restaurant updated successfully',
        restaurant: updatedRestaurant
      });
    } catch (error) {
      console.error('Update restaurant error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  async deleteRestaurant(req, res) {
    try {
      const { id } = req.params;
      const db = database.getDb();

      const restaurant = await this.getRestaurantById(id);
      if (!restaurant) {
        return res.status(404).json({ error: 'Restaurant not found' });
      }

      await new Promise((resolve, reject) => {
        db.run('DELETE FROM restaurants WHERE id = ?', [id], (err) => {
          if (err) reject(err);
          else resolve();
        });
      });

      res.json({ message: 'Restaurant deleted successfully' });
    } catch (error) {
      console.error('Delete restaurant error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  async getCuisineTypes(req, res) {
    try {
      const db = database.getDb();
      
      const cuisineTypes = await new Promise((resolve, reject) => {
        db.all(
          'SELECT DISTINCT cuisine_type FROM restaurants WHERE cuisine_type IS NOT NULL ORDER BY cuisine_type',
          (err, rows) => {
            if (err) reject(err);
            else resolve(rows.map(row => row.cuisine_type));
          }
        );
      });

      res.json({ cuisineTypes });
    } catch (error) {
      console.error('Get cuisine types error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
}

module.exports = new RestaurantController();