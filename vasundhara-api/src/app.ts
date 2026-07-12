import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { config } from './config/config';

import { connectDatabase } from './config/database';

const app = express();

// Database Connection Middleware
app.use(async (req, res, next) => {
  try {
    await connectDatabase();
    next();
  } catch (error) {
    console.error('Database connection middleware error:', error);
    next(error);
  }
});

// Middleware
app.use(helmet());

app.use(
  cors({
    origin: (origin, callback) => {
      callback(null, true);
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  })
);

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    service: 'vasundhara-api',
    version: '1.0.0'
  });
});

// Basic API routes
app.get('/api', (req, res) => {
  res.json({
    message: 'Welcome to Vasundhara API',
    version: '1.0.0',
    endpoints: {
      health: '/health',
      auth: '/api/auth',
      googleAuth: '/api/auth/google',
      inventory: '/api/inventory',
      recipes: '/api/recipes',
      alerts: '/api/alerts',
      marketplace: '/api/marketplace'
    }
  });
});

// API route mounting
import apiRoutes from './routes';
app.use('/api', apiRoutes);


// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack);
  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    error: err.name || 'Error',
    message: err.message || 'Internal server error'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Not Found',
    message: `Route ${req.originalUrl} not found`
  });
});

export default app;
