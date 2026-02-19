# Prompt: From specification to sprints and tasks YAML

Use this when you have a **written specification** and want a first draft of `specs/sprints.yaml` and `specs/tasks.yaml`.

---

## Prompt (copy and customize)

```
I have a project specification below. Generate a first draft of:

1. **specs/sprints.yaml** — list of sprints. Each sprint:
   - id (e.g. S1, S2), track, name, work_package_ref, duration_weeks (typically 2), tasks (list of task IDs), goal, status (draft).
2. **specs/tasks.yaml** — list of tasks. Each task:
   - id (e.g. S1.1, S1.2), sprint_id, title, depends_on (list of task IDs, no cycles), test_ref (what test defines success), description, definition_of_done (include "Test(s) pass" and "95% coverage maintained"), status (todo).

Rules:
- One sprint ≈ one work package (~2 weeks conventional effort).
- Tasks must have no circular dependencies.
- Every task: create test first, then implement. So test_ref must be concrete (e.g. "Tests for API X" or path).
- Order tasks so dependents come after their dependencies.

**Specification:**
[PASTE YOUR SPEC HERE]
```

---

## After the draft

- Put the generated content into `specs/sprints.yaml` and `specs/tasks.yaml`.
- Validate: no circular `depends_on`; every task ID in `sprints.tasks` exists in `tasks.yaml`; every `sprint_id` in tasks exists in sprints.
- Refine with the agent: "Task S2.3 is too large, split into S2.3a and S2.3b with dependencies."
