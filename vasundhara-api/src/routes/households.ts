/**
 * Household routes
 */

import { Router } from 'express';
import { authenticate, AuthRequest } from '@/middleware/auth';
import { asyncHandler } from '@/middleware/errorHandler';

const router = Router();

// Placeholder routes - to be implemented
router.get('/', authenticate, asyncHandler(async (req: AuthRequest, res) => {
  res.json({ message: 'Get households - to be implemented' });
}));

router.post('/', authenticate, asyncHandler(async (req: AuthRequest, res) => {
  res.json({ message: 'Create household - to be implemented' });
}));

router.get('/:id', authenticate, asyncHandler(async (req: AuthRequest, res) => {
  res.json({ message: 'Get household by ID - to be implemented' });
}));

router.put('/:id', authenticate, asyncHandler(async (req: AuthRequest, res) => {
  res.json({ message: 'Update household - to be implemented' });
}));

router.delete('/:id', authenticate, asyncHandler(async (req: AuthRequest, res) => {
  res.json({ message: 'Delete household - to be implemented' });
}));

export default router;
