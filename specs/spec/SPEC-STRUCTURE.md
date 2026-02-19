# How to structure the spec (one file vs many)

## When one file is enough

- **Small or medium app**, single author or small team, spec fits in a few pages → keep everything in **`product.md`** (or `spec.md`). Easy to read, easy to paste into the spec→YAML prompt.
- **Stable scope** — one file is simpler to maintain and to keep in sync with the YAML.

**Use one file** until the spec is long (e.g. 500+ lines), has clearly separate concerns (e.g. many modules, many APIs), or different people own different sections.

---

## When to split into multiple files

- **Long spec** — hard to navigate or to paste into a single prompt.
- **Many modules or domains** — each module or domain can have its own file.
- **Different owners** — e.g. backend vs frontend, or per bounded context.
- **APIs or contracts are large** — separate file for API/contracts so they can be versioned or shared.

---

## Suggested multi-file structure

Pick one of these patterns (or a mix). Keep **one entry point** (e.g. `product.md` or `README.md`) that summarizes and links to the rest so the spec→YAML prompt has a single “start here.”

### Option A — By concern (good for many apps)

```
specs/spec/
  product.md          # Overview: goals, scope, success criteria, links below
  tech-stack.md       # Runtime, data, tests, tooling
  modules.md          # Module list and one-line responsibility; optional short boundaries
  api.md              # API / contracts (endpoints, request/response, errors)
  layout.md           # Project layout (folders, tests, config)
  open-questions.md  # Optional: open questions and decisions
```

**product.md** stays short: goals, in/out of scope, “Tech stack: see tech-stack.md”, “Modules: see modules.md”, “API: see api.md”, “Layout: see layout.md”, success criteria. For spec→YAML, paste **product.md + tech-stack.md + modules.md** (and api.md if the plan depends on it).

### Option B — By domain or bounded context

```
specs/spec/
  product.md          # Overview, goals, scope, success criteria
  domain-auth.md      # Auth module / bounded context
  domain-billing.md   # Billing module
  domain-core.md      # Core product features
  shared-api.md       # Shared API contracts or integration
```

Use when you have clear domains or DDD bounded contexts. **product.md** lists them and links; each domain file has its own scope, modules, and contracts. For spec→YAML, paste **product.md** plus the domain files that are in scope for the current plan.

### Option C — Single file with sections (simplest)

```
specs/spec/
  product.md          # Everything: goals, scope, tech, modules, API, layout (SPEC-TEMPLATE)
```

One file, sections as in SPEC-TEMPLATE. No links; everything is in one place. Best for small apps.

---

## Rules of thumb

- **One entry point**: Always have one file (e.g. `product.md`) that gives the big picture and, if you split, points to the rest. The spec→YAML prompt can take “product.md + these other files” as the spec.
- **Paste order**: When using the spec→YAML prompt with multiple files, paste in order: overview first, then tech, modules, API, so the AI sees context before detail.
- **Keep YAML in sync**: When you split the spec, updating one file (e.g. modules.md) should still lead to updating only the **affected** parts of sprints/tasks (see runbook: “When the spec changes”). You don’t need to regenerate everything.
- **Naming**: Use clear names (`product.md`, `modules.md`, `api.md`) so anyone (and the AI) knows what to open. Avoid deep nesting (e.g. `spec/domain/auth.md` is fine; `spec/domain/auth/readme.md` is usually unnecessary).

---

## Summary

| Spec size / complexity | Structure |
|------------------------|-----------|
| Small, single author   | One file: **product.md** (full SPEC-TEMPLATE). |
| Medium, several modules/APIs | **product.md** (overview + links) + **tech-stack.md**, **modules.md**, **api.md**, **layout.md**. |
| Large, multiple domains | **product.md** (overview) + one file per domain or bounded context. |

Start with one file; split when the spec gets long or when separate concerns (tech, modules, API) would be easier to maintain separately.
