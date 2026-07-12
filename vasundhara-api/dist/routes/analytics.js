"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../middleware/auth");
const errorHandler_1 = require("../middleware/errorHandler");
const router = (0, express_1.Router)();
router.get('/household/:id', auth_1.authenticate, (0, errorHandler_1.asyncHandler)(async (req, res) => {
    res.json({ message: 'Get household analytics - to be implemented' });
}));
router.get('/waste-trends', auth_1.authenticate, (0, errorHandler_1.asyncHandler)(async (req, res) => {
    res.json({ message: 'Get waste trends - to be implemented' });
}));
router.get('/carbon-footprint', auth_1.authenticate, (0, errorHandler_1.asyncHandler)(async (req, res) => {
    res.json({ message: 'Get carbon footprint data - to be implemented' });
}));
exports.default = router;
//# sourceMappingURL=analytics.js.map