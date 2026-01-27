import { Request, Response } from "express";
import { asyncHandler } from "../../middlewares/asyncHandler";

export const me = asyncHandler(
  async (req: Request & { user: any }, res: Response) => {
    // req.user already populated by middleware

    if (!req.user || !req.user.id) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    res.json({ user: req.user });
  },
);
