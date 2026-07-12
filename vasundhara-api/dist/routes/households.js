"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("@/middleware/auth");
const errorHandler_1 = require("@/middleware/errorHandler");
const router = (0, express_1.Router)();
router.get('/', auth_1.authenticate, (0, errorHandler_1.asyncHandler)(async (req, res) => {
    res.json({ message: 'Get households - to be implemented' });
}));
router.post('/', auth_1.authenticate, (0, errorHandler_1.asyncHandler)(async (req, res) => {
    res.json({ message: 'Create household - to be implemented' });
}));
router.get('/:id', auth_1.authenticate, (0, errorHandler_1.asyncHandler)(async (req, res) => {
    res.json({ message: 'Get household by ID - to be implemented' });
}));
router.put('/:id', auth_1.authenticate, (0, errorHandler_1.asyncHandler)(async (req, res) => {
    res.json({ message: 'Update household - to be implemented' });
}));
router.delete('/:id', auth_1.authenticate, (0, errorHandler_1.asyncHandler)(async (req, res) => {
    res.json({ message: 'Delete household - to be implemented' });
}));
exports.default = router;
//# sourceMappingURL=households.js.map