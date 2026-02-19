/**
 * S1.3 — Persistence layer: project repository and schema for projects, runs, audit.
 * Test-first: create project (name, inputs, factorOverrides), get by id, update,
 * save/load runs, and that schema supports audit records.
 */
import { describe, it, expect, beforeEach, vi } from "vitest";
import type { MethodologyResult } from "../../src/domain/methodology-result.js";
import Database from "better-sqlite3";
import {
  createProjectRepository,
  initSchema,
  type ProjectRepository,
} from "../../src/persistence/project-repository.js";
import { minimalCanonicalInputs } from "../fixtures/canonical-inputs.js";

/** Minimal methodology result for run tests. */
function minimalResult(methodologyId: string): MethodologyResult {
  return {
    methodologyId,
    unit: "kgCO₂eq/kg H₂",
    total: 2.5,
    breakdown: {},
    warnings: [],
    errors: [],
  };
}

describe("project-repository (S1.3)", () => {
  let repo: ProjectRepository;
  let db: ReturnType<typeof initSchema>;

  beforeEach(() => {
    db = initSchema(":memory:");
    repo = createProjectRepository(db);
  });

  describe("schema", () => {
    it("creates normalized tables for projects, inputs, overrides, methodologies, runs, and audit", () => {
      const tables = db.prepare(
        "SELECT name FROM sqlite_master WHERE type = 'table' ORDER BY name"
      ).all() as { name: string }[];
      expect(tables.map((t) => t.name)).toEqual(
        expect.arrayContaining([
          "projects",
          "project_inputs",
          "project_factor_overrides",
          "project_selected_methodologies",
          "runs",
          "audit",
        ])
      );

      const projectCols = db.prepare("PRAGMA table_info(projects)").all() as { name: string }[];
      const projectColumnNames = projectCols.map((c) => c.name);
      expect(projectColumnNames).toContain("id");
      expect(projectColumnNames).toContain("name");
      expect(projectColumnNames).toContain("created_at");
      expect(projectColumnNames).toContain("updated_at");

      const inputsCols = db.prepare("PRAGMA table_info(project_inputs)").all() as { name: string }[];
      const inputColumnNames = inputsCols.map((c) => c.name);
      expect(inputColumnNames).toContain("project_id");
      expect(inputColumnNames).toContain("period");
      expect(inputColumnNames).toContain("annual_h2_output_kg");
      expect(inputColumnNames).toContain("fuels_json");

      const runsCols = db.prepare("PRAGMA table_info(runs)").all() as { name: string }[];
      expect(runsCols.map((c) => c.name)).toEqual(
        expect.arrayContaining(["id", "project_id", "results", "created_at"])
      );

      const auditCols = db.prepare("PRAGMA table_info(audit)").all() as { name: string }[];
      expect(auditCols.map((c) => c.name)).toEqual(
        expect.arrayContaining(["id", "run_id", "payload", "created_at"])
      );
    });
  });

  describe("create project", () => {
    it("creates project with name, inputs, and factorOverrides", () => {
      const inputs = minimalCanonicalInputs();
      const factorOverrides = { "grid_ef": 0.35 };
      const project = repo.createProject({
        name: "Test Project",
        inputs,
        factorOverrides,
      });

      expect(project.id).toBeDefined();
      expect(project.name).toBe("Test Project");
      expect(project.inputs).toEqual(inputs);
      expect(project.factorOverrides).toEqual(factorOverrides);
      expect(project.selectedMethodologies).toEqual([]);
      expect(project.createdAt).toBeDefined();
      expect(project.updatedAt).toBeDefined();
    });

    it("creates project with only name (optional inputs and factorOverrides)", () => {
      const project = repo.createProject({ name: "Minimal Project" });

      expect(project.id).toBeDefined();
      expect(project.name).toBe("Minimal Project");
      expect(project.inputs).toBeNull();
      expect(project.factorOverrides).toEqual({});
      expect(project.selectedMethodologies).toEqual([]);
    });
  });

  describe("get by id", () => {
    it("returns project when it exists", () => {
      const inputs = minimalCanonicalInputs();
      const created = repo.createProject({
        name: "Get Me",
        inputs,
        factorOverrides: { x: 1 },
      });

      const loaded = repo.getProjectById(created.id);
      expect(loaded).not.toBeNull();
      expect(loaded!.id).toBe(created.id);
      expect(loaded!.name).toBe("Get Me");
      expect(loaded!.inputs).toEqual(inputs);
      expect(loaded!.factorOverrides).toEqual({ x: 1 });
    });

    it("returns null when project does not exist", () => {
      const loaded = repo.getProjectById("non-existent-id");
      expect(loaded).toBeNull();
    });

    it("round-trips optional canonical input groups (ccs, coProducts, fugitive, optional steam/electricity fields)", () => {
      const richInputs = {
        ...minimalCanonicalInputs(),
        electrolyserCapacityKw: 5000,
        electricity: {
          ...minimalCanonicalInputs().electricity,
          otherKwhPerKgH2: 3,
        },
        steam: {
          ...minimalCanonicalInputs().steam,
          otherHeatMjPerKgH2: 1.2,
          steamLciKgCo2PerMj: 0.02,
        },
        coProducts: [
          {
            productId: "oxygen",
            lhvMjPerKg: 0,
            massKg: 100,
            massH2Kg: 1000,
          },
        ],
        fugitiveNonCo2: {
          methaneLeakageKgPerKgH2: 0.001,
        },
        ccs: {
          eccsProcessKgCo2PerKgH2: 0.15,
          co2SequestratedKgPerKgH2: 0.8,
        },
      };

      const created = repo.createProject({
        name: "Rich Inputs",
        inputs: richInputs,
      });

      const loaded = repo.getProjectById(created.id);
      expect(loaded).not.toBeNull();
      expect(loaded!.inputs).toEqual(richInputs);
    });
  });

  describe("update project", () => {
    it("updates inputs, factorOverrides, and selectedMethodologies", () => {
      const created = repo.createProject({
        name: "To Update",
        inputs: minimalCanonicalInputs(),
        factorOverrides: { a: 1 },
      });

      const newInputs = { ...minimalCanonicalInputs(), annualH2OutputKg: 2000 };
      const newOverrides = { a: 2, b: 3 };
      const newMethodologies = ["india_ghci_v2025", "korea_clean_v2025"];

      const updated = repo.updateProject(created.id, {
        inputs: newInputs,
        factorOverrides: newOverrides,
        selectedMethodologies: newMethodologies,
      });

      expect(updated).not.toBeNull();
      expect(updated!.inputs).toEqual(newInputs);
      expect(updated!.factorOverrides).toEqual(newOverrides);
      expect(updated!.selectedMethodologies).toEqual(newMethodologies);
      expect(updated!.name).toBe("To Update");

      const loaded = repo.getProjectById(created.id);
      expect(loaded!.inputs).toEqual(newInputs);
      expect(loaded!.factorOverrides).toEqual(newOverrides);
      expect(loaded!.selectedMethodologies).toEqual(newMethodologies);
    });

    it("returns null when updating non-existent project", () => {
      const updated = repo.updateProject("no-such-id", {
        selectedMethodologies: ["india_ghci_v2025"],
      });
      expect(updated).toBeNull();
    });
  });

  describe("runs", () => {
    it("saves run and loads by id", () => {
      const project = repo.createProject({ name: "Run Project" });
      const results: MethodologyResult[] = [
        minimalResult("india_ghci_v2025"),
        minimalResult("korea_clean_v2025"),
      ];
      const auditPayload = {
        inputsSnapshot: {},
        factorVersions: { india_ghci_v2025: "v1" },
        equationVersions: {},
        timestamp: new Date().toISOString(),
      };

      const run = repo.saveRun(project.id, { results, auditPayload });

      expect(run.id).toBeDefined();
      expect(run.projectId).toBe(project.id);
      expect(run.results).toEqual(results);
      expect(run.createdAt).toBeDefined();

      const loaded = repo.getRunById(run.id);
      expect(loaded).not.toBeNull();
      expect(loaded!.id).toBe(run.id);
      expect(loaded!.projectId).toBe(project.id);
      expect(loaded!.results).toEqual(results);
    });

    it("returns null when run does not exist", () => {
      const loaded = repo.getRunById("no-run-id");
      expect(loaded).toBeNull();
    });

    it("loads runs by project id in created_at order", () => {
      const project = repo.createProject({ name: "Multi Run" });
      const run1 = repo.saveRun(project.id, { results: [minimalResult("india_ghci_v2025")], auditPayload: {} });
      const run2 = repo.saveRun(project.id, { results: [minimalResult("korea_clean_v2025")], auditPayload: {} });

      const runs = repo.getRunsByProjectId(project.id);
      expect(runs).toHaveLength(2);
      expect(runs.every((r: { projectId: string }) => r.projectId === project.id)).toBe(true);
      expect(runs[0].createdAt <= runs[1].createdAt).toBe(true);
      expect(runs.map((r: { id: string }) => r.id)).toEqual(expect.arrayContaining([run1.id, run2.id]));
    });

    it("round-trips run with empty results array", () => {
      const project = repo.createProject({ name: "Empty Results" });
      const run = repo.saveRun(project.id, { results: [], auditPayload: { timestamp: new Date().toISOString() } });
      const loaded = repo.getRunById(run.id);
      expect(loaded).not.toBeNull();
      expect(loaded!.results).toEqual([]);
      expect(loaded!.auditPayload).toHaveProperty("timestamp");
    });
  });

  describe("audit records", () => {
    it("schema supports saving and loading audit record with run", () => {
      const project = repo.createProject({ name: "Audit Project" });
      const auditPayload = {
        inputsSnapshot: { annualH2OutputKg: 1000 },
        factorVersions: { india_ghci_v2025: "v2025-04" },
        equationVersions: { india_ghci_v2025: "pages 19-23" },
        timestamp: new Date().toISOString(),
      };

      const run = repo.saveRun(project.id, {
        results: [minimalResult("india_ghci_v2025")],
        auditPayload,
      });

      const loaded = repo.getRunById(run.id);
      expect(loaded).not.toBeNull();
      expect(loaded!.auditPayload).toEqual(auditPayload);
    });

    it("getRunById returns run with empty auditPayload when no audit row exists", () => {
      const project = repo.createProject({ name: "No Audit" });
      db.prepare(
        "INSERT INTO runs (id, project_id, results, created_at) VALUES (?, ?, ?, ?)"
      ).run(
        "run-no-audit",
        project.id,
        JSON.stringify([minimalResult("india_ghci_v2025")]),
        new Date().toISOString()
      );

      const loaded = repo.getRunById("run-no-audit");
      expect(loaded).not.toBeNull();
      expect(loaded!.auditPayload).toEqual({});
    });
  });

  describe("robustness", () => {
    it("getProjectById returns fallback when stored factor override value is invalid JSON", () => {
      const project = repo.createProject({ name: "Corrupt", inputs: minimalCanonicalInputs() });
      db.prepare(
        "INSERT INTO project_factor_overrides (project_id, factor_key, factor_value_json) VALUES (?, ?, ?)"
      ).run(project.id, "bad", "not json");

      const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
      const loaded = repo.getProjectById(project.id);
      warnSpy.mockRestore();

      expect(loaded).not.toBeNull();
      expect(loaded!.factorOverrides).toEqual({});
    });

    it("getRunById returns fallback when runs.results column is invalid JSON", () => {
      const project = repo.createProject({ name: "Run Corrupt" });
      db.prepare(
        "INSERT INTO runs (id, project_id, results, created_at) VALUES (?, ?, ?, ?)"
      ).run("run-bad-results", project.id, "not valid json", new Date().toISOString());
      db.prepare(
        "INSERT INTO audit (id, run_id, payload, created_at) VALUES (?, ?, ?, ?)"
      ).run("audit-bad", "run-bad-results", "{}", new Date().toISOString());

      const loaded = repo.getRunById("run-bad-results");
      expect(loaded).not.toBeNull();
      expect(loaded!.results).toEqual([]);
    });

    it("getRunById returns fallback when audit.payload is invalid JSON", () => {
      const project = repo.createProject({ name: "Audit Corrupt" });
      db.prepare(
        "INSERT INTO runs (id, project_id, results, created_at) VALUES (?, ?, ?, ?)"
      ).run("run-bad-audit", project.id, JSON.stringify([minimalResult("india_ghci_v2025")]), new Date().toISOString());
      db.prepare(
        "INSERT INTO audit (id, run_id, payload, created_at) VALUES (?, ?, ?, ?)"
      ).run("audit-bad-payload", "run-bad-audit", "not json", new Date().toISOString());

      const loaded = repo.getRunById("run-bad-audit");
      expect(loaded).not.toBeNull();
      expect(loaded!.auditPayload).toEqual({});
    });

    it("updateProject updates only provided fields and leaves others unchanged", () => {
      const created = repo.createProject({
        name: "Partial Update",
        inputs: minimalCanonicalInputs(),
        factorOverrides: { keep: 1 },
      });
      const newInputs = { ...minimalCanonicalInputs(), annualH2OutputKg: 3000 };

      const updated = repo.updateProject(created.id, { inputs: newInputs });

      expect(updated!.inputs!.annualH2OutputKg).toBe(3000);
      expect(updated!.factorOverrides).toEqual({ keep: 1 });
      expect(updated!.selectedMethodologies).toEqual([]);
    });

    it("updateProject with only selectedMethodologies leaves inputs and factorOverrides unchanged", () => {
      const inputs = minimalCanonicalInputs();
      const created = repo.createProject({
        name: "Methods Only",
        inputs,
        factorOverrides: { f: 1 },
      });
      const updated = repo.updateProject(created.id, {
        selectedMethodologies: ["india_ghci_v2025"],
      });
      expect(updated!.selectedMethodologies).toEqual(["india_ghci_v2025"]);
      expect(updated!.inputs).toEqual(inputs);
      expect(updated!.factorOverrides).toEqual({ f: 1 });
    });

    it("updateProject with inputs set to null clears inputs", () => {
      const created = repo.createProject({
        name: "Clear Inputs",
        inputs: minimalCanonicalInputs(),
      });
      const updated = repo.updateProject(created.id, { inputs: null });
      expect(updated!.inputs).toBeNull();
    });
  });
});
