# How to work from this base

Step-by-step guide to build **any** application using this scaffolding. No tech or app is assumed—you define the stack and product in your spec.

---

## Build an app in 3 steps (your understanding, refined)

1. **Add your spec**  
   Put your product specification in `specs/spec/` (e.g. copy `SPEC-TEMPLATE.md` and fill it for your app).

2. **Get sprints and tasks from the spec**  
   Ask the AI (e.g. in Cursor) using the prompt in `agents/prompts/SPEC-TO-YAML-PROMPT.md`: paste your spec, get a first draft of `specs/sprints.yaml` and `specs/tasks.yaml`. Paste the output into those files and tweak if needed.

3. **Work through the tasks (you + AI)**  
   You don’t “run” an agent that builds the whole app in one go. You **pick the next task** from `specs/tasks.yaml`, then for that task:
   - Create the test from `test_ref` (you or AI can write it),
   - Implement until tests pass (you or AI can implement),
   - Mark the task done and move to the next.
   Repeat until all tasks are done. Cursor rules (SOLID, test-first, 95% coverage) apply while you and the AI work. So: **spec → AI generates tasks/sprints → you (+ AI) build the app task by task.**

---

## Where to start (order of work)

1. **Add your specification**  
   Put your product spec in `specs/spec/` (e.g. copy `SPEC-TEMPLATE.md` and fill it). Describe goals, scope, tech stack, modules, and project layout for **your** app.

2. **Plan is in YAML**  
   Fill `specs/sprints.yaml` and `specs/tasks.yaml` from your spec (by hand or with `agents/prompts/SPEC-TO-YAML-PROMPT.md`). Implement in **task order**; for each task, **create the test first** (see `test_ref`), then implement until tests pass.

3. **Pick the next task**  
   Open `specs/tasks.yaml`, find a task whose `depends_on` are all done, set its `status: in_progress`, create the test from `test_ref`, then implement. When done, set `status: done` and move to the next.

4. **Where your code lives**  
   Define this in your spec (e.g. `src/`, `app/`, `backend/`, `frontend/`—whatever your stack and structure require). This repo does not assume any layout.

5. **Cursor rules**  
   They apply automatically: SWE principles (SOLID, DRY, KISS, etc.), test-first, 95% coverage, **vibe coding**, **Cursor/agentic** (plan, context, prompts), and **security awareness**. Add stack-specific rules under `.cursor/rules/` with `globs` if you want.

---

## Must-have (do not remove)

| Item | Why |
|------|-----|
| **`.cursor/rules/`** | Shared standards (SOLID, YAGNI, test-first, coverage). Keep all. |
| **`specs/spec/`** | Your product spec. Use `SPEC-TEMPLATE.md` or your own structure. |
| **`specs/sprints.yaml`** | Canonical list of sprints. Implementation follows this. |
| **`specs/tasks.yaml`** | Canonical list of tasks with dependencies and `test_ref`. Source of truth for “what to do next”. |
| **`framework/sprints/`** and **`framework/tasks/`** | Schema and workflow docs. Reference when editing YAML or adding tasks. |
| **`agents/prompts/SPEC-TO-YAML-PROMPT.md`** | Use when you have a new spec and want a first draft of sprints/tasks. |
| **README.md**, **PORTABLE-VS-PROJECT.md** | Explain the repo and what’s portable vs project-specific. |

---

## Optional / can remove or skip for small apps

| Item | Suggestion |
|------|------------|
| **PLAN.md** | Meta-plan for the scaffolding itself. Keep as reference or remove if you only care about one app. |
| **docs/prd/**, **docs/architecture/**, **docs/modules/** | Templates for large products. Use when you need formal PRD/architecture; otherwise your spec in `specs/spec/` is enough. |
| **framework/work-packages/** | Useful for breaking down large modules. Reference when needed. |
| **agents/estimation/** | Use when you need estimates. Optional for small apps. |
| **agents/prompts/MODULE-BOUNDARIES-PROMPTS.md** | Use when you have many modules and need clear boundaries. |

---

Start with the first task in `specs/tasks.yaml` (e.g. S1.1: project setup and test harness). Follow the test-first workflow in `framework/tasks/TEST-FIRST-WORKFLOW.md`.
