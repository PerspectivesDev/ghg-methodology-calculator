# Agent Runbook: When and How to Use AI Agents

Guidance for using AI within this scaffolding: **when** to use which prompt and **what** to ask. In Cursor you have **one AI**; "agents" here means **different prompts for different jobs**, not separate AI processes.

---

## How to use: one "agent" per job (recommended)

You don't have separate Agent A and Agent B. You get **focused behavior** by using **one conversation per major step** and the right prompt:

| Step | Conversation | Prompt / ask |
|------|--------------|---------------|
| **Build specification** | New chat #1 | Copy prompt from `prompts/SPEC-DRAFTING-PROMPT.md`, paste your app idea. Save output to `specs/spec/product.md`. |
| **Build tasks and sprints** | New chat #2 | Copy prompt from `prompts/SPEC-TO-YAML-PROMPT.md`, paste your spec (e.g. contents of `specs/spec/product.md`). Save output to `specs/sprints.yaml` and `specs/tasks.yaml`. |
| **Implement tasks** | New chat or Composer per task | "Implement task S1.1 from specs/tasks.yaml" or "Write the test for S1.2 first, then implement." Use `specs/tasks.yaml` as context. |

**Why separate conversations?** Each step has a clear deliverable and its own context. A spec-drafting chat can get long; starting a **new chat for spec→YAML** keeps the AI focused on the spec text and the YAML format, not the earlier brainstorming. Same for implementation: a fresh chat (or Composer) per task keeps context clean and avoids mixing spec/task/implementation talk.

**Alternative:** You can run spec and spec→YAML in the **same** chat (run spec prompt, save output, then run spec→YAML prompt with that output). Use separate chats when the thread is long or you want a clear "spec only" vs "plan only" separation.

---

## When to use separate conversations ("multi-agent" in practice)

- **Separate chat for spec**: When you're only defining the product (goals, scope, stack, modules). Keeps spec discussion from mixing with task breakdown.
- **Separate chat for tasks/sprints**: When you're only turning a spec into YAML. Give the AI just the spec text and the SPEC-TO-YAML prompt; no prior chat about implementation.
- **Separate chat (or Composer) per implementation task**: When starting a new task from `specs/tasks.yaml`. Context = current task + codebase; no need for the whole spec or other tasks in the thread.
- **Same chat is fine when**: The thread is short, you're iterating on one thing (e.g. refining the spec with a few follow-ups), or you're doing small follow-up (e.g. "add two more tasks to the YAML").

**When are true separate agents (different systems) necessary?** When you need a fully autonomous pipeline (e.g. system A writes spec, system B reads it and writes tasks, system C implements) with no human in the loop. That's a different setup (custom orchestration, not Cursor). For our purpose—**you** plus Cursor, with spec → YAML → implement—**one AI, different prompts and conversations** is enough and follows current best practice.

---

## When the spec changes or you want to improve the app

**You do not start the whole process over.** Update only what changed.

| What changed | What to do |
|--------------|------------|
| **Spec** (goals, scope, new feature, more detail) | Edit `specs/spec/product.md` yourself, or ask the AI: "Update the spec with: [your change]. Keep the rest. Output the updated spec." Save the result. Then either update the YAML by hand (if the change is small) or ask the AI: "Given this change in the spec [paste the changed section or full spec], update only the affected parts of `specs/sprints.yaml` and `specs/tasks.yaml`—add or change tasks/sprints as needed, keep the rest." No need to regenerate everything. |
| **Only YAML** (add a task, split a task, reorder, add a sprint) | Edit `specs/sprints.yaml` and `specs/tasks.yaml` directly, or ask the AI: "Add a new task to do X, depending on S1.2" or "Split task S2.3 into S2.3a and S2.3b." Point the AI at the current YAML files. No need to touch the spec unless the change reflects a real scope change. |
| **Refine an existing task** (clearer description, better test_ref) | Edit the task in `specs/tasks.yaml` or ask the AI to update that task only. Then continue implementing. |
| **Big scope change** (e.g. new module, major pivot) | Update the spec first (edit or ask AI). Then either (a) ask the AI to update the YAML to reflect the new scope (add/remove tasks and sprints), or (b) run the SPEC-TO-YAML prompt again with the full updated spec and **merge** the new YAML with what you have (keep existing task IDs and status where they still apply, add new ones). You still don't redo implementation of already-done tasks. |

**Rule of thumb:** Change the **smallest** thing that needs to change—spec only, YAML only, or one task. Use the AI to draft the edit (e.g. "update spec with X" or "add tasks for Y to the YAML"); you review and save. Only regenerate from scratch if the product is effectively new.

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
