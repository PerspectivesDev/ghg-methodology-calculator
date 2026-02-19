import { existsSync, readFileSync, readdirSync } from "fs";
import { resolve } from "path";
import type Database from "better-sqlite3";

export interface MigrationFile {
  version: string;
  fileName: string;
  sql: string;
}

const MIGRATION_FILE_PATTERN = /^(\d+)_.*\.sql$/;

function ensureMigrationsTable(db: Database.Database): void {
  db.exec(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      version TEXT PRIMARY KEY,
      file_name TEXT NOT NULL,
      applied_at TEXT NOT NULL
    );
  `);
}

function getMigrationFiles(migrationsDir: string): MigrationFile[] {
  if (!existsSync(migrationsDir)) {
    throw new Error(`Migrations directory not found: ${migrationsDir}`);
  }

  const migrationFiles = readdirSync(migrationsDir)
    .map((fileName) => {
      const match = fileName.match(MIGRATION_FILE_PATTERN);
      if (!match) {
        return null;
      }
      const absolutePath = resolve(migrationsDir, fileName);
      return {
        version: match[1],
        fileName,
        sql: readFileSync(absolutePath, "utf8"),
      } satisfies MigrationFile;
    })
    .filter((migration): migration is MigrationFile => migration !== null)
    .sort((a, b) => a.version.localeCompare(b.version));

  return migrationFiles;
}

export function runMigrations(db: Database.Database, migrationsDir = resolve(process.cwd(), "migrations")): void {
  ensureMigrationsTable(db);

  const appliedVersions = new Set(
    (db.prepare("SELECT version FROM schema_migrations ORDER BY version").all() as { version: string }[]).map(
      (row) => row.version
    )
  );

  const migrationFiles = getMigrationFiles(migrationsDir);

  const applyMigration = db.transaction((migration: MigrationFile) => {
    db.exec(migration.sql);
    db.prepare(
      "INSERT INTO schema_migrations (version, file_name, applied_at) VALUES (?, ?, ?)"
    ).run(migration.version, migration.fileName, new Date().toISOString());
  });

  migrationFiles.forEach((migration) => {
    if (!appliedVersions.has(migration.version)) {
      applyMigration(migration);
    }
  });
}
