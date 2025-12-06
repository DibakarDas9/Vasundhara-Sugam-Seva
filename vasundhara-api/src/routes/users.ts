/**
 * User routes
 */

import { Router } from 'express';
import { body, validationResult } from 'express-validator';
import { User } from '@/models/User';
import { authenticate, AuthRequest } from '@/middleware/auth';
import { CustomError, asyncHandler } from '@/middleware/errorHandler';
import { logger } from '@/utils/logger';

const router = Router();

/**
 * @swagger
 * /api/users/profile:
 *   put:
 *     summary: Update user profile
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               firstName:
 *                 type: string
 *               lastName:
 *                 type: string
 *               phoneNumber:
 *                 type: string
 *               dateOfBirth:
 *                 type: string
 *                 format: date
 *               preferences:
 *                 type: object
 *                 properties:
 *                   notifications:
 *                     type: boolean
 *                   alerts:
 *                     type: boolean
 *                   gamification:
 *                     type: boolean
 *                   language:
 *                     type: string
 *                   timezone:
 *                     type: string
 *     responses:
 *       200:
 *         description: Profile updated successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 */
router.put('/profile', authenticate, [
  body('firstName').optional().trim().isLength({ min: 1 }),
  body('lastName').optional().trim().isLength({ min: 1 }),
  body('phoneNumber').optional().isMobilePhone(),
  body('dateOfBirth').optional().isISO8601(),
  body('preferences.notifications').optional().isBoolean(),
  body('preferences.alerts').optional().isBoolean(),
  body('preferences.gamification').optional().isBoolean(),
  body('preferences.language').optional().isIn(['en', 'es', 'fr', 'de', 'it', 'pt', 'hi', 'zh', 'ja', 'ko']),
  body('preferences.timezone').optional().isString(),
], asyncHandler(async (req: AuthRequest, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new CustomError('Validation failed', 400);
  }

  const allowedUpdates = [
    'firstName', 'lastName', 'phoneNumber', 'dateOfBirth', 'preferences'
  ];
  
  const updates = Object.keys(req.body)
    .filter(key => allowedUpdates.includes(key))
    .reduce((obj, key) => {
      obj[key] = req.body[key];
      return obj;
    }, {} as any);

  const user = await User.findByIdAndUpdate(
    req.user!._id,
    updates,
    { new: true, runValidators: true }
  );

  if (!user) {
    throw new CustomError('User not found', 404);
  }

  logger.info('User profile updated', { userId: user._id });

  res.json({
    message: 'Profile updated successfully',
    user: user.toJSON(),
  });
}));

/**
 * @swagger
 * /api/users/change-password:
 *   post:
 *     summary: Change user password
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - currentPassword
 *               - newPassword
 *             properties:
 *               currentPassword:
 *                 type: string
 *               newPassword:
 *                 type: string
 *                 minLength: 8
 *     responses:
 *       200:
 *         description: Password changed successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized or invalid current password
 */
router.post('/change-password', authenticate, [
  body('currentPassword').notEmpty().withMessage('Current password is required'),
  body('newPassword').isLength({ min: 8 }).withMessage('New password must be at least 8 characters'),
], asyncHandler(async (req: AuthRequest, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new CustomError('Validation failed', 400);
  }

  const { currentPassword, newPassword } = req.body;

  // Get user with password
  const user = await User.findById(req.user!._id).select('+password');
  if (!user) {
    throw new CustomError('User not found', 404);
  }

  // Verify current password
  const isCurrentPasswordValid = await user.comparePassword(currentPassword);
  if (!isCurrentPasswordValid) {
    throw new CustomError('Current password is incorrect', 401);
  }

  // Update password
  user.password = newPassword;
  await user.save();

  logger.info('User password changed', { userId: user._id });

  res.json({
    message: 'Password changed successfully',
  });
}));

/**
 * @swagger
 * /api/users/deactivate:
 *   post:
 *     summary: Deactivate user account
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Account deactivated successfully
 *       401:
 *         description: Unauthorized
 */
router.post('/deactivate', authenticate, asyncHandler(async (req: AuthRequest, res) => {
  const user = await User.findByIdAndUpdate(
    req.user!._id,
    { isActive: false },
    { new: true }
  );

  if (!user) {
    throw new CustomError('User not found', 404);
  }

  logger.info('User account deactivated', { userId: user._id });

  res.json({
    message: 'Account deactivated successfully',
  });
}));

/**
 * @swagger
 * /api/users/delete:
 *   delete:
 *     summary: Delete user account
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Account deleted successfully
 *       401:
 *         description: Unauthorized
 */
router.delete('/delete', authenticate, asyncHandler(async (req: AuthRequest, res) => {
  // In a real implementation, you might want to soft delete or anonymize data
  const user = await User.findByIdAndDelete(req.user!._id);

  if (!user) {
    throw new CustomError('User not found', 404);
  }

  logger.info('User account deleted', { userId: user._id });

  res.json({
    message: 'Account deleted successfully',
  });
}));

export default router;
