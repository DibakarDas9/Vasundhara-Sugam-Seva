// MongoDB initialization script for Vasundhara
// This script sets up the initial database structure and indexes

// Switch to the vasundhara database
db = db.getSiblingDB('vasundhara');

// Create collections with validation rules
db.createCollection('users', {
  validator: {
    $jsonSchema: {
      bsonType: 'object',
      required: ['email', 'firstName', 'lastName', 'role'],
      properties: {
        email: {
          bsonType: 'string',
          pattern: '^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$'
        },
        firstName: {
          bsonType: 'string',
          minLength: 1,
          maxLength: 50
        },
        lastName: {
          bsonType: 'string',
          minLength: 1,
          maxLength: 50
        },
        role: {
          bsonType: 'string',
          enum: ['user', 'retail_partner', 'admin']
        }
      }
    }
  }
});

db.createCollection('households', {
  validator: {
    $jsonSchema: {
      bsonType: 'object',
      required: ['name', 'members'],
      properties: {
        name: {
          bsonType: 'string',
          minLength: 1,
          maxLength: 100
        },
        members: {
          bsonType: 'array',
          items: {
            bsonType: 'object',
            required: ['user', 'role'],
            properties: {
              user: { bsonType: 'objectId' },
              role: {
                bsonType: 'string',
                enum: ['owner', 'member', 'viewer']
              }
            }
          }
        }
      }
    }
  }
});

db.createCollection('fooditems', {
  validator: {
    $jsonSchema: {
      bsonType: 'object',
      required: ['name', 'category', 'household', 'addedBy', 'purchaseDate', 'quantity', 'unit', 'storage'],
      properties: {
        name: {
          bsonType: 'string',
          minLength: 1,
          maxLength: 200
        },
        category: {
          bsonType: 'string',
          minLength: 1,
          maxLength: 100
        },
        household: { bsonType: 'objectId' },
        addedBy: { bsonType: 'objectId' },
        purchaseDate: { bsonType: 'date' },
        quantity: { bsonType: 'number', minimum: 0.01 },
        unit: {
          bsonType: 'string',
          enum: ['piece', 'kg', 'g', 'l', 'ml', 'cup', 'tbsp', 'tsp', 'oz', 'lb']
        },
        storage: {
          bsonType: 'string',
          enum: ['fridge', 'freezer', 'pantry', 'counter', 'outside']
        }
      }
    }
  }
});

db.createCollection('recipes');
db.createCollection('alerts');
db.createCollection('marketplacelistings');
db.createCollection('wastelogs');
db.createCollection('gamification');

// Create indexes for better performance
print('Creating indexes...');

// Users collection indexes
db.users.createIndex({ email: 1 }, { unique: true });
db.users.createIndex({ role: 1 });
db.users.createIndex({ isActive: 1 });
db.users.createIndex({ createdAt: -1 });

// Households collection indexes
db.households.createIndex({ 'members.user': 1 });
db.households.createIndex({ 'members.role': 1 });
db.households.createIndex({ createdAt: -1 });

// Food items collection indexes
db.fooditems.createIndex({ household: 1 });
db.fooditems.createIndex({ addedBy: 1 });
db.fooditems.createIndex({ status: 1 });
db.fooditems.createIndex({ category: 1 });
db.fooditems.createIndex({ expiryDate: 1 });
db.fooditems.createIndex({ predictedExpiryDate: 1 });
db.fooditems.createIndex({ createdAt: -1 });
db.fooditems.createIndex({ household: 1, status: 1 });
db.fooditems.createIndex({ household: 1, expiryDate: 1 });
db.fooditems.createIndex({ household: 1, category: 1 });

// Recipes collection indexes
db.recipes.createIndex({ name: 'text', description: 'text' });
db.recipes.createIndex({ category: 1 });
db.recipes.createIndex({ tags: 1 });
db.recipes.createIndex({ 'statistics.averageRating': -1 });
db.recipes.createIndex({ 'statistics.timesCooked': -1 });
db.recipes.createIndex({ createdAt: -1 });

// Alerts collection indexes
db.alerts.createIndex({ household: 1 });
db.alerts.createIndex({ user: 1 });
db.alerts.createIndex({ type: 1 });
db.alerts.createIndex({ priority: 1 });
db.alerts.createIndex({ isRead: 1 });
db.alerts.createIndex({ isDismissed: 1 });
db.alerts.createIndex({ createdAt: -1 });
db.alerts.createIndex({ user: 1, isRead: 1 });
db.alerts.createIndex({ household: 1, type: 1 });
db.alerts.createIndex({ user: 1, isDismissed: 1, createdAt: -1 });

// Marketplace listings indexes
db.marketplacelistings.createIndex({ status: 1 });
db.marketplacelistings.createIndex({ 'location.coordinates': '2dsphere' });
db.marketplacelistings.createIndex({ createdAt: -1 });
db.marketplacelistings.createIndex({ pickupTime: 1 });

// Waste logs indexes
db.wastelogs.createIndex({ household: 1 });
db.wastelogs.createIndex({ user: 1 });
db.wastelogs.createIndex({ createdAt: -1 });
db.wastelogs.createIndex({ category: 1 });

// Gamification indexes
db.gamification.createIndex({ user: 1 });
db.gamification.createIndex({ household: 1 });
db.gamification.createIndex({ points: -1 });
db.gamification.createIndex({ createdAt: -1 });

print('Database initialization completed successfully!');
print('Collections created: users, households, fooditems, recipes, alerts, marketplacelistings, wastelogs, gamification');
print('Indexes created for optimal query performance');
