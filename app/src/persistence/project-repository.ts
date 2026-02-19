/**
 * S1.3 — Project repository: save/load project and runs.
 * Uses domain types from canonical-inputs for inputs.
 * Structured project fields are stored in explicit SQL columns/tables.
 */

import Database from "better-sqlite3";
import { randomUUID } from "crypto";
import type {
  CanonicalProjectInputs,
  CoProductEntry,
  InputMaterialEntry,
  ProcessFuelEntry,
} from "../domain/canonical-inputs.js";
import type { MethodologyResult } from "../domain/methodology-result.js";
import { runMigrations } from "./migrations.js";

/** Row shape from projects table (snake_case as in DB). */
interface ProjectRow {
  id: string;
  name: string;
  created_at: string;
  updated_at: string;
}

interface ProjectInputsRow {
  period: "monthly" | "annual";
  annual_h2_output_kg: number;
  electrolyser_capacity_kw: number | null;
  feedstock_water_volume_per_kg_h2: number;
  feedstock_water_type: string;
  feedstock_upstream_lci_per_kg: number;
  electricity_grid_kwh_per_kg_h2: number;
  electricity_renewable_kwh_per_kg_h2: number;
  electricity_other_kwh_per_kg_h2: number | null;
  electricity_grid_emission_factor_kg_co2_per_kwh: number;
  electricity_t_and_d_loss_factor: number;
  steam_steam_mj_per_kg_h2: number;
  steam_other_heat_mj_per_kg_h2: number | null;
  steam_steam_lci_kg_co2_per_mj: number | null;
  steam_source: "internal" | "external";
  steam_emission_factor_kg_co2_per_mj: number;
  co_product_allocation_method: "energy" | "mass";
  co_product_allocation_lhv_h2_gas_mj_per_kg: number;
  co_product_allocation_mass_h2_kg: number;
  ccs_eccs_process_kg_co2_per_kg_h2: number | null;
  ccs_co2_sequestrated_kg_per_kg_h2: number | null;
  fuels_json: string;
  input_materials_json: string;
  co_product_allocation_lhv_json: string;
  co_product_allocation_mass_json: string;
  co_products_json: string | null;
  fugitive_non_co2_json: string | null;
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

/**
 * Parse JSON with fallback on error. Intentional contract: invalid/corrupt stored JSON
 * returns fallback so persistence remains robust; not silent swallow of a bug.
 */
function parseJson<T>(raw: string | null, fallback: T): T {
  if (raw === null || raw === undefined) return fallback;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function saveProjectInputs(db: Database.Database, projectId: string, inputs: CanonicalProjectInputs): void {
  db.prepare("DELETE FROM project_inputs WHERE project_id = ?").run(projectId);
  db.prepare(
    `INSERT INTO project_inputs (
      project_id, period, annual_h2_output_kg, electrolyser_capacity_kw,
      feedstock_water_volume_per_kg_h2, feedstock_water_type, feedstock_upstream_lci_per_kg,
      electricity_grid_kwh_per_kg_h2, electricity_renewable_kwh_per_kg_h2, electricity_other_kwh_per_kg_h2,
      electricity_grid_emission_factor_kg_co2_per_kwh, electricity_t_and_d_loss_factor,
      steam_steam_mj_per_kg_h2, steam_other_heat_mj_per_kg_h2, steam_steam_lci_kg_co2_per_mj,
      steam_source, steam_emission_factor_kg_co2_per_mj,
      co_product_allocation_method, co_product_allocation_lhv_h2_gas_mj_per_kg, co_product_allocation_mass_h2_kg,
      ccs_eccs_process_kg_co2_per_kg_h2, ccs_co2_sequestrated_kg_per_kg_h2,
      fuels_json, input_materials_json, co_product_allocation_lhv_json, co_product_allocation_mass_json,
      co_products_json, fugitive_non_co2_json
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
  ).run(
    projectId,
    inputs.period,
    inputs.annualH2OutputKg,
    inputs.electrolyserCapacityKw ?? null,
    inputs.feedstock.waterVolumePerKgH2,
    inputs.feedstock.waterType,
    inputs.feedstock.upstreamLciPerKg,
    inputs.electricity.gridKwhPerKgH2,
    inputs.electricity.renewableKwhPerKgH2,
    inputs.electricity.otherKwhPerKgH2 ?? null,
    inputs.electricity.gridEmissionFactorKgCo2PerKwh,
    inputs.electricity.tAndDLossFactor,
    inputs.steam.steamMjPerKgH2,
    inputs.steam.otherHeatMjPerKgH2 ?? null,
    inputs.steam.steamLciKgCo2PerMj ?? null,
    inputs.steam.source,
    inputs.steam.emissionFactorKgCo2PerMj,
    inputs.coProductAllocation.allocationMethod,
    inputs.coProductAllocation.lhvH2GasMjPerKg,
    inputs.coProductAllocation.massH2Kg,
    inputs.ccs?.eccsProcessKgCo2PerKgH2 ?? null,
    inputs.ccs?.co2SequestratedKgPerKgH2 ?? null,
    JSON.stringify(inputs.fuels),
    JSON.stringify(inputs.inputMaterials),
    JSON.stringify(inputs.coProductAllocation.lhvCoProductsMjPerKg),
    JSON.stringify(inputs.coProductAllocation.massCoProductsKg),
    inputs.coProducts ? JSON.stringify(inputs.coProducts) : null,
    inputs.fugitiveNonCo2 ? JSON.stringify(inputs.fugitiveNonCo2) : null
  );
}

function loadProjectInputs(db: Database.Database, projectId: string): CanonicalProjectInputs | null {
  const row = db.prepare("SELECT * FROM project_inputs WHERE project_id = ?").get(projectId) as ProjectInputsRow | undefined;
  if (!row) return null;

  const inputs: CanonicalProjectInputs = {
    period: row.period,
    annualH2OutputKg: row.annual_h2_output_kg,
    feedstock: {
      waterVolumePerKgH2: row.feedstock_water_volume_per_kg_h2,
      waterType: row.feedstock_water_type,
      upstreamLciPerKg: row.feedstock_upstream_lci_per_kg,
    },
    electricity: {
      gridKwhPerKgH2: row.electricity_grid_kwh_per_kg_h2,
      renewableKwhPerKgH2: row.electricity_renewable_kwh_per_kg_h2,
      gridEmissionFactorKgCo2PerKwh: row.electricity_grid_emission_factor_kg_co2_per_kwh,
      tAndDLossFactor: row.electricity_t_and_d_loss_factor,
    },
    fuels: parseJson<ProcessFuelEntry[]>(row.fuels_json, []),
    steam: {
      steamMjPerKgH2: row.steam_steam_mj_per_kg_h2,
      source: row.steam_source,
      emissionFactorKgCo2PerMj: row.steam_emission_factor_kg_co2_per_mj,
    },
    inputMaterials: parseJson<InputMaterialEntry[]>(row.input_materials_json, []),
    coProductAllocation: {
      allocationMethod: row.co_product_allocation_method,
      lhvH2GasMjPerKg: row.co_product_allocation_lhv_h2_gas_mj_per_kg,
      lhvCoProductsMjPerKg: parseJson<number[]>(row.co_product_allocation_lhv_json, []),
      massH2Kg: row.co_product_allocation_mass_h2_kg,
      massCoProductsKg: parseJson<number[]>(row.co_product_allocation_mass_json, []),
    },
  };

  if (row.electrolyser_capacity_kw !== null) {
    inputs.electrolyserCapacityKw = row.electrolyser_capacity_kw;
  }
  if (row.electricity_other_kwh_per_kg_h2 !== null) {
    inputs.electricity.otherKwhPerKgH2 = row.electricity_other_kwh_per_kg_h2;
  }
  if (row.steam_other_heat_mj_per_kg_h2 !== null) {
    inputs.steam.otherHeatMjPerKgH2 = row.steam_other_heat_mj_per_kg_h2;
  }
  if (row.steam_steam_lci_kg_co2_per_mj !== null) {
    inputs.steam.steamLciKgCo2PerMj = row.steam_steam_lci_kg_co2_per_mj;
  }
  if (row.ccs_eccs_process_kg_co2_per_kg_h2 !== null && row.ccs_co2_sequestrated_kg_per_kg_h2 !== null) {
    inputs.ccs = {
      eccsProcessKgCo2PerKgH2: row.ccs_eccs_process_kg_co2_per_kg_h2,
      co2SequestratedKgPerKgH2: row.ccs_co2_sequestrated_kg_per_kg_h2,
    };
  }

  const coProducts = parseJson<CoProductEntry[] | null>(row.co_products_json, null);
  if (coProducts && coProducts.length > 0) {
    inputs.coProducts = coProducts;
  }
  const fugitiveNonCo2 = parseJson<Record<string, number | undefined> | null>(row.fugitive_non_co2_json, null);
  if (fugitiveNonCo2 && Object.keys(fugitiveNonCo2).length > 0) {
    inputs.fugitiveNonCo2 = fugitiveNonCo2;
  }

  return inputs;
}

function saveFactorOverrides(db: Database.Database, projectId: string, factorOverrides: Record<string, unknown>): void {
  db.prepare("DELETE FROM project_factor_overrides WHERE project_id = ?").run(projectId);
  const stmt = db.prepare(
    "INSERT INTO project_factor_overrides (project_id, factor_key, factor_value_json) VALUES (?, ?, ?)"
  );
  Object.entries(factorOverrides).forEach(([factorKey, value]) => {
    stmt.run(projectId, factorKey, JSON.stringify(value));
  });
}

function loadFactorOverrides(db: Database.Database, projectId: string): Record<string, unknown> {
  const rows = db.prepare(
    "SELECT factor_key, factor_value_json FROM project_factor_overrides WHERE project_id = ?"
  ).all(projectId) as { factor_key: string; factor_value_json: string }[];

  const factorOverrides: Record<string, unknown> = {};
  rows.forEach((row) => {
    try {
      factorOverrides[row.factor_key] = JSON.parse(row.factor_value_json);
    } catch {
      // Do not swallow: log and skip malformed row so callers can trace (no value in log — security).
      console.warn(
        "[project-repository] Skipping factor override: invalid JSON for project_id=%s factor_key=%s",
        projectId,
        row.factor_key
      );
    }
  });
  return factorOverrides;
}

function saveSelectedMethodologies(db: Database.Database, projectId: string, selectedMethodologies: string[]): void {
  db.prepare("DELETE FROM project_selected_methodologies WHERE project_id = ?").run(projectId);
  const stmt = db.prepare(
    "INSERT INTO project_selected_methodologies (project_id, position, methodology_id) VALUES (?, ?, ?)"
  );
  selectedMethodologies.forEach((methodologyId, position) => {
    stmt.run(projectId, position, methodologyId);
  });
}

function loadSelectedMethodologies(db: Database.Database, projectId: string): string[] {
  const rows = db.prepare(
    "SELECT methodology_id FROM project_selected_methodologies WHERE project_id = ? ORDER BY position ASC"
  ).all(projectId) as { methodology_id: string }[];
  return rows.map((row) => row.methodology_id);
}

/** Map DB project row to domain Project. */
function rowToProject(
  row: ProjectRow,
  inputs: CanonicalProjectInputs | null,
  factorOverrides: Record<string, unknown>,
  selectedMethodologies: string[]
): Project {
  return {
    id: row.id,
    name: row.name,
    inputs,
    factorOverrides,
    selectedMethodologies,
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
  runMigrations(db);
  return db;
}

export function createProjectRepository(db: Database.Database): ProjectRepository {
  return {
    createProject(params) {
      const id = randomUUID();
      const ts = now();
      const factorOverrides = params.factorOverrides ?? {};
      const selectedMethodologies: string[] = [];

      db.prepare("INSERT INTO projects (id, name, created_at, updated_at) VALUES (?, ?, ?, ?)").run(
        id,
        params.name,
        ts,
        ts
      );

      if (params.inputs != null) {
        saveProjectInputs(db, id, params.inputs);
      }
      saveFactorOverrides(db, id, factorOverrides);
      saveSelectedMethodologies(db, id, selectedMethodologies);

      return rowToProject(
        { id, name: params.name, created_at: ts, updated_at: ts },
        params.inputs ?? null,
        factorOverrides,
        selectedMethodologies
      );
    },

    getProjectById(id) {
      const row = db.prepare(
        "SELECT id, name, created_at, updated_at FROM projects WHERE id = ?"
      ).get(id) as ProjectRow | undefined;

      if (!row) return null;

      const inputs = loadProjectInputs(db, row.id);
      const factorOverrides = loadFactorOverrides(db, row.id);
      const selectedMethodologies = loadSelectedMethodologies(db, row.id);

      return rowToProject(row, inputs, factorOverrides, selectedMethodologies);
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

      db.prepare("UPDATE projects SET updated_at = ? WHERE id = ?").run(ts, id);
      db.prepare("DELETE FROM project_inputs WHERE project_id = ?").run(id);
      if (inputs != null) {
        saveProjectInputs(db, id, inputs);
      }
      saveFactorOverrides(db, id, factorOverrides);
      saveSelectedMethodologies(db, id, selectedMethodologies);

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
