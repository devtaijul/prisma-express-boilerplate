import { Request, Response } from "express";
import { prisma } from "../../config/prisma";
import { ApiError } from "../../utils/ApiError";
import { asyncHandler } from "../../middlewares/asyncHandler";
import { hashPassword, comparePassword } from "../../utils/password";
import { signAccessToken, signRefreshToken } from "../../utils/jwt";

export const register = asyncHandler(async (req: Request, res: Response) => {
  const { email, password } = req.body;

  const exists = await prisma.user.findUnique({ where: { email } });
  if (exists) throw new ApiError(409, "User already exists");

  const user = await prisma.user.create({
    data: {
      email,
      password: await hashPassword(password),
    },
  });

  res.status(201).json({ success: true, user });
});

export const login = asyncHandler(async (req: Request, res: Response) => {
  const { email, password } = req.body;

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) throw new ApiError(401, "Invalid credentials");

  const match = await comparePassword(password, user.password);
  if (!match) throw new ApiError(401, "Invalid credentials");

  const accessToken = signAccessToken({ userId: user.id });
  const refreshToken = signRefreshToken({ userId: user.id });

  await prisma.session.create({
    data: {
      userId: user.id,
      refreshToken,
      expiresAt: new Date(Date.now() + 7 * 86400000),
    },
  });

  res.json({
    accessToken,
    refreshToken,
  });
});
