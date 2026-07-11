"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const errorHandler_1 = require("../middleware/errorHandler");
const MarketplaceListing_1 = require("../models/MarketplaceListing");
const mongoose_1 = __importDefault(require("mongoose"));
const router = (0, express_1.Router)();
router.get('/', (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const location = typeof req.query.location === 'string' ? req.query.location.trim() : '';
    let query = {};
    if (location) {
        const cleanLoc = location.toLowerCase();
        const ignoreWords = new Set(['india', 'and', 'the', 'near', 'east', 'west', 'north', 'south']);
        const keywords = cleanLoc.split(/[,\s]+/).map(w => w.trim()).filter(w => w.length > 2 && !ignoreWords.has(w));
        if (keywords.length > 0) {
            const escapedKeywords = keywords.map(k => k.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
            const regexPatterns = escapedKeywords.map(k => new RegExp(k, 'i'));
            query.$or = regexPatterns.map(pattern => ({ location: { $regex: pattern } }));
        }
    }
    const list = await MarketplaceListing_1.MarketplaceListing.find(query).sort({ createdAt: -1 });
    const mappedListings = list.map(l => ({
        id: l.id || l._id.toString(),
        title: l.title,
        expiryDate: l.expiryDate,
        location: l.location,
        postedBy: l.postedBy,
        postedTime: l.postedTime,
        createdAt: l.createdAt.getTime(),
        category: l.category,
        price: l.price,
        isFree: l.isFree,
        image: l.image,
        ownerId: l.ownerId,
        phone: l.phone,
        status: l.status,
    }));
    res.json({ listings: mappedListings });
}));
router.post('/', (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const title = typeof req.body.title === 'string' ? req.body.title.trim() : '';
    const expiryDate = typeof req.body.expiryDate === 'string' ? req.body.expiryDate.trim() : '';
    const location = typeof req.body.location === 'string' ? req.body.location.trim() : '';
    const postedBy = typeof req.body.postedBy === 'string' && req.body.postedBy.trim()
        ? req.body.postedBy.trim()
        : 'Marketplace user';
    const category = typeof req.body.category === 'string' ? req.body.category.trim() : 'Other';
    const price = typeof req.body.price === 'number' ? req.body.price : 0;
    const isFree = typeof req.body.isFree === 'boolean' ? req.body.isFree : (price === 0);
    const image = typeof req.body.image === 'string' ? req.body.image : undefined;
    const ownerId = typeof req.body.ownerId === 'string' ? req.body.ownerId.trim() : 'local-user';
    const phone = typeof req.body.phone === 'string' ? req.body.phone.trim() : '';
    if (!title || !expiryDate || !location) {
        res.status(400).json({ error: 'Item name, expiry date, and location are required.' });
        return;
    }
    const customId = `market_${Date.now()}`;
    const listing = new MarketplaceListing_1.MarketplaceListing({
        id: customId,
        title,
        expiryDate,
        location,
        postedBy,
        postedTime: 'Just now',
        category,
        price,
        isFree,
        image,
        ownerId,
        phone,
        status: 'available',
    });
    await listing.save();
    res.status(201).json({
        listing: {
            id: listing.id,
            title: listing.title,
            expiryDate: listing.expiryDate,
            location: listing.location,
            postedBy: listing.postedBy,
            postedTime: listing.postedTime,
            createdAt: listing.createdAt.getTime(),
            category: listing.category,
            price: listing.price,
            isFree: listing.isFree,
            image: listing.image,
            ownerId: listing.ownerId,
            phone: listing.phone,
            status: listing.status,
        }
    });
}));
router.post('/:id/claim', (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { id } = req.params;
    const query = mongoose_1.default.isValidObjectId(id) ? { _id: id } : { id: id };
    const listing = await MarketplaceListing_1.MarketplaceListing.findOne(query);
    if (!listing) {
        res.status(404).json({ error: 'Listing not found' });
        return;
    }
    listing.status = 'claimed';
    await listing.save();
    res.json({
        success: true,
        listing: {
            id: listing.id || listing._id.toString(),
            title: listing.title,
            expiryDate: listing.expiryDate,
            location: listing.location,
            postedBy: listing.postedBy,
            postedTime: listing.postedTime,
            createdAt: listing.createdAt.getTime(),
            category: listing.category,
            price: listing.price,
            isFree: listing.isFree,
            image: listing.image,
            ownerId: listing.ownerId,
            phone: listing.phone,
            status: listing.status,
        }
    });
}));
exports.default = router;
//# sourceMappingURL=marketplace.js.map