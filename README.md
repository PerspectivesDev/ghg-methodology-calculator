# GHG Methodology Calculator (GIZ WP3)

[![CI](https://github.com/PerspectivesDev/ghg-methodology-calculator/actions/workflows/ci.yml/badge.svg)](https://github.com/PerspectivesDev/ghg-methodology-calculator/actions/workflows/ci.yml)

Tool for hydrogen/PtX project developers: enter project data once, select one or more GHG methodologies (India GHCI, South Korea Clean Hydrogen, and future standards), get lifecycle GHG intensity per methodology and a comparison view with verification-ready outputs and audit trail.

---

## What it does

- **Single project**: One set of canonical inputs per workspace; user enters data once.
- **Methodologies (MVP)**: India Green Hydrogen Certification (GHCI, electrolysis) and South Korea Clean Hydrogen Certification. Tool is designed for up to 4–5 methodologies (final list with GIZ); additional standards (e.g. EU RFNBO, IPHE, ISO) can be added later.
- **Calculation**: Lifecycle GHG intensity (e.g. kgCO₂eq/kg H₂) per methodology, using equations and rules from the official PDFs only. No ad hoc formulas.
- **Outputs**: Per-methodology breakdown (Efeedstock, Eenergy, Eprocess, etc.), comparison view, verification-ready report. Export to PDF, Excel, and JSON.
- **Audit**: Inputs, factor versions (Basic Data Provided / defaults), equation versions, and timestamp recorded for each run.

---

## Tech stack

- **Runtime**: Node.js 20+ LTS, TypeScript.
- **Backend**: Node + TypeScript; calculation engine as methodology adapters (pure functions), orchestrated by a single runner.
- **Persistence**: SQLite (projects, canonical inputs, runs, audit).
- **Frontend**: React 18 + TypeScript (forms, methodology selection, results, comparison, export).
- **Tests**: Vitest (unit + integration); 95% coverage target for calculation and validation.
- **Export**: PDF, Excel (e.g. ExcelJS), JSON for machine-readable audit.

---

## Project docs and plan

| Item | Location |
|------|----------|
| **Product spec** | `specs/spec/product.md` |
| **Methodology inputs (Korea)** | `specs/spec/methodologies/KOREA-REQUIRED-INPUTS.md` |
| **Methodology inputs (India)** | `specs/spec/methodologies/INDIA-GHCI-REQUIRED-INPUTS.md` |
| **Sprints** | `specs/sprints.yaml` |
| **Tasks** | `specs/tasks.yaml` |
| **Assumptions & open questions** | `specs/assumptions-and-open-questions.md` |
| **Pre-development checklist** | `specs/PRE-DEVELOPMENT-CHECKLIST.md` |

Development follows the task list in `specs/tasks.yaml` (test-first, 95% coverage). Sprint S1 (foundation) is complete; S2–S7 are planned.

---

## Run and develop

Application code lives in **`app/`**. From the `app/` directory:

- `npm install` — install dependencies
- `npm run migrate` — apply SQLite migrations
- `npm test` — run tests
- `npm run coverage` — tests and coverage report

See **`app/README.md`** for prerequisites (Node.js version) and current runtime direction (e.g. Electron vs standalone server).

---

## Repo layout

| Path | Purpose |
|------|---------|
| **`app/`** | Application: `src/` (domain, adapters, persistence, API), `client/` (React), `tests/`, `config/` |
| **`specs/`** | Product spec (`spec/`), methodology docs, `sprints.yaml`, `tasks.yaml` |
| **`docs/`** | Architecture and module templates (if used) |
| **`.cursor/rules/`** | Project and coding rules applied when editing in Cursor |

For how this repo relates to portable scaffolding (rules, task schema) and starting new projects, see **PORTABLE-VS-PROJECT.md** and **HOW-TO-WORK.md**.
