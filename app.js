import express from "express";
import cors from "cors";
import helmet from "helmet";
import compression from "compression";
import pinoHttp from "pino-http";
import { logger } from "./config/logger.js";
import routes from "./routes/index.js";
import erroHandler from "./middlewares/error.middleware.js";

const app = express();

// Security
app.use(
  cors({ origin: "*", methods: ["GET", "POST", "PUT", "PATCH", "DELETE"] }),
);
app.use(helmet());

// performance
app.use(compression());
app.use(express.json({ limit: "200kb" }));

//Logging
app.use(pinoHttp({ logger }));

//Routes
app.use("/api", routes);

//Global error handler
app.use(erroHandler);

export default app;
