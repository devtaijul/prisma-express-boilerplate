"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.me = void 0;
const asyncHandler_1 = require("../../middlewares/asyncHandler");
exports.me = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    // req.user already populated by middleware
    res.json({ user: req.user });
});
