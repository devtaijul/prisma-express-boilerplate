"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authMiddleware = void 0;
const jwt_1 = require("../utils/jwt");
const ApiError_1 = require("../utils/ApiError");
const authMiddleware = (req, res, next) => {
    const header = req.headers.authorization;
    if (!header)
        throw new ApiError_1.ApiError(401, "No token");
    const token = header.split(" ")[1];
    const payload = (0, jwt_1.verifyAccessToken)(token);
    req.user = payload;
    next();
};
exports.authMiddleware = authMiddleware;
