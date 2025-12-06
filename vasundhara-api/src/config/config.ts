import dotenv from 'dotenv';

dotenv.config();

const nodeEnv = process.env.NODE_ENV || 'development';
const appName = process.env.APP_NAME || 'Vasundhara API';
const appVersion = process.env.APP_VERSION || '1.0.0';
const serverPort = parseInt(process.env.PORT || '5000', 10);
const serverHost = process.env.HOST || '0.0.0.0';

export const config = {
  app: {
    name: appName,
    version: appVersion,
    env: nodeEnv,
    debug: process.env.DEBUG === 'true',
  },
  server: {
    host: serverHost,
    port: serverPort,
  },
  port: serverPort,
  nodeEnv,
  database: {
    mongodb: {
      uri: process.env.MONGODB_URI || process.env.MONGO_URI || 'mongodb://localhost:27017',
      database: process.env.MONGODB_DATABASE || 'vasundhara',
      options: {
        maxPoolSize: parseInt(process.env.MONGODB_MAX_POOL_SIZE || '10', 10),
        serverSelectionTimeoutMS: parseInt(process.env.MONGODB_SERVER_SELECTION_TIMEOUT || '5000', 10),
        socketTimeoutMS: parseInt(process.env.MONGODB_SOCKET_TIMEOUT || '45000', 10),
      },
    },
  },
  redis: {
    uri: process.env.REDIS_URI || process.env.REDIS_URL || 'redis://localhost:6379',
    options: {},
  },
  jwt: {
    secret: process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-this-in-production',
    expiresIn: process.env.JWT_EXPIRES_IN || '15m',
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
    issuer: process.env.JWT_ISSUER || 'vasundhara-api',
    audience: process.env.JWT_AUDIENCE || 'vasundhara-app',
  },
  cors: {
    allowedOrigins: (process.env.CORS_ALLOWED_ORIGINS || process.env.CORS_ORIGIN || 'http://localhost:3000')
      .split(',')
      .map((origin) => origin.trim()),
  },
  externalServices: {
    ml: {
      url: process.env.ML_SERVICE_URL || 'http://localhost:8000',
      timeout: parseInt(process.env.ML_SERVICE_TIMEOUT || '5000', 10),
    },
  },
  email: {
    enabled: process.env.EMAIL_ENABLED !== 'false',
    service: process.env.EMAIL_SERVICE || 'smtp',
    from: process.env.EMAIL_FROM || 'noreply@vasundhara.app',
    apiKey: process.env.EMAIL_API_KEY,
    smtp: {
      host: process.env.EMAIL_SMTP_HOST || process.env.SMTP_HOST || '',
      port: parseInt(process.env.EMAIL_SMTP_PORT || process.env.SMTP_PORT || '587', 10),
      secure: (process.env.EMAIL_SMTP_SECURE || process.env.SMTP_SECURE || 'false') === 'true',
      user: process.env.EMAIL_SMTP_USER || process.env.SMTP_USERNAME || '',
      pass: process.env.EMAIL_SMTP_PASS || process.env.SMTP_PASSWORD || '',
    },
  },
  jobs: {
    redis: process.env.JOBS_REDIS_URI || process.env.REDIS_URI || 'redis://localhost:6379',
    concurrency: parseInt(process.env.JOBS_CONCURRENCY || '5', 10),
    retryAttempts: parseInt(process.env.JOBS_RETRY_ATTEMPTS || '3', 10),
    retryDelay: parseInt(process.env.JOBS_RETRY_DELAY || '5000', 10),
  },
  logging: {
    level: process.env.LOG_LEVEL || 'info',
    format: process.env.LOG_FORMAT || 'combined',
    file: process.env.LOG_FILE || 'logs/app.log',
  },
};