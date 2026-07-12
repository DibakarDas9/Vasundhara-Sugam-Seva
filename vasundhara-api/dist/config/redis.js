"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getConnectionInfo = exports.getConnectionStatus = exports.getRedisClient = exports.disconnectRedis = exports.connectRedis = void 0;
const ioredis_1 = __importDefault(require("ioredis"));
const config_1 = require("./config");
const logger_1 = require("@/utils/logger");
let redisClient = null;
const connectRedis = async () => {
    if (redisClient && redisClient.status === 'ready') {
        logger_1.logger.info('Redis already connected');
        return;
    }
    try {
        const { uri, options } = config_1.config.redis;
        logger_1.logger.info(`Connecting to Redis: ${uri}`);
        redisClient = new ioredis_1.default(uri, {
            ...options,
            retryDelayOnFailover: 100,
            enableReadyCheck: false,
            maxRetriesPerRequest: 3,
            lazyConnect: true,
        });
        redisClient.on('connect', () => {
            logger_1.logger.info('Redis connected');
        });
        redisClient.on('ready', () => {
            logger_1.logger.info('Redis ready');
        });
        redisClient.on('error', (error) => {
            logger_1.logger.error('Redis connection error:', error);
        });
        redisClient.on('close', () => {
            logger_1.logger.warn('Redis connection closed');
        });
        redisClient.on('reconnecting', () => {
            logger_1.logger.info('Redis reconnecting...');
        });
        await redisClient.connect();
    }
    catch (error) {
        logger_1.logger.error('Failed to connect to Redis:', error);
        throw error;
    }
};
exports.connectRedis = connectRedis;
const disconnectRedis = async () => {
    if (!redisClient) {
        return;
    }
    try {
        await redisClient.quit();
        redisClient = null;
        logger_1.logger.info('Disconnected from Redis');
    }
    catch (error) {
        logger_1.logger.error('Error disconnecting from Redis:', error);
        throw error;
    }
};
exports.disconnectRedis = disconnectRedis;
const getRedisClient = () => {
    if (!redisClient) {
        throw new Error('Redis client not initialized');
    }
    return redisClient;
};
exports.getRedisClient = getRedisClient;
const getConnectionStatus = () => {
    return redisClient !== null && redisClient.status === 'ready';
};
exports.getConnectionStatus = getConnectionStatus;
const getConnectionInfo = () => {
    if (!redisClient) {
        return {
            isConnected: false,
            status: 'not_initialized',
        };
    }
    return {
        isConnected: (0, exports.getConnectionStatus)(),
        status: redisClient.status,
        host: redisClient.options.host,
        port: redisClient.options.port,
    };
};
exports.getConnectionInfo = getConnectionInfo;
//# sourceMappingURL=redis.js.map