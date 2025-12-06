/**
 * Redis configuration and connection
 */

import Redis from 'ioredis';
import { config } from './config';
import { logger } from '@/utils/logger';

let redisClient: Redis | null = null;

export const connectRedis = async (): Promise<void> => {
  if (redisClient && redisClient.status === 'ready') {
    logger.info('Redis already connected');
    return;
  }

  try {
    const { uri, options } = config.redis;
    
    logger.info(`Connecting to Redis: ${uri}`);
    
    redisClient = new Redis(uri, {
      ...options,
      retryDelayOnFailover: 100,
      enableReadyCheck: false,
      maxRetriesPerRequest: 3,
      lazyConnect: true,
    });

    // Handle connection events
    redisClient.on('connect', () => {
      logger.info('Redis connected');
    });

    redisClient.on('ready', () => {
      logger.info('Redis ready');
    });

    redisClient.on('error', (error) => {
      logger.error('Redis connection error:', error);
    });

    redisClient.on('close', () => {
      logger.warn('Redis connection closed');
    });

    redisClient.on('reconnecting', () => {
      logger.info('Redis reconnecting...');
    });

    // Connect to Redis
    await redisClient.connect();

  } catch (error) {
    logger.error('Failed to connect to Redis:', error);
    throw error;
  }
};

export const disconnectRedis = async (): Promise<void> => {
  if (!redisClient) {
    return;
  }

  try {
    await redisClient.quit();
    redisClient = null;
    logger.info('Disconnected from Redis');
  } catch (error) {
    logger.error('Error disconnecting from Redis:', error);
    throw error;
  }
};

export const getRedisClient = (): Redis => {
  if (!redisClient) {
    throw new Error('Redis client not initialized');
  }
  return redisClient;
};

export const getConnectionStatus = (): boolean => {
  return redisClient !== null && redisClient.status === 'ready';
};

export const getConnectionInfo = () => {
  if (!redisClient) {
    return {
      isConnected: false,
      status: 'not_initialized',
    };
  }

  return {
    isConnected: getConnectionStatus(),
    status: redisClient.status,
    host: redisClient.options.host,
    port: redisClient.options.port,
  };
};
