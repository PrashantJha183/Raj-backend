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

    // 1️⃣ Check header
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "Authorization token missing",
      });
    }

    const token = authHeader.split(" ")[1];

    // 2️⃣ Verify JWT
    const decoded = jwt.verify(token, process.env.SUPABASE_JWT_ACCESS_SECRET);

    // 3️⃣ Attach user (your system)
    req.user = {
      id: decoded.userId,
      email: decoded.email || null,
      phone: decoded.phone || null,
    };

    next();
  } catch (err) {
    // Log internally only
    logger.warn({ error: err.name, path: req.path }, "JWT verification failed");

    return res.status(401).json({
      success: false,
      message: "Invalid or expired token",
    });
  }
};
