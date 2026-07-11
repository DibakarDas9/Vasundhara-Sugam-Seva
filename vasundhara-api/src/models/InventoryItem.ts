import mongoose, { Document, Schema } from 'mongoose';

export interface IInventoryItem extends Document {
  id: string;
  userId: mongoose.Types.ObjectId;
  name: string;
  category: string;
  expiryDate: string | null;
  quantity: number;
  unit: string;
  addedDate: string;
  status: string;
  price: number;
  photo: string;
  createdAt: Date;
  updatedAt: Date;
}

const InventoryItemSchema = new Schema<IInventoryItem>({
  id: { type: String, required: true },
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  name: { type: String, required: true },
  category: { type: String, default: 'Uncategorized' },
  expiryDate: { type: String, default: null },
  quantity: { type: Number, default: 1 },
  unit: { type: String, default: '' },
  addedDate: { type: String },
  status: { type: String, default: 'good' },
  price: { type: Number, default: 0 },
  photo: { type: String, default: '' }
}, { timestamps: true });

// Avoid OverwriteModelError if it already exists
export const InventoryItem = mongoose.models.InventoryItem || mongoose.model<IInventoryItem>('InventoryItem', InventoryItemSchema);
