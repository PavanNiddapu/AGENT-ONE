const Joi = require('joi');
const database = require('../config/database');

// Helper function to get visit by ID
async function getVisitByIdHelper(id) {
  console.log('Getting visit by ID:', id);
  
  const db = database.getDb();
  
  return new Promise((resolve, reject) => {
    db.get(
      `SELECT 
        v.*,
        r.name as restaurant_name,
        r.cuisine_type,
        r.address
      FROM visits v
      JOIN restaurants r ON v.restaurant_id = r.id
      WHERE v.id = ?`,
      [id],
      async (err, row) => {
        if (err) {
          console.error('Database error getting visit by ID:', err);
          reject(err);
        } else if (!row) {
          resolve(null);
        } else {
          // Get food items for this visit
          const foodItems = await new Promise((resolve, reject) => {
            db.all(
              `SELECT 
                vfi.*,
                fi.name as food_item_name
              FROM visit_food_items vfi
              JOIN food_items fi ON vfi.food_item_id = fi.id
              WHERE vfi.visit_id = ?`,
              [id],
              (err, rows) => {
                if (err) {
                  console.error('Error getting food items:', err);
                  reject(err);
                } else {
                  resolve(rows);
                }
              }
            );
          });
          
          row.foodItems = foodItems;
          resolve(row);
        }
      }
    );
  });
}

// Validation schemas
const visitSchema = Joi.object({
  restaurantId: Joi.number().integer().positive().required(),
  visitDate: Joi.string().isoDate().required(),
  occasion: Joi.string().max(50).optional(),
  partySize: Joi.number().integer().positive().optional(),
  overallRating: Joi.number().integer().min(1).max(5).optional(),
  serviceRating: Joi.number().integer().min(1).max(5).optional(),
  ambianceRating: Joi.number().integer().min(1).max(5).optional(),
  waitTime: Joi.number().integer().min(0).optional(),
  totalCost: Joi.number().precision(2).min(0).optional(),
  tipAmount: Joi.number().precision(2).min(0).optional(),
  paymentMethod: Joi.string().max(20).optional(),
  notes: Joi.string().optional(),
  wouldReturn: Joi.boolean().optional(),
  foodItems: Joi.array().items(
    Joi.object({
      dishName: Joi.string().max(100).required(),
      category: Joi.string().max(50).optional(),
      price: Joi.number().precision(2).min(0).optional(),
      rating: Joi.number().integer().min(1).max(5).optional(),
      notes: Joi.string().optional()
    })
  ).optional()
});

class VisitController {
  async createVisit(req, res) {
    console.log('Creating new visit - Request body:', req.body);
    
    try {
      const { error, value } = visitSchema.validate(req.body);
      if (error) {
        console.error('Validation error:', error.details[0].message);
        return res.status(400).json({ error: error.details[0].message });
      }

      const userId = req.user.userId;
      const {
        restaurantId, visitDate, occasion, partySize, overallRating,
        serviceRating, ambianceRating, waitTime, totalCost, tipAmount,
        paymentMethod, notes, wouldReturn, foodItems
      } = value;

      console.log('Creating visit for user:', userId, 'restaurant:', restaurantId);

      const db = database.getDb();

      // Insert visit
      const visitId = await new Promise((resolve, reject) => {
        db.run(
          `INSERT INTO visits (
            user_id, restaurant_id, visit_date, occasion, party_size,
            overall_rating, service_rating, ambiance_rating, wait_time,
            total_cost, tip_amount, payment_method, notes, would_return
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            userId, restaurantId, visitDate, occasion, partySize,
            overallRating, serviceRating, ambianceRating, waitTime,
            totalCost, tipAmount, paymentMethod, notes, wouldReturn
          ],
          function(err) {
            if (err) {
              console.error('Database error inserting visit:', err);
              reject(err);
            } else {
              console.log('Visit inserted with ID:', this.lastID);
              resolve(this.lastID);
            }
          }
        );
      });

      // Insert food items if provided
      if (foodItems && foodItems.length > 0) {
        console.log('Inserting', foodItems.length, 'food items');
        
        for (const foodItem of foodItems) {
          await new Promise((resolve, reject) => {
            // First create or find the food item
            db.get(
              'SELECT id FROM food_items WHERE name = ?',
              [foodItem.dishName],
              (err, row) => {
                if (err) {
                  console.error('Error checking food item:', err);
                  reject(err);
                  return;
                }

                let foodItemId = row ? row.id : null;

                if (!foodItemId) {
                  // Create new food item
                  db.run(
                    'INSERT INTO food_items (name, description) VALUES (?, ?)',
                    [foodItem.dishName, foodItem.category || 'General'],
                    function(err) {
                      if (err) {
                        console.error('Error creating food item:', err);
                        reject(err);
                        return;
                      }
                      foodItemId = this.lastID;
                      console.log('Created new food item with ID:', foodItemId);
                      insertVisitFoodItem();
                    }
                  );
                } else {
                  console.log('Using existing food item with ID:', foodItemId);
                  insertVisitFoodItem();
                }

                function insertVisitFoodItem() {
                  // Insert visit_food_item record
                  db.run(
                    `INSERT INTO visit_food_items (
                      visit_id, food_item_id, dish_name, price, rating, notes
                    ) VALUES (?, ?, ?, ?, ?, ?)`,
                    [visitId, foodItemId, foodItem.dishName, foodItem.price, foodItem.rating, foodItem.notes],
                    function(err) {
                      if (err) {
                        console.error('Error inserting visit food item:', err);
                        reject(err);
                      } else {
                        console.log('Inserted visit food item with ID:', this.lastID);
                        resolve();
                      }
                    }
                  );
                }
              }
            );
          });
        }
      }

      // Get the complete visit data by calling the method correctly
      const visit = await getVisitByIdHelper(visitId);
      
      console.log('Visit created successfully:', visit);
      res.status(201).json({
        message: 'Visit created successfully',
        visit
      });
    } catch (error) {
      console.error('Create visit error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  async getVisits(req, res) {
    console.log('Getting visits for user:', req.user.userId);
    
    try {
      const userId = req.user.userId;
      const db = database.getDb();

      const visits = await new Promise((resolve, reject) => {
        db.all(
          `SELECT 
            v.*,
            r.name as restaurant_name,
            r.cuisine_type,
            r.address
          FROM visits v
          JOIN restaurants r ON v.restaurant_id = r.id
          WHERE v.user_id = ?
          ORDER BY v.visit_date DESC`,
          [userId],
          (err, rows) => {
            if (err) {
              console.error('Database error getting visits:', err);
              reject(err);
            } else {
              console.log('Found', rows.length, 'visits');
              resolve(rows);
            }
          }
        );
      });

      // Get food items for each visit
      for (const visit of visits) {
        const foodItems = await new Promise((resolve, reject) => {
          db.all(
            `SELECT 
              vfi.*,
              fi.name as food_item_name
            FROM visit_food_items vfi
            JOIN food_items fi ON vfi.food_item_id = fi.id
            WHERE vfi.visit_id = ?`,
            [visit.id],
            (err, rows) => {
              if (err) {
                console.error('Error getting food items for visit:', visit.id, err);
                reject(err);
              } else {
                resolve(rows);
              }
            }
          );
        });
        
        visit.foodItems = foodItems;
      }

      console.log('Returning visits with food items');
      res.json({ visits });
    } catch (error) {
      console.error('Get visits error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  async getVisitById(id) {
    return getVisitByIdHelper(id);
  }

  async getVisit(req, res) {
    try {
      const visitId = parseInt(req.params.id);
      const userId = req.user.userId;
      
      console.log('Getting specific visit:', visitId, 'for user:', userId);

      if (isNaN(visitId)) {
        return res.status(400).json({ error: 'Invalid visit ID' });
      }

      const visit = await this.getVisitById(visitId);

      if (!visit) {
        return res.status(404).json({ error: 'Visit not found' });
      }

      // Check if visit belongs to the user
      if (visit.user_id !== userId) {
        return res.status(403).json({ error: 'Access denied' });
      }

      res.json({ visit });
    } catch (error) {
      console.error('Get visit error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  async deleteVisit(req, res) {
    try {
      const visitId = parseInt(req.params.id);
      const userId = req.user.userId;
      
      console.log('Deleting visit:', visitId, 'for user:', userId);

      if (isNaN(visitId)) {
        return res.status(400).json({ error: 'Invalid visit ID' });
      }

      const db = database.getDb();

      // Check if visit exists and belongs to user
      const visit = await new Promise((resolve, reject) => {
        db.get(
          'SELECT id, user_id FROM visits WHERE id = ?',
          [visitId],
          (err, row) => {
            if (err) reject(err);
            else resolve(row);
          }
        );
      });

      if (!visit) {
        return res.status(404).json({ error: 'Visit not found' });
      }

      if (visit.user_id !== userId) {
        return res.status(403).json({ error: 'Access denied' });
      }

      // Delete visit (food items will be deleted via CASCADE if set up, or we delete manually)
      await new Promise((resolve, reject) => {
        db.run('DELETE FROM visit_food_items WHERE visit_id = ?', [visitId], (err) => {
          if (err) reject(err);
          else resolve();
        });
      });

      await new Promise((resolve, reject) => {
        db.run('DELETE FROM visits WHERE id = ?', [visitId], (err) => {
          if (err) reject(err);
          else resolve();
        });
      });

      console.log('Visit deleted successfully');
      res.json({ message: 'Visit deleted successfully' });
    } catch (error) {
      console.error('Delete visit error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
}

module.exports = new VisitController();