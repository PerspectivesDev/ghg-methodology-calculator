/**
 * S1.4 — Application factory: Express app with project API.
 * API lives in the app layer; persistence is behind the repository (explicit dependency).
 */

import express, { type Request, type Response, type NextFunction } from "express";
import type { ProjectRepository } from "./persistence/project-repository.js";
import {
  validateCreateProjectBody,
  validateUpdateProjectBody,
} from "./validation/project-body.js";

/** Extract :id route param as string (Express types allow string | string[]). Exported for tests. */
export function paramId(req: Request): string {
  const id = req.params.id;
  return Array.isArray(id) ? id[0] ?? "" : id;
}

/**
 * Creates an Express app with POST/GET/PUT /api/projects.
 * Repository is injected so tests can use an in-memory DB.
 */
export function createApp(repository: ProjectRepository): express.Express {
  const app = express();

  app.use(express.json());

  app.post("/api/projects", (req: Request, res: Response) => {
    const result = validateCreateProjectBody(req.body);
    if (!result.success) {
      res.status(400).json({ errors: result.errors });
      return;
    }
    const project = repository.createProject({
      name: result.data.name,
      inputs: result.data.inputs,
      factorOverrides: result.data.factorOverrides,
    });
    res.status(201).json(project);
  });

  app.get("/api/projects/:id", (req: Request, res: Response) => {
    const id = paramId(req);
    const project = repository.getProjectById(id);
    if (!project) {
      res.status(404).send();
      return;
    }
    res.status(200).json(project);
  });

  app.put("/api/projects/:id", (req: Request, res: Response) => {
    const result = validateUpdateProjectBody(req.body);
    if (!result.success) {
      res.status(400).json({ errors: result.errors });
      return;
    }
    const id = paramId(req);
    const project = repository.updateProject(id, {
      inputs: result.data.inputs,
      factorOverrides: result.data.factorOverrides,
      selectedMethodologies: result.data.selectedMethodologies,
    });
    if (!project) {
      res.status(404).send();
      return;
    }
    res.status(200).json(project);
  });

  app.use(createErrorHandler());

  return app;
}

/**
 * Central error handler: 400 for invalid JSON, 500 for other errors.
 * Exported for unit testing the 500 path (no need to trigger real server errors).
 */
export function createErrorHandler(): (err: unknown, _req: Request, res: Response, _next: NextFunction) => void {
  return (err: unknown, _req: Request, res: Response, _next: NextFunction) => {
    if (err instanceof SyntaxError) {
      res.status(400).json({ errors: ["Invalid JSON in request body"] });
      return;
    }
    res.status(500).json({ errors: ["Internal server error"] });
  };
}
