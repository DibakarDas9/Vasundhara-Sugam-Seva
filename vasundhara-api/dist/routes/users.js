"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const express_validator_1 = require("express-validator");
const User_1 = require("@/models/User");
const auth_1 = require("@/middleware/auth");
const errorHandler_1 = require("@/middleware/errorHandler");
const logger_1 = require("@/utils/logger");
const router = (0, express_1.Router)();
router.put('/profile', auth_1.authenticate, [
    (0, express_validator_1.body)('firstName').optional().trim().isLength({ min: 1 }),
    (0, express_validator_1.body)('lastName').optional().trim().isLength({ min: 1 }),
    (0, express_validator_1.body)('phoneNumber').optional().isMobilePhone('any'),
    (0, express_validator_1.body)('dateOfBirth').optional().isISO8601(),
    (0, express_validator_1.body)('preferences.notifications').optional().isBoolean(),
    (0, express_validator_1.body)('preferences.alerts').optional().isBoolean(),
    (0, express_validator_1.body)('preferences.gamification').optional().isBoolean(),
    (0, express_validator_1.body)('preferences.language').optional().isIn(['en', 'es', 'fr', 'de', 'it', 'pt', 'hi', 'zh', 'ja', 'ko']),
    (0, express_validator_1.body)('preferences.timezone').optional().isString(),
], (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const errors = (0, express_validator_1.validationResult)(req);
    if (!errors.isEmpty()) {
        throw new errorHandler_1.CustomError('Validation failed', 400);
    }
    const allowedUpdates = [
        'firstName', 'lastName', 'phoneNumber', 'dateOfBirth', 'preferences'
    ];
    const updates = Object.keys(req.body)
        .filter(key => allowedUpdates.includes(key))
        .reduce((obj, key) => {
        obj[key] = req.body[key];
        return obj;
    }, {});
    const user = await User_1.User.findByIdAndUpdate(req.user._id, updates, { new: true, runValidators: true });
    if (!user) {
        throw new errorHandler_1.CustomError('User not found', 404);
    }
    logger_1.logger.info('User profile updated', { userId: user._id });
    res.json({
        message: 'Profile updated successfully',
        user: user.toJSON(),
    });
}));
router.post('/change-password', auth_1.authenticate, [
    (0, express_validator_1.body)('currentPassword').notEmpty().withMessage('Current password is required'),
    (0, express_validator_1.body)('newPassword').isLength({ min: 8 }).withMessage('New password must be at least 8 characters'),
], (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const errors = (0, express_validator_1.validationResult)(req);
    if (!errors.isEmpty()) {
        throw new errorHandler_1.CustomError('Validation failed', 400);
    }
    const { currentPassword, newPassword } = req.body;
    const user = await User_1.User.findById(req.user._id).select('+password');
    if (!user) {
        throw new errorHandler_1.CustomError('User not found', 404);
    }
    const isCurrentPasswordValid = await user.comparePassword(currentPassword);
    if (!isCurrentPasswordValid) {
        throw new errorHandler_1.CustomError('Current password is incorrect', 401);
    }
    user.password = newPassword;
    await user.save();
    logger_1.logger.info('User password changed', { userId: user._id });
    res.json({
        message: 'Password changed successfully',
    });
}));
router.post('/deactivate', auth_1.authenticate, (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const user = await User_1.User.findByIdAndUpdate(req.user._id, { isActive: false }, { new: true });
    if (!user) {
        throw new errorHandler_1.CustomError('User not found', 404);
    }
    logger_1.logger.info('User account deactivated', { userId: user._id });
    res.json({
        message: 'Account deactivated successfully',
    });
}));
router.delete('/delete', auth_1.authenticate, (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const user = await User_1.User.findByIdAndDelete(req.user._id);
    if (!user) {
        throw new errorHandler_1.CustomError('User not found', 404);
    }
    logger_1.logger.info('User account deleted', { userId: user._id });
    res.json({
        message: 'Account deleted successfully',
    });
}));
exports.default = router;
//# sourceMappingURL=users.js.map