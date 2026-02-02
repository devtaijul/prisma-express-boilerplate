import { Router } from "express";
import {
  childDrivenCategory,
  createCategory,
  deleteCategories,
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

router
  .get("/:id", getCategoryById)
  .put("/:id", updateCategory)
  .delete("/:id", deleteCategories);

export default router;
