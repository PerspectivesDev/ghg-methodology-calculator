# Test-First Workflow

Follow this for every task. Target: **95% test coverage**; tests define success before code.

## Steps

1. **Pick a task** from the sprint. Ensure all `depends_on` tasks are done.
2. **Create or update the test**
   - Add/update test(s) that define the desired behavior for this task.
   - Run tests — they should fail (or not yet cover the new behavior).
3. **Implement**
   - Implement until the new test(s) pass.
   - Do not change tests to make them pass by lowering expectations (fix the implementation).
4. **Coverage**
   - Check coverage. If below 95%, add tests for uncovered paths (then implement if needed).
5. **Refactor** (optional)
   - With green tests, refactor for clarity. Keep tests green.
6. **Mark task done**
   - When tests pass and coverage is acceptable, mark task done and commit.

## Definition of done (per task)

- [ ] Test(s) for this task exist and were created/updated before implementation.
- [ ] All tests pass.
- [ ] Coverage target (95%) met or exception documented.
- [ ] No new linter/security issues.

## If the task has no test yet

- **First step**: Create the test file and the minimal test case that describes the behavior.
- **Then**: Implement to make it pass. This applies to both new features and refactors that have a clear behavioral contract.
