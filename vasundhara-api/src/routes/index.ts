import { Router } from 'express';

import authRouter from './auth';
import googleAuthRouter from './google';
import marketplaceRouter from './marketplace';

const router = Router();

// /api/auth
router.use('/auth', authRouter);

// /api/auth/google
router.use('/auth/google', googleAuthRouter);

router.use('/marketplace', marketplaceRouter);

export default router;

