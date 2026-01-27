"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.refreshToken = void 0;
const prisma_1 = require("../../config/prisma");
const jwt_1 = require("../../utils/jwt");
const ApiError_1 = require("../../utils/ApiError");
const asyncHandler_1 = require("../../middlewares/asyncHandler");
exports.refreshToken = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { refreshToken } = req.body;
    if (!refreshToken)
        throw new ApiError_1.ApiError(401, "No refresh token");
    const session = await prisma_1.prisma.session.findUnique({
        where: { refreshToken },
    });
    if (!session || session.expiresAt < new Date())
        throw new ApiError_1.ApiError(401, "Session expired");
    const payload = (0, jwt_1.verifyRefreshToken)(refreshToken);
    const accessToken = (0, jwt_1.signAccessToken)({
        userId: payload.userId,
    });
    res.json({ accessToken });
});
