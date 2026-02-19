# Specs — Project-specific plan (YAML)

This folder is **project-specific**. You bring the scaffolding (rules, prompts, schema) from repo to repo; you replace **this folder** with your own spec and YAML for each project.

## Flow

1. **You provide a specification** (in `spec/`): narrative, PRD, or structured description of the product and modules.
2. **Sprints and tasks are defined as YAML** (canonical source of truth):
   - `sprints.yaml` — list of sprints (one sprint ≈ one work package, ~2 weeks).
   - `tasks.yaml` — list of tasks; each task has `depends_on`, `test_ref`, and belongs to a sprint.
3. **Implementation** reads from these files: pick a task → create test from `test_ref` → implement → 95% coverage.

## Layout

```
specs/
  README.md          # This file
  spec/              # Your specification (markdown, YAML, or both)
  sprints.yaml       # Canonical list of sprints (from spec)
  tasks.yaml         # Canonical list of tasks (from spec)
```

## Deriving YAML from your spec

- **By hand**: Use `framework/sprints/SPRINT-SCHEMA.md` and `framework/tasks/TASK-SCHEMA.md`; fill `sprints.yaml` and `tasks.yaml`.
- **With an agent**: Use the prompt in `agents/prompts/SPEC-TO-YAML-PROMPT.md` — paste your spec, get a first draft of sprints and tasks YAML.

## Schema reference

- Sprint fields: `id`, `track`, `name`, `work_package_ref`, `duration_weeks`, `tasks`, `goal`, `status`.
- Task fields: `id`, `sprint_id`, `title`, `depends_on`, `test_ref`, `description`, `definition_of_done`, `status`.

Full schema: `framework/sprints/SPRINT-SCHEMA.md`, `framework/tasks/TASK-SCHEMA.md`.

## Portable vs project-specific

- **Portable** (reuse in every project): `.cursor/rules/`, `agents/`, `docs/`, `framework/` (schema and templates only). Copy these.
- **Project-specific** (this app): `specs/` (your spec + `sprints.yaml` + `tasks.yaml`) and your application code. Replace per project.

---

## Ready to start (this project)

- **Spec**: `spec/product.md` — goals, scope, PDF-first calculation, methodology data model, API, modules.
- **Methodology docs**: `spec/methodologies/KOREA-REQUIRED-INPUTS.md`, `spec/methodologies/INDIA-GHCI-REQUIRED-INPUTS.md`.
- **Sprints**: `sprints.yaml` — S1–S7; **tasks**: `tasks.yaml` — S1.1–S7.3; no circular `depends_on`.
- **Assumptions & open questions**: `assumptions-and-open-questions.md` — pre-build assumptions and GIZ open questions.
- **Pre-development checklist**: `PRE-DEVELOPMENT-CHECKLIST.md` — confirm all items before S1.1.
- **First task**: **S1.1** — Project setup and test harness (Node 20+, TypeScript, Vitest, coverage). Create test from `test_ref` first, then implement.
- **How to add a new standard**: See `spec/product.md` §10 — add methodology doc under `spec/methodologies/` + new adapter; register.
