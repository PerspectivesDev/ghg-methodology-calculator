# AI Scaffolding Project

**Base scaffolding for all applications** — tech-stack agnostic. You use **specifications** to define a project; **sprints and tasks are YAML files** in `specs/`. Cursor rules, prompts, and templates are **generic and portable** — you bring them from project to project and extend them over time (e.g. add SOLID, YAGNI, DRY).

---

## This project: GHG Methodology Calculator (GIZ WP3)

Tool for hydrogen/PtX project developers: enter project data once, select 1–5 GHG methodologies (India GHCI, South Korea Clean Hydrogen, and future standards), get lifecycle GHG intensity per methodology and a comparison view with verification-ready outputs.

| Item | Location |
|------|----------|
| **Product spec** | `specs/spec/product.md` |
| **Methodology inputs (Korea)** | `specs/spec/methodologies/KOREA-REQUIRED-INPUTS.md` |
| **Methodology inputs (India)** | `specs/spec/methodologies/INDIA-GHCI-REQUIRED-INPUTS.md` |
| **Sprints & tasks** | `specs/sprints.yaml`, `specs/tasks.yaml` |
| **Assumptions & open questions** | `specs/assumptions-and-open-questions.md` |
| **Pre-development checklist** | `specs/PRE-DEVELOPMENT-CHECKLIST.md` |
| **First task** | **S1.1** — Project setup and test harness (`specs/tasks.yaml`) |
| **Run instructions** | To be added in task S7.3 (README, .env.example, run steps). |

Tech stack (from spec): Node.js 20, TypeScript, SQLite, React 18; Vitest; export to PDF, Excel, JSON.

---

## Two parts

1. **Portable agentic infrastructure** (reuse everywhere): Cursor rules, agents/prompts, docs and framework templates, sprint/task **schema**. Copy these into every project. **Nothing here is tech- or app-specific.**
2. **Per-project content** (replace per app): Your **spec** (in `specs/spec/`), the **YAML** derived from it (`specs/sprints.yaml`, `specs/tasks.yaml`), and the application code you build. You choose stack and structure.

See **PORTABLE-VS-PROJECT.md** for what to copy vs replace.

---

## Quick start

1. **Copy** the portable parts (`.cursor/rules/`, `agents/`, `docs/`, `framework/`, `PLAN.md`, this README, `PORTABLE-VS-PROJECT.md`) into a new repo, or clone this repo for a new app.
2. **Add your specification** in `specs/spec/` (markdown or structured).
3. **Produce YAML**: Fill `specs/sprints.yaml` and `specs/tasks.yaml` from your spec (by hand or with `agents/prompts/SPEC-TO-YAML-PROMPT.md`). These are the **source of truth** for the plan.
4. **Cursor rules** apply automatically: general SWE, SOLID, YAGNI, test-first, 95% coverage, task/sprint conventions when editing specs or code.
5. **Implement**: For each task in `specs/tasks.yaml` — create the test from `test_ref` first → implement → 95% coverage. Use estimation prompts in `agents/estimation/` when needed.

---

## What’s inside

| Area | Purpose |
|------|--------|
| **specs/** | **Project-specific.** Your spec (`spec/`) and canonical **sprints.yaml** + **tasks.yaml** (from spec). |
| **.cursor/rules/** | **Portable.** General SWE, SOLID, YAGNI, DRY, KISS, Clean Code, composition/coupling, error handling, explicit/immutability, SoC, CQS, least astonishment, SSOT, no premature optimization, encapsulation, DDD, refactoring, test-first, 95% coverage, task/sprint conventions, **vibe coding**, **Cursor/agentic**, **security awareness**. Add more as needed. |
| **framework/sprints/, framework/tasks/** | **Portable.** Schema and docs for sprint/task YAML (fields, rules). |
| **framework/work-packages/** | WP template, tech stack decision, module→WP breakdown. |
| **docs/** | PRD, architecture, module definition templates (portable). |
| **agents/** | **Portable.** Estimation, spec→YAML prompt, module boundaries, runbook. |
| **PLAN.md** | Meta-plan for the scaffolding itself (tracks/sprints); optional. |
| **PORTABLE-VS-PROJECT.md** | What to copy vs replace when starting a new project. |

---

## Principles

- **No tech or app in the scaffolding**: This repo is a pure agentic setup. Stack, product, and layout are defined in **your** spec and YAML per project.
- **Spec → YAML**: You provide a specification; sprints and tasks live as **YAML** in `specs/`. Implementation follows that plan.
- **Test-first**: For every task, create the test(s) that define success, then implement.
- **95% coverage**: Target test coverage; part of definition of done.
- **Clear module boundaries**: Modules independent; interfaces explicit; no overlap.
- **Sprint = work package**: One sprint ≈ one work package (~2 weeks conventional effort).
- **Rules are generic and evolving**: Add principles (SOLID, YAGNI, DRY, etc.) or stack-specific rules as separate rule files and carry them across projects.

---

## Flow (high level)

1. **Spec** in `specs/spec/` → **sprints.yaml** and **tasks.yaml** in `specs/` (manually or via agent prompt).
2. **PRD & architecture** (from `docs/`) and module boundaries (checklist + agents) define modules.
3. **Tech stack** via `framework/work-packages/TECH-STACK-DECISION.md` if needed.
4. **Implement** from `specs/tasks.yaml`: pick task → test first → implement → 95% coverage.
5. **Estimate** with `agents/estimation/` and historical context when planning.

---

## Adding more Cursor rules

Add new `.mdc` files under `.cursor/rules/` (e.g. `dry.mdc`, `clean-code.mdc`, or stack-specific like `typescript.mdc` with `globs: "**/*.ts"`). Keep each file focused and short. These are part of your **portable** infra.

---

*Sprint/task schema: **framework/sprints/SPRINT-SCHEMA.md**, **framework/tasks/TASK-SCHEMA.md**. Portable vs project: **PORTABLE-VS-PROJECT.md**.*
