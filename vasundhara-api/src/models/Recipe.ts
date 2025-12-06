/**
 * Recipe model and schema
 */

import mongoose, { Document, Schema } from 'mongoose';

export interface IRecipe extends Document {
  _id: string;
  name: string;
  description: string;
  instructions: string[];
  ingredients: Array<{
    name: string;
    quantity: number;
    unit: string;
    optional: boolean;
    notes?: string;
  }>;
  
  // Recipe metadata
  cookingTime: number; // in minutes
  prepTime: number; // in minutes
  difficulty: 'easy' | 'medium' | 'hard';
  servings: number;
  
  // Categories and tags
  category: string;
  subcategory?: string;
  tags: string[];
  dietaryRestrictions: string[]; // vegetarian, vegan, gluten-free, etc.
  
  // Media
  imageUrl?: string;
  videoUrl?: string;
  
  // Nutrition information
  nutrition?: {
    calories: number;
    protein: number; // grams
    carbs: number; // grams
    fat: number; // grams
    fiber: number; // grams
    sugar: number; // grams
    sodium: number; // mg
  };
  
  // Source information
  source: {
    type: 'user' | 'system' | 'partner';
    author?: string;
    url?: string;
    license?: string;
  };
  
  // AI/ML data
  aiGenerated: boolean;
  priorityScore?: number; // For recommendation ranking
  usesExpiringItems: string[]; // Array of food item IDs
  
  // Statistics
  statistics: {
    timesCooked: number;
    averageRating: number;
    totalRatings: number;
    lastCookedAt?: Date;
  };
  
  // Timestamps
  createdAt: Date;
  updatedAt: Date;
  
  // Methods
  addRating(rating: number, userId: string): Promise<IRecipe>;
  incrementCookCount(): Promise<IRecipe>;
  calculatePriorityScore(expiringItems: string[]): number;
}

const RecipeSchema = new Schema<IRecipe>({
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200,
  },
  description: {
    type: String,
    required: true,
    trim: true,
    maxlength: 2000,
  },
  instructions: [{
    type: String,
    required: true,
    trim: true,
    maxlength: 1000,
  }],
  ingredients: [{
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },
    quantity: {
      type: Number,
      required: true,
      min: 0,
    },
    unit: {
      type: String,
      required: true,
      enum: ['piece', 'kg', 'g', 'l', 'ml', 'cup', 'tbsp', 'tsp', 'oz', 'lb', 'pinch', 'dash'],
    },
    optional: {
      type: Boolean,
      default: false,
    },
    notes: {
      type: String,
      trim: true,
      maxlength: 200,
    },
  }],
  
  // Recipe metadata
  cookingTime: {
    type: Number,
    required: true,
    min: 0,
  },
  prepTime: {
    type: Number,
    required: true,
    min: 0,
  },
  difficulty: {
    type: String,
    enum: ['easy', 'medium', 'hard'],
    required: true,
  },
  servings: {
    type: Number,
    required: true,
    min: 1,
  },
  
  // Categories and tags
  category: {
    type: String,
    required: true,
    trim: true,
    maxlength: 50,
  },
  subcategory: {
    type: String,
    trim: true,
    maxlength: 50,
  },
  tags: {
    type: [String],
    default: [],
  },
  dietaryRestrictions: {
    type: [String],
    default: [],
    enum: ['vegetarian', 'vegan', 'gluten-free', 'dairy-free', 'nut-free', 'keto', 'paleo', 'low-carb', 'high-protein'],
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
  videoUrl: {
    type: String,
    validate: {
      validator: function(v: string) {
        return !v || /^https?:\/\/(www\.)?(youtube\.com|youtu\.be|vimeo\.com)/.test(v);
      },
      message: 'Video URL must be a valid YouTube or Vimeo URL',
    },
  },
  
  // Nutrition information
  nutrition: {
    calories: {
      type: Number,
      min: 0,
    },
    protein: {
      type: Number,
      min: 0,
    },
    carbs: {
      type: Number,
      min: 0,
    },
    fat: {
      type: Number,
      min: 0,
    },
    fiber: {
      type: Number,
      min: 0,
    },
    sugar: {
      type: Number,
      min: 0,
    },
    sodium: {
      type: Number,
      min: 0,
    },
  },
  
  // Source information
  source: {
    type: {
      type: String,
      enum: ['user', 'system', 'partner'],
      required: true,
    },
    author: {
      type: String,
      trim: true,
      maxlength: 100,
    },
    url: {
      type: String,
      validate: {
        validator: function(v: string) {
          return !v || /^https?:\/\/.+/.test(v);
        },
        message: 'Source URL must be a valid HTTP/HTTPS URL',
      },
    },
    license: {
      type: String,
      trim: true,
      maxlength: 50,
    },
  },
  
  // AI/ML data
  aiGenerated: {
    type: Boolean,
    default: false,
  },
  priorityScore: {
    type: Number,
    min: 0,
    max: 1,
  },
  usesExpiringItems: [{
    type: Schema.Types.ObjectId,
    ref: 'FoodItem',
  }],
  
  // Statistics
  statistics: {
    timesCooked: {
      type: Number,
      default: 0,
    },
    averageRating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    totalRatings: {
      type: Number,
      default: 0,
    },
    lastCookedAt: {
      type: Date,
    },
  },
}, {
  timestamps: true,
});

// Indexes
RecipeSchema.index({ name: 'text', description: 'text' });
RecipeSchema.index({ category: 1 });
RecipeSchema.index({ subcategory: 1 });
RecipeSchema.index({ tags: 1 });
RecipeSchema.index({ dietaryRestrictions: 1 });
RecipeSchema.index({ difficulty: 1 });
RecipeSchema.index({ 'statistics.averageRating': -1 });
RecipeSchema.index({ 'statistics.timesCooked': -1 });
RecipeSchema.index({ createdAt: -1 });
RecipeSchema.index({ priorityScore: -1 });

// Compound indexes
RecipeSchema.index({ category: 1, difficulty: 1 });
RecipeSchema.index({ dietaryRestrictions: 1, category: 1 });
RecipeSchema.index({ 'usesExpiringItems': 1, priorityScore: -1 });

// Methods
RecipeSchema.methods.addRating = async function(rating: number, userId: string) {
  if (rating < 1 || rating > 5) {
    throw new Error('Rating must be between 1 and 5');
  }
  
  // In a real implementation, you'd store individual ratings
  // For now, we'll just update the average
  const totalRatings = this.statistics.totalRatings;
  const currentAverage = this.statistics.averageRating;
  
  this.statistics.averageRating = 
    (currentAverage * totalRatings + rating) / (totalRatings + 1);
  this.statistics.totalRatings += 1;
  
  return this.save();
};

RecipeSchema.methods.incrementCookCount = async function() {
  this.statistics.timesCooked += 1;
  this.statistics.lastCookedAt = new Date();
  return this.save();
};

RecipeSchema.methods.calculatePriorityScore = function(expiringItems: string[]): number {
  if (!this.usesExpiringItems || this.usesExpiringItems.length === 0) {
    return 0;
  }
  
  const matchingItems = this.usesExpiringItems.filter(itemId => 
    expiringItems.includes(itemId.toString())
  );
  
  return matchingItems.length / this.usesExpiringItems.length;
};

// Pre-save middleware
RecipeSchema.pre('save', function(next) {
  // Calculate total time
  const totalTime = this.prepTime + this.cookingTime;
  
  // Auto-categorize based on cooking time
  if (totalTime <= 15) {
    this.tags.push('quick');
  } else if (totalTime <= 30) {
    this.tags.push('moderate');
  } else {
    this.tags.push('slow-cook');
  }
  
  // Auto-categorize based on difficulty
  if (this.difficulty === 'easy') {
    this.tags.push('beginner-friendly');
  } else if (this.difficulty === 'hard') {
    this.tags.push('advanced');
  }
  
  next();
});

// Static methods
RecipeSchema.statics.findByCategory = function(category: string) {
  return this.find({ category: category }).sort({ 'statistics.averageRating': -1 });
};

RecipeSchema.statics.findByDietaryRestriction = function(restriction: string) {
  return this.find({ dietaryRestrictions: restriction }).sort({ 'statistics.averageRating': -1 });
};

RecipeSchema.statics.findQuickRecipes = function(maxTime: number = 30) {
  return this.find({
    $expr: { $lte: [{ $add: ['$prepTime', '$cookingTime'] }, maxTime] }
  }).sort({ 'statistics.averageRating': -1 });
};

RecipeSchema.statics.findForExpiringItems = function(expiringItemIds: string[]) {
  return this.find({
    usesExpiringItems: { $in: expiringItemIds }
  }).sort({ priorityScore: -1 });
};

RecipeSchema.statics.search = function(query: string) {
  return this.find({
    $text: { $search: query }
  }, {
    score: { $meta: 'textScore' }
  }).sort({ score: { $meta: 'textScore' } });
};

export const Recipe = mongoose.model<IRecipe>('Recipe', RecipeSchema);
