"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.analyticsQueue = exports.smsQueue = exports.emailQueue = exports.expiryAlertQueue = exports.startJobProcessor = void 0;
const bull_1 = __importDefault(require("bull"));
const config_1 = require("../config/config");
const logger_1 = require("../utils/logger");
const expiryAlertQueue = new bull_1.default('expiry-alerts', config_1.config.jobs.redis);
exports.expiryAlertQueue = expiryAlertQueue;
const emailQueue = new bull_1.default('email', config_1.config.jobs.redis);
exports.emailQueue = emailQueue;
const smsQueue = new bull_1.default('sms', config_1.config.jobs.redis);
exports.smsQueue = smsQueue;
const analyticsQueue = new bull_1.default('analytics', config_1.config.jobs.redis);
exports.analyticsQueue = analyticsQueue;
const startJobProcessor = async () => {
    try {
        logger_1.logger.info('Starting background job processor...');
        expiryAlertQueue.process('check-expiry', async (job) => {
            logger_1.logger.info('Processing expiry alert job', { jobId: job.id });
        });
        emailQueue.process('send-email', async (job) => {
            logger_1.logger.info('Processing email job', { jobId: job.id });
        });
        smsQueue.process('send-sms', async (job) => {
            logger_1.logger.info('Processing SMS job', { jobId: job.id });
        });
        analyticsQueue.process('update-analytics', async (job) => {
            logger_1.logger.info('Processing analytics job', { jobId: job.id });
        });
        expiryAlertQueue.on('completed', (job) => {
            logger_1.logger.info('Expiry alert job completed', { jobId: job.id });
        });
        expiryAlertQueue.on('failed', (job, err) => {
            logger_1.logger.error('Expiry alert job failed', { jobId: job.id, error: err.message });
        });
        logger_1.logger.info('Background job processor started successfully');
    }
    catch (error) {
        logger_1.logger.error('Failed to start job processor:', error);
        throw error;
    }
};
exports.startJobProcessor = startJobProcessor;
//# sourceMappingURL=jobProcessor.js.map