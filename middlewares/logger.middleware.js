import pino from "pino";
import pinoHttp from "pino-http";

const isProd = process.env.NODE_ENV === "production";

const pinoLogger = pino({
  level: isProd ? "info" : "debug",
  redact: {
    paths: [
      "req.headers.authorization",
      "req.headers.cookie",
      "req.body.otp",
      "req.body.password",
      "req.body.accessToken",
      "req.body.refreshToken",
    ],
    censor: "[REDACTED]",
  },
  base: {
    env: process.env.NODE_ENV,
  },
  transport: !isProd
    ? {
        target: "pino-pretty",
        options: {
          colorize: true,
          translateTime: "SYS:standard",
          ignore: "pid,hostname",
        },
      }
    : undefined,
});

export const logger = pinoHttp({
  logger: pinoLogger,
});
