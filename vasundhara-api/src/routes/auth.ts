/**
 * Authentication routes
 */

import { Router } from 'express';
import { body, validationResult } from 'express-validator';
import { User } from '@/models/User';
import { generateTokens, verifyRefreshToken, authenticate, AuthRequest } from '@/middleware/auth';
import { CustomError, asyncHandler } from '@/middleware/errorHandler';
import { logger } from '@/utils/logger';

const router = Router();

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Register a new user
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *               - firstName
 *               - lastName
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *                 minLength: 8
 *               firstName:
 *                 type: string
 *               lastName:
 *                 type: string
 *               phoneNumber:
 *                 type: string
 *     responses:
 *       201:
 *         description: User registered successfully
 *       400:
 *         description: Validation error
 *       409:
 *         description: User already exists
 */
router.post('/register', [
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
  body('firstName').trim().isLength({ min: 1 }).withMessage('First name is required'),
  body('lastName').trim().isLength({ min: 1 }).withMessage('Last name is required'),
  body('phoneNumber').optional().isMobilePhone(),
  body('role').optional().isIn(['household', 'shopkeeper', 'admin']).withMessage('Invalid role'),
  body('householdProfile').optional().isObject(),
  body('householdProfile.familySize').optional().isInt({ min: 1, max: 25 }),
  body('householdProfile.address').optional().isLength({ max: 280 }),
  body('householdProfile.ward').optional().isLength({ max: 80 }),
  body('shopkeeperProfile').optional().isObject(),
  body('shopkeeperProfile.businessName').optional().isLength({ min: 2, max: 140 }),
  body('shopkeeperProfile.licenseNumber').optional().isLength({ max: 60 }),
  body('shopkeeperProfile.address').optional().isLength({ max: 280 }),
], asyncHandler(async (req: AuthRequest, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new CustomError('Validation failed', 400);
  }

  const {
    email,
    password,
    firstName,
    lastName,
    phoneNumber,
    role = 'household',
    householdProfile,
    shopkeeperProfile,
  } = req.body;

  const normalizedRole = (role === 'user' ? 'household' : role === 'retail_partner' ? 'shopkeeper' : role) as 'household' | 'shopkeeper' | 'admin';

  const safeHouseholdProfile = normalizedRole === 'household' ? (householdProfile || {}) : undefined;
  const safeShopkeeperProfile = normalizedRole === 'shopkeeper' ? (shopkeeperProfile || {}) : undefined;

  // Check if user already exists
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw new CustomError('User already exists', 409);
  }

  // Create new user
  const approvalStatus = normalizedRole === 'admin' ? 'approved' : 'pending';

  const user = new User({
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

  // Generate tokens
  const { accessToken, refreshToken } = generateTokens(user);

  logger.info('User registered successfully', { userId: user._id, email });

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

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Login user
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Login successful
 *       401:
 *         description: Invalid credentials
 */
router.post('/login', [
  body('email').isEmail().normalizeEmail(),
  body('password').notEmpty().withMessage('Password is required'),
], asyncHandler(async (req: AuthRequest, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new CustomError('Validation failed', 400);
  }

  const { email, password } = req.body;

  // Find user and include password for comparison
  const user = await User.findOne({ email }).select('+password');
  if (!user) {
    throw new CustomError('Invalid credentials', 401);
  }

  // Check if user is active
  if (!user.isActive) {
    throw new CustomError('Account is deactivated', 401);
  }

  if (user.approvalStatus === 'rejected') {
    throw new CustomError('Account has been rejected by an administrator', 401);
  }

  // Verify password
  const isPasswordValid = await user.comparePassword(password);
  if (!isPasswordValid) {
    throw new CustomError('Invalid credentials', 401);
  }

  // Update last login
  user.lastLoginAt = new Date();
  await user.save();

  // Generate tokens
  const { accessToken, refreshToken } = generateTokens(user);

  logger.info('User logged in successfully', { userId: user._id, email });

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

/**
 * @swagger
 * /api/auth/refresh:
 *   post:
 *     summary: Refresh access token
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - refreshToken
 *             properties:
 *               refreshToken:
 *                 type: string
 *     responses:
 *       200:
 *         description: Token refreshed successfully
 *       401:
 *         description: Invalid refresh token
 */
router.post('/refresh', [
  body('refreshToken').notEmpty().withMessage('Refresh token is required'),
], asyncHandler(async (req: AuthRequest, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new CustomError('Validation failed', 400);
  }

  const { refreshToken } = req.body;

  try {
    const decoded = verifyRefreshToken(refreshToken);
    const user = await User.findById(decoded.userId);
    
    if (!user || !user.isActive) {
      throw new CustomError('Invalid refresh token', 401);
    }

    // Generate new tokens
    const { accessToken, refreshToken: newRefreshToken } = generateTokens(user);

    res.json({
      message: 'Token refreshed successfully',
      tokens: {
        accessToken,
        refreshToken: newRefreshToken,
      },
    });
  } catch (error) {
    throw new CustomError('Invalid refresh token', 401);
  }
}));

/**
 * @swagger
 * /api/auth/me:
 *   get:
 *     summary: Get current user profile
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User profile retrieved successfully
 *       401:
 *         description: Unauthorized
 */
router.get('/me', authenticate, asyncHandler(async (req: AuthRequest, res) => {
  res.json({
    user: req.user!.toJSON(),
  });
}));

/**
 * @swagger
 * /api/auth/logout:
 *   post:
 *     summary: Logout user
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Logout successful
 */
router.post('/logout', authenticate, asyncHandler(async (req: AuthRequest, res) => {
  // In a real implementation, you might want to blacklist the token
  // For now, we'll just return success
  logger.info('User logged out', { userId: req.user!._id });
  
  res.json({
    message: 'Logout successful',
  });
}));

export default router;
