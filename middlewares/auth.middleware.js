import jwt from "jsonwebtoken";
import { logger } from "../config/logger.js";

/**
 * JWT Authentication Middleware
 * - Custom OTP auth
 * - Stateless
 * - Fast
 * - Production safe
 */
export const authMiddleware = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "Authorization token missing",
      });
    }

    const token = authHeader.split(" ")[1];

    const decoded = jwt.verify(token, process.env.SUPABASE_JWT_ACCESS_SECRET, {
      audience: "user",
      issuer: "ecommerce-api",
    });

    // Attach identity only — no side effects
    req.user = {
      userId: decoded.userId,
    };

    next();
  } catch (err) {
    logger.warn({ error: err.name, path: req.path }, "JWT verification failed");

    return res.status(401).json({
      success: false,
      message: "Invalid or expired token",
    });
  }
};
