"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = __importDefault(require("./auth"));
const google_1 = __importDefault(require("./google"));
const marketplace_1 = __importDefault(require("./marketplace"));
const inventory_1 = __importDefault(require("./inventory"));
const router = (0, express_1.Router)();
router.use('/auth', auth_1.default);
router.use('/auth/google', google_1.default);
router.use('/marketplace', marketplace_1.default);
router.use('/inventory', inventory_1.default);
exports.default = router;
//# sourceMappingURL=index.js.map