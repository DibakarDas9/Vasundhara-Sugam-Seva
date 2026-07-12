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
exports.Household = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const HouseholdSchema = new mongoose_1.Schema({
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
                type: mongoose_1.Schema.Types.ObjectId,
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
                    validator: function (v) {
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
HouseholdSchema.index({ 'members.user': 1 });
HouseholdSchema.index({ 'members.role': 1 });
HouseholdSchema.index({ 'address.coordinates': '2dsphere' });
HouseholdSchema.index({ createdAt: -1 });
HouseholdSchema.methods.addMember = async function (userId, role = 'member') {
    const existingMember = this.members.find((member) => member.user.toString() === userId && member.isActive);
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
HouseholdSchema.methods.removeMember = async function (userId) {
    const memberIndex = this.members.findIndex((member) => member.user.toString() === userId && member.isActive);
    if (memberIndex === -1) {
        throw new Error('User is not a member of this household');
    }
    this.members[memberIndex].isActive = false;
    return this.save();
};
HouseholdSchema.methods.isMember = function (userId) {
    return this.members.some((member) => member.user.toString() === userId && member.isActive);
};
HouseholdSchema.methods.getOwner = function () {
    return this.members.find((member) => member.role === 'owner' && member.isActive);
};
HouseholdSchema.methods.updateStatistics = async function () {
    this.statistics.lastActivityAt = new Date();
    return this.save();
};
HouseholdSchema.pre('save', function (next) {
    const owners = this.members.filter(member => member.role === 'owner' && member.isActive);
    if (owners.length === 0 && this.members.length > 0) {
        this.members[0].role = 'owner';
    }
    next();
});
HouseholdSchema.statics.findByMember = function (userId) {
    return this.find({
        'members.user': userId,
        'members.isActive': true,
    });
};
HouseholdSchema.statics.findByOwner = function (userId) {
    return this.find({
        'members.user': userId,
        'members.role': 'owner',
        'members.isActive': true,
    });
};
exports.Household = mongoose_1.default.model('Household', HouseholdSchema);
//# sourceMappingURL=Household.js.map