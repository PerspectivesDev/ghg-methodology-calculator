# Portable vs project-specific

Use this to know **what to copy from project to project** (your agentic programming infrastructure) vs **what is unique to each application** (specs and app code).

---

## Portable — bring with you to every project

Copy these into every new repo. Evolve them over time (e.g. add more Cursor rules like SOLID, YAGNI, DRY, or stack-specific rules).

| Item | Location | Purpose |
|------|----------|---------|
| **Cursor rules** | `.cursor/rules/*.mdc` | Generic SWE, SOLID, YAGNI, test-first, coverage, task/sprint conventions. Add more rules as you learn. |
| **Agents & prompts** | `agents/` | Estimation, spec→YAML, module boundaries, runbook. |
| **Templates & schema** | `docs/`, `framework/` | PRD, architecture, module definition, sprint/task **schema** (the shape of YAML), work packages, tech stack template. |
| **Plan (meta)** | `PLAN.md` | Tracks/sprints for *building the scaffolding itself*; optional reference for how you run multi-track work. |

**Not portable**: The actual **content** of `specs/sprints.yaml` and `specs/tasks.yaml` is project-specific (see below). The **schema** (what fields a sprint or task has) lives in `framework/` and is portable.

---

## Project-specific — replace per application

Each application has its own specification and plan. Do **not** copy these from project to project; replace them.

| Item | Location | Purpose |
|------|----------|---------|
| **Your specification** | `specs/spec/` | PRD, narrative, or structured description of *this* product and modules. |
| **Sprints (YAML)** | `specs/sprints.yaml` | The list of sprints for *this* project (from your spec). |
| **Tasks (YAML)** | `specs/tasks.yaml` | The list of tasks for *this* project (from your spec); dependencies, test_ref, etc. |
| **Application code** | e.g. `src/`, `app/`, `backend/`, `frontend/` (define in your spec) | The actual implementation of the product. |

---

## Flow

1. **New project**: Copy the repo (or only the portable parts: `.cursor/rules/`, `agents/`, `docs/`, `framework/`, `PLAN.md`, `README.md`, `PORTABLE-VS-PROJECT.md`). Add an empty or template `specs/` (see `specs/README.md`).
2. **Write or paste your spec** into `specs/spec/`.
3. **Produce YAML**: Manually or with the agent prompt (`agents/prompts/SPEC-TO-YAML-PROMPT.md`) fill `specs/sprints.yaml` and `specs/tasks.yaml`.
4. **Implement**: Read tasks from `specs/tasks.yaml`; for each task, create test per `test_ref` → implement → 95% coverage. Rules (SOLID, YAGNI, test-first) apply from `.cursor/rules/`.
5. **Evolve infra**: As you work, add or refine Cursor rules and prompts in this repo; sync those changes to other projects when you want to adopt them.

---

## Adding new rules (e.g. SOLID, YAGNI, DRY)

- Add a new `.mdc` file under `.cursor/rules/` (e.g. `solid-principles.mdc`, `yagni.mdc`).
- Keep each rule **focused** and **short** (one concern per file). Set `alwaysApply: true` for global principles, or `globs` for file-specific rules.
- These new rules are **portable** — they go with you to every project that uses this scaffolding.
