import { Request, Response } from "express";
import { prisma } from "../../config/prisma";
import { verifyRefreshToken, signAccessToken } from "../../utils/jwt";
import { ApiError } from "../../utils/ApiError";
import { asyncHandler } from "../../middlewares/asyncHandler";

export const refreshToken = asyncHandler(
  async (req: Request, res: Response) => {
    const { refreshToken } = req.body;

    if (!refreshToken) throw new ApiError(401, "No refresh token");

    const session = await prisma.session.findUnique({
      where: { refreshToken },
    });

    if (!session || session.expiresAt < new Date())
      throw new ApiError(401, "Session expired");

    const payload = verifyRefreshToken(refreshToken) as any;

    const accessToken = signAccessToken({
      userId: payload.userId,
    });

    res.json({ accessToken });
  },
);
