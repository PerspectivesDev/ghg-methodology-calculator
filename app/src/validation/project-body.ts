/**
 * S1.4 — Validation stub for project API request bodies.
 * Full validation (required fields, units, cross-field) is S2.2.
 * Here: type/shape checks only; fail fast on invalid input.
 */

import type { CanonicalProjectInputs } from "../domain/canonical-inputs.js";

export interface CreateProjectBody {
  name: string;
  inputs?: CanonicalProjectInputs | null;
  factorOverrides?: Record<string, unknown>;
}

export interface UpdateProjectBody {
  inputs?: CanonicalProjectInputs | null;
  factorOverrides?: Record<string, unknown>;
  selectedMethodologies?: string[];
}

export type ValidationSuccess<T> = { success: true; data: T };
export type ValidationFailure = { success: false; errors: string[] };
export type ValidationResult<T> = ValidationSuccess<T> | ValidationFailure;

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isStringArray(value: unknown): value is string[] {
  if (!Array.isArray(value)) return false;
  return value.every((item) => typeof item === "string");
}

/**
 * Shared guard: ensures body is a plain object. Returns failure result or null (continue validation).
 * DRY for POST and PUT body validation.
 */
function requireBodyObject(body: unknown): ValidationFailure | null {
  if (body === null || body === undefined) {
    return { success: false, errors: ["Request body is required"] };
  }
  if (!isPlainObject(body)) {
    return { success: false, errors: ["Request body must be a JSON object"] };
  }
  return null;
}

/**
 * Validates POST /api/projects body. Name is required and must be a non-empty string.
 * inputs and factorOverrides are optional; when present must be objects.
 */
export function validateCreateProjectBody(body: unknown): ValidationResult<CreateProjectBody> {
  const bodyError = requireBodyObject(body);
  if (bodyError) return bodyError;

  const errors: string[] = [];
  const { name, inputs, factorOverrides } = body as Record<string, unknown>;

  if (name === undefined || name === null) {
    errors.push("name is required");
  } else if (typeof name !== "string") {
    errors.push("name must be a string");
  } else if (name.trim() === "") {
    errors.push("name must not be empty");
  }

  if (inputs !== undefined && inputs !== null && !isPlainObject(inputs)) {
    errors.push("inputs must be an object when provided");
  }

  if (factorOverrides !== undefined && factorOverrides !== null && !isPlainObject(factorOverrides)) {
    errors.push("factorOverrides must be an object when provided");
  }

  if (errors.length > 0) {
    return { success: false, errors };
  }

  return {
    success: true,
    data: {
      name: ((body as Record<string, unknown>).name as string).trim(),
      inputs: (body as Record<string, unknown>).inputs as CanonicalProjectInputs | undefined | null,
      factorOverrides: (body as Record<string, unknown>).factorOverrides as Record<string, unknown> | undefined,
    },
  };
}

/**
 * Validates PUT /api/projects/:id body. All fields optional.
 * inputs may be object or null; factorOverrides must be object; selectedMethodologies must be array of strings.
 */
export function validateUpdateProjectBody(body: unknown): ValidationResult<UpdateProjectBody> {
  const bodyError = requireBodyObject(body);
  if (bodyError) return bodyError;

  const errors: string[] = [];
  const bodyObj = body as Record<string, unknown>;
  const { inputs, factorOverrides, selectedMethodologies } = bodyObj;

  if (inputs !== undefined && inputs !== null && !isPlainObject(inputs)) {
    errors.push("inputs must be an object or null when provided");
  }

  if (factorOverrides !== undefined && factorOverrides !== null && !isPlainObject(factorOverrides)) {
    errors.push("factorOverrides must be an object when provided");
  }

  if (selectedMethodologies !== undefined && !isStringArray(selectedMethodologies)) {
    errors.push("selectedMethodologies must be an array of strings when provided");
  }

  if (errors.length > 0) {
    return { success: false, errors };
  }

  return {
    success: true,
    data: {
      inputs: bodyObj.inputs as CanonicalProjectInputs | null | undefined,
      factorOverrides: bodyObj.factorOverrides as Record<string, unknown> | undefined,
      selectedMethodologies: bodyObj.selectedMethodologies as string[] | undefined,
    },
  };
}
