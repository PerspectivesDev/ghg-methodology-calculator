# Module → Work Package Breakdown

How to go from **modules** (with clear boundaries) to **work packages** (sprints).

## 1. Start from modules

- Use `docs/modules/` and the boundary checklist.
- Each module has: responsibility, interfaces, no overlap.

## 2. Submodules (optional)

- If a module is large, split into **submodules**.
- Apply the same rules: clear boundary, explicit interfaces, no overlap.
- Check independence (testable alone, describable without other modules’ internals).

## 3. Work packages per (sub)module

- **Option A — by layer**: e.g. "Module A — API", "Module A — persistence", "Module A — domain".
- **Option B — by feature**: e.g. "Module A — feature X", "Module A — feature Y".
- **Option C — vertical slice**: e.g. "Module A — slice: create resource end-to-end".

Choose so that:
- One WP is shippable or testable.
- One WP ≈ one sprint (~2 weeks).
- Dependencies between WPs are clear (e.g. API WP before integration WP).

## 4. WP → Sprint

- Each work package = one sprint.
- Sprint backlog = tasks from that WP (ordered by dependency).
- Task-level: test first, then implement; 95% coverage.

## 5. Example (sketch)

| Module   | Submodule | Work package     | Sprint | Tasks   |
|----------|-----------|------------------|--------|---------|
| Auth     | —         | WP-Auth-API      | S1     | A1.1…   |
| Auth     | —         | WP-Auth-Storage  | S2     | A2.1…   |
| Billing  | —         | WP-Billing-Core  | S3     | B1.1…   |

Dependencies: S2 may depend on S1; S3 may depend on S1. No cycles.

---

*Use `WORK-PACKAGE-TEMPLATE.md` for each WP and `framework/sprints/SPRINT-SCHEMA.md` for each sprint.*
