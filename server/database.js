const sqlite3 = require("sqlite3").verbose();
const path = require("path");

const dbPath = path.resolve(__dirname, "database.db");
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error("Could not connect to database", err);
  } else {
    console.log("Connected to SQLite database");
    initDb();
  }
});

// Helper to wrap db.run in a promise
const run = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function (err) {
      if (err) reject(err);
      else resolve({ id: this.lastID, changes: this.changes });
    });
  });
};

// Helper to wrap db.all in a promise
const query = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
};

// Helper to wrap db.get in a promise
const get = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) reject(err);
      else resolve(row);
    });
  });
};

// Initialize Database Table
const initDb = async () => {
  const createTableQuery = `
        CREATE TABLE IF NOT EXISTS receivers (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            type TEXT DEFAULT 'family', -- 'family' or 'individual'
            children_count INTEGER DEFAULT 0,
            is_eligible INTEGER DEFAULT 1, -- 0: false, 1: true
            is_received INTEGER DEFAULT 0, -- 0: false, 1: true
            amount_per_packet INTEGER DEFAULT 10,
            cash_note INTEGER DEFAULT 10, -- Denomination of the note
            year INTEGER DEFAULT 2026
        );
    `;
  try {
    await run(createTableQuery);

    // Lazy Migration: Check if 'type' column exists, if not add it
    try {
      await run(`ALTER TABLE receivers ADD COLUMN type TEXT DEFAULT 'family'`);
      console.log("Migration: Added 'type' column to receivers table.");
    } catch (err) {
      if (!err.message.includes("duplicate column name")) {
        console.error("Migration check error (type):", err);
      }
    }

    // Lazy Migration: Check if 'year' column exists, if not add it
    try {
      await run(`ALTER TABLE receivers ADD COLUMN year INTEGER DEFAULT 2026`);
      console.log("Migration: Added 'year' column to receivers table.");
    } catch (err) {
      if (!err.message.includes("duplicate column name")) {
        console.error("Migration check error (year):", err);
      }
    }

    console.log("Database initialized: receivers table ready.");
  } catch (err) {
    console.error("Error initializing DB:", err);
  }
};

module.exports = { db, run, query, get };
