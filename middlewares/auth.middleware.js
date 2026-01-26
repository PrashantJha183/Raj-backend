import jwt from "jsonwebtoken";

/**
 * JWT Authentication Middleware
 * - Stateless
 * - Fast
 * - Production safe
 */
export const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;

  // Check header existence
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({
      success: false,
      message: "Authorization token missing",
    });
  }

  const token = authHeader.split(" ")[1];

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Attach user to request
    req.user = {
      id: decoded.id,
      role: decoded.role,
    };

    next();
  } catch (err) {
    // Log reason (debuggable, not exposed)
    req.log?.warn(
      { error: err.name, path: req.path },
      "JWT verification failed",
    );

    return res.status(401).json({
      success: false,
      message: "Invalid or expired token",
    });
  }
};
