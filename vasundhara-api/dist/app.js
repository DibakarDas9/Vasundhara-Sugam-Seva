"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const database_1 = require("./config/database");
const app = (0, express_1.default)();
app.use(async (req, res, next) => {
    try {
        await (0, database_1.connectDatabase)();
        next();
    }
    catch (error) {
        console.error('Database connection middleware error:', error);
        next(error);
    }
});
app.use((0, helmet_1.default)());
app.use((0, cors_1.default)({
    origin: (origin, callback) => {
        callback(null, true);
    },
    credentials: true,
}));
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
app.get('/health', (req, res) => {
    res.status(200).json({
        status: 'OK',
        timestamp: new Date().toISOString(),
        service: 'vasundhara-api',
        version: '1.0.0'
    });
});
app.get('/api', (req, res) => {
    res.json({
        message: 'Welcome to Vasundhara API',
        version: '1.0.0',
        endpoints: {
            health: '/health',
            auth: '/api/auth',
            googleAuth: '/api/auth/google',
            inventory: '/api/inventory',
            recipes: '/api/recipes',
            alerts: '/api/alerts',
            marketplace: '/api/marketplace'
        }
    });
});
const routes_1 = __importDefault(require("./routes"));
app.use('/api', routes_1.default);
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        error: 'Something went wrong!',
        message: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
    });
});
app.use('*', (req, res) => {
    res.status(404).json({
        error: 'Not Found',
        message: `Route ${req.originalUrl} not found`
    });
});
exports.default = app;
//# sourceMappingURL=app.js.map