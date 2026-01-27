import express from "express";
import cors from "cors";
import helmet from "helmet";
import compression from "compression";

import { logger } from "./middlewares/logger.middleware.js";
import routes from "./routes/index.js";
import authRoutes from "./routes/auth.routes.js";
import errorHandler from "./middlewares/error.middleware.js";
import { apiLimiter } from "./middlewares/rateLimit.middleware.js";
import { swaggerServe, swaggerSetup } from "./swagger/index.js";
const app = express();

/* ======================
   Proxy
====================== */
app.set("trust proxy", 1);

/* ======================
   Security
====================== */
app.use(
  cors({
    origin: process.env.CORS_ORIGIN
      ? process.env.CORS_ORIGIN.split(",")
      : false,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
  }),
);

app.use(
  helmet({
    contentSecurityPolicy: false, // API-safe
  }),
);

/* ======================
   Logging (must be before routes)
====================== */
app.use(logger);

/* ======================
   Body Parsing
====================== */
app.use(express.json({ limit: "200kb" }));

/* ======================
   Performance
====================== */
app.use(compression());

/* ======================
   Routes
====================== */
app.use("/api", apiLimiter, routes); // health, general APIs
app.use("/api/auth", authRoutes); // OTP + auth (own limiter)

if (process.env.NODE_ENV !== "production") {
  app.use("/docs", swaggerServe, swaggerSetup);
}

/* ======================
   Error Handler (LAST)
====================== */
app.use(errorHandler);

export default app;
