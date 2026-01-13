import { Request, Response, NextFunction } from "express";
import { verifyAccessToken } from "../utils/jwt";
import { ApiError } from "../utils/ApiError";

export const authMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const header = req.headers.authorization;
  if (!header) throw new ApiError(401, "No token");

  const token = header.split(" ")[1];
  const payload = verifyAccessToken(token) as any;

  req.user = payload;
  next();
};
