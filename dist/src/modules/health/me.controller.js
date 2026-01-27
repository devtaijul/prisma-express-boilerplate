"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.me = void 0;
const asyncHandler_1 = require("../../middlewares/asyncHandler");
exports.me = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    // req.user already populated by middleware
    if (!req.user || !req.user.id) {
        return res.status(401).json({
            success: false,
            message: "Unauthorized",
        });
    }
    res.json({ user: req.user });
});
