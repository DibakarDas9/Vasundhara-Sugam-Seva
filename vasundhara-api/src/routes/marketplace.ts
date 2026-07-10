/**
 * Marketplace routes
 */

import { Request, Response, Router } from 'express';
import { asyncHandler } from '@/middleware/errorHandler';

type MarketplaceListing = {
  id: string;
  title: string;
  expiryDate: string;
  location: string;
  postedBy: string;
  postedTime: string;
  createdAt: number;
};

const router = Router();
const listings: MarketplaceListing[] = [];

function normalizeLocation(value: string) {
  return value.trim().toLowerCase().replace(/\s+/g, ' ');
}

router.get('/', asyncHandler(async (req: Request, res: Response) => {
  const location = typeof req.query.location === 'string' ? req.query.location : '';
  const normalizedLocation = normalizeLocation(location);

  const visibleListings = normalizedLocation
    ? listings.filter(listing => normalizeLocation(listing.location) === normalizedLocation)
    : listings;

  res.json({
    listings: visibleListings.sort((left, right) => right.createdAt - left.createdAt),
  });
}));

router.post('/', asyncHandler(async (req: Request, res: Response) => {
  const title = typeof req.body.title === 'string' ? req.body.title.trim() : '';
  const expiryDate = typeof req.body.expiryDate === 'string' ? req.body.expiryDate.trim() : '';
  const location = typeof req.body.location === 'string' ? req.body.location.trim() : '';
  const postedBy = typeof req.body.postedBy === 'string' && req.body.postedBy.trim()
    ? req.body.postedBy.trim()
    : 'Marketplace user';

  if (!title || !expiryDate || !location) {
    res.status(400).json({ error: 'Item name, expiry date, and location are required.' });
    return;
  }

  const listing: MarketplaceListing = {
    id: `market_${Date.now()}`,
    title,
    expiryDate,
    location,
    postedBy,
    postedTime: 'Just now',
    createdAt: Date.now(),
  };

  listings.unshift(listing);

  res.status(201).json({ listing });
}));

export default router;
