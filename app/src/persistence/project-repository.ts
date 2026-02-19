/**
 * S1.3 — Project repository: save/load project and runs.
 * Uses domain types from canonical-inputs for inputs; stores JSON in DB.
 * Database layer: schema (schema.ts) and repository (this file) only; no domain logic.
 */

import Database from "better-sqlite3";
import { randomUUID } from "crypto";
import type { CanonicalProjectInputs } from "../domain/canonical-inputs.js";
import type { MethodologyResult } from "../domain/methodology-result.js";
import { applySchema } from "./schema.js";

/** Row shape from projects table (snake_case as in DB). */
interface ProjectRow {
  id: string;
  name: string;
  inputs: string | null;
  factor_overrides: string;
  selected_methodologies: string;
  created_at: string;
  updated_at: string;
}

/** Row shape from runs table. */
interface RunRow {
  id: string;
  project_id: string;
  results: string;
  created_at: string;
}

/** Row shape from audit table (payload only when loading with run). */
interface AuditRow {
  payload: string;
}

export interface Project {
  id: string;
  name: string;
  inputs: CanonicalProjectInputs | null;
  factorOverrides: Record<string, unknown>;
  selectedMethodologies: string[];
  createdAt: string;
  updatedAt: string;
}

export interface Run {
  id: string;
  projectId: string;
  results: MethodologyResult[];
  auditPayload: Record<string, unknown>;
  createdAt: string;
}

export interface AuditPayload {
  inputsSnapshot?: Record<string, unknown>;
  factorVersions?: Record<string, unknown>;
  equationVersions?: Record<string, unknown>;
  timestamp?: string;
}

export interface CreateProjectParams {
  name: string;
  inputs?: CanonicalProjectInputs | null;
  factorOverrides?: Record<string, unknown>;
}

export interface UpdateProjectParams {
  inputs?: CanonicalProjectInputs | null;
  factorOverrides?: Record<string, unknown>;
  selectedMethodologies?: string[];
}

export interface SaveRunParams {
  results: MethodologyResult[];
  auditPayload: Record<string, unknown>;
}

export interface ProjectRepository {
  createProject(params: CreateProjectParams): Project;
  getProjectById(id: string): Project | null;
  updateProject(id: string, params: UpdateProjectParams): Project | null;
  saveRun(projectId: string, params: SaveRunParams): Run;
  getRunById(runId: string): Run | null;
  getRunsByProjectId(projectId: string): Run[];
}

function now(): string {
  return new Date().toISOString();
}

function parseJson<T>(raw: string | null, fallback: T): T {
  if (raw === null || raw === undefined) return fallback;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

/** Map DB project row to domain Project. Single place for project row → entity mapping. */
function rowToProject(row: ProjectRow): Project {
  return {
    id: row.id,
    name: row.name,
    inputs: parseJson<CanonicalProjectInputs | null>(row.inputs, null),
    factorOverrides: parseJson<Record<string, unknown>>(row.factor_overrides, {}),
    selectedMethodologies: parseJson<string[]>(row.selected_methodologies, []),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

/** Map DB run row + audit payload to domain Run. Single place for run row → entity mapping. */
function rowToRun(runRow: RunRow, auditPayload: Record<string, unknown>): Run {
  return {
    id: runRow.id,
    projectId: runRow.project_id,
    results: parseJson<MethodologyResult[]>(runRow.results, []),
    auditPayload,
    createdAt: runRow.created_at,
  };
}

/**
 * Create database at path and apply schema (e.g. ":memory:" for tests or file path).
 * Returns the database instance; caller owns closing it.
 */
export function initSchema(path: string): Database.Database {
  const db = new Database(path);
  applySchema(db);
  return db;
}

export function createProjectRepository(db: Database.Database): ProjectRepository {
  return {
    createProject(params) {
      const id = randomUUID();
      const ts = now();
      const inputsJson = params.inputs != null ? JSON.stringify(params.inputs) : null;
      const factorOverrides = params.factorOverrides ?? {};
      const selectedMethodologies: string[] = [];

      db.prepare(
        `INSERT INTO projects (id, name, inputs, factor_overrides, selected_methodologies, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?)`
      ).run(id, params.name, inputsJson, JSON.stringify(factorOverrides), JSON.stringify(selectedMethodologies), ts, ts);

      return {
        id,
        name: params.name,
        inputs: params.inputs ?? null,
        factorOverrides,
        selectedMethodologies,
        createdAt: ts,
        updatedAt: ts,
      };
    },

    getProjectById(id) {
      const row = db.prepare(
        "SELECT id, name, inputs, factor_overrides, selected_methodologies, created_at, updated_at FROM projects WHERE id = ?"
      ).get(id) as ProjectRow | undefined;

      if (!row) return null;

      return rowToProject(row);
    },

    updateProject(id, params) {
      const existing = db.prepare("SELECT id FROM projects WHERE id = ?").get(id);
      if (!existing) return null;

      const ts = now();
      const current = this.getProjectById(id)!;
      const inputs = params.inputs !== undefined ? params.inputs : current.inputs;
      const factorOverrides = params.factorOverrides !== undefined ? params.factorOverrides : current.factorOverrides;
      const selectedMethodologies = params.selectedMethodologies !== undefined
        ? params.selectedMethodologies
        : current.selectedMethodologies;

      const inputsJson = inputs != null ? JSON.stringify(inputs) : null;

      db.prepare(
        `UPDATE projects SET inputs = ?, factor_overrides = ?, selected_methodologies = ?, updated_at = ? WHERE id = ?`
      ).run(inputsJson, JSON.stringify(factorOverrides), JSON.stringify(selectedMethodologies), ts, id);

      return this.getProjectById(id);
    },

    saveRun(projectId, params) {
      const runId = randomUUID();
      const ts = now();
      const resultsJson = JSON.stringify(params.results);
      const auditId = randomUUID();

      db.prepare(
        "INSERT INTO runs (id, project_id, results, created_at) VALUES (?, ?, ?, ?)"
      ).run(runId, projectId, resultsJson, ts);

      db.prepare(
        "INSERT INTO audit (id, run_id, payload, created_at) VALUES (?, ?, ?, ?)"
      ).run(auditId, runId, JSON.stringify(params.auditPayload), ts);

      const loaded = this.getRunById(runId)!;
      return loaded;
    },

    getRunById(runId) {
      const runRow = db.prepare(
        "SELECT id, project_id, results, created_at FROM runs WHERE id = ?"
      ).get(runId) as RunRow | undefined;

      if (!runRow) return null;

      const auditRow = db.prepare(
        "SELECT payload FROM audit WHERE run_id = ?"
      ).get(runId) as AuditRow | undefined;

      const auditPayload = auditRow
        ? parseJson<Record<string, unknown>>(auditRow.payload, {})
        : {};

      return rowToRun(runRow, auditPayload);
    },

    getRunsByProjectId(projectId) {
      const rows = db.prepare(
        "SELECT id FROM runs WHERE project_id = ? ORDER BY created_at ASC"
      ).all(projectId) as { id: string }[];

      return rows.map((r) => this.getRunById(r.id)!);
    },
  };
}
