/**
 * Webhook routes
 */

import { Router } from 'express';
import { asyncHandler } from '@/middleware/errorHandler';

const router = Router();

// Placeholder routes - to be implemented
router.post('/stripe', asyncHandler(async (req, res) => {
  res.json({ message: 'Stripe webhook - to be implemented' });
}));

router.post('/ml-service', asyncHandler(async (req, res) => {
  res.json({ message: 'ML service webhook - to be implemented' });
}));

export default router;
