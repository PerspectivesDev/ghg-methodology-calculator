# QA Review: Tasks S1.1, S1.2, S1.3, S1.4

Quality assurance review of the Foundation sprint tasks against current software architecture and design standards.

## Summary

| Task   | Scope                    | Verdict | Notes |
|--------|---------------------------|---------|--------|
| **S1.1** | Project setup, test harness | ✅ Pass | Vitest, coverage 95%, layout, docs |
| **S1.2** | Domain model (canonical inputs, methodology result) | ✅ Pass | Pure domain; no persistence |
| **S1.3** | Persistence (SQLite schema, repository) | ✅ Pass | Schema separated; repository refactored with row mappers |
| **S1.4** | Project API (POST/GET/PUT /api/projects) | ✅ Pass | Validation stub, 400/404, error handler tested; DRY validation |

---

## S1.1 — Project setup and test harness

- **Vitest**: Configured with Node env, 95% coverage thresholds (lines, statements, branches, functions).
- **Layout**: `src/`, `tests/`, `config/` (vitest.config.ts) align with spec.
- **Documentation**: `docs/COVERAGE.md` states 95% target; `npm run coverage` generates report.
- **Tests**: Setup tests verify config, layout, and coverage script.

**No issues.**

---

## S1.2 — Domain model (canonical inputs, methodology result)

- **Separation**: Domain lives in `src/domain/`; no imports from persistence or infrastructure. Single responsibility.
- **Canonical inputs**: Types cover India and Korea (feedstock, electricity, fuels, steam, input materials, co-product allocation, fugitive, CCS). Optional fields for Korea clearly typed.
- **Methodology result**: `MethodologyResult` with breakdown, total, unit, warnings, errors; `createMethodologyResult` factory; value objects (`IndiaBreakdown`, `KoreaBreakdown`).
- **Immutability**: Interfaces and factory support immutable usage; no mutable shared state.
- **Tests**: `tests/domain/canonical-inputs.test.ts` and `methodology-result.test.ts` cover types and factory.

**No issues.**

---

## S1.3 — Persistence layer

### Database layer separation

- **Schema**: `src/persistence/schema.ts` is the single source of truth for table definitions (`projects`, `runs`, `audit`). No business logic.
- **Repository**: `src/persistence/project-repository.ts` handles only persistence: CRUD and row ↔ entity mapping. Depends on domain types; domain does not depend on persistence.
- **Layering**: Application/API (future) will call repository; repository uses schema and domain types. Clear separation.

### Refinements applied (from this QA)

1. **Explicit row types**: `ProjectRow`, `RunRow`, `AuditRow` interfaces document DB shape and remove repeated inline `as` casts.
2. **Row → entity mappers**: `rowToProject(row)` and `rowToRun(runRow, auditPayload)` centralize mapping logic (DRY, single place to change if schema or domain changes).
3. **Shared test fixture**: `tests/fixtures/canonical-inputs.ts` provides `minimalCanonicalInputs()` used by persistence tests, avoiding duplicate minimal input definitions (DRY).

### Dependency inversion (optional future improvement)

- The repository currently takes `Database.Database` (better-sqlite3) directly. Tests use in-memory SQLite, which is standard and works well.
- For stricter DIP, you could introduce a small interface (e.g. `PrepareRun`, `Get`, `All`) implemented by better-sqlite3 and by a fake in tests. **Recommendation**: Only add this if you need to test repository logic without a real DB (e.g. for performance or isolation). Current approach is acceptable.

### Repetition and clarity

- JSON parse/stringify is centralized via `parseJson<T>()`; no duplicated try/catch logic.
- Timestamps via `now()`; UUIDs via `randomUUID()`.
- No duplicated mapping code after introducing `rowToProject` and `rowToRun`.

---

## S1.4 — Project API (POST/GET/PUT /api/projects)

### Architecture and layering

- **App layer**: `src/app.ts` creates the Express app; depends only on `ProjectRepository` (injected) and validation. No direct DB or domain logic in handlers.
- **Validation layer**: `src/validation/project-body.ts` validates request bodies only (type/shape). Full validation (required fields, units, cross-field) is deferred to S2.2 per task.
- **Flow**: Request → express.json() → route handler → validate body → repository → JSON response. 400 on validation failure, 404 when resource missing.

### Contract

- **POST /api/projects**: Body `name` (required, non-empty string), optional `inputs` (object), optional `factorOverrides` (object). Returns 201 + project JSON.
- **GET /api/projects/:id**: Returns 200 + project JSON or 404.
- **PUT /api/projects/:id**: Body optional `inputs`, `factorOverrides`, `selectedMethodologies` (array of strings). Partial update; 200 + project or 404.
- **Errors**: 400 with `{ errors: string[] }` for validation or invalid JSON; 500 with same shape for unhandled errors.

### Refinements applied (from this QA)

1. **DRY validation**: Extracted `requireBodyObject(body)` so “body required” and “body must be JSON object” are validated in one place for both create and update.
2. **Error handler testability**: `createErrorHandler()` exported and unit-tested so the 500 path is covered (SyntaxError → 400, other → 500). Full coverage for `app.ts`.

### Tests

- **API**: `tests/api/projects.test.ts` — create, get, update, 400 for missing/invalid name, invalid inputs/factorOverrides/selectedMethodologies, 404 for missing project, invalid JSON → 400.
- **Validation**: `tests/validation/project-body.test.ts` — null/undefined/array body, trimmed name, empty object for PUT, inputs null.
- **Error handler**: `tests/app/error-handler.test.ts` — 400 for SyntaxError, 500 for other errors.

### Standards

- Single responsibility: app (HTTP), validation (bodies), repository (persistence).
- Dependency injection: repository passed into `createApp`; tests use in-memory SQLite.
- Fail fast: validation at boundary; structured errors returned.
- No duplication: body guard logic shared via `requireBodyObject`.

---

## Standards checklist

| Criterion | S1.1 | S1.2 | S1.3 | S1.4 |
|-----------|------|------|------|------|
| Single responsibility | ✅ | ✅ | ✅ (schema vs repository) | ✅ (app / validation / repo) |
| Separation of concerns (domain vs data) | N/A | ✅ | ✅ | ✅ |
| DRY (no repetitive code) | ✅ | ✅ | ✅ (after refactor) | ✅ (requireBodyObject, error handler) |
| Explicit over implicit | ✅ | ✅ | ✅ (row types, mappers) | ✅ (validation result, error handler) |
| Dependency direction (domain independent) | N/A | ✅ | ✅ (persistence → domain) | ✅ (app → validation, repo) |
| Test coverage 95% | ✅ | ✅ | ✅ | ✅ (100%) |
| Clean naming, no magic | ✅ | ✅ | ✅ | ✅ |

---

## Conclusion

Tasks S1.1–S1.4 are implemented in line with current software development standards. The database layer is separated and clean; domain is free of persistence; the API layer is thin and delegates to validation and repository. Refinements applied: explicit row types and mappers (S1.3), shared test fixture (S1.3), DRY body validation and testable error handler (S1.4).
