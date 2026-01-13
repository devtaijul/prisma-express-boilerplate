import { Router } from "express";
import { healthCheck } from "./health.controller";
import { me } from "./me.controller";
import { authMiddleware } from "../../middlewares/auth.middleware";

const router = Router();

router.get("/", healthCheck);
router.get("/me", authMiddleware, me);

export default router;
