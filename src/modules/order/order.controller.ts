import { Request, Response } from "express";
import { prisma } from "../../config/prisma";
import { asyncHandler } from "../../middlewares/asyncHandler";
import { Order, orderStatus } from "../../../generated/prisma";
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

// pagination and search
export const getAllOrders = asyncHandler(
  async (req: Request, res: Response) => {
    const {
      page = "1",
      limit = "10",
      search = "",
      order = "desc",
    } = req.query as Record<string, string>;

    // Search should be string .

    const pageNumber = parseInt(page);
    const pageSize = parseInt(limit);
    const skip = (pageNumber - 1) * pageSize;

    const orders = await prisma.order.findMany({
      where: {
        OR: [
          {
            trackingNumber: {
              contains: search,
              mode: "insensitive",
            },
          },
          {
            phone: {
              contains: search,
              mode: "insensitive",
            },
          },
          {
            name: {
              contains: search,
              mode: "insensitive",
            },
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
      orderBy: {
        createdAt: order as "asc" | "desc",
      },
      skip,
      take: pageSize,
    });

    const orderCount = await prisma.order.count({
      where: {
        OR: [
          {
            trackingNumber: {
              contains: search,
              mode: "insensitive",
            },
          },
          {
            phone: {
              contains: search,
              mode: "insensitive",
            },
          },
          {
            name: {
              contains: search,
              mode: "insensitive",
            },
          },
        ],
      },
    });

    res.json({
      success: true,
      data: orders,
      page: pageNumber,
      limit: pageSize,
      total: orderCount,
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

export const getOrderById = asyncHandler(
  async (req: Request, res: Response) => {
    const { id } = req.params;

    if (!id || Array.isArray(id)) {
      return res.status(400).json({
        success: false,
        message: "Order id is required",
      });
    }

    const order = await prisma.order.findUnique({
      where: {
        id,
      },
      include: {
        orderItems: {
          include: {
            product: true,
          },
        },
      },
    });

    if (!order) {
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

export const updateOrder = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  if (!id || Array.isArray(id)) {
    return res.status(400).json({
      success: false,
      message: "Order id is required",
    });
  }

  const { name, phone, address, note, status } = req.body;

  const order = await prisma.order.update({
    where: {
      id,
    },
    data: {
      name,
      phone,
      address,
      note,
      status,
    },
  });

  if (!order) {
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

export const deleteOrder = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  if (!id || Array.isArray(id)) {
    return res.status(400).json({
      success: false,
      message: "Order id is required",
    });
  }

  const order = await prisma.order.delete({
    where: {
      id,
    },
  });

  if (!order) {
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
