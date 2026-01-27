"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const order_controller_1 = require("./order.controller");
const router = (0, express_1.Router)();
router.get("/", order_controller_1.getAllOrders).post("/", order_controller_1.createOrder);
router.get("/track/:trackingNumber", order_controller_1.trackingOrder);
exports.default = router;
