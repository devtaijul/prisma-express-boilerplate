"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.healthCheck = void 0;
const asyncHandler_1 = require("../../middlewares/asyncHandler");
exports.healthCheck = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    res.json({
        success: true,
        message: "Server is healthy 🚀",
    });
});
