# AI Scaffolding Project — Master Plan

This project is the **base scaffolding** for all applications. It is tech-stack agnostic and provides: Cursor rules, PRDs, architecture and module definitions, sprint/task framework, work packages, and AI estimation guidance.

---

## 1. Principles

| Principle | Description |
|-----------|-------------|
| **Test-first** | Before starting any task: write the test(s) that define success, then implement. |
| **95% coverage** | Target 95% test coverage; tests are part of the definition of done. |
| **Clear module boundaries** | Modules are independent; interfaces are explicit; no overlap. |
| **Sprint = work package** | One sprint typically = one work package (~2 weeks conventional coder effort). |
| **AI estimation** | Use historical context (e.g. “3 people, 2 months”) to get AI estimates (e.g. 1–2 days with agentic coding). |

---

## 2. Tracks (High-Level)

Tracks are parallel streams of work. Dependencies between tracks are minimal.

| Track | Purpose | Delivers |
|-------|---------|----------|
| **A. Rules & Standards** | Cursor rules, coding standards, test-first and coverage rules | `.cursor/rules/`, standards docs |
| **B. PRD & Architecture** | PRD template, architecture doc, module definitions | Templates, examples |
| **C. Module & Boundaries** | Module boundary checklist, interfaces, independence criteria | Checklist, interface template |
| **D. Planning & Execution** | Sprints, tasks, dependencies, work packages | Sprint/task schema, examples |
| **E. Stack & Work Packages** | Tech stack guidance, work package breakdown by module | Stack decision doc, WP template |
| **F. Estimation & Agents** | AI estimation prompts, historical context format, agent usage | Prompts, runbooks |

---

## 3. Sprints (≈ Work Packages, ~2 Weeks Each)

Sprints are ordered; later sprints can depend on earlier ones. Each sprint is a work package.

### Track A — Rules & Standards

| Sprint | Name | Depends On | Deliverables |
|--------|------|------------|--------------|
| A1 | Core Cursor rules | — | General SWE rule, test-first rule, 95% coverage rule |
| A2 | Stack-specific rule stubs | A1 | Placeholder rules per stack (optional) |

### Track B — PRD & Architecture

| Sprint | Name | Depends On | Deliverables |
|--------|------|------------|--------------|
| B1 | PRD template | — | PRD template (goals, scope, out-of-scope, success) |
| B2 | Architecture template | B1 | Architecture doc template (high-level, modules) |
| B3 | Module definition template | B2 | Per-module: name, responsibility, boundaries, interfaces |

### Track C — Module & Boundaries

| Sprint | Name | Depends On | Deliverables |
|--------|------|------------|--------------|
| C1 | Boundary checklist | B3 | “Are module boundaries clear?” checklist |
| C2 | Interface contract template | C1 | Interface/API contract template (inputs, outputs, errors) |
| C3 | Independence & overlap check | C2 | Criteria + prompts for “no overlap, clear boundary” |

### Track D — Planning & Execution

| Sprint | Name | Depends On | Deliverables |
|--------|------|------------|--------------|
| D1 | Task & dependency model | — | Task schema, dependency rules, “task → test first” |
| D2 | Sprint schema & track mapping | D1 | Sprint = work package, link to tasks |
| D3 | Test-first workflow doc | D1, A1 | Step-by-step: create test → implement → 95% coverage |

### Track E — Stack & Work Packages

| Sprint | Name | Depends On | Deliverables |
|--------|------|------------|--------------|
| E1 | Tech stack decision template | B2 | How to choose stack; criteria; options table |
| E2 | Work package template | D2, B3 | WP = scope, module, tasks, acceptance, ~2 weeks |
| E3 | Module → work package breakdown | E2, C1 | How to split module into WPs; example breakdown |

### Track F — Estimation & Agents

| Sprint | Name | Depends On | Deliverables |
|--------|------|------------|--------------|
| F1 | Historical context format | — | Template: “X people, Y months” → inputs for AI |
| F2 | AI estimation prompt | F1 | Prompt: give history, get estimate (e.g. days with AI) |
| F3 | Agent usage runbook | — | When to use agents; “go deeper” prompts; module refinement |

---

## 4. Task-Level Breakdown (Track D as Example)

Tasks have dependencies. **Before starting a task: create the test(s) for that task.**

### Sprint D1 — Task & dependency model

| Task | Depends On | Test (create first) | Description |
|------|------------|---------------------|-------------|
| D1.1 | — | Schema validates task ID, deps, test ref | Define task schema (ID, title, deps, test ref) |
| D1.2 | D1.1 | Dependency graph has no cycles | Implement dependency validation (no cycles) |
| D1.3 | D1.2 | Every task links to “test created before impl” | Add “test-first” requirement to schema/docs |

### Sprint D2 — Sprint schema & track mapping

| Task | Depends On | Test (create first) | Description |
|------|------------|---------------------|-------------|
| D2.1 | D1.1 | Sprint schema has WP ref, task list | Define sprint schema (WP ref, tasks) |
| D2.2 | D2.1 | Each sprint maps to one track | Document track → sprint mapping |

---

## 5. Task Dependency Summary

- **A1** → A2  
- **B1** → B2 → B3  
- **B3** → C1 → C2 → C3  
- **D1** → D2 → D3; **A1** → D3  
- **B2** → E1; **D2**, **B3** → E2; **E2**, **C1** → E3  
- **F1** → F2; **F3** independent  

Use this to order work and to ask AI for “next available task” given completed set.

---

## 6. Module Boundaries (Summary)

- **Define modules** with clear responsibility; one place owns each concern.
- **Interfaces** between modules: explicit (API, events, files); document inputs, outputs, errors.
- **No overlap**: no behavior implemented in two modules; no shared mutable state.
- **Independence**: each module can be described and tested without referring to others’ internals.
- **Agents**: use “Are module boundaries clear?” and “Describe modules independent of each other” as prompts; iterate until boundaries and interfaces are stable.

---

## 7. Work Package ↔ Sprint

- **Work package** = shippable slice (feature, submodule, or vertical slice).  
- **Sprint** = time-box (~2 weeks conventional) executing one work package.  
- **Track** = theme (e.g. “Rules”, “Architecture”); each sprint belongs to one track.  
- Break **module → submodules** first; then **submodule → work packages**; then **work package = sprint** with tasks inside.

---

## 8. AI Estimation

- **Input**: Historical context (e.g. “3 people, 2 months for similar project”).  
- **Process**: Provide that context to the agent; ask for estimate in “days with agentic coding” (or story points).  
- **Output**: e.g. “1–2 days” for the same scope with AI-assisted development.  
- Always **attach or summarize historical resource** (prior to agentic coding) when asking for estimates.

---

## 9. Repository Layout (Scaffolding)

```
.cursor/rules/          # Cursor rules (general + optional stack-specific)
docs/
  prd/                  # PRD template + examples
  architecture/         # Architecture + module templates
  modules/              # Boundary checklist, interface template
framework/
  sprints/              # Sprint schema + examples
  tasks/                # Task schema + dependency rules
  work-packages/        # WP template + module→WP breakdown
agents/
  prompts/              # Estimation, boundary check, “go deeper”
  estimation/           # Historical context template + prompt
README.md               # How to use this scaffolding
PLAN.md                 # This file
```

---

## 10. How to Use This Plan

1. **New project**: Copy this repo (or use as template); fill PRD and architecture from `docs/`.  
2. **Define modules**: Use `docs/modules/` and agents to get clear boundaries and interfaces.  
3. **Choose stack**: Use `framework/work-packages/` and stack decision template.  
4. **Plan sprints**: One work package per sprint; break into tasks; for each task, create test first, then implement; aim 95% coverage.  
5. **Estimate**: Use `agents/estimation/` with historical context; run estimation prompt.  
6. **Cursor**: Ensure `.cursor/rules/` is active; follow test-first and coverage rules in this scaffolding.

---

*This PLAN.md is the single source of truth for tracks, sprints, tasks, and how they relate. Update it when you add or change work packages or dependencies.*
