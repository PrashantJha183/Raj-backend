import pino from "pino";

const isProd = process.env.NODE_ENV === "production";

export const logger = pino({
  level: isProd ? "info" : "debug",
  redact: {
    paths: ["req.headers.authorization", "req.body.otp", "req.body.password"],
    censor: "[REDACTED]",
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
