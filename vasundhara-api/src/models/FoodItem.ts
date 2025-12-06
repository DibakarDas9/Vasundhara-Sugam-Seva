/**
 * Food Item model and schema
 */

import mongoose, { Document, Schema } from 'mongoose';

export interface IFoodItem extends Document {
  _id: string;
  name: string;
  category: string;
  subcategory?: string;
  brand?: string;
  description?: string;
  household: mongoose.Types.ObjectId;
  addedBy: mongoose.Types.ObjectId;
  
  // Purchase information
  purchaseDate: Date;
  purchasePrice?: number;
  purchaseLocation?: string;
  
  // Expiry information
  expiryDate?: Date;
  predictedExpiryDate?: Date;
  expiryConfidence?: number;
  spoilageCurve?: Array<{
    date: Date;
    probSpoiled: number;
  }>;
  
  // Storage information
  storage: 'fridge' | 'freezer' | 'pantry' | 'counter' | 'outside';
  packaging: 'plastic' | 'glass' | 'metal' | 'paper' | 'clamshell' | 'vacuum' | 'none';
  temperature?: number; // in Celsius
  humidity?: number; // percentage
  
  // Quantity information
  quantity: number;
  unit: 'piece' | 'kg' | 'g' | 'l' | 'ml' | 'cup' | 'tbsp' | 'tsp' | 'oz' | 'lb';
  remainingQuantity: number;
  
  // Status and tracking
  status: 'fresh' | 'expiring_soon' | 'expired' | 'consumed' | 'wasted';
  lastUsedAt?: Date;
  usageRate: number; // times per week
  
  // Media
  imageUrl?: string;
  barcode?: string;
  qrCode?: string;
  
  // ML and AI data
  mlFeatures?: {
    colorAnalysis?: any;
    freshnessScore?: number;
    qualityIndicators?: string[];
    spoilageIndicators?: string[];
  };
  
  // Tags and metadata
  tags: string[];
  notes?: string;
  
  // Timestamps
  createdAt: Date;
  updatedAt: Date;
  
  // Methods
  updateStatus(): Promise<IFoodItem>;
  markAsConsumed(quantity?: number): Promise<IFoodItem>;
  markAsWasted(reason?: string): Promise<IFoodItem>;
  isExpiringSoon(days?: number): boolean;
  getDaysUntilExpiry(): number;
  calculateWasteValue(): number;
}

const FoodItemSchema = new Schema<IFoodItem>({
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200,
  },
  category: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100,
  },
  subcategory: {
    type: String,
    trim: true,
    maxlength: 100,
  },
  brand: {
    type: String,
    trim: true,
    maxlength: 100,
  },
  description: {
    type: String,
    trim: true,
    maxlength: 1000,
  },
  household: {
    type: Schema.Types.ObjectId,
    ref: 'Household',
    required: true,
  },
  addedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  
  // Purchase information
  purchaseDate: {
    type: Date,
    required: true,
    default: Date.now,
  },
  purchasePrice: {
    type: Number,
    min: 0,
  },
  purchaseLocation: {
    type: String,
    trim: true,
    maxlength: 200,
  },
  
  // Expiry information
  expiryDate: {
    type: Date,
    validate: {
      validator: function(v: Date) {
        return !v || v > this.purchaseDate;
      },
      message: 'Expiry date must be after purchase date',
    },
  },
  predictedExpiryDate: {
    type: Date,
  },
  expiryConfidence: {
    type: Number,
    min: 0,
    max: 1,
  },
  spoilageCurve: [{
    date: {
      type: Date,
      required: true,
    },
    probSpoiled: {
      type: Number,
      required: true,
      min: 0,
      max: 1,
    },
  }],
  
  // Storage information
  storage: {
    type: String,
    enum: ['fridge', 'freezer', 'pantry', 'counter', 'outside'],
    required: true,
    default: 'fridge',
  },
  packaging: {
    type: String,
    enum: ['plastic', 'glass', 'metal', 'paper', 'clamshell', 'vacuum', 'none'],
    default: 'none',
  },
  temperature: {
    type: Number,
    min: -20,
    max: 50,
  },
  humidity: {
    type: Number,
    min: 0,
    max: 100,
  },
  
  // Quantity information
  quantity: {
    type: Number,
    required: true,
    min: 0.01,
  },
  unit: {
    type: String,
    enum: ['piece', 'kg', 'g', 'l', 'ml', 'cup', 'tbsp', 'tsp', 'oz', 'lb'],
    required: true,
    default: 'piece',
  },
  remainingQuantity: {
    type: Number,
    required: true,
    min: 0,
    validate: {
      validator: function(v: number) {
        return v <= this.quantity;
      },
      message: 'Remaining quantity cannot exceed total quantity',
    },
  },
  
  // Status and tracking
  status: {
    type: String,
    enum: ['fresh', 'expiring_soon', 'expired', 'consumed', 'wasted'],
    default: 'fresh',
  },
  lastUsedAt: {
    type: Date,
  },
  usageRate: {
    type: Number,
    default: 1,
    min: 0,
    max: 7,
  },
  
  // Media
  imageUrl: {
    type: String,
    validate: {
      validator: function(v: string) {
        return !v || /^https?:\/\/.+\.(jpg|jpeg|png|gif|webp)$/i.test(v);
      },
      message: 'Image URL must be a valid URL to an image file',
    },
  },
  barcode: {
    type: String,
    trim: true,
  },
  qrCode: {
    type: String,
    trim: true,
  },
  
  // ML and AI data
  mlFeatures: {
    colorAnalysis: Schema.Types.Mixed,
    freshnessScore: {
      type: Number,
      min: 0,
      max: 1,
    },
    qualityIndicators: [String],
    spoilageIndicators: [String],
  },
  
  // Tags and metadata
  tags: {
    type: [String],
    default: [],
  },
  notes: {
    type: String,
    trim: true,
    maxlength: 1000,
  },
}, {
  timestamps: true,
});

// Indexes
FoodItemSchema.index({ household: 1 });
FoodItemSchema.index({ addedBy: 1 });
FoodItemSchema.index({ status: 1 });
FoodItemSchema.index({ category: 1 });
FoodItemSchema.index({ expiryDate: 1 });
FoodItemSchema.index({ predictedExpiryDate: 1 });
FoodItemSchema.index({ createdAt: -1 });
FoodItemSchema.index({ 'tags': 1 });

// Compound indexes
FoodItemSchema.index({ household: 1, status: 1 });
FoodItemSchema.index({ household: 1, expiryDate: 1 });
FoodItemSchema.index({ household: 1, category: 1 });

// Methods
FoodItemSchema.methods.updateStatus = async function() {
  const now = new Date();
  const daysUntilExpiry = this.getDaysUntilExpiry();
  
  if (this.status === 'consumed' || this.status === 'wasted') {
    return this;
  }
  
  if (daysUntilExpiry < 0) {
    this.status = 'expired';
  } else if (daysUntilExpiry <= 3) {
    this.status = 'expiring_soon';
  } else {
    this.status = 'fresh';
  }
  
  return this.save();
};

FoodItemSchema.methods.markAsConsumed = async function(quantity?: number) {
  const consumedQuantity = quantity || this.remainingQuantity;
  
  if (consumedQuantity > this.remainingQuantity) {
    throw new Error('Cannot consume more than remaining quantity');
  }
  
  this.remainingQuantity -= consumedQuantity;
  this.lastUsedAt = new Date();
  
  if (this.remainingQuantity <= 0) {
    this.status = 'consumed';
  }
  
  return this.save();
};

FoodItemSchema.methods.markAsWasted = async function(reason?: string) {
  this.status = 'wasted';
  this.remainingQuantity = 0;
  
  if (reason) {
    this.notes = (this.notes || '') + `\nWasted: ${reason}`;
  }
  
  return this.save();
};

FoodItemSchema.methods.isExpiringSoon = function(days: number = 3): boolean {
  const daysUntilExpiry = this.getDaysUntilExpiry();
  return daysUntilExpiry >= 0 && daysUntilExpiry <= days;
};

FoodItemSchema.methods.getDaysUntilExpiry = function(): number {
  const expiryDate = this.predictedExpiryDate || this.expiryDate;
  if (!expiryDate) return Infinity;
  
  const now = new Date();
  const diffTime = expiryDate.getTime() - now.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

FoodItemSchema.methods.calculateWasteValue = function(): number {
  if (!this.purchasePrice || this.quantity === 0) return 0;
  
  const wasteRatio = (this.quantity - this.remainingQuantity) / this.quantity;
  return this.purchasePrice * wasteRatio;
};

// Pre-save middleware
FoodItemSchema.pre('save', async function(next) {
  // Update status based on expiry dates
  if (this.isModified('expiryDate') || this.isModified('predictedExpiryDate')) {
    await this.updateStatus();
  }
  
  next();
});

// Static methods
FoodItemSchema.statics.findExpiringSoon = function(householdId: string, days: number = 3) {
  const futureDate = new Date();
  futureDate.setDate(futureDate.getDate() + days);
  
  return this.find({
    household: householdId,
    status: { $in: ['fresh', 'expiring_soon'] },
    $or: [
      { expiryDate: { $lte: futureDate } },
      { predictedExpiryDate: { $lte: futureDate } },
    ],
  });
};

FoodItemSchema.statics.findByCategory = function(householdId: string, category: string) {
  return this.find({
    household: householdId,
    category: category,
    status: { $in: ['fresh', 'expiring_soon'] },
  });
};

FoodItemSchema.statics.getStatistics = function(householdId: string) {
  return this.aggregate([
    { $match: { household: mongoose.Types.ObjectId(householdId) } },
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 },
        totalValue: { $sum: '$purchasePrice' },
        totalQuantity: { $sum: '$quantity' },
      },
    },
  ]);
};

export const FoodItem = mongoose.model<IFoodItem>('FoodItem', FoodItemSchema);
