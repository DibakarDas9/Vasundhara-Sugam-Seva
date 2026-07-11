import { Schema, model, Document } from 'mongoose';

export interface IMarketplaceListing extends Document {
  id: string;
  title: string;
  expiryDate: string;
  location: string;
  postedBy: string;
  postedTime: string;
  category: string;
  price: number;
  isFree: boolean;
  image?: string;
  ownerId: string;
  phone: string;
  status: 'available' | 'claimed';
  createdAt: Date;
}

const MarketplaceListingSchema = new Schema<IMarketplaceListing>({
  id: { type: String, unique: true, sparse: true },
  title: { type: String, required: true },
  expiryDate: { type: String, required: true },
  location: { type: String, required: true, index: true },
  postedBy: { type: String, default: 'Marketplace user' },
  postedTime: { type: String, default: 'Just now' },
  category: { type: String, default: 'Other' },
  price: { type: Number, default: 0 },
  isFree: { type: Boolean, default: true },
  image: { type: String },
  ownerId: { type: String, required: true, index: true },
  phone: { type: String, default: '' },
  status: { type: String, enum: ['available', 'claimed'], default: 'available' }
}, {
  timestamps: { createdAt: true, updatedAt: false }
});

export const MarketplaceListing = model<IMarketplaceListing>('MarketplaceListing', MarketplaceListingSchema);
