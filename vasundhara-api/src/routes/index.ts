import { Router } from 'express';

import authRouter from './auth';
import googleAuthRouter from './google';
import marketplaceRouter from './marketplace';
import inventoryRouter from './inventory';
import adminRouter from './admin';

const router = Router();

// /api/auth
router.use('/auth', authRouter);

// /api/auth/google
router.use('/auth/google', googleAuthRouter);

router.use('/marketplace', marketplaceRouter);
router.use('/inventory', inventoryRouter);
router.use('/admin', adminRouter);

export default router;

