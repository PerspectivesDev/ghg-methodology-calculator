# Docs — templates and reference (portable)

This folder holds **reusable templates and reference** for writing formal product, architecture, and module docs. It is **not** where you put your app’s spec content (that goes in **specs/spec/**). It’s the *structure* you can use when you want more than a single spec file.

## Why docs exists (vs specs vs agents)

| Folder | Purpose |
|--------|--------|
| **specs/spec/** | **Your** product spec for this app (e.g. product.md). You write or paste content here. |
| **agents/** | **Prompts and runbook** for asking the AI (spec drafting, spec→YAML, etc.). |
| **docs/** | **Templates and checklists** for PRD, architecture, and modules. Copy or reference when you want that structure. No app-specific content. |

## What’s in docs

- **prd/** — PRD template (goals, scope, success criteria). Use when you need a formal, stakeholder-facing product doc.
- **architecture/** — Architecture template (context, modules, data flow, tech). Use when you want a separate architecture doc.
- **modules/** — Module definition template, boundary checklist, interface contract template. Use when you define modules with clear boundaries and contracts.

## When you need docs

- **Small/medium app**: Often you don’t. **specs/spec/product.md** (from SPEC-TEMPLATE) is enough. The spec can include goals, scope, tech, modules, and layout in one place.
- **Larger app or handoff**: When you want a **full PRD**, a **separate architecture doc**, or **per-module docs** (responsibility, boundaries, interfaces), use the templates here. Copy them into your project (e.g. into specs/spec/ or a project `docs/` folder) and fill them. The **agents/prompts/MODULE-BOUNDARIES-PROMPTS.md** can help refine boundaries; the **docs/modules/** templates define the format.

## Summary

**docs** = portable templates and reference for *how* to write PRD, architecture, and module docs. **specs/spec** = where you actually write *your* spec. Use docs when you want that extra structure; otherwise the spec in specs/spec is enough.
