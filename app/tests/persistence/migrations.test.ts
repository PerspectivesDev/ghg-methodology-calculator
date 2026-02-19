import { describe, it, expect } from "vitest";
import Database from "better-sqlite3";
import { mkdtempSync, rmSync, writeFileSync } from "fs";
import { join } from "path";
import { tmpdir } from "os";
import { runMigrations } from "../../src/persistence/migrations.js";

describe("migrations", () => {
  it("applies pending migrations and records them", () => {
    const db = new Database(":memory:");
    const migrationsDir = mkdtempSync(join(tmpdir(), "ghg-migrations-"));
    try {
      writeFileSync(
        join(migrationsDir, "0001_create_sample.sql"),
        "CREATE TABLE IF NOT EXISTS sample (id TEXT PRIMARY KEY);"
      );
      writeFileSync(join(migrationsDir, "README.txt"), "ignored");

      runMigrations(db, migrationsDir);

      const tables = db
        .prepare("SELECT name FROM sqlite_master WHERE type = 'table' ORDER BY name")
        .all() as { name: string }[];
      expect(tables.map((t) => t.name)).toEqual(
        expect.arrayContaining(["schema_migrations", "sample"])
      );

      const applied = db
        .prepare("SELECT version, file_name FROM schema_migrations ORDER BY version")
        .all() as { version: string; file_name: string }[];
      expect(applied).toEqual([
        { version: "0001", file_name: "0001_create_sample.sql" },
      ]);
    } finally {
      db.close();
      rmSync(migrationsDir, { recursive: true, force: true });
    }
  });

  it("is idempotent when run multiple times", () => {
    const db = new Database(":memory:");
    const migrationsDir = mkdtempSync(join(tmpdir(), "ghg-migrations-"));
    try {
      writeFileSync(
        join(migrationsDir, "0001_create_sample.sql"),
        "CREATE TABLE IF NOT EXISTS sample (id TEXT PRIMARY KEY);"
      );

      runMigrations(db, migrationsDir);
      runMigrations(db, migrationsDir);

      const count = db
        .prepare("SELECT COUNT(*) AS count FROM schema_migrations")
        .get() as { count: number };
      expect(count.count).toBe(1);
    } finally {
      db.close();
      rmSync(migrationsDir, { recursive: true, force: true });
    }
  });

  it("throws when migrations directory does not exist", () => {
    const db = new Database(":memory:");
    try {
      expect(() => runMigrations(db, "/tmp/non-existent-ghg-migrations-dir")).toThrow(
        /Migrations directory not found/
      );
    } finally {
      db.close();
    }
  });

  it("applies migrations in version order and skips non-matching files", () => {
    const db = new Database(":memory:");
    const migrationsDir = mkdtempSync(join(tmpdir(), "ghg-migrations-"));
    try {
      writeFileSync(
        join(migrationsDir, "0002_second.sql"),
        "CREATE TABLE IF NOT EXISTS second (id INTEGER PRIMARY KEY);"
      );
      writeFileSync(
        join(migrationsDir, "0001_first.sql"),
        "CREATE TABLE IF NOT EXISTS first (id TEXT PRIMARY KEY);"
      );
      writeFileSync(join(migrationsDir, "README.md"), "ignored");

      runMigrations(db, migrationsDir);

      const applied = db
        .prepare("SELECT version, file_name FROM schema_migrations ORDER BY version")
        .all() as { version: string; file_name: string }[];
      expect(applied).toEqual([
        { version: "0001", file_name: "0001_first.sql" },
        { version: "0002", file_name: "0002_second.sql" },
      ]);
      const tableNames = (db.prepare("SELECT name FROM sqlite_master WHERE type = 'table'").all() as { name: string }[]).map(
        (r) => r.name
      );
      expect(tableNames).toContain("schema_migrations");
      expect(tableNames).toContain("first");
      expect(tableNames).toContain("second");
    } finally {
      db.close();
      rmSync(migrationsDir, { recursive: true, force: true });
    }
  });
});
