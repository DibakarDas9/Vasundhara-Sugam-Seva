/**
 * Swagger/OpenAPI configuration
 */

import swaggerJSDoc from 'swagger-jsdoc';
import { config } from './config';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Vasundhara API',
      version: config.app.version,
      description: 'AI-powered smart food waste management system API',
      contact: {
        name: 'Vasundhara Team',
        email: 'support@vasundhara.app',
        url: 'https://vasundhara.app',
      },
      license: {
        name: 'MIT',
        url: 'https://opensource.org/licenses/MIT',
      },
    },
    servers: [
      {
        url: `http://${config.server.host}:${config.server.port}`,
        description: 'Development server',
      },
      {
        url: 'https://api.vasundhara.app',
        description: 'Production server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
        oauth2: {
          type: 'oauth2',
          flows: {
            authorizationCode: {
              authorizationUrl: 'https://accounts.google.com/o/oauth2/auth',
              tokenUrl: 'https://oauth2.googleapis.com/token',
              scopes: {
                'openid': 'OpenID Connect',
                'email': 'Email address',
                'profile': 'Basic profile information',
              },
            },
          },
        },
      },
      schemas: {
        User: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            email: { type: 'string', format: 'email' },
            firstName: { type: 'string' },
            lastName: { type: 'string' },
            role: { type: 'string', enum: ['user', 'retail_partner', 'admin'] },
            isActive: { type: 'boolean' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },
        Household: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            name: { type: 'string' },
            members: {
              type: 'array',
              items: { $ref: '#/components/schemas/User' },
            },
            settings: {
              type: 'object',
              properties: {
                notifications: { type: 'boolean' },
                alerts: { type: 'boolean' },
                gamification: { type: 'boolean' },
              },
            },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },
        FoodItem: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            name: { type: 'string' },
            category: { type: 'string' },
            purchaseDate: { type: 'string', format: 'date' },
            expiryDate: { type: 'string', format: 'date' },
            predictedExpiryDate: { type: 'string', format: 'date' },
            storage: { type: 'string', enum: ['fridge', 'freezer', 'pantry', 'counter'] },
            status: { type: 'string', enum: ['fresh', 'expiring_soon', 'expired', 'consumed', 'wasted'] },
            quantity: { type: 'number' },
            unit: { type: 'string' },
            imageUrl: { type: 'string', format: 'uri' },
            barcode: { type: 'string' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },
        Recipe: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            name: { type: 'string' },
            description: { type: 'string' },
            ingredients: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  name: { type: 'string' },
                  quantity: { type: 'number' },
                  unit: { type: 'string' },
                },
              },
            },
            instructions: {
              type: 'array',
              items: { type: 'string' },
            },
            cookingTime: { type: 'number' },
            difficulty: { type: 'string', enum: ['easy', 'medium', 'hard'] },
            servings: { type: 'number' },
            tags: {
              type: 'array',
              items: { type: 'string' },
            },
            imageUrl: { type: 'string', format: 'uri' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },
        Alert: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            type: { type: 'string', enum: ['expiry', 'low_stock', 'recipe_suggestion', 'achievement'] },
            title: { type: 'string' },
            message: { type: 'string' },
            priority: { type: 'string', enum: ['low', 'medium', 'high', 'urgent'] },
            isRead: { type: 'boolean' },
            data: { type: 'object' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },
        MarketplaceListing: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            title: { type: 'string' },
            description: { type: 'string' },
            foodItems: {
              type: 'array',
              items: { $ref: '#/components/schemas/FoodItem' },
            },
            location: {
              type: 'object',
              properties: {
                address: { type: 'string' },
                coordinates: {
                  type: 'object',
                  properties: {
                    lat: { type: 'number' },
                    lng: { type: 'number' },
                  },
                },
              },
            },
            pickupTime: { type: 'string', format: 'date-time' },
            status: { type: 'string', enum: ['available', 'reserved', 'picked_up', 'expired'] },
            price: { type: 'number' },
            currency: { type: 'string', default: 'USD' },
            images: {
              type: 'array',
              items: { type: 'string', format: 'uri' },
            },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },
        Error: {
          type: 'object',
          properties: {
            error: { type: 'string' },
            message: { type: 'string' },
            statusCode: { type: 'number' },
            timestamp: { type: 'string', format: 'date-time' },
            path: { type: 'string' },
          },
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
  },
  apis: [
    './src/routes/*.ts',
    './src/controllers/*.ts',
    './src/models/*.ts',
  ],
};

export default swaggerJSDoc(options);
