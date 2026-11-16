const rateLimit = require("express-rate-limit");

/**
 * Resolves client IP safely using Express's trust proxy configuration.
 *
 * @param {import("express").Request} req
 * @returns {string}
 */
function getClientIp(req) {
  if (!req) return "127.0.0.1";
  return req.ip || req.socket?.remoteAddress || "127.0.0.1";
}

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  skipSuccessfulRequests: true, // Only penalize failed authentication attempts
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => getClientIp(req),
  message: {
    error: "Too many failed login attempts from this IP. Please try again after 15 minutes.",
  },
});

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => getClientIp(req),
  message: {
    error: "Too many requests. Please slow down.",
  },
});

module.exports = {
  authLimiter,
  apiLimiter,
  getClientIp,
};
