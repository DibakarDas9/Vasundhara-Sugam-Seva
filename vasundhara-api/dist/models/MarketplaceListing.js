"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MarketplaceListing = void 0;
const mongoose_1 = require("mongoose");
const MarketplaceListingSchema = new mongoose_1.Schema({
    id: { type: String, unique: true, sparse: true },
    title: { type: String, required: true },
    expiryDate: { type: String, required: true },
    location: { type: String, required: true, index: true },
    postedBy: { type: String, default: 'Marketplace user' },
    postedTime: { type: String, default: 'Just now' },
    category: { type: String, default: 'Other' },
    price: { type: Number, default: 0 },
    isFree: { type: Boolean, default: true },
    image: { type: String },
    ownerId: { type: String, required: true, index: true },
    phone: { type: String, default: '' },
    status: { type: String, enum: ['available', 'claimed'], default: 'available' }
}, {
    timestamps: { createdAt: true, updatedAt: false }
});
exports.MarketplaceListing = (0, mongoose_1.model)('MarketplaceListing', MarketplaceListingSchema);
//# sourceMappingURL=MarketplaceListing.js.map