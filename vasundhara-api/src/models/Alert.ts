/**
 * Alert model and schema
 */

import mongoose, { Document, Schema } from 'mongoose';

export interface IAlert extends Document {
  _id: string;
  type: 'expiry' | 'low_stock' | 'recipe_suggestion' | 'achievement' | 'system';
  title: string;
  message: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  
  // Target information
  household: mongoose.Types.ObjectId;
  user: mongoose.Types.ObjectId; // Specific user who should see this alert
  
  // Related data
  relatedItem?: mongoose.Types.ObjectId; // Food item, recipe, etc.
  data?: any; // Additional structured data
  
  // Status
  isRead: boolean;
  isDismissed: boolean;
  readAt?: Date;
  dismissedAt?: Date;
  
  // Delivery
  channels: ('push' | 'email' | 'sms' | 'in_app')[];
  sentAt?: Date;
  deliveryStatus: 'pending' | 'sent' | 'delivered' | 'failed';
  
  // Timestamps
  createdAt: Date;
  updatedAt: Date;
  
  // Methods
  markAsRead(): Promise<IAlert>;
  dismiss(): Promise<IAlert>;
  isExpired(): boolean;
}

const AlertSchema = new Schema<IAlert>({
  type: {
    type: String,
    enum: ['expiry', 'low_stock', 'recipe_suggestion', 'achievement', 'system'],
    required: true,
  },
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200,
  },
  message: {
    type: String,
    required: true,
    trim: true,
    maxlength: 1000,
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium',
  },
  
  // Target information
  household: {
    type: Schema.Types.ObjectId,
    ref: 'Household',
    required: true,
  },
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  
  // Related data
  relatedItem: {
    type: Schema.Types.ObjectId,
    refPath: 'relatedItemModel',
  },
  relatedItemModel: {
    type: String,
    enum: ['FoodItem', 'Recipe', 'MarketplaceListing'],
  },
  data: {
    type: Schema.Types.Mixed,
  },
  
  // Status
  isRead: {
    type: Boolean,
    default: false,
  },
  isDismissed: {
    type: Boolean,
    default: false,
  },
  readAt: {
    type: Date,
  },
  dismissedAt: {
    type: Date,
  },
  
  // Delivery
  channels: [{
    type: String,
    enum: ['push', 'email', 'sms', 'in_app'],
  }],
  sentAt: {
    type: Date,
  },
  deliveryStatus: {
    type: String,
    enum: ['pending', 'sent', 'delivered', 'failed'],
    default: 'pending',
  },
}, {
  timestamps: true,
});

// Indexes
AlertSchema.index({ household: 1 });
AlertSchema.index({ user: 1 });
AlertSchema.index({ type: 1 });
AlertSchema.index({ priority: 1 });
AlertSchema.index({ isRead: 1 });
AlertSchema.index({ isDismissed: 1 });
AlertSchema.index({ createdAt: -1 });
AlertSchema.index({ deliveryStatus: 1 });

// Compound indexes
AlertSchema.index({ user: 1, isRead: 1 });
AlertSchema.index({ household: 1, type: 1 });
AlertSchema.index({ user: 1, isDismissed: 1, createdAt: -1 });

// Methods
AlertSchema.methods.markAsRead = async function() {
  if (!this.isRead) {
    this.isRead = true;
    this.readAt = new Date();
    return this.save();
  }
  return this;
};

AlertSchema.methods.dismiss = async function() {
  if (!this.isDismissed) {
    this.isDismissed = true;
    this.dismissedAt = new Date();
    return this.save();
  }
  return this;
};

AlertSchema.methods.isExpired = function(): boolean {
  // Alerts expire after 30 days
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  return this.createdAt < thirtyDaysAgo;
};

// Pre-save middleware
AlertSchema.pre('save', function(next) {
  // Set default channels based on type
  if (this.channels.length === 0) {
    switch (this.type) {
      case 'expiry':
        this.channels = ['push', 'in_app'];
        break;
      case 'low_stock':
        this.channels = ['in_app'];
        break;
      case 'recipe_suggestion':
        this.channels = ['in_app'];
        break;
      case 'achievement':
        this.channels = ['push', 'in_app'];
        break;
      case 'system':
        this.channels = ['in_app'];
        break;
    }
  }
  
  next();
});

// Static methods
AlertSchema.statics.findUnread = function(userId: string) {
  return this.find({
    user: userId,
    isRead: false,
    isDismissed: false,
  }).sort({ createdAt: -1 });
};

AlertSchema.statics.findByType = function(userId: string, type: string) {
  return this.find({
    user: userId,
    type: type,
    isDismissed: false,
  }).sort({ createdAt: -1 });
};

AlertSchema.statics.findHighPriority = function(userId: string) {
  return this.find({
    user: userId,
    priority: { $in: ['high', 'urgent'] },
    isRead: false,
    isDismissed: false,
  }).sort({ createdAt: -1 });
};

AlertSchema.statics.markAllAsRead = function(userId: string) {
  return this.updateMany(
    { user: userId, isRead: false },
    { isRead: true, readAt: new Date() }
  );
};

AlertSchema.statics.cleanupExpired = function() {
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  
  return this.deleteMany({
    createdAt: { $lt: thirtyDaysAgo },
    isDismissed: true,
  });
};

export const Alert = mongoose.model<IAlert>('Alert', AlertSchema);
