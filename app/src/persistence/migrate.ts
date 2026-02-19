import Database from "better-sqlite3";
import { runMigrations } from "./migrations.js";

const DEFAULT_DB_PATH = "./data/ghg.db";
const dbPath = process.env.DB_PATH ?? DEFAULT_DB_PATH;

const db = new Database(dbPath);
try {
  runMigrations(db);
  // Keep output concise for CI and local scripts.
  console.log(`Migrations applied successfully for ${dbPath}`);
} finally {
  db.close();
}
