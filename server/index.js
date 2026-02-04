const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
dotenv.config();

const prisma = require("./prismaClient");
const path = require("path");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const compression = require("compression");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const authMiddleware = require("./middleware/authMiddleware");

// Enforce JWT Secret
if (!process.env.JWT_SECRET) {
  console.error(
    "FATAL: JWT_SECRET is not defined in the environment variables.",
  );
  process.exit(1);
}

const app = express();
// Enable trust proxy for rate limiting behind proxies (e.g. Heroku, Nginx, etc)
app.set("trust proxy", 1);
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
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });
    if (existingUser)
      return res.status(400).json({ error: "User already exists" });

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const result = await prisma.user.create({
      data: {
        username,
        email,
        password: hashedPassword,
      },
    });

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
    const user = await prisma.user.findUnique({
      where: { email },
    });
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
    const where = { user_id: userId };
    if (year) where.year = parseInt(year);

    const receivers = await prisma.receiver.findMany({
      where,
      orderBy: { id: "desc" },
    });
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
    const info = await prisma.receiver.create({
      data: {
        name,
        type: type || "family",
        children_count: children_count || 0,
        amount_per_packet: amount_per_packet || 10,
        cash_note: cash_note || 10,
        year: year || 2026,
        user_id: userId,
      },
    });
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
    const data = {};
    if (name !== undefined) data.name = name;
    if (type !== undefined) data.type = type;
    if (children_count !== undefined) data.children_count = children_count;
    if (is_eligible !== undefined) data.is_eligible = is_eligible ? 1 : 0;
    if (is_received !== undefined) data.is_received = is_received ? 1 : 0;
    if (amount_per_packet !== undefined)
      data.amount_per_packet = amount_per_packet;
    if (cash_note !== undefined) data.cash_note = cash_note;
    if (year !== undefined) data.year = year;

    if (Object.keys(data).length === 0)
      return res.json({ message: "No changes" });

    // Use updateMany to safely update only if owned by user
    const result = await prisma.receiver.updateMany({
      where: {
        id: parseInt(id),
        user_id: userId,
      },
      data,
    });

    if (result.count === 0) {
      return res
        .status(404)
        .json({ error: "Receiver not found or access denied" });
    }

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
    const result = await prisma.receiver.deleteMany({
      where: {
        id: parseInt(id),
        user_id: userId,
      },
    });

    if (result.count === 0) {
      return res
        .status(404)
        .json({ error: "Receiver not found or access denied" });
    }

    res.json({ message: "Deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get Summary Breakdown (Protected & User Scoped)
// Get Summary Breakdown (Protected & User Scoped)
app.get("/api/summary", authMiddleware, async (req, res) => {
  const { year } = req.query;
  const userId = req.user.id;

  try {
    const where = {
      user_id: userId,
      is_eligible: 1,
    };
    if (year) where.year = parseInt(year);

    const receivers = await prisma.receiver.findMany({
      where,
      select: {
        children_count: true,
        amount_per_packet: true,
        is_received: true,
        cash_note: true,
      },
    });

    let totalPlanned = 0;
    let totalDistributed = 0;
    const notesMap = {};

    receivers.forEach((r) => {
      const count = r.children_count || 0;
      const amount = r.amount_per_packet || 0;
      const total = count * amount;

      totalPlanned += total;
      if (r.is_received === 1) totalDistributed += total;

      const note = r.cash_note || 10;

      // Initialize if not exists
      if (!notesMap[note]) {
        notesMap[note] = {
          cash_note: note,
          total_count: 0,
          remaining_count: 0,
        };
      }

      // Calculate number of physical notes
      // Assumption: amount_per_packet is divisible by cash_note, or logic handles it.
      // Existing SQL was: children_count * (amount_per_packet / cash_note)
      const notesForReceiver = count * (amount / note);

      notesMap[note].total_count += notesForReceiver;
      if (r.is_received === 0) {
        notesMap[note].remaining_count += notesForReceiver;
      }
    });

    const notesBreakdown = Object.values(notesMap);

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
    // Fetch all eligible data for user
    const receivers = await prisma.receiver.findMany({
      where: {
        user_id: userId,
        is_eligible: 1,
      },
      select: {
        year: true,
        children_count: true,
        amount_per_packet: true,
        is_received: true,
      },
      orderBy: { year: "asc" },
    });

    // Group by year
    const comparisonMap = {};

    receivers.forEach((r) => {
      const year = r.year || 2026;
      if (!comparisonMap[year]) {
        comparisonMap[year] = { year, total_budget: 0, total_distributed: 0 };
      }

      const amount = (r.children_count || 0) * (r.amount_per_packet || 0);
      comparisonMap[year].total_budget += amount;

      if (r.is_received === 1) {
        comparisonMap[year].total_distributed += amount;
      }
    });

    const comparison = Object.values(comparisonMap).sort(
      (a, b) => a.year - b.year,
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
