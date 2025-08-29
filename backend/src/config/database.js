const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = process.env.DB_PATH || './database.sqlite';

class Database {
  constructor() {
    this.db = null;
  }

  connect() {
    return new Promise(async (resolve, reject) => {
      this.db = new sqlite3.Database(dbPath, async (err) => {
        if (err) {
          console.error('Error opening database:', err.message);
          reject(err);
        } else {
          console.log('Connected to SQLite database');
          try {
            await this.initializeTables();
            resolve();
          } catch (initError) {
            console.error('Error initializing tables:', initError);
            reject(initError);
          }
        }
      });
    });
  }

  async initializeTables() {
    const tables = [
      // Users table
      `CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username VARCHAR(50) UNIQUE NOT NULL,
        email VARCHAR(100) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        first_name VARCHAR(50),
        last_name VARCHAR(50),
        preferences TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )`,

      // Restaurants table
      `CREATE TABLE IF NOT EXISTS restaurants (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name VARCHAR(100) NOT NULL,
        cuisine_type VARCHAR(50),
        address TEXT,
        city VARCHAR(50),
        state VARCHAR(50),
        zip_code VARCHAR(10),
        phone VARCHAR(20),
        website VARCHAR(255),
        operating_hours TEXT,
        avg_rating DECIMAL(2,1) DEFAULT 0,
        total_reviews INTEGER DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )`,

      // Categories table
      `CREATE TABLE IF NOT EXISTS categories (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name VARCHAR(50) UNIQUE NOT NULL,
        type VARCHAR(20) NOT NULL, -- 'cuisine' or 'dish'
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )`,

      // Food items table
      `CREATE TABLE IF NOT EXISTS food_items (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name VARCHAR(100) NOT NULL,
        description TEXT,
        category_id INTEGER,
        ingredients TEXT,
        allergens TEXT,
        is_vegetarian BOOLEAN DEFAULT 0,
        is_vegan BOOLEAN DEFAULT 0,
        is_gluten_free BOOLEAN DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (category_id) REFERENCES categories (id)
      )`,

      // Visits table
      `CREATE TABLE IF NOT EXISTS visits (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        restaurant_id INTEGER NOT NULL,
        visit_date DATETIME NOT NULL,
        occasion VARCHAR(50),
        party_size INTEGER,
        overall_rating INTEGER CHECK (overall_rating BETWEEN 1 AND 5),
        service_rating INTEGER CHECK (service_rating BETWEEN 1 AND 5),
        ambiance_rating INTEGER CHECK (ambiance_rating BETWEEN 1 AND 5),
        wait_time INTEGER, -- in minutes
        total_cost DECIMAL(10,2),
        tip_amount DECIMAL(10,2),
        payment_method VARCHAR(20),
        notes TEXT,
        would_return BOOLEAN,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users (id),
        FOREIGN KEY (restaurant_id) REFERENCES restaurants (id)
      )`,

      // Visit food items table (many-to-many relationship)
      `CREATE TABLE IF NOT EXISTS visit_food_items (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        visit_id INTEGER NOT NULL,
        food_item_id INTEGER,
        dish_name VARCHAR(100) NOT NULL,
        price DECIMAL(8,2),
        portion_size VARCHAR(20),
        rating INTEGER CHECK (rating BETWEEN 1 AND 5),
        notes TEXT,
        photo_path VARCHAR(255),
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (visit_id) REFERENCES visits (id),
        FOREIGN KEY (food_item_id) REFERENCES food_items (id)
      )`,

      // Restaurant photos table
      `CREATE TABLE IF NOT EXISTS restaurant_photos (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        restaurant_id INTEGER NOT NULL,
        photo_path VARCHAR(255) NOT NULL,
        caption TEXT,
        uploaded_by INTEGER,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (restaurant_id) REFERENCES restaurants (id),
        FOREIGN KEY (uploaded_by) REFERENCES users (id)
      )`
    ];

    // Execute table creation sequentially
    for (const tableSQL of tables) {
      await new Promise((resolve, reject) => {
        this.db.run(tableSQL, (err) => {
          if (err) {
            console.error('Error creating table:', err.message);
            reject(err);
          } else {
            resolve();
          }
        });
      });
    }

    // Insert default categories after tables are created
    await this.insertDefaultCategories();
  }

  async insertDefaultCategories() {
    const cuisineTypes = [
      'Italian', 'Chinese', 'Mexican', 'Japanese', 'Indian', 'French', 'Thai', 'Greek',
      'American', 'Mediterranean', 'Korean', 'Vietnamese', 'Spanish', 'Middle Eastern'
    ];

    const dishTypes = [
      'Appetizer', 'Main Course', 'Dessert', 'Beverage', 'Soup', 'Salad', 'Side Dish', 'Snack'
    ];

    cuisineTypes.forEach(cuisine => {
      this.db.run(
        'INSERT OR IGNORE INTO categories (name, type) VALUES (?, ?)',
        [cuisine, 'cuisine']
      );
    });

    dishTypes.forEach(dish => {
      this.db.run(
        'INSERT OR IGNORE INTO categories (name, type) VALUES (?, ?)',
        [dish, 'dish']
      );
    });
  }

  getDb() {
    return this.db;
  }

  close() {
    return new Promise((resolve) => {
      if (this.db) {
        this.db.close((err) => {
          if (err) {
            console.error('Error closing database:', err.message);
          } else {
            console.log('Database connection closed');
          }
          resolve();
        });
      } else {
        resolve();
      }
    });
  }
}

module.exports = new Database();