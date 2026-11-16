const assert = require("assert");
const prisma = require("../prismaClient");
const adminMiddleware = require("../middleware/adminMiddleware");

console.log("Running adminMiddleware unit tests...\n");

function createMockReq(user) {
  const req = {};
  if (user !== undefined) {
    req.user = user;
  }
  return req;
}

function createMockRes() {
  return {
    statusCode: null,
    jsonData: null,
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

const originalFindUnique = prisma.user.findUnique;

async function runTests() {
  try {
    // ==========================================
    // Case 1: Active Admin in DB
    // ==========================================
    console.log("Testing Case 1: Active admin in DB -> calls next()...");
    {
      let capturedArgs = null;
      prisma.user.findUnique = async (args) => {
        capturedArgs = args;
        return { is_admin: true };
      };

      const req = createMockReq({ id: 1, is_admin: true });
      const res = createMockRes();
      let nextCalled = false;
      let nextError = null;

      await adminMiddleware(req, res, (err) => {
        nextCalled = true;
        nextError = err;
      });

      assert.strictEqual(nextCalled, true, "next() must be called for active admin");
      assert.strictEqual(nextError, undefined, "next() must not be called with an error");
      assert.strictEqual(res.statusCode, null, "res.status() must not be called when allowed");
      assert.deepStrictEqual(
        capturedArgs,
        { where: { id: 1 }, select: { is_admin: true } },
        "prisma.user.findUnique must be queried with req.user.id and select is_admin"
      );
    }

    // Case 1b: User promoted in DB even if token had is_admin: false/undefined
    {
      prisma.user.findUnique = async () => ({ is_admin: true });

      const req = createMockReq({ id: 5 }); // no is_admin in token
      const res = createMockRes();
      let nextCalled = false;

      await adminMiddleware(req, res, () => {
        nextCalled = true;
      });

      assert.strictEqual(nextCalled, true, "Live DB check promotes active admin");
      assert.strictEqual(res.statusCode, null);
    }

    // ==========================================
    // Case 2: Demoted Admin in DB (Stale Token)
    // ==========================================
    console.log("Testing Case 2: Demoted admin in DB -> returns 403...");
    {
      prisma.user.findUnique = async () => ({ is_admin: false });

      const req = createMockReq({ id: 2, is_admin: true });
      const res = createMockRes();
      let nextCalled = false;

      await adminMiddleware(req, res, () => {
        nextCalled = true;
      });

      assert.strictEqual(nextCalled, false, "next() must not be called for demoted admin");
      assert.strictEqual(res.statusCode, 403, "Status code must be 403");
      assert.deepStrictEqual(
        res.jsonData,
        { error: "Access denied. Admins only." },
        "Error message must inform admins only"
      );
    }

    // Case 2b: is_admin is null in DB
    {
      prisma.user.findUnique = async () => ({ is_admin: null });

      const req = createMockReq({ id: 3, is_admin: true });
      const res = createMockRes();
      let nextCalled = false;

      await adminMiddleware(req, res, () => {
        nextCalled = true;
      });

      assert.strictEqual(nextCalled, false);
      assert.strictEqual(res.statusCode, 403);
      assert.deepStrictEqual(res.jsonData, { error: "Access denied. Admins only." });
    }

    // ==========================================
    // Case 3: Deleted / Non-existent User in DB
    // ==========================================
    console.log("Testing Case 3: Deleted user (not found in DB) -> returns 403...");
    {
      prisma.user.findUnique = async () => null;

      const req = createMockReq({ id: 999, is_admin: true });
      const res = createMockRes();
      let nextCalled = false;

      await adminMiddleware(req, res, () => {
        nextCalled = true;
      });

      assert.strictEqual(nextCalled, false, "next() must not be called when user not found");
      assert.strictEqual(res.statusCode, 403, "Status code must be 403");
      assert.deepStrictEqual(
        res.jsonData,
        { error: "Access denied. Admins only." },
        "Error message must inform admins only"
      );
    }

    // ==========================================
    // Case 4: Missing Authentication / User Context
    // ==========================================
    console.log("Testing Case 4: Missing req.user or req.user.id -> returns 401...");
    // 4.1 req.user is undefined
    {
      let dbQueried = false;
      prisma.user.findUnique = async () => {
        dbQueried = true;
        return { is_admin: true };
      };

      const req = createMockReq(undefined);
      const res = createMockRes();
      let nextCalled = false;

      await adminMiddleware(req, res, () => {
        nextCalled = true;
      });

      assert.strictEqual(nextCalled, false);
      assert.strictEqual(res.statusCode, 401, "Must return 401 for unauthenticated request");
      assert.deepStrictEqual(
        res.jsonData,
        { error: "Access denied. Authentication required." }
      );
      assert.strictEqual(dbQueried, false, "Database should not be queried when auth is missing");
    }

    // 4.2 req.user is null
    {
      const req = createMockReq(null);
      const res = createMockRes();
      let nextCalled = false;

      await adminMiddleware(req, res, () => {
        nextCalled = true;
      });

      assert.strictEqual(nextCalled, false);
      assert.strictEqual(res.statusCode, 401);
      assert.deepStrictEqual(
        res.jsonData,
        { error: "Access denied. Authentication required." }
      );
    }

    // 4.3 req.user.id is missing/undefined
    {
      const req = createMockReq({ email: "user@example.com" });
      const res = createMockRes();
      let nextCalled = false;

      await adminMiddleware(req, res, () => {
        nextCalled = true;
      });

      assert.strictEqual(nextCalled, false);
      assert.strictEqual(res.statusCode, 401);
      assert.deepStrictEqual(
        res.jsonData,
        { error: "Access denied. Authentication required." }
      );
    }

    // 4.4 req.user.id is null
    {
      const req = createMockReq({ id: null, email: "user@example.com" });
      const res = createMockRes();
      let nextCalled = false;

      await adminMiddleware(req, res, () => {
        nextCalled = true;
      });

      assert.strictEqual(nextCalled, false);
      assert.strictEqual(res.statusCode, 401);
      assert.deepStrictEqual(
        res.jsonData,
        { error: "Access denied. Authentication required." }
      );
    }

    // ==========================================
    // Case 5: Database Failure
    // ==========================================
    console.log("Testing Case 5: Database failure -> calls next(err)...");
    {
      const dbError = new Error("PrismaClientInitializationError: Connection refused");
      prisma.user.findUnique = async () => {
        throw dbError;
      };

      const req = createMockReq({ id: 1 });
      const res = createMockRes();
      let nextCalled = false;
      let capturedError = null;

      await adminMiddleware(req, res, (err) => {
        nextCalled = true;
        capturedError = err;
      });

      assert.strictEqual(nextCalled, true, "next() must be called on DB error");
      assert.strictEqual(capturedError, dbError, "Database error must be forwarded to next()");
      assert.strictEqual(res.statusCode, null, "Response should not be completed by middleware");
    }

    console.log("\nAll adminMiddleware unit tests passed successfully!");
  } finally {
    // Restore original prisma method
    prisma.user.findUnique = originalFindUnique;
  }
}

runTests().catch((err) => {
  console.error("Test execution failed:", err);
  process.exit(1);
});
