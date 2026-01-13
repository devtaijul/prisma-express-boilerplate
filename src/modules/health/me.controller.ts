import { asyncHandler } from "../../middlewares/asyncHandler";

export const me = asyncHandler(
  async (req: Request & { user: any }, res: Response) => {
    // req.user already populated by middleware
    res.json({ user: req.user });
  }
);
