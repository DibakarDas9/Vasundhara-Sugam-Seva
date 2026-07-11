"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const app_1 = __importDefault(require("./app"));
const config_1 = require("./config/config");
const PORT = config_1.config.port;
app_1.default.listen(PORT, () => {
    console.log(`🚀 Vasundhara API Server running on port ${PORT}`);
    console.log(`📊 Health check: http://localhost:${PORT}/health`);
    console.log(`🌍 Environment: ${config_1.config.nodeEnv}`);
});
//# sourceMappingURL=server.js.map