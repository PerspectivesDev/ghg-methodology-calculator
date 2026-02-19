/**
 * S1.4 — Error handler: 400 for invalid JSON, 500 for other errors.
 * Unit test for the 500 path (not easily reachable via API tests).
 */
import { describe, it, expect, vi } from "vitest";
import type { Response } from "express";
import { createErrorHandler } from "../../src/app.js";

describe("createErrorHandler", () => {
  it("returns 400 with message when error is SyntaxError", () => {
    const handler = createErrorHandler();
    const res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
    } as unknown as Response;

    handler(new SyntaxError("Unexpected token"), {} as never, res, () => {});

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ errors: ["Invalid JSON in request body"] });
  });

  it("returns 500 with message for non-SyntaxError errors", () => {
    const handler = createErrorHandler();
    const res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
    } as unknown as Response;

    handler(new Error("Something broke"), {} as never, res, () => {});

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ errors: ["Internal server error"] });
  });
});
