import rateLimit from "express-rate-limit";

/**
 * Base config to avoid double counting (OPTIONS / preflight)
 */
const baseLimiterConfig = {
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => req.method === "OPTIONS",
};

/**
 * OTP SEND limiter – strict
 */
export const otpLimiter = rateLimit({
  ...baseLimiterConfig,
  windowMs: 60 * 1000, // 1 minute
  max: 3,
  message: {
    success: false,
    message: "Too many OTP requests. Try again in a minute.",
  },
  handler: (req, res) => {
    req.log?.warn(
      { ip: req.ip, path: req.path },
      "OTP send rate limit exceeded",
    );
    res.status(429).json({
      success: false,
      message: "Too many OTP requests. Try again in a minute.",
    });
  },
});

/**
 * OTP VERIFY limiter – slightly relaxed
 */
export const verifyOtpLimiter = rateLimit({
  ...baseLimiterConfig,
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 10,
  message: {
    success: false,
    message: "Too many OTP attempts. Try again later.",
  },
  handler: (req, res) => {
    req.log?.warn(
      { ip: req.ip, path: req.path },
      "OTP verify rate limit exceeded",
    );
    res.status(429).json({
      success: false,
      message: "Too many OTP attempts. Try again later.",
    });
  },
});

/**
 * General API limiter – soft
 */
export const apiLimiter = rateLimit({
  ...baseLimiterConfig,
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 50,
  message: {
    success: false,
    message: "Too many requests. Please slow down.",
  },
  handler: (req, res) => {
    req.log?.warn({ ip: req.ip, path: req.path }, "API rate limit exceeded");
    res.status(429).json({
      success: false,
      message: "Too many requests. Please slow down.",
    });
  },
});
