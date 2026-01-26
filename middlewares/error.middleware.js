export default (err, req, res, next) => {
  const statusCode = err.statusCode || 500;

  req.log?.error(
    {
      err,
      path: req.path,
      method: req.method,
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
