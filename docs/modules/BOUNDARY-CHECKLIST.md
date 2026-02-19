# Module Boundary Checklist

Use this (and agents) to verify that modules are **independent** with **clear boundaries**. End state: a description of each module that does not depend on others’ internals.

## Per-module checks

For each module:

- [ ] **Single responsibility**: One clear sentence describes what the module does. No "and also".
- [ ] **Owned behavior**: Every behavior is owned by exactly one module. No overlap.
- [ ] **Explicit interfaces**: All communication in/out is via documented interfaces (API, events, files).
- [ ] **No shared mutable state**: Modules do not share in-memory state; they pass data or events.
- [ ] **Testable in isolation**: Module can be tested by mocking only its interfaces.
- [ ] **Describable alone**: You can describe the module without explaining other modules’ internals.

## Cross-module checks

- [ ] **No circular dependencies**: Dependency graph between modules is acyclic.
- [ ] **Clear data flow**: Data flows in one direction where possible (e.g. request → A → B → response).
- [ ] **Interface contracts**: Every call/event between modules has a defined contract (inputs, outputs, errors).

## Agent prompts (suggested)

1. **"List all modules and their single responsibility. Flag any overlap."**
2. **"For module [X], list everything it provides and consumes. Are boundaries clear?"**
3. **"Describe module [X] in a way that does not reference other modules’ internals. Is that possible?"**
4. **"Are there any shared mutable structures between modules? If yes, which module should own them?"**

Iterate until all checkboxes pass and descriptions are stable.
