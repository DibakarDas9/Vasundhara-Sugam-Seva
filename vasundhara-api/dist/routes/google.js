"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const express_validator_1 = require("express-validator");
const google_auth_library_1 = require("google-auth-library");
const User_1 = require("@/models/User");
const auth_1 = require("@/middleware/auth");
const errorHandler_1 = require("@/middleware/errorHandler");
const logger_1 = require("@/utils/logger");
const router = (0, express_1.Router)();
router.post('/google', [
    (0, express_validator_1.body)('idToken').isString().notEmpty().withMessage('idToken is required'),
], (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const errors = (0, express_validator_1.validationResult)(req);
    if (!errors.isEmpty()) {
        throw new errorHandler_1.CustomError('Validation failed', 400);
    }
    const { idToken } = req.body;
    const clientId = process.env.GOOGLE_CLIENT_ID;
    if (!clientId) {
        throw new errorHandler_1.CustomError('Server misconfiguration: GOOGLE_CLIENT_ID missing', 500);
    }
    const client = new google_auth_library_1.OAuth2Client(clientId);
    let ticketPayload;
    try {
        const ticket = await client.verifyIdToken({ idToken, audience: clientId });
        ticketPayload = ticket.getPayload();
    }
    catch (e) {
        throw new errorHandler_1.CustomError('Invalid Google token', 401);
    }
    const googleEmail = ticketPayload?.email;
    const googleSub = ticketPayload?.sub;
    const givenName = ticketPayload?.given_name || '';
    const familyName = ticketPayload?.family_name || '';
    if (!googleEmail || !googleSub) {
        throw new errorHandler_1.CustomError('Invalid Google token payload', 401);
    }
    let user = await User_1.User.findOne({ email: googleEmail.toLowerCase() });
    if (!user) {
        user = new User_1.User({
            email: googleEmail.toLowerCase(),
            firstName: givenName || 'Google',
            lastName: familyName || 'User',
            role: 'household',
            isActive: true,
            isEmailVerified: true,
            socialLogins: {
                google: { id: googleSub, email: googleEmail.toLowerCase() },
            },
            approvalStatus: 'approved',
        });
        await user.save();
    }
    else {
        user.socialLogins = user.socialLogins || {};
        user.socialLogins.google = { id: googleSub, email: googleEmail.toLowerCase() };
        user.isEmailVerified = true;
        if (givenName && !user.firstName)
            user.firstName = givenName;
        if (familyName && !user.lastName)
            user.lastName = familyName;
        await user.save();
    }
    if (!user.isActive) {
        throw new errorHandler_1.CustomError('Account is deactivated', 401);
    }
    const { accessToken, refreshToken } = (0, auth_1.generateTokens)(user);
    logger_1.logger.info('User signed in with Google', { userId: user._id, email: user.email });
    res.status(200).json({
        message: 'Google login successful',
        user: user.toJSON(),
        pendingApproval: user.approvalStatus !== 'approved',
        tokens: {
            accessToken,
            refreshToken,
        },
    });
}));
exports.default = router;
//# sourceMappingURL=google.js.map