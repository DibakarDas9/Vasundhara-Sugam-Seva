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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.User = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const UserSchema = new mongoose_1.Schema({
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
        required: function () {
            return !this.socialLogins?.google && !this.socialLogins?.facebook;
        },
        minlength: 8,
        select: false,
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
            validator: function (v) {
                return !v || /^https?:\/\/.+\.(jpg|jpeg|png|gif|webp)$/i.test(v);
            },
            message: 'Profile image must be a valid URL to an image file',
        },
    },
    phoneNumber: {
        type: String,
        validate: {
            validator: function (v) {
                return !v || /^\+?[\d\s\-\(\)]+$/.test(v);
            },
            message: 'Phone number must be a valid format',
        },
    },
    dateOfBirth: {
        type: Date,
        validate: {
            validator: function (v) {
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
        default: 'approved',
        index: true,
    },
    approvalMetadata: {
        reviewerId: {
            type: mongoose_1.Schema.Types.ObjectId,
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
        transform: function (doc, ret) {
            delete ret.password;
            delete ret.__v;
            return ret;
        },
    },
});
UserSchema.index({ email: 1 });
UserSchema.index({ role: 1 });
UserSchema.index({ isActive: 1 });
UserSchema.index({ createdAt: -1 });
UserSchema.pre('save', async function (next) {
    if (!this.isModified('password'))
        return next();
    try {
        const salt = await bcryptjs_1.default.genSalt(12);
        this.password = await bcryptjs_1.default.hash(this.password, salt);
        next();
    }
    catch (error) {
        next(error);
    }
});
UserSchema.methods.comparePassword = async function (candidatePassword) {
    if (!this.password)
        return false;
    return bcryptjs_1.default.compare(candidatePassword, this.password);
};
UserSchema.methods.toJSON = function () {
    const userObject = this.toObject();
    delete userObject.password;
    delete userObject.__v;
    return userObject;
};
UserSchema.statics.findByEmail = function (email) {
    return this.findOne({ email: email.toLowerCase() });
};
UserSchema.statics.findActive = function () {
    return this.find({ isActive: true });
};
exports.User = mongoose_1.default.model('User', UserSchema);
//# sourceMappingURL=User.js.map