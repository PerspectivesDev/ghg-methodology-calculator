# Agent Prompts: Module Boundaries & Independence

Use these prompts with an AI agent to refine **module boundaries** until modules are **independent** and **clearly separated**. End product: a description of each module that does not depend on other modules’ internals.

---

## 1. List modules and detect overlap

```
List all modules for this project and their single responsibility in one sentence each. Then flag any overlap: two or more modules owning the same behavior or data. Suggest which module should own each overlapping part.
```

---

## 2. Check one module’s boundaries

```
For module [MODULE_NAME]:
- List everything this module PROVIDES (APIs, events, outputs).
- List everything this module CONSUMES (from other modules or externals).
- Are the boundaries clear? Can you describe this module without referring to other modules’ internal implementation? If not, what is missing or ambiguous?
```

---

## 3. Describe module independently

```
Describe module [MODULE_NAME] in a standalone way: responsibility, inputs, outputs, and errors. Do not reference other modules’ internals—only their public interfaces. After the description, confirm: is this module independent and clearly bounded? If not, what is still coupled?
```

---

## 4. Find shared state or overlap

```
Across the modules [list module names], identify:
- Any shared mutable state (e.g. global cache, shared DB table written by multiple modules).
- Any behavior implemented in more than one module.
- Any interface that is unclear (ambiguous inputs/outputs or ownership).
For each finding, suggest which single module should own it and how others should interact (e.g. via API only).
```

---

## 5. Go deeper (submodules)

```
Module [MODULE_NAME] is too large. Break it into submodules with:
- Clear responsibility per submodule
- Explicit interfaces between submodules
- No overlap and no circular dependencies
Provide a short table: submodule name, responsibility, provided interface, consumed interface.
```

---

## Usage

- Run 1 first to get an overview and overlap list.
- Run 2 and 3 per module until descriptions are stable and independent.
- Run 4 to catch shared state and overlap.
- Run 5 when a module needs to be split.
- Document the final result in `docs/modules/` using `MODULE-DEFINITION-TEMPLATE.md` and `BOUNDARY-CHECKLIST.md`.
