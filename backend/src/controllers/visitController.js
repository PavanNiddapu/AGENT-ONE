const database = require('../config/database');
const Joi = require('joi');

class VisitController {
  // Validation schemas
  visitSchema = Joi.object({
    restaurant_id: Joi.number().integer().required(),
    visit_date: Joi.date().iso().required(),
    occasion: Joi.string().max(50).optional(),
    party_size: Joi.number().integer().min(1).max(50).optional(),
    overall_rating: Joi.number().integer().min(1).max(5).required(),
    service_rating: Joi.number().integer().min(1).max(5).optional(),
    ambiance_rating: Joi.number().integer().min(1).max(5).optional(),
    wait_time: Joi.number().integer().min(0).optional(),
    total_cost: Joi.number().precision(2).min(0).optional(),
    tip_amount: Joi.number().precision(2).min(0).optional(),
    payment_method: Joi.string().max(20).optional(),
    notes: Joi.string().max(1000).optional(),
    would_return: Joi.boolean().optional(),
    food_items: Joi.array().items(Joi.object({
      dish_name: Joi.string().max(100).required(),
      price: Joi.number().precision(2).min(0).optional(),
      rating: Joi.number().integer().min(1).max(5).required(),
      notes: Joi.string().max(500).optional(),
      category: Joi.string().max(50).optional()
    })).optional()
  });

  // Get all visits for the authenticated user
  async getVisits(req, res) {
    try {
      const db = database.getDb();
      const userId = req.user.id;

      const sql = `
        SELECT 
          v.*,
          r.name as restaurant_name,
          r.cuisine_type,
          r.address,
          r.city,
          r.state
        FROM visits v
        JOIN restaurants r ON v.restaurant_id = r.id
        WHERE v.user_id = ?
        ORDER BY v.visit_date DESC
      `;

      db.all(sql, [userId], async (err, visits) => {
        if (err) {
          console.error('Error fetching visits:', err);
          return res.status(500).json({ error: 'Failed to fetch visits' });
        }

        // For each visit, get the food items
        const visitsWithFoodItems = await Promise.all(
          visits.map(async (visit) => {
            return new Promise((resolve, reject) => {
              const foodItemsSql = `
                SELECT * FROM visit_food_items 
                WHERE visit_id = ?
                ORDER BY created_at
              `;
              
              db.all(foodItemsSql, [visit.id], (err, foodItems) => {
                if (err) {
                  reject(err);
                } else {
                  resolve({
                    ...visit,
                    food_items: foodItems || []
                  });
                }
              });
            });
          })
        );

        res.json({ visits: visitsWithFoodItems });
      });
    } catch (error) {
      console.error('Error in getVisits:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Get a specific visit by ID
  async getVisit(req, res) {
    try {
      const db = database.getDb();
      const visitId = req.params.id;
      const userId = req.user.id;

      const sql = `
        SELECT 
          v.*,
          r.name as restaurant_name,
          r.cuisine_type,
          r.address,
          r.city,
          r.state,
          r.phone,
          r.website
        FROM visits v
        JOIN restaurants r ON v.restaurant_id = r.id
        WHERE v.id = ? AND v.user_id = ?
      `;

      db.get(sql, [visitId, userId], (err, visit) => {
        if (err) {
          console.error('Error fetching visit:', err);
          return res.status(500).json({ error: 'Failed to fetch visit' });
        }

        if (!visit) {
          return res.status(404).json({ error: 'Visit not found' });
        }

        // Get food items for this visit
        const foodItemsSql = `
          SELECT * FROM visit_food_items 
          WHERE visit_id = ?
          ORDER BY created_at
        `;
        
        db.all(foodItemsSql, [visitId], (err, foodItems) => {
          if (err) {
            console.error('Error fetching food items:', err);
            return res.status(500).json({ error: 'Failed to fetch food items' });
          }

          res.json({
            visit: {
              ...visit,
              food_items: foodItems || []
            }
          });
        });
      });
    } catch (error) {
      console.error('Error in getVisit:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Create a new visit
  async createVisit(req, res) {
    try {
      // Validate request body
      const { error, value } = this.visitSchema.validate(req.body);
      if (error) {
        return res.status(400).json({ 
          error: 'Validation failed', 
          details: error.details.map(d => d.message) 
        });
      }

      const db = database.getDb();
      const userId = req.user.id;

      // Extract food items from the request body
      const { food_items, ...visitData } = value;

      // First, verify the restaurant exists
      const restaurantCheckSql = 'SELECT id FROM restaurants WHERE id = ?';
      db.get(restaurantCheckSql, [visitData.restaurant_id], (err, restaurant) => {
        if (err) {
          console.error('Error checking restaurant:', err);
          return res.status(500).json({ error: 'Failed to verify restaurant' });
        }

        if (!restaurant) {
          return res.status(400).json({ error: 'Restaurant not found' });
        }

        // Insert visit
        const insertVisitSql = `
          INSERT INTO visits (
            user_id, restaurant_id, visit_date, occasion, party_size,
            overall_rating, service_rating, ambiance_rating, wait_time,
            total_cost, tip_amount, payment_method, notes, would_return
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;

        const visitValues = [
          userId,
          visitData.restaurant_id,
          visitData.visit_date,
          visitData.occasion || null,
          visitData.party_size || null,
          visitData.overall_rating,
          visitData.service_rating || null,
          visitData.ambiance_rating || null,
          visitData.wait_time || null,
          visitData.total_cost || null,
          visitData.tip_amount || null,
          visitData.payment_method || null,
          visitData.notes || null,
          visitData.would_return || null
        ];

        db.run(insertVisitSql, visitValues, function(err) {
          if (err) {
            console.error('Error creating visit:', err);
            return res.status(500).json({ error: 'Failed to create visit' });
          }

          const visitId = this.lastID;

          // Insert food items if provided
          if (food_items && food_items.length > 0) {
            const insertFoodItemSql = `
              INSERT INTO visit_food_items (
                visit_id, food_item_id, dish_name, price, rating, notes
              ) VALUES (?, ?, ?, ?, ?, ?)
            `;

            let completedInserts = 0;
            const totalInserts = food_items.length;

            food_items.forEach((item) => {
              const foodItemValues = [
                visitId,
                null, // food_item_id - we'll set this to null for now
                item.dish_name,
                item.price || null,
                item.rating,
                item.notes || null
              ];

              db.run(insertFoodItemSql, foodItemValues, (err) => {
                if (err) {
                  console.error('Error inserting food item:', err);
                }
                
                completedInserts++;
                if (completedInserts === totalInserts) {
                  res.status(201).json({
                    message: 'Visit created successfully',
                    visitId: visitId
                  });
                }
              });
            });
          } else {
            res.status(201).json({
              message: 'Visit created successfully',
              visitId: visitId
            });
          }
        });
      });
    } catch (error) {
      console.error('Error in createVisit:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Update a visit
  async updateVisit(req, res) {
    try {
      const visitId = req.params.id;
      const userId = req.user.id;

      // Validate request body
      const { error, value } = this.visitSchema.validate(req.body);
      if (error) {
        return res.status(400).json({ 
          error: 'Validation failed', 
          details: error.details.map(d => d.message) 
        });
      }

      const db = database.getDb();

      // First, verify the visit exists and belongs to the user
      const checkSql = 'SELECT id FROM visits WHERE id = ? AND user_id = ?';
      db.get(checkSql, [visitId, userId], (err, visit) => {
        if (err) {
          console.error('Error checking visit:', err);
          return res.status(500).json({ error: 'Failed to verify visit' });
        }

        if (!visit) {
          return res.status(404).json({ error: 'Visit not found' });
        }

        const { food_items, ...visitData } = value;

        // Update visit
        const updateSql = `
          UPDATE visits SET
            restaurant_id = ?, visit_date = ?, occasion = ?, party_size = ?,
            overall_rating = ?, service_rating = ?, ambiance_rating = ?, wait_time = ?,
            total_cost = ?, tip_amount = ?, payment_method = ?, notes = ?, would_return = ?,
            updated_at = CURRENT_TIMESTAMP
          WHERE id = ? AND user_id = ?
        `;

        const updateValues = [
          visitData.restaurant_id,
          visitData.visit_date,
          visitData.occasion || null,
          visitData.party_size || null,
          visitData.overall_rating,
          visitData.service_rating || null,
          visitData.ambiance_rating || null,
          visitData.wait_time || null,
          visitData.total_cost || null,
          visitData.tip_amount || null,
          visitData.payment_method || null,
          visitData.notes || null,
          visitData.would_return || null,
          visitId,
          userId
        ];

        db.run(updateSql, updateValues, (err) => {
          if (err) {
            console.error('Error updating visit:', err);
            return res.status(500).json({ error: 'Failed to update visit' });
          }

          res.json({ message: 'Visit updated successfully' });
        });
      });
    } catch (error) {
      console.error('Error in updateVisit:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Delete a visit
  async deleteVisit(req, res) {
    try {
      const visitId = req.params.id;
      const userId = req.user.id;
      const db = database.getDb();

      // First, verify the visit exists and belongs to the user
      const checkSql = 'SELECT id FROM visits WHERE id = ? AND user_id = ?';
      db.get(checkSql, [visitId, userId], (err, visit) => {
        if (err) {
          console.error('Error checking visit:', err);
          return res.status(500).json({ error: 'Failed to verify visit' });
        }

        if (!visit) {
          return res.status(404).json({ error: 'Visit not found' });
        }

        // Delete food items first (foreign key constraint)
        const deleteFoodItemsSql = 'DELETE FROM visit_food_items WHERE visit_id = ?';
        db.run(deleteFoodItemsSql, [visitId], (err) => {
          if (err) {
            console.error('Error deleting food items:', err);
            return res.status(500).json({ error: 'Failed to delete visit food items' });
          }

          // Delete the visit
          const deleteVisitSql = 'DELETE FROM visits WHERE id = ? AND user_id = ?';
          db.run(deleteVisitSql, [visitId, userId], (err) => {
            if (err) {
              console.error('Error deleting visit:', err);
              return res.status(500).json({ error: 'Failed to delete visit' });
            }

            res.json({ message: 'Visit deleted successfully' });
          });
        });
      });
    } catch (error) {
      console.error('Error in deleteVisit:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
}

module.exports = new VisitController();