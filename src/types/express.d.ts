import type { JwtPayload } from "jsonwebtoken";
import { Category } from "../generated/prisma";

declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload & {
        userId: string;
      };
    }
  }
}

export type CategoryInput = Omit<
  Category,
  "id" | "createdAt" | "updatedAt" | "children"
>;

export {};
