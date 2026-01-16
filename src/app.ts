import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import compression from "compression";
import authRoutes from "./modules/auth/auth.route";
import healthRoutes from "./modules/health/health.route";
import mediaRoutes from "./modules/media/media.routes";
import connectionRoutes from "./modules/media/connection.routes";

import { errorMiddleware } from "./middlewares/error.middleware";
import { notFound } from "./middlewares/notFound.middleware";
import path from "path";
const UPLOAD_PATH = process.env.UPLOAD_PATH || "/var/www/uploads";
const app = express();

app.use(cors());
//app.use(helmet());
app.use(compression());
app.use(express.json());
app.use(morgan("dev"));

// API Routes
app.use("/api/media", mediaRoutes);
app.use("/api/media/connections", connectionRoutes);
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/health", healthRoutes);

// Static files
app.use("/uploads", express.static("uploads"));
app.use(notFound);
app.use(errorMiddleware);

export default app;
