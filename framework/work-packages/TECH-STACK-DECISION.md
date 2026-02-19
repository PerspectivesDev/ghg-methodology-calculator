# Tech Stack Decision Template

> Use this when choosing or documenting tech stack for a project. Copy and fill per project.

## 1. Context

- **Project**: (Name)
- **Constraints**: (Compliance, existing systems, team skills, timeline.)
- **Scale / NFRs**: (Expected load, latency, availability.)

## 2. Options (shortlist)

| Option | Runtime/Framework | Data | Key pros | Key cons |
|--------|-------------------|------|----------|----------|
| A      | (e.g. Node/TS)    | (e.g. PostgreSQL) | … | … |
| B      | (e.g. Python)    | (e.g. PostgreSQL) | … | … |
| C      | …                 | …    | …        | … |

## 3. Criteria (weight optional)

- Performance / scalability
- Team familiarity
- Ecosystem and libraries
- Hiring / maintainability
- Cost (infra, licensing)
- Security / compliance

## 4. Decision

- **Chosen stack**: (Option + versions.)
- **Rationale**: (2–3 sentences. Link ADR if needed.)

## 5. Per-module stack (if mixed)

| Module | Stack / framework | Note |
|--------|-------------------|------|
| (Name) | (Tech)            | (e.g. "Same as main" or "Python for ML") |
| …      | …                 | … |

---

*Next: Break each module into work packages; each WP becomes a sprint. Use `WORK-PACKAGE-TEMPLATE.md`.*
