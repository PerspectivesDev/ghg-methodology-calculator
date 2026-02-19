# Module: [Module Name]

> One file per module. Copy this template. Goal: **clear boundary**, **no overlap** with other modules.

## 1. Responsibility (one sentence)

- (What this module is the single owner of.)

## 2. Boundaries

### In this module

- (Behavior and data owned by this module.)
- …

### Not in this module

- (Behavior that belongs to other modules or externals.)
- …

## 3. Interfaces

### Provided (this module exposes)

| Interface | Type | Inputs | Outputs / side effects | Errors |
|-----------|------|--------|------------------------|--------|
| (e.g. API, function, event) | (API / event / file) | (Params, payload) | (Return, events) | (List) |
| … | … | … | … | … |

### Consumed (this module uses)

| From module / system | What is used | Contract ref |
|----------------------|--------------|--------------|
| (Module or service) | (API, event, etc.) | (Link or doc) |
| … | … | … |

## 4. Dependencies (technical)

- (Libraries, frameworks, infra this module depends on—minimal list.)

## 5. Independence check

- [ ] Can be described without referring to other modules’ internals.
- [ ] Can be tested in isolation (mocks at interfaces).
- [ ] No overlapping responsibility with another module.
- [ ] No shared mutable state with other modules.

---

*Use the boundary checklist in `BOUNDARY-CHECKLIST.md` and agents to refine until boundaries are clear.*
