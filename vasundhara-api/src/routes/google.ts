import { Router, Response } from 'express';
import { body, validationResult } from 'express-validator';
import { OAuth2Client } from 'google-auth-library';
import { User } from '@/models/User';
import { generateTokens } from '@/middleware/auth';
import { CustomError, asyncHandler } from '@/middleware/errorHandler';
import { logger } from '@/utils/logger';

const router = Router();

/**
 * @swagger
 * /api/auth/google:
 *   post:
 *     summary: Login/signup with Google
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - idToken
 *             properties:
 *               idToken:
 *                 type: string
 *                 description: Google ID token (from Google Identity Services)
 *     responses:
 *       200:
 *         description: Google login successful
 *       400:
 *         description: Validation error
 *       401:
 *         description: Invalid Google token
 */
router.post(
  '/google',
  [
    body('idToken').isString().notEmpty().withMessage('idToken is required'),
  ],
  asyncHandler(async (req: any, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new CustomError('Validation failed', 400);
    }

    const { idToken } = req.body as { idToken: string };

    const clientId = process.env.GOOGLE_CLIENT_ID;
    if (!clientId) {
      throw new CustomError('Server misconfiguration: GOOGLE_CLIENT_ID missing', 500);
    }

    const client = new OAuth2Client(clientId);

    let ticketPayload: any;
    try {
      const ticket = await client.verifyIdToken({ idToken, audience: clientId });
      ticketPayload = ticket.getPayload();
    } catch (e) {
      throw new CustomError('Invalid Google token', 401);
    }

    const googleEmail = ticketPayload?.email as string | undefined;
    const googleSub = ticketPayload?.sub as string | undefined;
    const givenName = (ticketPayload?.given_name as string | undefined) || '';
    const familyName = (ticketPayload?.family_name as string | undefined) || '';

    if (!googleEmail || !googleSub) {
      throw new CustomError('Invalid Google token payload', 401);
    }

    // Find existing user
    let user = await User.findOne({ email: googleEmail.toLowerCase() });

    if (!user) {
      // Create new social user
      user = new User({
        email: googleEmail.toLowerCase(),
        // password is omitted; schema requires it only when no socialLogins.google
        firstName: givenName || 'Google',
        lastName: familyName || 'User',
        role: 'household',
        isActive: true,
        isEmailVerified: true,
        socialLogins: {
          google: { id: googleSub, email: googleEmail.toLowerCase() },
        },
        approvalStatus: 'approved',
      });

      await user.save();
    } else {
      // Attach/refresh social identity
      user.socialLogins = user.socialLogins || ({} as any);
      user.socialLogins.google = { id: googleSub, email: googleEmail.toLowerCase() };

      // Update email verification/profile fields
      user.isEmailVerified = true;
      if (givenName && !user.firstName) user.firstName = givenName;
      if (familyName && !user.lastName) user.lastName = familyName;

      await user.save();
    }

    if (!user.isActive) {
      throw new CustomError('Account is deactivated', 401);
    }

    const { accessToken, refreshToken } = generateTokens(user);

    logger.info('User signed in with Google', { userId: user._id, email: user.email });

    res.status(200).json({
      message: 'Google login successful',
      user: user.toJSON(),
      pendingApproval: user.approvalStatus !== 'approved',
      tokens: {
        accessToken,
        refreshToken,
      },
    });
  }),
);

export default router;

