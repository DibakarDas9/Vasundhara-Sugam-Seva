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
exports.FoodItem = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const FoodItemSchema = new mongoose_1.Schema({
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
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'Household',
        required: true,
    },
    addedBy: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
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
    expiryDate: {
        type: Date,
        validate: {
            validator: function (v) {
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
            validator: function (v) {
                return v <= this.quantity;
            },
            message: 'Remaining quantity cannot exceed total quantity',
        },
    },
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
    imageUrl: {
        type: String,
        validate: {
            validator: function (v) {
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
    mlFeatures: {
        colorAnalysis: mongoose_1.Schema.Types.Mixed,
        freshnessScore: {
            type: Number,
            min: 0,
            max: 1,
        },
        qualityIndicators: [String],
        spoilageIndicators: [String],
    },
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
FoodItemSchema.index({ household: 1 });
FoodItemSchema.index({ addedBy: 1 });
FoodItemSchema.index({ status: 1 });
FoodItemSchema.index({ category: 1 });
FoodItemSchema.index({ expiryDate: 1 });
FoodItemSchema.index({ predictedExpiryDate: 1 });
FoodItemSchema.index({ createdAt: -1 });
FoodItemSchema.index({ 'tags': 1 });
FoodItemSchema.index({ household: 1, status: 1 });
FoodItemSchema.index({ household: 1, expiryDate: 1 });
FoodItemSchema.index({ household: 1, category: 1 });
FoodItemSchema.methods.updateStatus = async function () {
    const now = new Date();
    const daysUntilExpiry = this.getDaysUntilExpiry();
    if (this.status === 'consumed' || this.status === 'wasted') {
        return this;
    }
    if (daysUntilExpiry < 0) {
        this.status = 'expired';
    }
    else if (daysUntilExpiry <= 3) {
        this.status = 'expiring_soon';
    }
    else {
        this.status = 'fresh';
    }
    return this.save();
};
FoodItemSchema.methods.markAsConsumed = async function (quantity) {
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
FoodItemSchema.methods.markAsWasted = async function (reason) {
    this.status = 'wasted';
    this.remainingQuantity = 0;
    if (reason) {
        this.notes = (this.notes || '') + `\nWasted: ${reason}`;
    }
    return this.save();
};
FoodItemSchema.methods.isExpiringSoon = function (days = 3) {
    const daysUntilExpiry = this.getDaysUntilExpiry();
    return daysUntilExpiry >= 0 && daysUntilExpiry <= days;
};
FoodItemSchema.methods.getDaysUntilExpiry = function () {
    const expiryDate = this.predictedExpiryDate || this.expiryDate;
    if (!expiryDate)
        return Infinity;
    const now = new Date();
    const diffTime = expiryDate.getTime() - now.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};
FoodItemSchema.methods.calculateWasteValue = function () {
    if (!this.purchasePrice || this.quantity === 0)
        return 0;
    const wasteRatio = (this.quantity - this.remainingQuantity) / this.quantity;
    return this.purchasePrice * wasteRatio;
};
FoodItemSchema.pre('save', async function (next) {
    if (this.isModified('expiryDate') || this.isModified('predictedExpiryDate')) {
        await this.updateStatus();
    }
    next();
});
FoodItemSchema.statics.findExpiringSoon = function (householdId, days = 3) {
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
FoodItemSchema.statics.findByCategory = function (householdId, category) {
    return this.find({
        household: householdId,
        category: category,
        status: { $in: ['fresh', 'expiring_soon'] },
    });
};
FoodItemSchema.statics.getStatistics = function (householdId) {
    return this.aggregate([
        { $match: { household: new mongoose_1.default.Types.ObjectId(householdId) } },
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
exports.FoodItem = mongoose_1.default.model('FoodItem', FoodItemSchema);
//# sourceMappingURL=FoodItem.js.map