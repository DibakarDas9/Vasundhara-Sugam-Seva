"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getConnectionInfo = exports.getConnectionStatus = exports.disconnectDatabase = exports.connectDatabase = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const config_1 = require("./config");
const logger_1 = require("../utils/logger");
let isConnected = false;
const connectDatabase = async () => {
    if (isConnected) {
        logger_1.logger.info('Database already connected');
        return;
    }
    try {
        const { uri, database, options } = config_1.config.database.mongodb;
        logger_1.logger.info(`Connecting to MongoDB: ${uri}/${database}`);
        await mongoose_1.default.connect(uri, {
            ...options,
            dbName: database,
        });
        isConnected = true;
        logger_1.logger.info('Successfully connected to MongoDB');
        mongoose_1.default.connection.on('error', (error) => {
            logger_1.logger.error('MongoDB connection error:', error);
        });
        mongoose_1.default.connection.on('disconnected', () => {
            logger_1.logger.warn('MongoDB disconnected');
            isConnected = false;
        });
        mongoose_1.default.connection.on('reconnected', () => {
            logger_1.logger.info('MongoDB reconnected');
            isConnected = true;
        });
        process.on('SIGINT', async () => {
            await mongoose_1.default.connection.close();
            logger_1.logger.info('MongoDB connection closed through app termination');
            process.exit(0);
        });
    }
    catch (error) {
        logger_1.logger.error('Failed to connect to MongoDB:', error);
        throw error;
    }
};
exports.connectDatabase = connectDatabase;
const disconnectDatabase = async () => {
    if (!isConnected) {
        return;
    }
    try {
        await mongoose_1.default.connection.close();
        isConnected = false;
        logger_1.logger.info('Disconnected from MongoDB');
    }
    catch (error) {
        logger_1.logger.error('Error disconnecting from MongoDB:', error);
        throw error;
    }
};
exports.disconnectDatabase = disconnectDatabase;
const getConnectionStatus = () => {
    return isConnected && mongoose_1.default.connection.readyState === 1;
};
exports.getConnectionStatus = getConnectionStatus;
const getConnectionInfo = () => {
    return {
        isConnected: (0, exports.getConnectionStatus)(),
        readyState: mongoose_1.default.connection.readyState,
        host: mongoose_1.default.connection.host,
        port: mongoose_1.default.connection.port,
        name: mongoose_1.default.connection.name,
    };
};
exports.getConnectionInfo = getConnectionInfo;
//# sourceMappingURL=database.js.map