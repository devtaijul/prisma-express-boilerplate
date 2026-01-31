import { Router } from "express";
import {
  createOrder,
  deleteOrder,
  getAllOrders,
  getOrderById,
  trackingOrder,
  updateOrder,
} from "./order.controller";

const router = Router();

router.get("/", getAllOrders).post("/", createOrder);
router.get("/track/:trackingNumber", trackingOrder);
router
  .get("/:id", getOrderById)
  .put("/:id", updateOrder)
  .delete("/:id", deleteOrder);

export default router;
