# Framework — schema and process for planning (portable)

This folder defines the **shape and rules** for sprints, tasks, and work packages. It does **not** hold your project’s data (that goes in **specs/**). It tells you *what fields exist*, *what they mean*, and *how to run the process* (e.g. test-first).

## Why framework exists (vs specs vs agents vs docs)

| Folder | Purpose |
|--------|--------|
| **specs/** | **Your** project’s plan: actual `sprints.yaml` and `tasks.yaml` plus your spec. The *data*. |
| **agents/** | **Prompts and runbook** for asking the AI (draft spec, spec→YAML, etc.). |
| **docs/** | **Templates** for PRD, architecture, modules. Structure for formal docs. |
| **framework/** | **Schema and process**: what a sprint/task looks like, what fields are required, and how to execute (test-first, work packages). The *rules and format*. |

So: **specs** = your plan and spec. **framework** = the definition of that plan (schema + workflow). You edit **specs/sprints.yaml** and **specs/tasks.yaml**; you **reference** framework when you need to know the allowed fields or the process.

## What’s in framework

- **sprints/** — **SPRINT-SCHEMA.md**: fields for a sprint (id, track, name, tasks, goal, status, etc.). Reference when editing `specs/sprints.yaml` or when the AI generates sprints.
- **tasks/** — **TASK-SCHEMA.md**: fields for a task (id, sprint_id, depends_on, test_ref, definition_of_done, etc.). **TEST-FIRST-WORKFLOW.md**: steps for each task (create test first, then implement, then mark done). Reference when editing `specs/tasks.yaml` or when implementing.
- **work-packages/** — **WORK-PACKAGE-TEMPLATE.md**: what a work package is and how to describe it. **TECH-STACK-DECISION.md**: how to choose and document tech stack. **MODULE-TO-WP-BREAKDOWN.md**: how to go from modules to work packages to sprints. Use when planning or when the spec has many modules.

## When you need framework

- **Always, indirectly**: Your **specs/sprints.yaml** and **specs/tasks.yaml** follow the schema defined here. The **spec→YAML** prompt and the **task-and-sprint-conventions** Cursor rule refer to this schema.
- **When editing YAML**: If you’re not sure what fields a sprint or task should have, open **SPRINT-SCHEMA.md** or **TASK-SCHEMA.md**.
- **When implementing**: Follow **TEST-FIRST-WORKFLOW.md** for each task (test first, then implement).
- **When planning a large app**: Use **work-packages/** to break modules into work packages and to document tech stack choices.

## Summary

**framework** = portable schema and process for sprints, tasks, and work packages. **specs** = your actual plan (YAML + spec). You need framework to know the *format and rules*; you fill the *content* in specs.
