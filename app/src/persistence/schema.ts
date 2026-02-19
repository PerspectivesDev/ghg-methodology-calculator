/**
 * S1.3 — SQLite schema for projects, runs, and audit records.
 * Single source of truth for table definitions.
 */

import type Database from "better-sqlite3";

const PROJECTS_SQL = `
CREATE TABLE IF NOT EXISTS projects (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  inputs TEXT,
  factor_overrides TEXT NOT NULL DEFAULT '{}',
  selected_methodologies TEXT NOT NULL DEFAULT '[]',
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);
`;

const RUNS_SQL = `
CREATE TABLE IF NOT EXISTS runs (
  id TEXT PRIMARY KEY,
  project_id TEXT NOT NULL,
  results TEXT NOT NULL,
  created_at TEXT NOT NULL,
  FOREIGN KEY (project_id) REFERENCES projects(id)
);
`;

const AUDIT_SQL = `
CREATE TABLE IF NOT EXISTS audit (
  id TEXT PRIMARY KEY,
  run_id TEXT NOT NULL UNIQUE,
  payload TEXT NOT NULL,
  created_at TEXT NOT NULL,
  FOREIGN KEY (run_id) REFERENCES runs(id)
);
`;

export function applySchema(db: Database.Database): void {
  db.exec(PROJECTS_SQL);
  db.exec(RUNS_SQL);
  db.exec(AUDIT_SQL);
}
