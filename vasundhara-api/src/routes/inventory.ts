import { Router, Response } from 'express';
import { authenticate, AuthRequest } from '@/middleware/auth';
import { asyncHandler } from '@/middleware/errorHandler';
import { InventoryItem } from '@/models/InventoryItem';

const router = Router();

router.get('/', authenticate, asyncHandler(async (req: AuthRequest, res: Response) => {
  const userId = req.user?.id;
  if (!userId) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }
  const list = await InventoryItem.find({ userId }).sort({ createdAt: -1 });
  const mappedItems = list.map(item => ({
    id: Number(item.id) || Date.now(),
    name: item.name,
    category: item.category,
    expiryDate: item.expiryDate,
    quantity: item.quantity,
    unit: item.unit,
    addedDate: item.addedDate,
    status: item.status,
    price: item.price,
    photo: item.photo
  }));
  res.json({ items: mappedItems });
}));

router.post('/', authenticate, asyncHandler(async (req: AuthRequest, res: Response) => {
  const userId = req.user?.id;
  if (!userId) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }

  const {
    id,
    name,
    category,
    expiryDate,
    quantity,
    unit,
    addedDate,
    status,
    price,
    photo,
  } = req.body;

  if (!id || !name) {
    res.status(400).json({ error: 'Item ID and Name are required.' });
    return;
  }

  const idStr = String(id);

  // Remove duplicate if exists
  await InventoryItem.deleteOne({ userId, id: idStr });

  const item = new InventoryItem({
    id: idStr,
    userId,
    name,
    category,
    expiryDate,
    quantity,
    unit,
    addedDate,
    status,
    price,
    photo,
  });

  await item.save();
  res.status(201).json({ item });
}));

router.post('/sync', authenticate, asyncHandler(async (req: AuthRequest, res: Response) => {
  const userId = req.user?.id;
  if (!userId) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }

  const { items } = req.body;
  if (!Array.isArray(items)) {
    res.status(400).json({ error: 'Items array is required.' });
    return;
  }

  await InventoryItem.deleteMany({ userId });

  if (items.length > 0) {
    const docs = items.map(item => ({
      id: String(item.id),
      userId,
      name: item.name,
      category: item.category || 'Uncategorized',
      expiryDate: item.expiryDate || null,
      quantity: typeof item.quantity === 'number' ? item.quantity : 1,
      unit: item.unit || '',
      addedDate: item.addedDate,
      status: item.status || 'good',
      price: typeof item.price === 'number' ? item.price : 0,
      photo: item.photo || '',
    }));
    await InventoryItem.insertMany(docs);
  }

  res.json({ message: 'Inventory synced successfully.' });
}));

router.delete('/:id', authenticate, asyncHandler(async (req: AuthRequest, res: Response) => {
  const userId = req.user?.id;
  if (!userId) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }

  const { id } = req.params;
  await InventoryItem.deleteOne({ userId, id: String(id) });
  res.json({ message: 'Item deleted successfully.' });
}));

export default router;
