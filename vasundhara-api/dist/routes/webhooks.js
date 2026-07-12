"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const errorHandler_1 = require("@/middleware/errorHandler");
const router = (0, express_1.Router)();
router.post('/stripe', (0, errorHandler_1.asyncHandler)(async (req, res) => {
    res.json({ message: 'Stripe webhook - to be implemented' });
}));
router.post('/ml-service', (0, errorHandler_1.asyncHandler)(async (req, res) => {
    res.json({ message: 'ML service webhook - to be implemented' });
}));
exports.default = router;
//# sourceMappingURL=webhooks.js.map