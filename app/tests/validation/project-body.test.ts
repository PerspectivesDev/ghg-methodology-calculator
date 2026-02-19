/**
 * S1.4 — Unit tests for project request body validation stub.
 * Covers branches that are hard to hit only via API (e.g. null/array body).
 */
import { describe, it, expect } from "vitest";
import {
  validateCreateProjectBody,
  validateUpdateProjectBody,
} from "../../src/validation/project-body.js";
import { minimalCanonicalInputs } from "../fixtures/canonical-inputs.js";

describe("validateCreateProjectBody", () => {
  it("returns errors when body is null", () => {
    const result = validateCreateProjectBody(null);
    expect(result.success).toBe(false);
    if (!result.success) expect(result.errors).toContain("Request body is required");
  });

  it("returns errors when body is undefined", () => {
    const result = validateCreateProjectBody(undefined);
    expect(result.success).toBe(false);
    if (!result.success) expect(result.errors).toContain("Request body is required");
  });

  it("returns errors when body is not a plain object", () => {
    const result = validateCreateProjectBody([]);
    expect(result.success).toBe(false);
    if (!result.success) expect(result.errors).toContain("Request body must be a JSON object");
  });

  it("returns success with trimmed name and optional inputs and factorOverrides", () => {
    const inputs = minimalCanonicalInputs();
    const result = validateCreateProjectBody({
      name: "  Trimmed  ",
      inputs,
      factorOverrides: { k: 1 },
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.name).toBe("Trimmed");
      expect(result.data.inputs).toEqual(inputs);
      expect(result.data.factorOverrides).toEqual({ k: 1 });
    }
  });
});

describe("validateUpdateProjectBody", () => {
  it("returns errors when body is null", () => {
    const result = validateUpdateProjectBody(null);
    expect(result.success).toBe(false);
    if (!result.success) expect(result.errors).toContain("Request body is required");
  });

  it("returns errors when body is not a plain object", () => {
    const result = validateUpdateProjectBody(123);
    expect(result.success).toBe(false);
    if (!result.success) expect(result.errors).toContain("Request body must be a JSON object");
  });

  it("returns success with empty object", () => {
    const result = validateUpdateProjectBody({});
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.inputs).toBeUndefined();
      expect(result.data.factorOverrides).toBeUndefined();
      expect(result.data.selectedMethodologies).toBeUndefined();
    }
  });

  it("returns success with inputs null and selectedMethodologies array", () => {
    const result = validateUpdateProjectBody({
      inputs: null,
      selectedMethodologies: ["india_ghci_v2025"],
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.inputs).toBeNull();
      expect(result.data.selectedMethodologies).toEqual(["india_ghci_v2025"]);
    }
  });
});
