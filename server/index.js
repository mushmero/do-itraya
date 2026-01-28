const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const db = require("./database");
const path = require("path");

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Serve static files from React app in production
if (process.env.NODE_ENV === "production") {
  // Always serve for simplicity in this setup, or toggle with env
  app.use(express.static(path.join(__dirname, "../client/dist")));
}

// Routes

// Get all receivers (optionally filtered by year)
app.get("/api/receivers", async (req, res) => {
  const { year } = req.query;
  try {
    let query = "SELECT * FROM receivers";
    let params = [];

    if (year) {
      query += " WHERE year = ?";
      params.push(year);
    }

    query += " ORDER BY id DESC";

    const receivers = await db.query(query, params);
    res.json(receivers);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create receiver
app.post("/api/receivers", async (req, res) => {
  const { name, type, children_count, amount_per_packet, cash_note, year } =
    req.body;
  try {
    const info = await db.run(
      "INSERT INTO receivers (name, type, children_count, amount_per_packet, cash_note, year) VALUES (?, ?, ?, ?, ?, ?)",
      [
        name,
        type || "family",
        children_count || 0,
        amount_per_packet || 10,
        cash_note || 10,
        year || 2026,
      ],
    );
    res.json({ id: info.id, ...req.body });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update receiver
app.put("/api/receivers/:id", async (req, res) => {
  const { id } = req.params;
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
    const query = `UPDATE receivers SET ${updates.join(", ")} WHERE id = ?`;

    await db.run(query, params);
    res.json({ message: "Updated successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete receiver
app.delete("/api/receivers/:id", async (req, res) => {
  const { id } = req.params;
  try {
    await db.run("DELETE FROM receivers WHERE id = ?", [id]);
    res.json({ message: "Deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get Summary Breakdown (filtered by year)
app.get("/api/summary", async (req, res) => {
  const { year } = req.query;
  const yearFilter = year ? `AND year = ${year}` : ""; // Be careful with SQL injection, but year is int

  try {
    // Total Planned (All Eligible)
    const plannedResult = await db.get(
      `
            SELECT SUM(children_count * amount_per_packet) as total 
            FROM receivers 
            WHERE is_eligible = 1 ${year ? "AND year = ?" : ""}
        `,
      year ? [year] : [],
    );
    const totalPlanned = plannedResult.total || 0;

    // Total Distributed (Received)
    const distributedResult = await db.get(
      `
            SELECT SUM(children_count * amount_per_packet) as total 
            FROM receivers 
            WHERE is_received = 1 AND is_eligible = 1 ${year ? "AND year = ?" : ""}
        `,
      year ? [year] : [],
    );
    const totalDistributed = distributedResult.total || 0;

    // Notes Breakdown (Eligible Only)
    // We need total notes needed AND remaining notes needed
    // Logic: Total Notes = children_count * (amount_per_packet / cash_note)
    const notesBreakdown = await db.query(
      `
            SELECT 
                cash_note,
                SUM(children_count * (amount_per_packet / cash_note)) as total_count,
                SUM(CASE WHEN is_received = 0 THEN children_count * (amount_per_packet / cash_note) ELSE 0 END) as remaining_count
            FROM receivers
            WHERE is_eligible = 1 ${year ? "AND year = ?" : ""}
            GROUP BY cash_note
        `,
      year ? [year] : [],
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

// Get Yearly Comparison
app.get("/api/summary/comparison", async (req, res) => {
  try {
    const comparison = await db.query(`
      SELECT 
        year,
        SUM(CASE WHEN is_eligible = 1 THEN children_count * amount_per_packet ELSE 0 END) as total_budget,
        SUM(CASE WHEN is_eligible = 1 AND is_received = 1 THEN children_count * amount_per_packet ELSE 0 END) as total_distributed
      FROM receivers
      GROUP BY year
      ORDER BY year ASC
    `);
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
