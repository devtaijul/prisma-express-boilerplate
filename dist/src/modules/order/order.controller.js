"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.trackingOrder = exports.getAllOrders = exports.createOrder = void 0;
const prisma_1 = require("../../config/prisma");
const asyncHandler_1 = require("../../middlewares/asyncHandler");
const prisma_2 = require("../../generated/prisma");
const password_1 = require("../../utils/password");
exports.createOrder = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { name, phone, address, deliveryArea, paymentMethod, note, orderItems, subtotal, deliveryCharge, total, } = req.body;
    if (!deliveryArea) {
        return res.status(400).json({
            success: false,
            message: "Delivery area is required",
        });
    }
    if (!name || !phone || !address) {
        return res.status(400).json({
            success: false,
            message: "All fields are required",
        });
    }
    if (!orderItems || orderItems.length === 0) {
        return res.status(400).json({
            success: false,
            message: "At least one product is required",
        });
    }
    const order = await prisma_1.prisma.order.create({
        data: {
            name,
            phone,
            address,
            deliveryArea,
            paymentMethod,
            deliveryCharge,
            subtotal,
            total,
            trackingNumber: (0, password_1.generateOrderTrackingNumber)(),
            status: prisma_2.orderStatus.CONFIRMED,
            note,
            orderItems: {
                createMany: {
                    data: orderItems,
                },
            },
        },
    });
    return res.status(200).json({
        success: true,
        message: "Order created successfully",
        data: order,
    });
});
exports.getAllOrders = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const orders = await prisma_1.prisma.order.findMany();
    return res.status(200).json({
        success: true,
        data: orders,
    });
});
exports.trackingOrder = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { trackingNumber } = req.params;
    if (!trackingNumber || Array.isArray(trackingNumber)) {
        return res.status(400).json({
            success: false,
            message: "Tracking number is required",
        });
    }
    const order = await prisma_1.prisma.order.findMany({
        where: {
            OR: [
                {
                    trackingNumber: trackingNumber,
                },
                {
                    phone: trackingNumber,
                },
            ],
        },
        include: {
            orderItems: {
                include: {
                    product: true,
                },
            },
        },
    });
    if (!order || order.length === 0) {
        return res.status(404).json({
            success: false,
            message: "Order not found",
        });
    }
    return res.status(200).json({
        success: true,
        data: order,
    });
});
