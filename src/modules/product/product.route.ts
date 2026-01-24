import { Router } from "express";
import {
  createProduct,
  deleteProduct,
  getProductById,
  getProducts,
  getSpecialProducts,
  updateProduct,
} from "./product.controller";

const router = Router();

router
  .get("/", getProducts)
  .post("/", createProduct)
  .get("/special", getSpecialProducts);
router
  .get("/:id", getProductById)
  .put("/:id", updateProduct)
  .delete("/:id", deleteProduct);

export default router;
