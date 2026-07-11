"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.Recipe = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const RecipeSchema = new mongoose_1.Schema({
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
    imageUrl: {
        type: String,
        validate: {
            validator: function (v) {
                return !v || /^https?:\/\/.+\.(jpg|jpeg|png|gif|webp)$/i.test(v);
            },
            message: 'Image URL must be a valid URL to an image file',
        },
    },
    videoUrl: {
        type: String,
        validate: {
            validator: function (v) {
                return !v || /^https?:\/\/(www\.)?(youtube\.com|youtu\.be|vimeo\.com)/.test(v);
            },
            message: 'Video URL must be a valid YouTube or Vimeo URL',
        },
    },
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
                validator: function (v) {
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
            type: mongoose_1.Schema.Types.ObjectId,
            ref: 'FoodItem',
        }],
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
RecipeSchema.index({ category: 1, difficulty: 1 });
RecipeSchema.index({ dietaryRestrictions: 1, category: 1 });
RecipeSchema.index({ 'usesExpiringItems': 1, priorityScore: -1 });
RecipeSchema.methods.addRating = async function (rating, userId) {
    if (rating < 1 || rating > 5) {
        throw new Error('Rating must be between 1 and 5');
    }
    const totalRatings = this.statistics.totalRatings;
    const currentAverage = this.statistics.averageRating;
    this.statistics.averageRating =
        (currentAverage * totalRatings + rating) / (totalRatings + 1);
    this.statistics.totalRatings += 1;
    return this.save();
};
RecipeSchema.methods.incrementCookCount = async function () {
    this.statistics.timesCooked += 1;
    this.statistics.lastCookedAt = new Date();
    return this.save();
};
RecipeSchema.methods.calculatePriorityScore = function (expiringItems) {
    if (!this.usesExpiringItems || this.usesExpiringItems.length === 0) {
        return 0;
    }
    const matchingItems = this.usesExpiringItems.filter(itemId => expiringItems.includes(itemId.toString()));
    return matchingItems.length / this.usesExpiringItems.length;
};
RecipeSchema.pre('save', function (next) {
    const totalTime = this.prepTime + this.cookingTime;
    if (totalTime <= 15) {
        this.tags.push('quick');
    }
    else if (totalTime <= 30) {
        this.tags.push('moderate');
    }
    else {
        this.tags.push('slow-cook');
    }
    if (this.difficulty === 'easy') {
        this.tags.push('beginner-friendly');
    }
    else if (this.difficulty === 'hard') {
        this.tags.push('advanced');
    }
    next();
});
RecipeSchema.statics.findByCategory = function (category) {
    return this.find({ category: category }).sort({ 'statistics.averageRating': -1 });
};
RecipeSchema.statics.findByDietaryRestriction = function (restriction) {
    return this.find({ dietaryRestrictions: restriction }).sort({ 'statistics.averageRating': -1 });
};
RecipeSchema.statics.findQuickRecipes = function (maxTime = 30) {
    return this.find({
        $expr: { $lte: [{ $add: ['$prepTime', '$cookingTime'] }, maxTime] }
    }).sort({ 'statistics.averageRating': -1 });
};
RecipeSchema.statics.findForExpiringItems = function (expiringItemIds) {
    return this.find({
        usesExpiringItems: { $in: expiringItemIds }
    }).sort({ priorityScore: -1 });
};
RecipeSchema.statics.search = function (query) {
    return this.find({
        $text: { $search: query }
    }, {
        score: { $meta: 'textScore' }
    }).sort({ score: { $meta: 'textScore' } });
};
exports.Recipe = mongoose_1.default.model('Recipe', RecipeSchema);
//# sourceMappingURL=Recipe.js.map