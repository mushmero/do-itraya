const assert = require("assert");
const {
  schemas,
  validateData,
  validateBody,
  ALLOWED_CASH_NOTES,
  ALLOWED_TYPES,
} = require("../middleware/validate");

console.log("Running validation tests...\n");

// --- Constants Checks ---
assert(Array.isArray(ALLOWED_CASH_NOTES), "ALLOWED_CASH_NOTES should be an array");
assert.deepStrictEqual(ALLOWED_CASH_NOTES, [1, 5, 10, 20, 50, 100], "Allowed cash notes mismatch");
assert.deepStrictEqual(
  ALLOWED_TYPES,
  [
    "family",
    "single",
    "individual",
    "in-laws",
    "relatives",
    "neighbors",
    "colleagues",
    "charity",
  ],
  "Allowed types mismatch"
);

// --- Register Schema Tests ---
console.log("Testing schemas.register...");
const validRegister = {
  username: "testuser",
  email: "test@example.com",
  password: "ValidPassword123!",
};

// 1. Valid register passes
const regRes1 = validateData(schemas.register, validRegister);
assert.strictEqual(regRes1.isValid, true, "Valid register should pass");
assert.strictEqual(regRes1.errors.length, 0);

// 2. Long password (>72 chars) fails (bcrypt DoS protection)
const longPassword = "A".repeat(80);
const regRes2 = validateData(schemas.register, { ...validRegister, password: longPassword });
assert.strictEqual(regRes2.isValid, false, "Password > 72 chars must fail");
assert(regRes2.errors.some((e) => e.includes("72")), "Should mention 72 chars limit");

// 3. Short password (<8 chars) fails
const shortPassword = "short";
const regRes3 = validateData(schemas.register, { ...validRegister, password: shortPassword });
assert.strictEqual(regRes3.isValid, false, "Password < 8 chars must fail");

// 4. Missing/short username fails
assert.strictEqual(validateData(schemas.register, { ...validRegister, username: "a" }).isValid, false);
assert.strictEqual(validateData(schemas.register, { ...validRegister, username: "   " }).isValid, false);
assert.strictEqual(validateData(schemas.register, { ...validRegister, username: "" }).isValid, false);
assert.strictEqual(validateData(schemas.register, { ...validRegister, username: "A".repeat(51) }).isValid, false);

// 5. Invalid email format / overly long email fails
assert.strictEqual(validateData(schemas.register, { ...validRegister, email: "invalid-email" }).isValid, false);
assert.strictEqual(validateData(schemas.register, { ...validRegister, email: "@domain.com" }).isValid, false);
assert.strictEqual(validateData(schemas.register, { ...validRegister, email: "user@" }).isValid, false);
assert.strictEqual(validateData(schemas.register, { ...validRegister, email: "a".repeat(95) + "@test.com" }).isValid, false);

// --- Login Schema Tests ---
console.log("Testing schemas.login...");
const validLogin = {
  email: "user@example.com",
  password: "validpassword",
};

// 1. Valid login passes
const loginRes1 = validateData(schemas.login, validLogin);
assert.strictEqual(loginRes1.isValid, true, "Valid login should pass");

// 2. Missing email fails
assert.strictEqual(validateData(schemas.login, { ...validLogin, email: "" }).isValid, false);
assert.strictEqual(validateData(schemas.login, { ...validLogin, email: "   " }).isValid, false);
assert.strictEqual(validateData(schemas.login, { password: "validpassword" }).isValid, false);

// 3. Password > 72 chars fails
assert.strictEqual(validateData(schemas.login, { ...validLogin, password: "B".repeat(73) }).isValid, false);

// --- CreateReceiver Schema Tests ---
console.log("Testing schemas.createReceiver...");
const validReceiver = {
  name: "Uncle John",
  children_count: 2,
  amount_per_packet: 10,
  cash_note: 10,
  type: "family",
  year: 2026,
};

// 1. Valid receiver passes
const recRes1 = validateData(schemas.createReceiver, validReceiver);
assert.strictEqual(recRes1.isValid, true, "Valid receiver should pass");

// 2. Valid receiver with minimal fields (optional type and year omitted) passes
const recResMinimal = validateData(schemas.createReceiver, {
  name: "Aunt Sarah",
  children_count: 0,
  amount_per_packet: 50,
  cash_note: 50,
});
assert.strictEqual(recResMinimal.isValid, true, "Minimal receiver should pass");

// 3. cash_note = 0 fails (divide-by-zero protection)
const recResZeroCash = validateData(schemas.createReceiver, {
  ...validReceiver,
  cash_note: 0,
});
assert.strictEqual(recResZeroCash.isValid, false, "cash_note = 0 must fail validation");

// 4. cash_note negative or invalid denomination fails
assert.strictEqual(
  validateData(schemas.createReceiver, { ...validReceiver, cash_note: -10 }).isValid,
  false,
  "Negative cash_note must fail"
);
assert.strictEqual(
  validateData(schemas.createReceiver, { ...validReceiver, cash_note: 3 }).isValid,
  false,
  "Non-standard cash_note must fail"
);

// 5. Allowed cash notes all pass when amount_per_packet is a multiple
for (const note of ALLOWED_CASH_NOTES) {
  const res = validateData(schemas.createReceiver, { ...validReceiver, amount_per_packet: note * 2, cash_note: note });
  assert.strictEqual(res.isValid, true, `cash_note ${note} should pass`);
}

// 5b. Divisibility check: amount_per_packet must be a whole multiple of cash_note
assert.strictEqual(
  validateData(schemas.createReceiver, { ...validReceiver, amount_per_packet: 15, cash_note: 10 }).isValid,
  false,
  "Indivisible amount_per_packet (15 % 10 != 0) must fail"
);
assert.strictEqual(
  validateData(schemas.createReceiver, { ...validReceiver, amount_per_packet: 10, cash_note: 20 }).isValid,
  false,
  "Amount smaller than cash_note (10 % 20 != 0) must fail"
);
assert.strictEqual(
  validateData(schemas.createReceiver, { ...validReceiver, amount_per_packet: 50, cash_note: 10 }).isValid,
  true,
  "Divisible amount_per_packet (50 % 10 == 0) must pass"
);

// 6. Invalid name fails
assert.strictEqual(validateData(schemas.createReceiver, { ...validReceiver, name: "" }).isValid, false);
assert.strictEqual(validateData(schemas.createReceiver, { ...validReceiver, name: "   " }).isValid, false);
assert.strictEqual(validateData(schemas.createReceiver, { ...validReceiver, name: "A".repeat(101) }).isValid, false);

// 7. Invalid children_count fails
assert.strictEqual(validateData(schemas.createReceiver, { ...validReceiver, children_count: -1 }).isValid, false);
assert.strictEqual(validateData(schemas.createReceiver, { ...validReceiver, children_count: 101 }).isValid, false);
assert.strictEqual(validateData(schemas.createReceiver, { ...validReceiver, children_count: 2.5 }).isValid, false);

// 8. Invalid amount_per_packet fails
assert.strictEqual(validateData(schemas.createReceiver, { ...validReceiver, amount_per_packet: 0 }).isValid, false);
assert.strictEqual(validateData(schemas.createReceiver, { ...validReceiver, amount_per_packet: -5 }).isValid, false);
assert.strictEqual(validateData(schemas.createReceiver, { ...validReceiver, amount_per_packet: 10001 }).isValid, false);

// 9. Invalid type fails & all allowed types pass
assert.strictEqual(validateData(schemas.createReceiver, { ...validReceiver, type: "corporate" }).isValid, false);
for (const type of ALLOWED_TYPES) {
  assert.strictEqual(
    validateData(schemas.createReceiver, { ...validReceiver, type }).isValid,
    true,
    `type ${type} should pass`
  );
}

// 10. Invalid year fails
assert.strictEqual(validateData(schemas.createReceiver, { ...validReceiver, year: 1999 }).isValid, false);
assert.strictEqual(validateData(schemas.createReceiver, { ...validReceiver, year: 2101 }).isValid, false);
assert.strictEqual(validateData(schemas.createReceiver, { ...validReceiver, year: 2026 }).isValid, true);

// --- validateData Edge Cases ---
console.log("Testing validateData edge cases...");
assert.strictEqual(validateData(schemas.register, null).isValid, false);
assert.strictEqual(validateData(schemas.register, undefined).isValid, false);

// --- Express validateBody Middleware Tests ---
console.log("Testing validateBody middleware...");
const middleware = validateBody("register");

// Valid payload should call next() and not respond
let nextCalled = false;
let statusSent = null;
let jsonSent = null;

const mockRes = {
  status: (code) => {
    statusSent = code;
    return {
      json: (data) => {
        jsonSent = data;
      },
    };
  },
};

middleware({ body: validRegister }, mockRes, () => {
  nextCalled = true;
});
assert.strictEqual(nextCalled, true, "Middleware should call next() for valid body");
assert.strictEqual(statusSent, null, "Middleware should not send status for valid body");

// Invalid payload should return 400 with details
nextCalled = false;
statusSent = null;
jsonSent = null;

middleware(
  { body: { username: "x", email: "bad", password: "123" } },
  mockRes,
  () => {
    nextCalled = true;
  }
);
assert.strictEqual(nextCalled, false, "Middleware should not call next() for invalid body");
assert.strictEqual(statusSent, 400, "Middleware should respond with 400");
assert.strictEqual(jsonSent.error, "Validation failed");
assert(Array.isArray(jsonSent.details), "Details should be an array of errors");
assert(jsonSent.details.length >= 3, "All 3 field errors should be reported");

console.log("\nAll validation unit tests passed successfully!");
