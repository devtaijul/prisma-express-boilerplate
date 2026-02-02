import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import compression from "compression";
import authRoutes from "./modules/auth/auth.route";
import healthRoutes from "./modules/health/health.route";
import mediaRoutes from "./modules/media/media.routes";
import categoryRoutes from "./modules/category/category.routes";

import { errorMiddleware } from "./middlewares/error.middleware";
import { notFound } from "./middlewares/notFound.middleware";
import productRoutes from "./modules/product/product.route";
import orderRoutes from "./modules/order/order.route";

const app = express();

const allowedOrigins = [
  "https://sajherbati.com",
  "https://admin.sajherbati.com",
  "http://localhost:3000",
  "http://localhost:5173",
];

app.use(
  cors({
    origin: function (origin, callback) {
      // Postman / server-to-server request e origin undefined thake
      if (!origin) return callback(null, true);

      if (allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  }),
);
app.use(
  helmet({
    crossOriginResourcePolicy: false,
  }),
);
app.use(compression());
app.use(express.json());
app.use(morgan("dev"));

// API Routes
app.use("/api/v1/media", mediaRoutes);
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/health", healthRoutes);
app.use("/api/v1/category", categoryRoutes);
app.use("/api/v1/product", productRoutes);
app.use("/api/v1/order", orderRoutes);

// Static files
app.use("/uploads", express.static("uploads"));
app.use(notFound);
app.use(errorMiddleware);

export default app;
