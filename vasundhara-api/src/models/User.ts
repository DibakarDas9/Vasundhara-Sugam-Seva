/**
 * User model and schema
 */

import mongoose, { Document, Schema } from 'mongoose';
import bcrypt from 'bcryptjs';

export interface IUser extends Document {
  _id: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: 'household' | 'shopkeeper' | 'admin' | 'user' | 'retail_partner';
  isActive: boolean;
  isEmailVerified: boolean;
  profileImage?: string;
  phoneNumber?: string;
  dateOfBirth?: Date;
  preferences: {
    notifications: boolean;
    alerts: boolean;
    gamification: boolean;
    language: string;
    timezone: string;
  };
  socialLogins: {
    google?: {
      id: string;
      email: string;
    };
    facebook?: {
      id: string;
      email: string;
    };
  };
  approvalStatus: 'pending' | 'approved' | 'rejected';
  approvalMetadata?: {
    reviewerId?: string;
    note?: string;
    reviewedAt?: Date;
  };
  flags?: {
    isFlagged: boolean;
    reason?: string;
    lastReviewedAt?: Date;
  };
  householdProfile?: {
    familySize?: number;
    address?: string;
    ward?: string;
  };
  shopkeeperProfile?: {
    businessName?: string;
    licenseNumber?: string;
    address?: string;
  };
  lastLoginAt?: Date;
  createdAt: Date;
  updatedAt: Date;
  
  // Methods
  comparePassword(candidatePassword: string): Promise<boolean>;
  toJSON(): any;
}

const UserSchema = new Schema<IUser>({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email'],
  },
  password: {
    type: String,
    required: function() {
      return !this.socialLogins?.google && !this.socialLogins?.facebook;
    },
    minlength: 8,
    select: false, // Don't include password in queries by default
  },
  firstName: {
    type: String,
    required: true,
    trim: true,
    maxlength: 50,
  },
  lastName: {
    type: String,
    required: true,
    trim: true,
    maxlength: 50,
  },
  role: {
    type: String,
    enum: ['household', 'shopkeeper', 'admin', 'user', 'retail_partner'],
    default: 'household',
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  isEmailVerified: {
    type: Boolean,
    default: false,
  },
  profileImage: {
    type: String,
    validate: {
      validator: function(v: string) {
        return !v || /^https?:\/\/.+\.(jpg|jpeg|png|gif|webp)$/i.test(v);
      },
      message: 'Profile image must be a valid URL to an image file',
    },
  },
  phoneNumber: {
    type: String,
    validate: {
      validator: function(v: string) {
        return !v || /^\+?[\d\s\-\(\)]+$/.test(v);
      },
      message: 'Phone number must be a valid format',
    },
  },
  dateOfBirth: {
    type: Date,
    validate: {
      validator: function(v: Date) {
        return !v || v < new Date();
      },
      message: 'Date of birth must be in the past',
    },
  },
  preferences: {
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
    language: {
      type: String,
      default: 'en',
      enum: ['en', 'es', 'fr', 'de', 'it', 'pt', 'hi', 'zh', 'ja', 'ko'],
    },
    timezone: {
      type: String,
      default: 'UTC',
    },
  },
  socialLogins: {
    google: {
      id: String,
      email: String,
    },
    facebook: {
      id: String,
      email: String,
    },
  },
  approvalStatus: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending',
    index: true,
  },
  approvalMetadata: {
    reviewerId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    note: {
      type: String,
      maxlength: 500,
    },
    reviewedAt: Date,
  },
  flags: {
    isFlagged: {
      type: Boolean,
      default: false,
    },
    reason: {
      type: String,
      maxlength: 500,
    },
    lastReviewedAt: Date,
  },
  householdProfile: {
    familySize: {
      type: Number,
      min: 1,
      max: 25,
    },
    address: {
      type: String,
      maxlength: 280,
    },
    ward: {
      type: String,
      maxlength: 80,
    },
  },
  shopkeeperProfile: {
    businessName: {
      type: String,
      maxlength: 140,
    },
    licenseNumber: {
      type: String,
      maxlength: 60,
    },
    address: {
      type: String,
      maxlength: 280,
    },
  },
  lastLoginAt: {
    type: Date,
  },
}, {
  timestamps: true,
  toJSON: {
    transform: function(doc, ret) {
      delete ret.password;
      delete ret.__v;
      return ret;
    },
  },
});

// Indexes
UserSchema.index({ email: 1 });
UserSchema.index({ role: 1 });
UserSchema.index({ isActive: 1 });
UserSchema.index({ createdAt: -1 });

// Pre-save middleware to hash password
UserSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error as Error);
  }
});

// Method to compare password
UserSchema.methods.comparePassword = async function(candidatePassword: string): Promise<boolean> {
  if (!this.password) return false;
  return bcrypt.compare(candidatePassword, this.password);
};

// Method to get public profile
UserSchema.methods.toJSON = function() {
  const userObject = this.toObject();
  delete userObject.password;
  delete userObject.__v;
  return userObject;
};

// Static method to find by email
UserSchema.statics.findByEmail = function(email: string) {
  return this.findOne({ email: email.toLowerCase() });
};

// Static method to find active users
UserSchema.statics.findActive = function() {
  return this.find({ isActive: true });
};

export const User = mongoose.model<IUser>('User', UserSchema);
