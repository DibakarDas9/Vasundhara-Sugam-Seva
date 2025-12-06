/**
 * Recipe routes
 */

import { Router } from 'express';
import { authenticate, AuthRequest } from '@/middleware/auth';
import { asyncHandler } from '@/middleware/errorHandler';

const router = Router();

// Placeholder routes - to be implemented
router.get('/', authenticate, asyncHandler(async (req: AuthRequest, res) => {
  res.json({ message: 'Get recipes - to be implemented' });
}));

router.post('/', authenticate, asyncHandler(async (req: AuthRequest, res) => {
  res.json({ message: 'Create recipe - to be implemented' });
}));

router.get('/:id', authenticate, asyncHandler(async (req: AuthRequest, res) => {
  res.json({ message: 'Get recipe by ID - to be implemented' });
}));

router.put('/:id', authenticate, asyncHandler(async (req: AuthRequest, res) => {
  res.json({ message: 'Update recipe - to be implemented' });
}));

router.delete('/:id', authenticate, asyncHandler(async (req: AuthRequest, res) => {
  res.json({ message: 'Delete recipe - to be implemented' });
}));

export default router;
