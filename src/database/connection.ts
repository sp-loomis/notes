import * as sqlite3 from "sqlite3";
import * as path from "path";
import * as fs from "fs";
import { app } from "electron";

// Enable verbose mode for debugging in development
if (process.env.NODE_ENV === "development") {
  sqlite3.verbose();
}

// Get the user data path for storing our SQLite database
const userDataPath = app.getPath("userData");
const dbDirectory = path.join(userDataPath, "database");
const dbPath = path.join(dbDirectory, "notes.db");

// Ensure the database directory exists
if (!fs.existsSync(dbDirectory)) {
  fs.mkdirSync(dbDirectory, { recursive: true });
}

// Create or open the database
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error("Error opening database", err);
  } else {
    console.log("Database connected successfully");

    // Enable foreign keys
    db.run("PRAGMA foreign_keys = ON");
  }
});

// Ensure the database is properly closed when the app exits
process.on("exit", () => {
  db.close((err) => {
    if (err) {
      console.error("Error closing database", err);
    } else {
      console.log("Database connection closed");
    }
  });
});

export default db;
