"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("@/middleware/auth");
const errorHandler_1 = require("@/middleware/errorHandler");
const router = (0, express_1.Router)();
router.get('/', auth_1.authenticate, (0, errorHandler_1.asyncHandler)(async (req, res) => {
    res.json({ message: 'Get alerts - to be implemented' });
}));
router.put('/:id/read', auth_1.authenticate, (0, errorHandler_1.asyncHandler)(async (req, res) => {
    res.json({ message: 'Mark alert as read - to be implemented' });
}));
router.put('/:id/dismiss', auth_1.authenticate, (0, errorHandler_1.asyncHandler)(async (req, res) => {
    res.json({ message: 'Dismiss alert - to be implemented' });
}));
exports.default = router;
//# sourceMappingURL=alerts.js.map