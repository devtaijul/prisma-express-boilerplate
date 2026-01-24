import { Router } from "express";
import {
  childDrivenCategory,
  createCategory,
  getAllCategories,
  getAllFlatCategory,
  getCategoryById,
  getParentCategories,
  updateCategory,
} from "./category.controller";

const router = Router();

router.get("/", getAllCategories).post("/", createCategory);

router.get("/flat", getAllFlatCategory);
router.get("/tree", childDrivenCategory);
router.get("/parent", getParentCategories);

router.get("/:id", getCategoryById).put("/:id", updateCategory);

export default router;
