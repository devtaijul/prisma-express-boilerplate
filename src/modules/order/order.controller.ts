import { Request, Response } from "express";
import { prisma } from "../../config/prisma";
import { asyncHandler } from "../../middlewares/asyncHandler";
import { Order, orderStatus } from "../../generated/prisma";
import { generateOrderTrackingNumber } from "../../utils/password";

export const createOrder = asyncHandler(async (req: Request, res: Response) => {
  const {
    name,
    phone,
    address,
    deliveryArea,
    paymentMethod,
    note,
    orderItems,
    subtotal,
    deliveryCharge,
    total,
  } = req.body;

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

  const order = await prisma.order.create({
    data: {
      name,
      phone,
      address,
      deliveryArea,
      paymentMethod,
      deliveryCharge,
      subtotal,
      total,
      trackingNumber: generateOrderTrackingNumber(),
      status: orderStatus.CONFIRMED,
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

export const getAllOrders = asyncHandler(
  async (req: Request, res: Response) => {
    const orders = await prisma.order.findMany();
    return res.status(200).json({
      success: true,
      data: orders,
    });
  },
);

export const trackingOrder = asyncHandler(
  async (req: Request, res: Response) => {
    const { trackingNumber } = req.params;

    if (!trackingNumber || Array.isArray(trackingNumber)) {
      return res.status(400).json({
        success: false,
        message: "Tracking number is required",
      });
    }

    const order = await prisma.order.findMany({
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
  },
);
