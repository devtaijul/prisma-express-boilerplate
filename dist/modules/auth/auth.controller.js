"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.login = exports.register = void 0;
const prisma_1 = require("../../config/prisma");
const ApiError_1 = require("../../utils/ApiError");
const asyncHandler_1 = require("../../middlewares/asyncHandler");
const password_1 = require("../../utils/password");
const jwt_1 = require("../../utils/jwt");
exports.register = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { email, password } = req.body;
    const exists = await prisma_1.prisma.user.findUnique({ where: { email } });
    if (exists)
        throw new ApiError_1.ApiError(409, "User already exists");
    const user = await prisma_1.prisma.user.create({
        data: {
            email,
            password: await (0, password_1.hashPassword)(password),
        },
    });
    res.status(201).json({ success: true, user });
});
exports.login = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { email, password } = req.body;
    const user = await prisma_1.prisma.user.findUnique({ where: { email } });
    if (!user)
        throw new ApiError_1.ApiError(401, "Invalid credentials");
    const match = await (0, password_1.comparePassword)(password, user.password);
    if (!match)
        throw new ApiError_1.ApiError(401, "Invalid credentials");
    const accessToken = (0, jwt_1.signAccessToken)({ userId: user.id });
    const refreshToken = (0, jwt_1.signRefreshToken)({ userId: user.id });
    await prisma_1.prisma.session.create({
        data: {
            userId: user.id,
            refreshToken,
            expiresAt: new Date(Date.now() + 7 * 86400000),
        },
    });
    res.json({
        accessToken,
        refreshToken,
    });
});
