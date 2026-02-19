# Pre-development checklist — GHG Methodology Calculator

Complete before starting **S1.1** (project setup and test harness). When all items are done, development can begin from task S1.1.

---

## Specs and methodology docs

| Item | Status | Notes |
|------|--------|--------|
| Product spec complete | ✓ | `specs/spec/product.md` — goals, scope, methodology data model, API, modules, layout |
| Korea required inputs doc | ✓ | `specs/spec/methodologies/KOREA-REQUIRED-INPUTS.md` |
| India required inputs doc | ✓ | `specs/spec/methodologies/INDIA-GHCI-REQUIRED-INPUTS.md` — structure and mapping; equation symbols to align with PDF pages 19–23 during S3.2 |
| Methodology README | ✓ | `specs/spec/methodologies/README.md` — points to both methodology docs |
| product.md references India doc | ✓ | User inputs section and Methodology Data Model reference INDIA-GHCI-REQUIRED-INPUTS.md |

---

## Plan (YAML)

| Item | Status | Notes |
|------|--------|--------|
| Sprints defined | ✓ | `specs/sprints.yaml` — S1–S7, goals, task lists |
| Tasks defined | ✓ | `specs/tasks.yaml` — S1.1–S7.3, depends_on, test_ref, definition_of_done |
| No circular dependencies | ✓ | Task dependency graph is acyclic |
| First task identified | ✓ | S1.1 — Project setup and test harness |

---

## Assumptions and open questions

| Item | Status | Notes |
|------|--------|--------|
| Assumptions documented | ✓ | `specs/assumptions-and-open-questions.md` — deliverable, MVP scope, Korea placeholder, India alignment |
| Open questions listed | ✓ | Same doc; copied from product.md §8; to be resolved with GIZ / team |

---

## Project docs and config

| Item | Status | Notes |
|------|--------|--------|
| Root README project section | ✓ | Identifies app, links to spec, tasks, assumptions, first task |
| .env.example | ✓ | DB_PATH, PORT placeholders; no secrets |
| Pre-development checklist | ✓ | This file |

---

## Optional (before or during build)

| Item | Notes |
|------|--------|
| India PDF pages 19–23 | When implementing S3.2, align equation symbols and formula refs in the India adapter and optionally in INDIA-GHCI-REQUIRED-INPUTS.md |
| Korea Attached Form 2 | When available, add or replace Basic Data Provided in factor store (placeholder set is acceptable for MVP) |
| GIZ decisions | Resolve deliverable format, final 4–5 methodologies, and other open questions as needed; update assumptions-and-open-questions.md |

---

## Ready to start

When the table sections above are complete (all ✓), start with **S1.1** in `specs/tasks.yaml`: create the test from `test_ref`, then implement project setup and test harness (Node 20, TypeScript, Vitest, coverage, layout per spec).
