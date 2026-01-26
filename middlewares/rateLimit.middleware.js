import rateLimit from "express-rate-limit";

/**
 * OTP limiter – very strict
 */
export const otpLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 5,
  standardHeaders: true, // RateLimit-* headers
  legacyHeaders: false, // Disable X-RateLimit-* headers
  message: {
    success: false,
    message: "Too many OTP requests. Try again after 5 minutes.",
  },
  handler: (req, res, next, options) => {
    req.log?.warn({ ip: req.ip, path: req.path }, "OTP rate limit exceeded");

    res.status(429).json(options.message);
  },
});

/**
 * General API limiter – soft limit
 */
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 50,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many requests. Please slow down.",
  },
  handler: (req, res, next, options) => {
    req.log?.warn({ ip: req.ip, path: req.path }, "API rate limit exceeded");

    res.status(429).json(options.message);
  },
});
