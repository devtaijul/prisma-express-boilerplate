import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import compression from "compression";
import authRoutes from "./modules/auth/auth.route";
import healthRoutes from "./modules/health/health.route";

import { errorMiddleware } from "./middlewares/error.middleware";
import { notFound } from "./middlewares/notFound.middleware";

const app = express();

app.use(cors());
app.use(helmet());
app.use(compression());
app.use(express.json());
app.use(morgan("dev"));

app.use("/api/auth", authRoutes);
app.use("/api/health", healthRoutes);

app.use(notFound);
app.use(errorMiddleware);

export default app;
