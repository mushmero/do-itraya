const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const db = require("./database");
const path = require("path");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const compression = require("compression");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const authMiddleware = require("./middleware/authMiddleware");

dotenv.config();

// Enforce JWT Secret
if (!process.env.JWT_SECRET) {
  console.error(
    "FATAL: JWT_SECRET is not defined in the environment variables.",
  );
  process.exit(1);
}

const app = express();
const PORT = process.env.PORT || 3000;

// Security Middleware (Helmet with CSP)
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'"],
        styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
        fontSrc: ["'self'", "https://fonts.gstatic.com"],
        imgSrc: ["'self'", "data:", "https:"],
        connectSrc: [
          "'self'",
          "https://fonts.googleapis.com",
          "https://fonts.gstatic.com",
        ],
      },
    },
  }),
);

// Performance Middleware
app.use(compression());

// Rate Limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
});
app.use("/api", limiter);

// CORS Configuration
const corsOptions = {
  origin:
    process.env.NODE_ENV === "production"
      ? process.env.CLIENT_URL // Adjust for your production domain
      : "http://localhost:5173", // Default Vite dev server
  optionsSuccessStatus: 200,
};
app.use(cors(corsOptions));

app.use(express.json());

// Serve static files from React app in production
if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "../client/dist")));
}

// Routes

// Auth Routes

// Register
app.post("/api/auth/register", async (req, res) => {
  const { username, email, password } = req.body;
  try {
    const existingUser = await db.get("SELECT * FROM users WHERE email = ?", [
      email,
    ]);
    if (existingUser)
      return res.status(400).json({ error: "User already exists" });

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const result = await db.run(
      "INSERT INTO users (username, email, password) VALUES (?, ?, ?)",
      [username, email, hashedPassword],
    );

    const token = jwt.sign({ id: result.id, email }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });

    res.json({ token, user: { id: result.id, username, email } });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Login
app.post("/api/auth/login", async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await db.get("SELECT * FROM users WHERE email = ?", [email]);
    if (!user) return res.status(400).json({ error: "Invalid credentials" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ error: "Invalid credentials" });

    const token = jwt.sign(
      { id: user.id, email: user.email },
      process.env.JWT_SECRET,
      {
        expiresIn: "1h",
      },
    );

    res.json({
      token,
      user: { id: user.id, username: user.username, email: user.email },
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get all receivers (Protected & User Scoped)
app.get("/api/receivers", authMiddleware, async (req, res) => {
  const { year } = req.query;
  const userId = req.user.id;

  try {
    let query = "SELECT * FROM receivers WHERE user_id = ?";
    let params = [userId];

    if (year) {
      query += " AND year = ?";
      params.push(year);
    }

    query += " ORDER BY id DESC";

    const receivers = await db.query(query, params);
    res.json(receivers);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create receiver (Protected & User Scoped)
app.post("/api/receivers", authMiddleware, async (req, res) => {
  const { name, type, children_count, amount_per_packet, cash_note, year } =
    req.body;
  const userId = req.user.id;

  try {
    const info = await db.run(
      "INSERT INTO receivers (name, type, children_count, amount_per_packet, cash_note, year, user_id) VALUES (?, ?, ?, ?, ?, ?, ?)",
      [
        name,
        type || "family",
        children_count || 0,
        amount_per_packet || 10,
        cash_note || 10,
        year || 2026,
        userId,
      ],
    );
    res.json({ id: info.id, ...req.body, user_id: userId });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update receiver (Protected & User Scoped)
app.put("/api/receivers/:id", authMiddleware, async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;

  const {
    name,
    type,
    children_count,
    is_eligible,
    is_received,
    amount_per_packet,
    cash_note,
    year,
  } = req.body;

  try {
    // Build dynamic update query
    const updates = [];
    const params = [];

    if (name !== undefined) {
      updates.push("name = ?");
      params.push(name);
    }
    if (type !== undefined) {
      updates.push("type = ?");
      params.push(type);
    }
    if (children_count !== undefined) {
      updates.push("children_count = ?");
      params.push(children_count);
    }
    if (is_eligible !== undefined) {
      updates.push("is_eligible = ?");
      params.push(is_eligible ? 1 : 0);
    }
    if (is_received !== undefined) {
      updates.push("is_received = ?");
      params.push(is_received ? 1 : 0);
    }
    if (amount_per_packet !== undefined) {
      updates.push("amount_per_packet = ?");
      params.push(amount_per_packet);
    }
    if (cash_note !== undefined) {
      updates.push("cash_note = ?");
      params.push(cash_note);
    }
    if (year !== undefined) {
      updates.push("year = ?");
      params.push(year);
    }

    if (updates.length === 0) return res.json({ message: "No changes" });

    params.push(id);
    params.push(userId); // Ensure user owns the record

    // Add user_id check to WHERE clause
    const query = `UPDATE receivers SET ${updates.join(", ")} WHERE id = ? AND user_id = ?`;

    await db.run(query, params);
    res.json({ message: "Updated successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete receiver (Protected & User Scoped)
app.delete("/api/receivers/:id", authMiddleware, async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;

  try {
    await db.run("DELETE FROM receivers WHERE id = ? AND user_id = ?", [
      id,
      userId,
    ]);
    res.json({ message: "Deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get Summary Breakdown (Protected & User Scoped)
app.get("/api/summary", authMiddleware, async (req, res) => {
  const { year } = req.query;
  const userId = req.user.id;

  // Base Where Clause including User ID
  const baseWhere = `WHERE is_eligible = 1 AND user_id = ? ${year ? "AND year = ?" : ""}`;
  const baseParams = year ? [userId, year] : [userId];

  try {
    // Total Planned (All Eligible for User)
    const plannedResult = await db.get(
      `
            SELECT SUM(children_count * amount_per_packet) as total 
            FROM receivers 
            ${baseWhere}
        `,
      baseParams,
    );
    const totalPlanned = plannedResult.total || 0;

    // Total Distributed (Received for User)
    // Need separate where clause for distributed
    const distributedWhere = `WHERE is_received = 1 AND is_eligible = 1 AND user_id = ? ${year ? "AND year = ?" : ""}`;
    const distributedResult = await db.get(
      `
            SELECT SUM(children_count * amount_per_packet) as total 
            FROM receivers 
            ${distributedWhere}
        `,
      baseParams,
    );
    const totalDistributed = distributedResult.total || 0;

    // Notes Breakdown (Eligible Only for User)
    const notesBreakdown = await db.query(
      `
            SELECT 
                cash_note,
                SUM(children_count * (amount_per_packet / cash_note)) as total_count,
                SUM(CASE WHEN is_received = 0 THEN children_count * (amount_per_packet / cash_note) ELSE 0 END) as remaining_count
            FROM receivers
            ${baseWhere}
            GROUP BY cash_note
        `,
      baseParams,
    );

    res.json({
      total_planned: totalPlanned,
      total_distributed: totalDistributed,
      balance: totalPlanned - totalDistributed,
      notes_breakdown: notesBreakdown,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get Yearly Comparison (Protected & User Scoped)
app.get("/api/summary/comparison", authMiddleware, async (req, res) => {
  const userId = req.user.id;
  try {
    const comparison = await db.query(
      `
      SELECT 
        year,
        SUM(CASE WHEN is_eligible = 1 THEN children_count * amount_per_packet ELSE 0 END) as total_budget,
        SUM(CASE WHEN is_eligible = 1 AND is_received = 1 THEN children_count * amount_per_packet ELSE 0 END) as total_distributed
      FROM receivers
      WHERE user_id = ?
      GROUP BY year
      ORDER BY year ASC
    `,
      [userId],
    );
    res.json(comparison);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Serve React App for any other route (SPA Support)
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "../client/dist/index.html"));
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
