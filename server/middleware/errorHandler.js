function errorHandler(err, req, res, next) {
  if (res.headersSent) {
    return next(err);
  }

  const statusCode =
    err.statusCode || (res.statusCode && res.statusCode !== 200 ? res.statusCode : 500);

  console.error(`[Error] ${req.method} ${req.originalUrl}:`, err);

  const isProduction = process.env.NODE_ENV === "production";
  let message = err.message || "An unexpected internal server error occurred";

  if (isProduction && statusCode === 500) {
    message = "An internal server error occurred. Please try again later.";
  }

  res.status(statusCode).json({
    error: message,
    ...(isProduction ? {} : { stack: err.stack }),
  });
}

module.exports = errorHandler;
