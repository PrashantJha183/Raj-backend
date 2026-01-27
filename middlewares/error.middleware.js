export default (err, req, res, next) => {
  const statusCode = err.statusCode || err.status || 500;

  req.log?.error(
    {
      message: err.message,
      statusCode,
      path: req.path,
      method: req.method,
      stack: process.env.NODE_ENV !== "production" ? err.stack : undefined,
    },
    "Unhandled error",
  );

  res.status(statusCode).json({
    success: false,
    message:
      process.env.NODE_ENV === "production"
        ? "Internal server error"
        : err.message,
  });
};
