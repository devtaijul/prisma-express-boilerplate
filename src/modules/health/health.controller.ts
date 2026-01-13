import { Request, Response } from "express";
import { asyncHandler } from "../../middlewares/asyncHandler";

export const healthCheck = asyncHandler(async (req: Request, res: Response) => {
  res.json({
    success: true,
    message: "Server is healthy 🚀",
  });
});
