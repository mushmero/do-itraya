const ALLOWED_CASH_NOTES = [1, 5, 10, 20, 50, 100];
const ALLOWED_TYPES = [
  "family",
  "single",
  "individual",
  "in-laws",
  "relatives",
  "neighbors",
  "colleagues",
  "charity",
];

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const schemas = {
  register: (data) => {
    const errors = [];
    if (
      !data.username ||
      typeof data.username !== "string" ||
      data.username.trim().length < 2 ||
      data.username.trim().length > 50
    ) {
      errors.push("Username must be between 2 and 50 characters");
    }
    if (
      !data.email ||
      typeof data.email !== "string" ||
      !emailRegex.test(data.email) ||
      data.email.length > 100
    ) {
      errors.push("A valid email address under 100 characters is required");
    }
    if (
      !data.password ||
      typeof data.password !== "string" ||
      data.password.length < 8 ||
      data.password.length > 72
    ) {
      errors.push("Password must be between 8 and 72 characters");
    }
    return errors;
  },

  login: (data) => {
    const errors = [];
    if (!data.email || typeof data.email !== "string" || data.email.trim().length === 0) {
      errors.push("Email is required");
    }
    if (!data.password || typeof data.password !== "string" || data.password.length > 72) {
      errors.push("Valid password is required");
    }
    return errors;
  },

  resetPassword: (data) => {
    const errors = [];
    if (
      !data.newPassword ||
      typeof data.newPassword !== "string" ||
      data.newPassword.length < 8 ||
      data.newPassword.length > 72
    ) {
      errors.push("newPassword must be between 8 and 72 characters");
    }
    return errors;
  },

  createReceiver: (data, context = {}) => {
    const errors = [];
    const isUpdate = context.method === "PUT" || context.method === "PATCH";
    if (isUpdate) {
      if (
        data.name !== undefined &&
        (typeof data.name !== "string" ||
          data.name.trim().length < 1 ||
          data.name.trim().length > 100)
      ) {
        errors.push("Name must be between 1 and 100 characters");
      }
    } else {
      if (
        !data.name ||
        typeof data.name !== "string" ||
        data.name.trim().length < 1 ||
        data.name.trim().length > 100
      ) {
        errors.push("Name must be between 1 and 100 characters");
      }
    }
    if (data.children_count !== undefined) {
      const count = Number(data.children_count);
      if (!Number.isInteger(count) || count < 0 || count > 100) {
        errors.push("children_count must be an integer between 0 and 100");
      }
    }
    if (data.amount_per_packet !== undefined) {
      const amount = Number(data.amount_per_packet);
      if (!Number.isInteger(amount) || amount < 1 || amount > 10000) {
        errors.push("amount_per_packet must be an integer between 1 and 10,000");
      }
    }
    if (data.cash_note !== undefined) {
      const note = Number(data.cash_note);
      if (!ALLOWED_CASH_NOTES.includes(note)) {
        errors.push(`cash_note must be one of: ${ALLOWED_CASH_NOTES.join(", ")}`);
      }
    }
    if (data.amount_per_packet !== undefined && data.cash_note !== undefined) {
      const amount = Number(data.amount_per_packet);
      const note = Number(data.cash_note);
      if (Number.isInteger(amount) && ALLOWED_CASH_NOTES.includes(note) && amount % note !== 0) {
        errors.push(`amount_per_packet (RM ${amount}) must be evenly divisible by cash_note (RM ${note})`);
      }
    }
    if (data.type !== undefined && !ALLOWED_TYPES.includes(data.type)) {
      errors.push(`type must be one of: ${ALLOWED_TYPES.join(", ")}`);
    }
    if (data.year !== undefined) {
      const year = Number(data.year);
      if (!Number.isInteger(year) || year < 2000 || year > 2100) {
        errors.push("year must be between 2000 and 2100");
      }
    }
    return errors;
  },
};

function validateData(schemaValidator, data, context = {}) {
  if (typeof schemaValidator !== "function") {
    return { isValid: false, errors: ["Invalid schema validator"] };
  }
  const errors = schemaValidator(data || {}, context);
  return { isValid: errors.length === 0, errors };
}

function validateBody(schemaName) {
  const validator = schemas[schemaName];
  return (req, res, next) => {
    if (!validator) return next();
    const { isValid, errors } = validateData(validator, req.body, {
      method: req.method,
    });
    if (!isValid) {
      return res.status(400).json({ error: "Validation failed", details: errors });
    }
    if (schemaName === "createReceiver" && req.body) {
      if (req.body.children_count !== undefined) req.body.children_count = parseInt(req.body.children_count, 10);
      if (req.body.amount_per_packet !== undefined) req.body.amount_per_packet = parseInt(req.body.amount_per_packet, 10);
      if (req.body.cash_note !== undefined) req.body.cash_note = parseInt(req.body.cash_note, 10);
      if (req.body.year !== undefined) req.body.year = parseInt(req.body.year, 10);
    }
    next();
  };
}

function validateQuery(schemaName) {
  const validator = schemas[schemaName];
  return (req, res, next) => {
    if (!validator) return next();
    const { isValid, errors } = validateData(validator, req.query);
    if (!isValid) {
      return res.status(400).json({ error: "Validation failed", details: errors });
    }
    next();
  };
}

module.exports = {
  schemas,
  validateData,
  validateBody,
  validateQuery,
  ALLOWED_CASH_NOTES,
  ALLOWED_TYPES,
};
