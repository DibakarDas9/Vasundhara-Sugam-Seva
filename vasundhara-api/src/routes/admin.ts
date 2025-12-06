/**
 * Admin routes
 */

import { Router } from 'express';
import { body, param, query, validationResult } from 'express-validator';
import { authenticate, authorize, AuthRequest } from '@/middleware/auth';
import { asyncHandler, CustomError } from '@/middleware/errorHandler';
import { User } from '@/models/User';
import { AuditLog } from '@/models/AuditLog';
import { sendApprovalDecisionEmail } from '@/services/emailService';

const router = Router();

// All admin routes require admin role
router.use(authenticate);
router.use(authorize('admin'));

router.get('/users', [
  query('status').optional().isIn(['pending', 'approved', 'rejected']),
  query('role').optional().isIn(['household', 'shopkeeper', 'admin', 'user', 'retail_partner']),
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 }),
  query('search').optional().isString().isLength({ min: 2 }),
], asyncHandler(async (req: AuthRequest, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new CustomError('Validation failed', 400);
  }

  const {
    status,
    role,
    search,
    page = '1',
    limit = '20',
    sort = 'desc',
  } = req.query;

  const parsedPage = Math.max(parseInt(page as string, 10) || 1, 1);
  const parsedLimit = Math.min(Math.max(parseInt(limit as string, 10) || 20, 1), 100);
  const filter: Record<string, any> = {};

  if (status) {
    filter.approvalStatus = status;
  }

  if (role) {
    filter.role = role;
  }

  if (search) {
    const regex = new RegExp(search as string, 'i');
    filter.$or = [
      { firstName: regex },
      { lastName: regex },
      { email: regex },
    ];
  }

  const [users, total] = await Promise.all([
    User.find(filter)
      .sort({ createdAt: sort === 'asc' ? 1 : -1 })
      .skip((parsedPage - 1) * parsedLimit)
      .limit(parsedLimit),
    User.countDocuments(filter),
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
  param('userId').isMongoId(),
  body('note').optional().isLength({ max: 500 }),
], asyncHandler(async (req: AuthRequest, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new CustomError('Validation failed', 400);
  }

  const user = await User.findById(req.params.userId);
  if (!user) {
    throw new CustomError('User not found', 404);
  }

  user.approvalStatus = 'approved';
  user.isActive = true;
  user.approvalMetadata = {
    reviewerId: req.user!._id,
    note: req.body.note,
    reviewedAt: new Date(),
  };

  await user.save();

  sendApprovalDecisionEmail({
    to: user.email,
    name: user.firstName,
    decision: 'approved',
    note: req.body.note,
  });

  await AuditLog.create({
    actorId: req.user!._id,
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
  param('userId').isMongoId(),
  body('reason').isString().isLength({ min: 5, max: 280 }),
  body('note').optional().isLength({ max: 500 }),
], asyncHandler(async (req: AuthRequest, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new CustomError('Validation failed', 400);
  }

  const user = await User.findById(req.params.userId);
  if (!user) {
    throw new CustomError('User not found', 404);
  }

  user.approvalStatus = 'rejected';
  user.isActive = false;
  user.approvalMetadata = {
    reviewerId: req.user!._id,
    note: req.body.note || req.body.reason,
    reviewedAt: new Date(),
  };

  user.flags = {
    isFlagged: true,
    reason: req.body.reason,
    lastReviewedAt: new Date(),
  };

  await user.save();

  await AuditLog.create({
    actorId: req.user!._id,
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

  sendApprovalDecisionEmail({
    to: user.email,
    name: user.firstName,
    decision: 'rejected',
    note: req.body.note,
    reason: req.body.reason,
  });
}));

router.get('/audit-logs', [
  query('action').optional().isString(),
  query('limit').optional().isInt({ min: 1, max: 200 }),
], asyncHandler(async (req: AuthRequest, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new CustomError('Validation failed', 400);
  }

  const { action, limit = '50' } = req.query;
  const parsedLimit = Math.min(parseInt(limit as string, 10) || 50, 200);
  const filter = action ? { action } : {};

  const logs = await AuditLog.find(filter)
    .sort({ createdAt: -1 })
    .limit(parsedLimit)
    .populate('actorId', 'firstName lastName email role')
    .populate('targetUserId', 'firstName lastName email role');

  res.json({
    data: logs,
  });
}));

export default router;
