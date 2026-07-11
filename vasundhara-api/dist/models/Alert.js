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
exports.Alert = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const AlertSchema = new mongoose_1.Schema({
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
    household: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'Household',
        required: true,
    },
    user: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    relatedItem: {
        type: mongoose_1.Schema.Types.ObjectId,
        refPath: 'relatedItemModel',
    },
    relatedItemModel: {
        type: String,
        enum: ['FoodItem', 'Recipe', 'MarketplaceListing'],
    },
    data: {
        type: mongoose_1.Schema.Types.Mixed,
    },
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
AlertSchema.index({ household: 1 });
AlertSchema.index({ user: 1 });
AlertSchema.index({ type: 1 });
AlertSchema.index({ priority: 1 });
AlertSchema.index({ isRead: 1 });
AlertSchema.index({ isDismissed: 1 });
AlertSchema.index({ createdAt: -1 });
AlertSchema.index({ deliveryStatus: 1 });
AlertSchema.index({ user: 1, isRead: 1 });
AlertSchema.index({ household: 1, type: 1 });
AlertSchema.index({ user: 1, isDismissed: 1, createdAt: -1 });
AlertSchema.methods.markAsRead = async function () {
    if (!this.isRead) {
        this.isRead = true;
        this.readAt = new Date();
        return this.save();
    }
    return this;
};
AlertSchema.methods.dismiss = async function () {
    if (!this.isDismissed) {
        this.isDismissed = true;
        this.dismissedAt = new Date();
        return this.save();
    }
    return this;
};
AlertSchema.methods.isExpired = function () {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    return this.createdAt < thirtyDaysAgo;
};
AlertSchema.pre('save', function (next) {
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
AlertSchema.statics.findUnread = function (userId) {
    return this.find({
        user: userId,
        isRead: false,
        isDismissed: false,
    }).sort({ createdAt: -1 });
};
AlertSchema.statics.findByType = function (userId, type) {
    return this.find({
        user: userId,
        type: type,
        isDismissed: false,
    }).sort({ createdAt: -1 });
};
AlertSchema.statics.findHighPriority = function (userId) {
    return this.find({
        user: userId,
        priority: { $in: ['high', 'urgent'] },
        isRead: false,
        isDismissed: false,
    }).sort({ createdAt: -1 });
};
AlertSchema.statics.markAllAsRead = function (userId) {
    return this.updateMany({ user: userId, isRead: false }, { isRead: true, readAt: new Date() });
};
AlertSchema.statics.cleanupExpired = function () {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    return this.deleteMany({
        createdAt: { $lt: thirtyDaysAgo },
        isDismissed: true,
    });
};
exports.Alert = mongoose_1.default.model('Alert', AlertSchema);
//# sourceMappingURL=Alert.js.map