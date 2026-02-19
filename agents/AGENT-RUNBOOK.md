# Agent Runbook: When and How to Use AI Agents

Guidance for using AI agents within this scaffolding: **when** to use them and **what** to ask.

---

## 0a. Draft a spec (from your app idea)

- **When**: You have a rough idea of your app but no written spec yet.
- **What**: Use `agents/prompts/SPEC-DRAFTING-PROMPT.md`. Paste your app idea; Cursor drafts a full spec (goals, scope, tech stack, modules, API, layout, success criteria) following `specs/spec/SPEC-TEMPLATE.md`.
- **Then**: Save the output to `specs/spec/product.md` (or similar); edit as needed. Then use **0b** to get sprints and tasks.

---

## 0b. From specification to sprints and tasks (YAML)

- **When**: You have a written spec and need a first draft of the plan.
- **What**: Use `agents/prompts/SPEC-TO-YAML-PROMPT.md`. Paste your spec; Cursor outputs draft `specs/sprints.yaml` and `specs/tasks.yaml`.
- **Then**: Put the output into `specs/sprints.yaml` and `specs/tasks.yaml`; validate dependencies (no cycles); refine as needed.

---

## 1. Estimation

- **When**: Before committing to a sprint or work package; when scope changes.
- **What**: Use `agents/estimation/HISTORICAL-CONTEXT-TEMPLATE.md` + `ESTIMATION-PROMPT.md`.
- **Rule**: Always bring **historical resource** (e.g. 3 people, 2 months) before asking for agentic estimate (e.g. 1–2 days).

---

## 2. Module boundaries and independence

- **When**: After first draft of architecture and modules; when boundaries feel unclear or overlapping.
- **What**: Use `agents/prompts/MODULE-BOUNDARIES-PROMPTS.md` (prompts 1–5).
- **Goal**: End with a description of each module that is **independent** of others’ internals; **clear boundaries**; **no overlap**.

---

## 3. Going deeper (detail)

- **When**: A work package or module is still too coarse for tasks.
- **What**: Ask the agent to:
  - Break the module into **submodules** with clear interfaces.
  - Break the work package into **tasks** with dependencies and test refs.
  - Propose **interface contracts** (see `docs/modules/INTERFACE-CONTRACT-TEMPLATE.md`).

---

## 4. Tech stack

- **When**: Starting a new project or adding a new module with different stack.
- **What**: Use `framework/work-packages/TECH-STACK-DECISION.md`; ask the agent to fill options and criteria, or to suggest best stack given constraints (team, scale, compliance).

---

## 5. Task ordering and next task

- **When**: Planning a sprint or picking the next task.
- **What**: Provide the current task list and dependencies from **specs/sprints.yaml** and **specs/tasks.yaml**. Ask: "Given completed tasks [list], which tasks are unblocked? Suggest the next task to implement."

---

## 6. Test-first

- **When**: Starting any new task.
- **What**: Ask the agent: "For task [ID]: [description]. Propose the test(s) that should be written first (behavior and acceptance)." Then create those tests before implementation.

---

## Summary

| Need | Where | Always include |
|------|--------|----------------|
| Draft spec from idea | `agents/prompts/SPEC-DRAFTING-PROMPT.md` | Your app idea / description |
| Spec → YAML | `agents/prompts/SPEC-TO-YAML-PROMPT.md` | Your full spec text |
| Estimate | `agents/estimation/` | Historical context |
| Module boundaries | `agents/prompts/MODULE-BOUNDARIES-PROMPTS.md` | Current module list / architecture |
| Deeper breakdown | Same + TASK-SCHEMA, WP template | Scope and constraints |
| Stack choice | `framework/work-packages/TECH-STACK-DECISION.md` | Constraints, scale, team |
| Next task | `specs/sprints.yaml`, `specs/tasks.yaml` | Completed tasks, dependency graph |
| Test first | Task in `specs/tasks.yaml` | Task ID, description, test_ref |
