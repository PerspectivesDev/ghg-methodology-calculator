# Sprint Schema

A **sprint** is a time-boxed work package (conventionally ~2 weeks). One sprint = one work package.

## Schema (YAML or JSON)

```yaml
sprint:
  id: string              # e.g. "D2", "B3"
  track: string           # A|B|C|D|E|F or project-specific
  name: string            # Short name
  work_package_ref: string # Optional; link to work package id
  duration_weeks: number  # Typically 2
  tasks: string[]         # Task IDs in dependency order
  goal: string            # One sentence deliverable
  status: draft|active|done
```

## Example

```yaml
sprint:
  id: D1
  track: D
  name: Task and dependency model
  work_package_ref: WP-D1
  duration_weeks: 2
  tasks: [D1.1, D1.2, D1.3]
  goal: "Task schema, dependency validation, test-first requirement documented."
  status: draft
```

## Rules

- Every task in `tasks` belongs to this sprint.
- Task order in `tasks` must respect dependencies (dependents after their dependencies).
- Sprint is "done" when all tasks are done (tests pass, 95% coverage where applicable).
