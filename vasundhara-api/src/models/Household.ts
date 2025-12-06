/**
 * Household model and schema
 */

import mongoose, { Document, Schema } from 'mongoose';

export interface IHousehold extends Document {
  _id: string;
  name: string;
  description?: string;
  members: Array<{
    user: mongoose.Types.ObjectId;
    role: 'owner' | 'member' | 'viewer';
    joinedAt: Date;
    isActive: boolean;
  }>;
  settings: {
    notifications: boolean;
    alerts: boolean;
    gamification: boolean;
    defaultStorage: 'fridge' | 'freezer' | 'pantry' | 'counter';
    expiryAlerts: {
      enabled: boolean;
      daysBefore: number[];
    };
    wasteTracking: boolean;
    carbonFootprint: boolean;
  };
  address?: {
    street: string;
    city: string;
    state: string;
    country: string;
    postalCode: string;
    coordinates?: {
      lat: number;
      lng: number;
    };
  };
  statistics: {
    totalItemsTracked: number;
    itemsWasted: number;
    itemsConsumed: number;
    moneySaved: number;
    carbonFootprintReduced: number; // in kg CO2
    streakDays: number;
    lastActivityAt: Date;
  };
  createdAt: Date;
  updatedAt: Date;
  
  // Methods
  addMember(userId: string, role: 'owner' | 'member' | 'viewer'): Promise<IHousehold>;
  removeMember(userId: string): Promise<IHousehold>;
  isMember(userId: string): boolean;
  getOwner(): any;
  updateStatistics(): Promise<IHousehold>;
}

const HouseholdSchema = new Schema<IHousehold>({
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100,
  },
  description: {
    type: String,
    trim: true,
    maxlength: 500,
  },
  members: [{
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    role: {
      type: String,
      enum: ['owner', 'member', 'viewer'],
      default: 'member',
    },
    joinedAt: {
      type: Date,
      default: Date.now,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  }],
  settings: {
    notifications: {
      type: Boolean,
      default: true,
    },
    alerts: {
      type: Boolean,
      default: true,
    },
    gamification: {
      type: Boolean,
      default: true,
    },
    defaultStorage: {
      type: String,
      enum: ['fridge', 'freezer', 'pantry', 'counter'],
      default: 'fridge',
    },
    expiryAlerts: {
      enabled: {
        type: Boolean,
        default: true,
      },
      daysBefore: {
        type: [Number],
        default: [7, 3, 1],
        validate: {
          validator: function(v: number[]) {
            return v.every(day => day > 0 && day <= 30);
          },
          message: 'Days before expiry must be between 1 and 30',
        },
      },
    },
    wasteTracking: {
      type: Boolean,
      default: true,
    },
    carbonFootprint: {
      type: Boolean,
      default: true,
    },
  },
  address: {
    street: String,
    city: String,
    state: String,
    country: String,
    postalCode: String,
    coordinates: {
      lat: {
        type: Number,
        min: -90,
        max: 90,
      },
      lng: {
        type: Number,
        min: -180,
        max: 180,
      },
    },
  },
  statistics: {
    totalItemsTracked: {
      type: Number,
      default: 0,
    },
    itemsWasted: {
      type: Number,
      default: 0,
    },
    itemsConsumed: {
      type: Number,
      default: 0,
    },
    moneySaved: {
      type: Number,
      default: 0,
    },
    carbonFootprintReduced: {
      type: Number,
      default: 0,
    },
    streakDays: {
      type: Number,
      default: 0,
    },
    lastActivityAt: {
      type: Date,
      default: Date.now,
    },
  },
}, {
  timestamps: true,
});

// Indexes
HouseholdSchema.index({ 'members.user': 1 });
HouseholdSchema.index({ 'members.role': 1 });
HouseholdSchema.index({ 'address.coordinates': '2dsphere' });
HouseholdSchema.index({ createdAt: -1 });

// Methods
HouseholdSchema.methods.addMember = async function(userId: string, role: 'owner' | 'member' | 'viewer' = 'member') {
  // Check if user is already a member
  const existingMember = this.members.find(member => 
    member.user.toString() === userId && member.isActive
  );
  
  if (existingMember) {
    throw new Error('User is already a member of this household');
  }
  
  this.members.push({
    user: userId,
    role,
    joinedAt: new Date(),
    isActive: true,
  });
  
  return this.save();
};

HouseholdSchema.methods.removeMember = async function(userId: string) {
  const memberIndex = this.members.findIndex(member => 
    member.user.toString() === userId && member.isActive
  );
  
  if (memberIndex === -1) {
    throw new Error('User is not a member of this household');
  }
  
  this.members[memberIndex].isActive = false;
  return this.save();
};

HouseholdSchema.methods.isMember = function(userId: string): boolean {
  return this.members.some(member => 
    member.user.toString() === userId && member.isActive
  );
};

HouseholdSchema.methods.getOwner = function() {
  return this.members.find(member => 
    member.role === 'owner' && member.isActive
  );
};

HouseholdSchema.methods.updateStatistics = async function() {
  // This would typically involve aggregating data from food items, waste logs, etc.
  // For now, we'll just update the last activity timestamp
  this.statistics.lastActivityAt = new Date();
  return this.save();
};

// Pre-save middleware
HouseholdSchema.pre('save', function(next) {
  // Ensure there's at least one owner
  const owners = this.members.filter(member => 
    member.role === 'owner' && member.isActive
  );
  
  if (owners.length === 0 && this.members.length > 0) {
    // Make the first member an owner
    this.members[0].role = 'owner';
  }
  
  next();
});

// Static methods
HouseholdSchema.statics.findByMember = function(userId: string) {
  return this.find({
    'members.user': userId,
    'members.isActive': true,
  });
};

HouseholdSchema.statics.findByOwner = function(userId: string) {
  return this.find({
    'members.user': userId,
    'members.role': 'owner',
    'members.isActive': true,
  });
};

export const Household = mongoose.model<IHousehold>('Household', HouseholdSchema);
