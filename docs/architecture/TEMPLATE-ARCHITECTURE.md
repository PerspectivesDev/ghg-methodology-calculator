# Architecture: [Product / Project Name]

> High-level architecture. Module boundaries and interfaces are detailed in `docs/modules/`.

## 1. Context

- **What this system does**: (2–3 sentences.)
- **Key external systems**: (APIs, databases, queues, etc.)

## 2. Building Blocks (Modules)

| Module | Responsibility | Communicates with |
|--------|----------------|-------------------|
| (Name) | (One sentence) | (Other modules / externals) |
| …      | …              | … |

## 3. Diagram (optional)

- Use a simple diagram (e.g. boxes and arrows) to show modules and data/control flow.
- Keep it high-level; no implementation details.

## 4. Data & Control Flow

- **Entry points**: (API, UI, cron, events.)
- **Main flows**: (e.g. "Request → Module A → Module B → Response".)

## 5. Technology Choices (summary)

- **Runtime / framework**: (e.g. Node, Python, .NET.)
- **Data store**: (e.g. PostgreSQL, Redis.)
- **Other**: (queues, caches, etc.)
- **Rationale**: (Brief; full rationale in work package or ADR.)

## 6. Module Boundaries

- Each module has a **single responsibility** and **explicit interfaces**.
- Details: see `docs/modules/` (one file per module or boundary checklist).

## 7. Non-Functional

- **Security**: (Auth, secrets, compliance.)
- **Scalability / performance**: (Any known requirements.)
- **Observability**: (Logs, metrics, tracing.)

---

*Next: Define each module in `docs/modules/` with clear boundaries and interfaces.*
