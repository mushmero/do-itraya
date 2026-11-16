const express = require("express");
const cors = require("cors");
const path = require("path");
const fs = require("fs");
const dotenv = require("dotenv");
const dotenvExpand = require("dotenv-expand");

const myEnv = dotenv.config({ path: path.join(__dirname, ".env") });
dotenvExpand.expand(myEnv);

const prisma = require("./prismaClient");
const helmet = require("helmet");
const compression = require("compression");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const authMiddleware = require("./middleware/authMiddleware");
const adminMiddleware = require("./middleware/adminMiddleware");
const errorHandler = require("./middleware/errorHandler");
const { validateBody } = require("./middleware/validate");

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

// Security Middleware (Helmet with CSP in production)
app.use(
  helmet({
    contentSecurityPolicy:
      process.env.NODE_ENV === "production"
        ? {
            directives: {
              defaultSrc: ["'self'"],
              scriptSrc: ["'self'", "'unsafe-inline'"],
              styleSrc: [
                "'self'",
                "'unsafe-inline'",
                "https://fonts.googleapis.com",
              ],
              fontSrc: ["'self'", "https://fonts.gstatic.com"],
              imgSrc: ["'self'", "data:", "https:"],
              connectSrc: [
                "'self'",
                "https://fonts.googleapis.com",
                "https://fonts.gstatic.com",
              ],
            },
          }
        : false,
  }),
);

// Performance Middleware
app.use(compression());

// Rate Limiting
const { authLimiter, apiLimiter } = require("./middleware/rateLimiter");
app.use("/api/auth", authLimiter);
app.use("/api", apiLimiter);

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

// Routes

// Auth Routes

// Register
app.post(
  "/api/auth/register",
  validateBody("register"),
  async (req, res, next) => {
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

    const token = jwt.sign(
      { id: result.id, email, is_admin: false },
      process.env.JWT_SECRET,
      {
        expiresIn: "1h",
      },
    );

    res.json({
      token,
      user: {
        id: result.id,
        username,
        email,
        is_admin: false,
      },
    });
  } catch (error) {
    next(error);
  }
});

// Login
app.post(
  "/api/auth/login",
  validateBody("login"),
  async (req, res, next) => {
  const { email, password } = req.body;
  try {
    const user = await prisma.user.findUnique({
      where: { email },
    });
    if (!user) return res.status(400).json({ error: "Invalid credentials" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ error: "Invalid credentials" });

    const token = jwt.sign(
      { id: user.id, email: user.email, is_admin: user.is_admin || false },
      process.env.JWT_SECRET,
      {
        expiresIn: "1h",
      },
    );

    res.json({
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        is_admin: user.is_admin || false,
      },
    });
  } catch (error) {
    next(error);
  }
});

// Get all users (Admin Only)
app.get("/api/users", authMiddleware, adminMiddleware, async (req, res, next) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        username: true,
        email: true,
        is_admin: true,
        created_at: true,
      },
    });
    res.json(users);
  } catch (error) {
    next(error);
  }
});

// Get all receivers (Protected & User Scoped)
// Delete User (Admin Only)
app.delete(
  "/api/users/:id",
  authMiddleware,
  adminMiddleware,
  async (req, res, next) => {
    const { id } = req.params;
    try {
      // Prevent deleting self
      if (req.user.id === parseInt(id)) {
        return res
          .status(400)
          .json({ error: "Cannot delete your own admin account" });
      }

      const result = await prisma.user.delete({
        where: { id: parseInt(id) },
      });
      res.json({ message: "User deleted successfully" });
    } catch (error) {
      next(error);
    }
  },
);

// Reset Password (Admin Only)
app.put(
  "/api/users/:id/reset-password",
  authMiddleware,
  adminMiddleware,
  validateBody("resetPassword"),
  async (req, res, next) => {
    const { id } = req.params;
    const { newPassword } = req.body;

    try {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(newPassword, salt);

      await prisma.user.update({
        where: { id: parseInt(id) },
        data: { password: hashedPassword },
      });

      res.json({ message: "Password reset successfully" });
    } catch (error) {
      next(error);
    }
  },
);

// Get all receivers (Protected & User Scoped)
app.get("/api/receivers", authMiddleware, async (req, res, next) => {
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
    next(error);
  }
});

// Create receiver (Protected & User Scoped)
app.post(
  "/api/receivers",
  authMiddleware,
  validateBody("createReceiver"),
  async (req, res, next) => {
    const { name, type, children_count, amount_per_packet, cash_note, year } =
      req.body;
    const userId = req.user.id;

    try {
      const info = await prisma.receiver.create({
        data: {
          name: name ? String(name).trim() : "",
          type: type || "family",
          children_count:
            children_count !== undefined ? parseInt(children_count, 10) : 0,
          amount_per_packet:
            amount_per_packet !== undefined
              ? parseInt(amount_per_packet, 10)
              : 10,
          cash_note: cash_note !== undefined ? parseInt(cash_note, 10) : 10,
          year: year !== undefined ? parseInt(year, 10) : 2026,
          is_eligible:
            req.body.is_eligible !== undefined
              ? Boolean(req.body.is_eligible)
              : true,
          user_id: userId,
        },
      });
      res.json({ id: info.id, ...req.body, user_id: userId });
    } catch (error) {
      next(error);
    }
  },
);

// Update receiver (Protected & User Scoped)
app.put(
  "/api/receivers/:id",
  authMiddleware,
  validateBody("createReceiver"),
  async (req, res, next) => {
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
      if (name !== undefined) data.name = String(name).trim();
      if (type !== undefined) data.type = type;
      if (children_count !== undefined)
        data.children_count = parseInt(children_count, 10);
      if (is_eligible !== undefined) data.is_eligible = Boolean(is_eligible);
      if (is_received !== undefined) data.is_received = Boolean(is_received);
      if (amount_per_packet !== undefined)
        data.amount_per_packet = parseInt(amount_per_packet, 10);
      if (cash_note !== undefined) data.cash_note = parseInt(cash_note, 10);
      if (year !== undefined) data.year = parseInt(year, 10);

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
      next(error);
    }
  },
);

// Delete receiver (Protected & User Scoped)
app.delete("/api/receivers/:id", authMiddleware, async (req, res, next) => {
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
    next(error);
  }
});

// Get Summary Breakdown (Protected & User Scoped)
app.get("/api/summary", authMiddleware, async (req, res, next) => {
  const { year } = req.query;
  const userId = req.user.id;

  try {
    const where = {
      user_id: userId,
      is_eligible: true,
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
      if (r.is_received === true) totalDistributed += total;

      const note = r.cash_note && r.cash_note > 0 ? r.cash_note : 10;

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
      if (r.is_received === false) {
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
    next(error);
  }
});

// Get Yearly Comparison (Protected & User Scoped)
app.get("/api/summary/comparison", authMiddleware, async (req, res, next) => {
  const userId = req.user.id;
  try {
    // Fetch all eligible data for user
    const receivers = await prisma.receiver.findMany({
      where: {
        user_id: userId,
        is_eligible: true,
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

      if (r.is_received === true) {
        comparisonMap[year].total_distributed += amount;
      }
    });

    const comparison = Object.values(comparisonMap).sort(
      (a, b) => a.year - b.year,
    );
    res.json(comparison);
  } catch (error) {
    next(error);
  }
});

// Frontend & Server Startup
const http = require("http");
const { pathToFileURL } = require("url");

async function startServer() {
  const isProduction = process.env.NODE_ENV === "production";
  const distPath = path.join(__dirname, "../client/dist");
  const server = http.createServer(app);

  if (isProduction) {
    // Serve static files from React production build
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  } else {
    // Development Mode: Mount Vite in middleware mode for instant Hot Module Replacement (HMR) without building
    try {
      const clientDir = path.resolve(__dirname, "../client");
      const vitePath = pathToFileURL(
        path.resolve(clientDir, "node_modules/vite/dist/node/index.js")
      ).href;
      const { createServer } = await import(vitePath);
      const vite = await createServer({
        configFile: path.resolve(clientDir, "vite.config.js"),
        root: clientDir,
        server: {
          middlewareMode: true,
          hmr: {
            server, // Binds Vite's HMR WebSocket directly to the HTTP server
          },
        },
        appType: "custom",
      });
      app.use(vite.middlewares);

      // Serve index.html for all non-API SPA routes transformed by Vite
      app.use("*", async (req, res, next) => {
        const url = req.originalUrl;
        if (url.startsWith("/api")) {
          return next();
        }
        try {
          let template = fs.readFileSync(
            path.resolve(clientDir, "index.html"),
            "utf-8"
          );
          template = await vite.transformIndexHtml(url, template);
          res.status(200).set({ "Content-Type": "text/html" }).end(template);
        } catch (e) {
          if (vite && vite.ssrFixStacktrace) {
            vite.ssrFixStacktrace(e);
          }
          next(e);
        }
      });
      console.log("Vite development middleware mounted (live HMR active)");
    } catch (err) {
      console.error(
        "Warning: Failed to load Vite middleware, falling back to static files:",
        err.message
      );
      if (fs.existsSync(distPath)) {
        app.use(express.static(distPath));
        app.get("*", (req, res) => {
          res.sendFile(path.join(distPath, "index.html"));
        });
      }
    }
  }

  // Centralized Error Handler
  app.use(errorHandler);

  server.listen(PORT, () => {
    console.log(
      `Server running on port ${PORT} [${isProduction ? "production" : "development"}]`
    );
  });
}

startServer().catch((err) => {
  console.error("FATAL: Server startup failed:", err);
  process.exit(1);
});
