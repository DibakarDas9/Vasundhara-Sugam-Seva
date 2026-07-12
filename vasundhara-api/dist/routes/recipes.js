"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("@/middleware/auth");
const errorHandler_1 = require("@/middleware/errorHandler");
const router = (0, express_1.Router)();
router.get('/', auth_1.authenticate, (0, errorHandler_1.asyncHandler)(async (req, res) => {
    res.json({ message: 'Get recipes - to be implemented' });
}));
router.post('/', auth_1.authenticate, (0, errorHandler_1.asyncHandler)(async (req, res) => {
    res.json({ message: 'Create recipe - to be implemented' });
}));
router.get('/:id', auth_1.authenticate, (0, errorHandler_1.asyncHandler)(async (req, res) => {
    res.json({ message: 'Get recipe by ID - to be implemented' });
}));
router.put('/:id', auth_1.authenticate, (0, errorHandler_1.asyncHandler)(async (req, res) => {
    res.json({ message: 'Update recipe - to be implemented' });
}));
router.delete('/:id', auth_1.authenticate, (0, errorHandler_1.asyncHandler)(async (req, res) => {
    res.json({ message: 'Delete recipe - to be implemented' });
}));
exports.default = router;
//# sourceMappingURL=recipes.js.map