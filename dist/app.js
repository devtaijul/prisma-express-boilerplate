"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const morgan_1 = __importDefault(require("morgan"));
const compression_1 = __importDefault(require("compression"));
const auth_route_1 = __importDefault(require("./modules/auth/auth.route"));
const health_route_1 = __importDefault(require("./modules/health/health.route"));
const media_routes_1 = __importDefault(require("./modules/media/media.routes"));
const connection_routes_1 = __importDefault(require("./modules/media/connection.routes"));
const category_routes_1 = __importDefault(require("./modules/category/category.routes"));
const error_middleware_1 = require("./middlewares/error.middleware");
const notFound_middleware_1 = require("./middlewares/notFound.middleware");
const product_route_1 = __importDefault(require("./modules/product/product.route"));
const order_route_1 = __importDefault(require("./modules/order/order.route"));
const app = (0, express_1.default)();
app.use((0, cors_1.default)());
//app.use(helmet());
app.use((0, compression_1.default)());
app.use(express_1.default.json());
app.use((0, morgan_1.default)("dev"));
// API Routes
app.use("/api/media", media_routes_1.default);
app.use("/api/media/connections", connection_routes_1.default);
app.use("/api/v1/auth", auth_route_1.default);
app.use("/api/v1/health", health_route_1.default);
app.use("/api/v1/category", category_routes_1.default);
app.use("/api/v1/product", product_route_1.default);
app.use("/api/v1/order", order_route_1.default);
// Static files
app.use("/uploads", express_1.default.static("uploads"));
app.use(notFound_middleware_1.notFound);
app.use(error_middleware_1.errorMiddleware);
exports.default = app;
