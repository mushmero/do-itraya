const assert = require("assert");
const errorHandler = require("../middleware/errorHandler");

console.log("Running errorHandler unit tests...\n");

// Helper to create mock Express req and res
function createMockReq(method = "GET", originalUrl = "/api/test") {
  return { method, originalUrl };
}

function createMockRes(initialStatusCode = 200) {
  return {
    statusCode: initialStatusCode,
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(data) {
      this.jsonData = data;
      return this;
    },
  };
}

// Preserve original NODE_ENV and console.error
const originalEnv = process.env.NODE_ENV;
const originalConsoleError = console.error;

// Suppress console.error during tests, but verify it was invoked
let loggedErrors = [];
console.error = (...args) => {
  loggedErrors.push(args);
};

try {
  // ==========================================
  // 1. Production Mode Tests
  // ==========================================
  console.log("Testing errorHandler in production mode...");
  process.env.NODE_ENV = "production";

  // 1.1 Unhandled internal error (500) masks message and omits stack
  {
    loggedErrors = [];
    const req = createMockReq("POST", "/api/receivers");
    const res = createMockRes();
    const error = new Error(
      "PrismaClientKnownRequestError: Unique constraint failed on field email",
    );

    errorHandler(error, req, res, () => {});

    assert.strictEqual(
      res.statusCode,
      500,
      "Should default to 500 for unhandled error",
    );
    assert.strictEqual(
      res.jsonData.error,
      "An internal server error occurred. Please try again later.",
      "Internal database error message must be masked in production",
    );
    assert.strictEqual(
      res.jsonData.stack,
      undefined,
      "Stack trace must not be exposed in production",
    );
    assert(loggedErrors.length > 0, "Server must log error to console.error");
    assert(
      loggedErrors[0][0].includes("POST /api/receivers"),
      "Log should include HTTP method and path",
    );
  }

  // 1.2 Explicit 500 status code on error object
  {
    const req = createMockReq("GET", "/api/summary");
    const res = createMockRes();
    const error = new Error("Fatal DB crash");
    error.statusCode = 500;

    errorHandler(error, req, res, () => {});

    assert.strictEqual(res.statusCode, 500);
    assert.strictEqual(
      res.jsonData.error,
      "An internal server error occurred. Please try again later.",
    );
    assert.strictEqual(res.jsonData.stack, undefined);
  }

  // 1.3 Client error (e.g. 400 Bad Request) preserves safe message in production
  {
    const req = createMockReq("POST", "/api/auth/login");
    const res = createMockRes();
    const error = new Error("Invalid username or password");
    error.statusCode = 400;

    errorHandler(error, req, res, () => {});

    assert.strictEqual(res.statusCode, 400, "Should respect custom statusCode");
    assert.strictEqual(
      res.jsonData.error,
      "Invalid username or password",
      "Non-500 status codes should preserve explicit client-facing error message",
    );
    assert.strictEqual(
      res.jsonData.stack,
      undefined,
      "Stack trace must still be omitted in production",
    );
  }

  // 1.4 Pre-set res.statusCode (e.g. 404 from prior middleware)
  {
    const req = createMockReq("GET", "/api/receivers/999");
    const res = createMockRes(404);
    const error = new Error("Receiver not found");

    errorHandler(error, req, res, () => {});

    assert.strictEqual(
      res.statusCode,
      404,
      "Should respect res.statusCode when err.statusCode is not set",
    );
    assert.strictEqual(res.jsonData.error, "Receiver not found");
    assert.strictEqual(res.jsonData.stack, undefined);
  }

  // ==========================================
  // 2. Development Mode Tests
  // ==========================================
  console.log("Testing errorHandler in development mode...");
  process.env.NODE_ENV = "development";

  // 2.1 500 error includes actual error message and stack trace
  {
    loggedErrors = [];
    const req = createMockReq("POST", "/api/receivers");
    const res = createMockRes();
    const error = new Error(
      "PrismaClientInitializationError: Unable to open database file",
    );

    errorHandler(error, req, res, () => {});

    assert.strictEqual(res.statusCode, 500);
    assert.strictEqual(
      res.jsonData.error,
      "PrismaClientInitializationError: Unable to open database file",
      "Actual error message should be returned in development",
    );
    assert(
      typeof res.jsonData.stack === "string",
      "Stack trace must be present in development",
    );
    assert(
      res.jsonData.stack.includes("PrismaClientInitializationError"),
      "Stack should contain error details",
    );
  }

  // 2.2 Error without message uses fallback in development
  {
    const req = createMockReq("GET", "/api/users");
    const res = createMockRes();
    const error = {};

    errorHandler(error, req, res, () => {});

    assert.strictEqual(res.statusCode, 500);
    assert.strictEqual(
      res.jsonData.error,
      "An unexpected internal server error occurred",
      "Fallback message should be used when err.message is empty",
    );
  }

  // 2.3 Custom status code error in development includes stack
  {
    const req = createMockReq("DELETE", "/api/users/1");
    const res = createMockRes();
    const error = new Error("Forbidden action");
    error.statusCode = 403;

    errorHandler(error, req, res, () => {});

    assert.strictEqual(res.statusCode, 403);
    assert.strictEqual(res.jsonData.error, "Forbidden action");
    assert(
      typeof res.jsonData.stack === "string",
      "Stack trace should be returned in development",
    );
  }

  console.log("\nAll errorHandler unit tests passed successfully!");
} finally {
  // Always restore original environment and console.error
  process.env.NODE_ENV = originalEnv;
  console.error = originalConsoleError;
}
