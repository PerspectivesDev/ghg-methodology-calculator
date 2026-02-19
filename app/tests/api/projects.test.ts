/**
 * S1.4 — Project API: POST/GET/PUT /api/projects.
 * Test-first: create project, get by id, update (inputs, factorOverrides, selectedMethodologies);
 * 400 on validation error, 404 when resource missing.
 */
import { describe, it, expect, beforeEach } from "vitest";
import request from "supertest";
import Database from "better-sqlite3";
import {
  createProjectRepository,
  initSchema,
  type ProjectRepository,
} from "../../src/persistence/project-repository.js";
import type { Request } from "express";
import { createApp, paramId } from "../../src/app.js";
import { minimalCanonicalInputs } from "../fixtures/canonical-inputs.js";

describe("projects API (S1.4)", () => {
  let repo: ProjectRepository;
  let db: Database.Database;

  beforeEach(() => {
    db = initSchema(":memory:");
    repo = createProjectRepository(db);
  });

  function app() {
    return createApp(repo);
  }

  describe("paramId (Express params edge case)", () => {
    it("returns first element when params.id is array", () => {
      const req = { params: { id: ["the-id"] } } as unknown as Request;
      expect(paramId(req)).toBe("the-id");
    });

    it("returns empty string when params.id is empty array", () => {
      const req = { params: { id: [] } } as unknown as Request;
      expect(paramId(req)).toBe("");
    });
  });

  describe("POST /api/projects", () => {
    it("creates project with name and returns created project as JSON", async () => {
      const res = await request(app())
        .post("/api/projects")
        .set("Content-Type", "application/json")
        .send({ name: "My Project" });

      expect(res.status).toBe(201);
      expect(res.body).toMatchObject({
        name: "My Project",
        inputs: null,
        factorOverrides: {},
        selectedMethodologies: [],
      });
      expect(res.body.id).toBeDefined();
      expect(res.body.createdAt).toBeDefined();
      expect(res.body.updatedAt).toBeDefined();
    });

    it("creates project with name, inputs, and factorOverrides", async () => {
      const inputs = minimalCanonicalInputs();
      const factorOverrides = { grid_ef: 0.35 };

      const res = await request(app())
        .post("/api/projects")
        .set("Content-Type", "application/json")
        .send({ name: "Full Project", inputs, factorOverrides });

      expect(res.status).toBe(201);
      expect(res.body.name).toBe("Full Project");
      expect(res.body.inputs).toEqual(inputs);
      expect(res.body.factorOverrides).toEqual(factorOverrides);
      expect(res.body.selectedMethodologies).toEqual([]);
    });

    it("returns 400 with structured errors when name is missing", async () => {
      const res = await request(app())
        .post("/api/projects")
        .set("Content-Type", "application/json")
        .send({});

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty("errors");
      expect(Array.isArray(res.body.errors)).toBe(true);
      expect(res.body.errors.length).toBeGreaterThan(0);
    });

    it("returns 400 when name is not a string", async () => {
      const res = await request(app())
        .post("/api/projects")
        .set("Content-Type", "application/json")
        .send({ name: 123 });

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty("errors");
      expect(Array.isArray(res.body.errors)).toBe(true);
    });

    it("returns 400 when name is empty string", async () => {
      const res = await request(app())
        .post("/api/projects")
        .set("Content-Type", "application/json")
        .send({ name: "   " });

      expect(res.status).toBe(400);
      expect(res.body.errors).toContainEqual(expect.stringMatching(/empty|name/));
    });

    it("returns 400 when inputs is not an object", async () => {
      const res = await request(app())
        .post("/api/projects")
        .set("Content-Type", "application/json")
        .send({ name: "P", inputs: 42 });

      expect(res.status).toBe(400);
      expect(res.body.errors).toContainEqual(expect.stringMatching(/inputs.*object/));
    });

    it("returns 400 when factorOverrides is not an object", async () => {
      const res = await request(app())
        .post("/api/projects")
        .set("Content-Type", "application/json")
        .send({ name: "P", factorOverrides: "not-object" });

      expect(res.status).toBe(400);
      expect(res.body.errors).toContainEqual(expect.stringMatching(/factorOverrides.*object/));
    });

    it("returns 400 when body is not valid JSON", async () => {
      const res = await request(app())
        .post("/api/projects")
        .set("Content-Type", "application/json")
        .send("not json");

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty("errors");
    });
  });

  describe("GET /api/projects/:id", () => {
    it("returns project as JSON when it exists", async () => {
      const created = repo.createProject({
        name: "Get Me",
        inputs: minimalCanonicalInputs(),
        factorOverrides: { x: 1 },
      });

      const res = await request(app()).get(`/api/projects/${created.id}`);

      expect(res.status).toBe(200);
      expect(res.body.id).toBe(created.id);
      expect(res.body.name).toBe("Get Me");
      expect(res.body.inputs).toEqual(minimalCanonicalInputs());
      expect(res.body.factorOverrides).toEqual({ x: 1 });
    });

    it("returns 404 when project does not exist", async () => {
      const res = await request(app()).get("/api/projects/non-existent-id");

      expect(res.status).toBe(404);
      expect(res.body).toEqual({});
    });
  });

  describe("PUT /api/projects/:id", () => {
    it("updates project with inputs, factorOverrides, selectedMethodologies and returns updated project", async () => {
      const created = repo.createProject({
        name: "To Update",
        inputs: minimalCanonicalInputs(),
        factorOverrides: { a: 1 },
      });

      const newInputs = { ...minimalCanonicalInputs(), annualH2OutputKg: 2000 };
      const newOverrides = { a: 2, b: 3 };
      const newMethodologies = ["india_ghci_v2025", "korea_clean_v2025"];

      const res = await request(app())
        .put(`/api/projects/${created.id}`)
        .set("Content-Type", "application/json")
        .send({
          inputs: newInputs,
          factorOverrides: newOverrides,
          selectedMethodologies: newMethodologies,
        });

      expect(res.status).toBe(200);
      expect(res.body.id).toBe(created.id);
      expect(res.body.name).toBe("To Update");
      expect(res.body.inputs).toEqual(newInputs);
      expect(res.body.factorOverrides).toEqual(newOverrides);
      expect(res.body.selectedMethodologies).toEqual(newMethodologies);
    });

    it("returns 404 when updating non-existent project", async () => {
      const res = await request(app())
        .put("/api/projects/non-existent-id")
        .set("Content-Type", "application/json")
        .send({ selectedMethodologies: ["india_ghci_v2025"] });

      expect(res.status).toBe(404);
      expect(res.body).toEqual({});
    });

    it("updates only selectedMethodologies when only that field is sent (partial update)", async () => {
      const inputs = minimalCanonicalInputs();
      const created = repo.createProject({
        name: "Partial",
        inputs,
        factorOverrides: { k: 1 },
      });

      const res = await request(app())
        .put(`/api/projects/${created.id}`)
        .set("Content-Type", "application/json")
        .send({ selectedMethodologies: ["india_ghci_v2025"] });

      expect(res.status).toBe(200);
      expect(res.body.selectedMethodologies).toEqual(["india_ghci_v2025"]);
      expect(res.body.inputs).toEqual(inputs);
      expect(res.body.factorOverrides).toEqual({ k: 1 });
    });

    it("returns 400 with structured errors when selectedMethodologies is not an array of strings", async () => {
      const created = repo.createProject({ name: "Validate" });

      const res = await request(app())
        .put(`/api/projects/${created.id}`)
        .set("Content-Type", "application/json")
        .send({ selectedMethodologies: "not-an-array" });

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty("errors");
      expect(Array.isArray(res.body.errors)).toBe(true);
    });

    it("returns 400 when inputs is not object or null on PUT", async () => {
      const created = repo.createProject({ name: "P" });
      const res = await request(app())
        .put(`/api/projects/${created.id}`)
        .set("Content-Type", "application/json")
        .send({ inputs: 123 });

      expect(res.status).toBe(400);
      expect(res.body.errors).toContainEqual(expect.stringMatching(/inputs/));
    });

    it("returns 400 when factorOverrides is not object on PUT", async () => {
      const created = repo.createProject({ name: "P" });
      const res = await request(app())
        .put(`/api/projects/${created.id}`)
        .set("Content-Type", "application/json")
        .send({ factorOverrides: [] });

      expect(res.status).toBe(400);
      expect(res.body.errors).toContainEqual(expect.stringMatching(/factorOverrides/));
    });

    it("returns 400 when selectedMethodologies contains non-strings", async () => {
      const created = repo.createProject({ name: "P" });
      const res = await request(app())
        .put(`/api/projects/${created.id}`)
        .set("Content-Type", "application/json")
        .send({ selectedMethodologies: [1, 2] });

      expect(res.status).toBe(400);
      expect(res.body.errors).toContainEqual(expect.stringMatching(/selectedMethodologies/));
    });
  });
});
