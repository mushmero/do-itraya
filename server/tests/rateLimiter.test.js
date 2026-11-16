const assert = require("assert");
const EventEmitter = require("events");
const { authLimiter, apiLimiter, getClientIp } = require("../middleware/rateLimiter");

console.log("Running rateLimiter unit tests...\n");

function createMockReq(options = {}) {
  return {
    headers: options.headers || {},
    ip: options.ip || undefined,
    socket: options.socket || undefined,
  };
}

function createMockRes() {
  const emitter = new EventEmitter();
  const headers = {};
  return Object.assign(emitter, {
    statusCode: 200,
    headers,
    jsonData: null,
    setHeader(name, value) {
      headers[name.toLowerCase()] = value;
      return this;
    },
    getHeader(name) {
      return headers[name.toLowerCase()];
    },
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(data) {
      this.jsonData = data;
      return this;
    },
    send(data) {
      this.sentData = data;
      return this;
    },
  });
}

async function runTests() {
  try {
    // ==========================================
    // 1. getClientIp Unit Tests
    // ==========================================
    console.log("Testing getClientIp: Express req.ip...");
    {
      const req = createMockReq({ ip: "203.0.113.195" });
      assert.strictEqual(getClientIp(req), "203.0.113.195");
    }

    console.log("Testing getClientIp: Fallback to socket.remoteAddress...");
    {
      const req = createMockReq({ socket: { remoteAddress: "192.168.1.50" } });
      assert.strictEqual(getClientIp(req), "192.168.1.50");
    }

    console.log("Testing getClientIp: Fallback to 127.0.0.1...");
    {
      assert.strictEqual(getClientIp(null), "127.0.0.1");
      assert.strictEqual(getClientIp({}), "127.0.0.1");
    }

    // ==========================================
    // 2. Middleware Signature Tests
    // ==========================================
    console.log("Testing authLimiter & apiLimiter middleware signatures...");
    assert.strictEqual(typeof authLimiter, "function");
    assert.strictEqual(typeof apiLimiter, "function");

    // ==========================================
    // 3. Execution Verification
    // ==========================================
    console.log("Testing middleware invocation...");
    const req = createMockReq({ ip: "127.0.0.1" });
    const res = createMockRes();
    let nextCalled = false;

    await authLimiter(req, res, () => {
      nextCalled = true;
    });

    assert.strictEqual(nextCalled, true, "authLimiter should call next()");

    console.log("\nAll rateLimiter unit tests passed successfully!");
  } catch (error) {
    console.error("Test failed:", error);
    process.exit(1);
  }
}

runTests();
