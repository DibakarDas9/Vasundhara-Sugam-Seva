"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const express_validator_1 = require("express-validator");
const User_1 = require("../models/User");
const auth_1 = require("../middleware/auth");
const errorHandler_1 = require("../middleware/errorHandler");
const logger_1 = require("../utils/logger");
const router = (0, express_1.Router)();
router.post('/register', [
    (0, express_validator_1.body)('email').isEmail().normalizeEmail(),
    (0, express_validator_1.body)('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
    (0, express_validator_1.body)('firstName').trim().isLength({ min: 1 }).withMessage('First name is required'),
    (0, express_validator_1.body)('lastName').trim().isLength({ min: 1 }).withMessage('Last name is required'),
    (0, express_validator_1.body)('phoneNumber').optional({ checkFalsy: true }).isMobilePhone(),
    (0, express_validator_1.body)('role').optional().isIn(['household', 'shopkeeper', 'admin']).withMessage('Invalid role'),
    (0, express_validator_1.body)('householdProfile').optional().isObject(),
    (0, express_validator_1.body)('householdProfile.familySize').optional().isInt({ min: 1, max: 25 }),
    (0, express_validator_1.body)('householdProfile.address').optional().isLength({ max: 280 }),
    (0, express_validator_1.body)('householdProfile.ward').optional().isLength({ max: 80 }),
    (0, express_validator_1.body)('shopkeeperProfile').optional().isObject(),
    (0, express_validator_1.body)('shopkeeperProfile.businessName').optional().isLength({ min: 2, max: 140 }),
    (0, express_validator_1.body)('shopkeeperProfile.licenseNumber').optional().isLength({ max: 60 }),
    (0, express_validator_1.body)('shopkeeperProfile.address').optional().isLength({ max: 280 }),
], (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const errors = (0, express_validator_1.validationResult)(req);
    if (!errors.isEmpty()) {
        res.status(400).json({
            error: 'Validation failed',
            message: errors.array().map(e => e.msg).join(', ')
        });
        return;
    }
    const { email, password, firstName, lastName, phoneNumber, role = 'household', householdProfile, shopkeeperProfile, } = req.body;
    const normalizedRole = (role === 'user' ? 'household' : role === 'retail_partner' ? 'shopkeeper' : role);
    const safeHouseholdProfile = normalizedRole === 'household' ? (householdProfile || {}) : undefined;
    const safeShopkeeperProfile = normalizedRole === 'shopkeeper' ? (shopkeeperProfile || {}) : undefined;
    const existingUser = await User_1.User.findOne({ email });
    if (existingUser) {
        throw new errorHandler_1.CustomError('User already exists', 409);
    }
    const approvalStatus = normalizedRole === 'admin' ? 'approved' : 'pending';
    const user = new User_1.User({
        email,
        password,
        firstName,
        lastName,
        phoneNumber,
        role: normalizedRole,
        householdProfile: safeHouseholdProfile,
        shopkeeperProfile: safeShopkeeperProfile,
        approvalStatus,
    });
    await user.save();
    const { accessToken, refreshToken } = (0, auth_1.generateTokens)(user);
    logger_1.logger.info('User registered successfully', { userId: user._id, email });
    res.status(201).json({
        message: 'User registered successfully',
        user: user.toJSON(),
        pendingApproval: user.approvalStatus !== 'approved',
        tokens: {
            accessToken,
            refreshToken,
        },
    });
}));
router.post('/login', [
    (0, express_validator_1.body)('email').isEmail().normalizeEmail(),
    (0, express_validator_1.body)('password').notEmpty().withMessage('Password is required'),
], (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const errors = (0, express_validator_1.validationResult)(req);
    if (!errors.isEmpty()) {
        throw new errorHandler_1.CustomError('Validation failed', 400);
    }
    const { email, password } = req.body;
    const user = await User_1.User.findOne({ email }).select('+password');
    if (!user) {
        throw new errorHandler_1.CustomError('Invalid credentials', 401);
    }
    if (!user.isActive) {
        throw new errorHandler_1.CustomError('Account is deactivated', 401);
    }
    if (user.approvalStatus === 'rejected') {
        throw new errorHandler_1.CustomError('Account has been rejected by an administrator', 401);
    }
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
        throw new errorHandler_1.CustomError('Invalid credentials', 401);
    }
    user.lastLoginAt = new Date();
    await user.save();
    const { accessToken, refreshToken } = (0, auth_1.generateTokens)(user);
    logger_1.logger.info('User logged in successfully', { userId: user._id, email });
    res.json({
        message: 'Login successful',
        user: user.toJSON(),
        pendingApproval: user.approvalStatus !== 'approved',
        tokens: {
            accessToken,
            refreshToken,
        },
    });
}));
router.post('/refresh', [
    (0, express_validator_1.body)('refreshToken').notEmpty().withMessage('Refresh token is required'),
], (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const errors = (0, express_validator_1.validationResult)(req);
    if (!errors.isEmpty()) {
        throw new errorHandler_1.CustomError('Validation failed', 400);
    }
    const { refreshToken } = req.body;
    try {
        const decoded = (0, auth_1.verifyRefreshToken)(refreshToken);
        const user = await User_1.User.findById(decoded.userId);
        if (!user || !user.isActive) {
            throw new errorHandler_1.CustomError('Invalid refresh token', 401);
        }
        const { accessToken, refreshToken: newRefreshToken } = (0, auth_1.generateTokens)(user);
        res.json({
            message: 'Token refreshed successfully',
            tokens: {
                accessToken,
                refreshToken: newRefreshToken,
            },
        });
    }
    catch (error) {
        throw new errorHandler_1.CustomError('Invalid refresh token', 401);
    }
}));
router.get('/me', auth_1.authenticate, (0, errorHandler_1.asyncHandler)(async (req, res) => {
    res.json({
        user: req.user.toJSON(),
    });
}));
router.post('/logout', auth_1.authenticate, (0, errorHandler_1.asyncHandler)(async (req, res) => {
    logger_1.logger.info('User logged out', { userId: req.user._id });
    res.json({
        message: 'Logout successful',
    });
}));
exports.default = router;
//# sourceMappingURL=auth.js.map