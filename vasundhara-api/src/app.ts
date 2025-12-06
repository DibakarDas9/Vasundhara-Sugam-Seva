import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { config } from './config/config';

const app = express();

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

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
      inventory: '/api/inventory',
      recipes: '/api/recipes',
      alerts: '/api/alerts',
      marketplace: '/api/marketplace'
    }
  });
});

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).json({
    error: 'Something went wrong!',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
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
