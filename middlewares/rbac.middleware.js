/**
 * Role-Based Access Control Middleware
 * Usage: allowRoles("ADMIN", "MANAGER")
 */
export const allowRoles = (...allowedRoles) => {
  return (req, res, next) => {
    // Ensure auth middleware ran
    if (!req.user || !req.user.role) {
      req.log?.error(
        { path: req.path },
        "RBAC check failed: user missing on request",
      );

      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    // Role check
    if (!allowedRoles.includes(req.user.role)) {
      req.log?.warn(
        {
          userId: req.user.id,
          role: req.user.role,
          allowedRoles,
          path: req.path,
        },
        "RBAC access denied",
      );

      return res.status(403).json({
        success: false,
        message: "Forbidden: insufficient permissions",
      });
    }

    // Authorized
    next();
  };
};
