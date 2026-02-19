# Step-by-step: Build your first app with this scaffolding

This guide says **what you do as the human** and **what you give the AI** at each step so the AI can help you build the app. Follow the steps in order.

---

## Before you start

- You have this repo open in **Cursor**.
- You have a rough idea of the app (e.g. "A .NET API with PostgreSQL for X" or "A React app that does Y").
- You’re ready to create a **new chat** for each major step (spec, then tasks/sprints, then implementation).

---

## Step 1 — You: Describe your app idea

**What you do**

1. Open a **new chat** in Cursor.
2. In 2–5 sentences, write:
   - **What** the app does (e.g. web API, dashboard, mobile app).
   - **Who** it’s for or what problem it solves.
   - **Tech** you want (e.g. .NET Core, React, PostgreSQL) if you know it.
   - **Main features** (e.g. auth, CRUD for X, reporting).

**What you give the AI**

Paste that short description into the chat and add:

> Use the prompt in `agents/prompts/SPEC-DRAFTING-PROMPT.md` to turn this into a full product spec. Output the spec in markdown I can save.

**What the AI needs from you**

- That one short **app idea** (as above). Nothing else is required for this step.

**After Step 1**

- Copy the AI’s spec output and save it as **`specs/spec/product.md`** (create the file if needed).
- Optionally tweak the spec (goals, scope, tech, modules). Then go to Step 2.

---

## Step 2 — You: Ask for tasks and sprints from the spec

**What you do**

1. Open a **new chat** in Cursor (so the AI focuses only on spec → YAML).
2. Open **`specs/spec/product.md`** and copy its full content (or, if you split the spec into several files, copy them in order: overview first, then modules/API/tech).
3. Open **`agents/prompts/SPEC-TO-YAML-PROMPT.md`**, copy the prompt block, and in the placeholder **[PASTE YOUR SPEC HERE]** paste the spec content.

**What you give the AI**

- The full **spec text** (product.md or product.md + other spec files).
- The **SPEC-TO-YAML prompt** with that spec pasted in.

**What the AI needs from you**

- The **complete spec** (so it can derive sprints and tasks).
- Nothing else for this step.

**After Step 2**

- Copy the AI’s **sprints** and **tasks** output.
- Paste them into **`specs/sprints.yaml`** and **`specs/tasks.yaml`** (replace or merge as needed).
- Check: no circular `depends_on`; every task ID in a sprint exists in tasks. Fix if needed. Then go to Step 3.

---

## Step 3 — You: Pick the first task and ask the AI to implement it

**What you do**

1. Open **`specs/tasks.yaml`** and find the **first task** (one with no dependencies, or whose `depends_on` are already done). Example: S1.1 “Project setup and test harness”.
2. Open a **new chat** or **Composer** and tell the AI what you want.

**What you give the AI**

- **Task ID and description** (e.g. copy from tasks.yaml).
- **Context**: “We’re implementing from specs/tasks.yaml. This project has no code yet / has code in [paths]. Tech stack: [from spec].”
- **Instruction**: e.g. “Implement task S1.1. Create the test from test_ref first, then implement until tests pass. Follow the test-first workflow in framework/tasks/TEST-FIRST-WORKFLOW.md.”

**What the AI needs from you**

- **Which task** (ID + short description or paste from tasks.yaml).
- **Tech stack** (from your spec: e.g. .NET Core, pytest, Jest).
- **Where code should live** (from your spec: e.g. `src/`, `backend/`, `frontend/`). If the spec doesn’t say, add one sentence (e.g. “Backend in `backend/`, frontend in `frontend/`”).

**After Step 3**

- Run tests and fix until the task’s definition of done is met (tests pass, 95% coverage if required).
- In **`specs/tasks.yaml`** set that task’s **`status: done`**.
- Repeat Step 3 for the **next** task (same or new chat), until all tasks are done.

---

## Step 4 — You: Repeat for each next task

**What you do**

1. In **`specs/tasks.yaml`** pick the next task whose **`depends_on`** are all **done**.
2. In chat or Composer: “Implement task [ID]. [Paste or summarize description and test_ref.] Test first, then implement. Stack and layout: [from spec].”

**What you give the AI (each time)**

- **Task ID** and **description** / **test_ref** from tasks.yaml.
- **Tech stack** and **project layout** (if not already clear from the codebase).
- For later tasks: you can add “Existing code: [paths or brief summary]” if it helps.

**What the AI needs from you**

- Same as Step 3: clear task, stack, and where code lives. For later tasks, the AI can read the repo; you only need to point at the task and any special constraints.

**After each task**

- Mark the task **done** in **`specs/tasks.yaml`**.
- Commit when you’re happy. Then pick the next task.

---

## Step 5 — You: If the spec or plan changes

**What you do**

- **Small change**: Edit **`specs/spec/product.md`** (or the relevant spec file), then either edit **`specs/sprints.yaml`** and **`specs/tasks.yaml`** yourself or ask the AI: “Given this change [paste], update only the affected parts of specs/sprints.yaml and specs/tasks.yaml.”
- **Add a feature**: Add it to the spec, then ask the AI to add or adjust tasks/sprints for that feature. Don’t start the whole process over; see **agents/AGENT-RUNBOOK.md** → “When the spec changes or you want to improve the app.”

**What you give the AI**

- The **changed spec** or the **new requirement**.
- Instruction to update **only** the affected parts of the YAML (or to add new tasks).

---

## Quick reference: what you provide at each step

| Step | You provide | AI produces |
|------|-------------|-------------|
| **1. Spec** | Short app idea (what, who, tech, main features) | Full product spec → you save as `specs/spec/product.md` |
| **2. Tasks/sprints** | Full spec (product.md or multi-file) + SPEC-TO-YAML prompt | Draft `sprints.yaml` and `tasks.yaml` → you save in `specs/` |
| **3. First task** | Task ID + description + tech stack + where code lives | Test(s) + implementation for that task |
| **4. Next tasks** | Task ID + description (+ context if needed) | Test(s) + implementation for each task |
| **5. Changes** | Changed spec or new requirement | Updated spec and/or updated YAML (only affected parts) |

---

## Where things live

- **Your spec** → `specs/spec/product.md` (or multiple files; see `specs/spec/SPEC-STRUCTURE.md`).
- **Your plan** → `specs/sprints.yaml`, `specs/tasks.yaml`.
- **Schema and workflow** → `framework/` (reference when editing YAML or implementing).
- **Prompts** → `agents/prompts/` (SPEC-DRAFTING, SPEC-TO-YAML); runbook → `agents/AGENT-RUNBOOK.md`.
- **Templates for formal docs** → `docs/` (optional; use when you want a full PRD or architecture doc).

You’re ready to build: do **Step 1** in a new chat with your app idea, then follow the steps above.
