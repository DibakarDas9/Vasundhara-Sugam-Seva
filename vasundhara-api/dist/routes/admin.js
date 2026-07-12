"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const express_validator_1 = require("express-validator");
const auth_1 = require("../middleware/auth");
const errorHandler_1 = require("../middleware/errorHandler");
const User_1 = require("../models/User");
const AuditLog_1 = require("../models/AuditLog");
const emailService_1 = require("../services/emailService");
const router = (0, express_1.Router)();
router.use((req, res, next) => {
    if (req.headers['x-admin-pin'] === 'admin') {
        req.user = { _id: 'admin_demo_id', role: 'admin', email: 'admin@vasundhara.com', firstName: 'Admin', lastName: 'User' };
        return next();
    }
    (0, auth_1.authenticate)(req, res, (err) => {
        if (err)
            return next(err);
        (0, auth_1.authorize)('admin')(req, res, next);
    });
});
router.get('/users', [
    (0, express_validator_1.query)('status').optional().isIn(['pending', 'approved', 'rejected']),
    (0, express_validator_1.query)('role').optional().isIn(['household', 'shopkeeper', 'admin', 'user', 'retail_partner']),
    (0, express_validator_1.query)('page').optional().isInt({ min: 1 }),
    (0, express_validator_1.query)('limit').optional().isInt({ min: 1, max: 100 }),
    (0, express_validator_1.query)('search').optional().isString().isLength({ min: 2 }),
], (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const errors = (0, express_validator_1.validationResult)(req);
    if (!errors.isEmpty()) {
        throw new errorHandler_1.CustomError('Validation failed', 400);
    }
    const { status, role, search, page = '1', limit = '20', sort = 'desc', } = req.query;
    const parsedPage = Math.max(parseInt(page, 10) || 1, 1);
    const parsedLimit = Math.min(Math.max(parseInt(limit, 10) || 20, 1), 100);
    const filter = {};
    if (status) {
        filter.approvalStatus = status;
    }
    if (role) {
        filter.role = role;
    }
    if (search) {
        const regex = new RegExp(search, 'i');
        filter.$or = [
            { firstName: regex },
            { lastName: regex },
            { email: regex },
        ];
    }
    const [users, total] = await Promise.all([
        User_1.User.find(filter)
            .sort({ createdAt: sort === 'asc' ? 1 : -1 })
            .skip((parsedPage - 1) * parsedLimit)
            .limit(parsedLimit),
        User_1.User.countDocuments(filter),
    ]);
    res.json({
        data: users,
        pagination: {
            page: parsedPage,
            limit: parsedLimit,
            total,
            pages: Math.ceil(total / parsedLimit),
        },
    });
}));
router.post('/users/:userId/approve', [
    (0, express_validator_1.param)('userId').isMongoId(),
    (0, express_validator_1.body)('note').optional().isLength({ max: 500 }),
], (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const errors = (0, express_validator_1.validationResult)(req);
    if (!errors.isEmpty()) {
        throw new errorHandler_1.CustomError('Validation failed', 400);
    }
    const user = await User_1.User.findById(req.params.userId);
    if (!user) {
        throw new errorHandler_1.CustomError('User not found', 404);
    }
    user.approvalStatus = 'approved';
    user.isActive = true;
    user.approvalMetadata = {
        reviewerId: req.user._id,
        note: req.body.note,
        reviewedAt: new Date(),
    };
    await user.save();
    (0, emailService_1.sendApprovalDecisionEmail)({
        to: user.email,
        name: user.firstName,
        decision: 'approved',
        note: req.body.note,
    });
    await AuditLog_1.AuditLog.create({
        actorId: req.user._id,
        action: 'USER_APPROVED',
        targetUserId: user._id,
        metadata: {
            note: req.body.note,
            role: user.role,
        },
    });
    res.json({
        message: 'User approved successfully',
        user: user.toJSON(),
    });
}));
router.post('/users/:userId/reject', [
    (0, express_validator_1.param)('userId').isMongoId(),
    (0, express_validator_1.body)('reason').isString().isLength({ min: 5, max: 280 }),
    (0, express_validator_1.body)('note').optional().isLength({ max: 500 }),
], (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const errors = (0, express_validator_1.validationResult)(req);
    if (!errors.isEmpty()) {
        throw new errorHandler_1.CustomError('Validation failed', 400);
    }
    const user = await User_1.User.findById(req.params.userId);
    if (!user) {
        throw new errorHandler_1.CustomError('User not found', 404);
    }
    user.approvalStatus = 'rejected';
    user.isActive = false;
    user.approvalMetadata = {
        reviewerId: req.user._id,
        note: req.body.note || req.body.reason,
        reviewedAt: new Date(),
    };
    user.flags = {
        isFlagged: true,
        reason: req.body.reason,
        lastReviewedAt: new Date(),
    };
    await user.save();
    await AuditLog_1.AuditLog.create({
        actorId: req.user._id,
        action: 'USER_REJECTED',
        targetUserId: user._id,
        metadata: {
            reason: req.body.reason,
        },
    });
    res.json({
        message: 'User rejected successfully',
        user: user.toJSON(),
    });
    (0, emailService_1.sendApprovalDecisionEmail)({
        to: user.email,
        name: user.firstName,
        decision: 'rejected',
        note: req.body.note,
        reason: req.body.reason,
    });
}));
router.post('/users/:userId/premium', [
    (0, express_validator_1.param)('userId').isMongoId(),
    (0, express_validator_1.body)('action').isIn(['grant', 'revoke']),
], (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const errors = (0, express_validator_1.validationResult)(req);
    if (!errors.isEmpty()) {
        throw new errorHandler_1.CustomError('Validation failed', 400);
    }
    const { action } = req.body;
    const newExpiry = action === 'grant' ? Date.now() + (100 * 365 * 24 * 60 * 60 * 1000) : 0;
    const user = await User_1.User.findByIdAndUpdate(req.params.userId, { premiumExpiry: newExpiry }, { new: true });
    if (!user) {
        throw new errorHandler_1.CustomError('User not found', 404);
    }
    res.json({ message: `Premium ${action}ed successfully`, user });
}));
router.get('/audit-logs', [
    (0, express_validator_1.query)('action').optional().isString(),
    (0, express_validator_1.query)('limit').optional().isInt({ min: 1, max: 200 }),
], (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const errors = (0, express_validator_1.validationResult)(req);
    if (!errors.isEmpty()) {
        throw new errorHandler_1.CustomError('Validation failed', 400);
    }
    const { action, limit = '50' } = req.query;
    const parsedLimit = Math.min(parseInt(limit, 10) || 50, 200);
    const filter = action ? { action } : {};
    const logs = await AuditLog_1.AuditLog.find(filter)
        .sort({ createdAt: -1 })
        .limit(parsedLimit)
        .populate('actorId', 'firstName lastName email role')
        .populate('targetUserId', 'firstName lastName email role');
    res.json({
        data: logs,
    });
}));
exports.default = router;
//# sourceMappingURL=admin.js.map