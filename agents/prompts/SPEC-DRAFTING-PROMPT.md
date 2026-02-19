# Prompt: Draft a product specification from your idea

Use this in Cursor when you have a **rough idea** of your app and want a first **draft spec** that you can put in `specs/spec/`. The structure follows `specs/spec/SPEC-TEMPLATE.md`.

---

## Prompt (copy and customize)

```
Draft a product specification for my application. Use the structure below and fill each section based on my description. Output markdown I can save as specs/spec/product.md (or similar).

Structure (follow this):
1. **Goals** — Primary goal (one sentence), secondary goals (bullet list).
2. **Scope** — In scope (features/capabilities), Out of scope.
3. **Tech stack** — Runtime/framework, data/persistence, tests (and coverage target), other (APIs, frontend, etc.). Pick a concrete stack that fits the app.
4. **Modules** — List modules with one-line responsibility each. Keep boundaries clear.
5. **API / contracts** — Main endpoints or interfaces (method, path/name, request/response, errors) if applicable.
6. **Project layout** — Where app code lives (e.g. src/, app/), where tests live, config/env. Match the tech stack.
7. **Success criteria** — Measurable or observable criteria.
8. **Open questions** — Anything to decide or clarify.

**My app idea / description:**
[DESCRIBE YOUR APP HERE: e.g. "A web API for X with auth and CRUD; I'm considering [stack]." or "A mobile app for Y with sync." — any app, any stack.]
```

---

## After the draft

- Save the output to `specs/spec/product.md` (or another file in `specs/spec/`).
- Edit as needed (tech choices, scope, modules).
- **Next step**: Use `SPEC-TO-YAML-PROMPT.md` — paste this spec and get `specs/sprints.yaml` and `specs/tasks.yaml`.
