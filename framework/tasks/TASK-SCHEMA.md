# Task Schema

A **task** is the smallest unit of work that has a test and a definition of done. **Test is created before implementation.**

## Schema (YAML or JSON)

```yaml
task:
  id: string              # Unique, e.g. "D1.1", "B2.3"
  sprint_id: string       # Sprint this task belongs to
  title: string           # Short title
  depends_on: string[]    # Task IDs that must be done first (no cycles)
  test_ref: string        # Path to test file(s) or description of test
  description: string     # What to do
  definition_of_done:
    - "Test(s) pass"
    - "95% coverage maintained (or explicit exception)"
    - "Code review if applicable"
  status: todo|in_progress|done
```

## Example

```yaml
task:
  id: D1.1
  sprint_id: D1
  title: Define task schema
  depends_on: []
  test_ref: "framework/tasks/schema.test.* or validation script"
  description: "Define task schema (ID, title, deps, test ref)."
  definition_of_done:
    - "Schema validates task ID, deps, test ref"
    - "Documented in TASK-SCHEMA.md"
  status: todo
```

## Rules

- **No circular dependencies**: The graph of `depends_on` must be acyclic.
- **Test first**: Before implementation, create or update the test referenced in `test_ref`.
- **One task = one test target**: Each task should map to a clear test (or test suite) that defines success.
