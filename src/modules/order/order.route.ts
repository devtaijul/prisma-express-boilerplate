import { Router } from "express";
import { createOrder, getAllOrders, trackingOrder } from "./order.controller";

const router = Router();

router.get("/", getAllOrders).post("/", createOrder);
router.get("/track/:trackingNumber", trackingOrder);

export default router;
