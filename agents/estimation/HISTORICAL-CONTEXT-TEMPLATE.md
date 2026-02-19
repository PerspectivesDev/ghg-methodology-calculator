# Historical Context Template (for AI Estimation)

> **Always** provide historical context when asking AI for implementation estimates. This template standardizes the input.

## Copy and fill

```markdown
## Historical context (prior to agentic/AI-assisted development)

- **Project / feature**: (Name or short description)
- **Scope**: (What was delivered: modules, features, integrations.)
- **Team**: (e.g. 3 developers)
- **Duration**: (e.g. 2 months)
- **Tech stack**: (e.g. React, Node, PostgreSQL)
- **Notes**: (Any special conditions: legacy system, compliance, first-time stack.)
```

## Example

```markdown
## Historical context

- **Project**: Customer portal v1
- **Scope**: Auth, profile, dashboard, 5 API services, PostgreSQL.
- **Team**: 3 developers
- **Duration**: 2 months
- **Tech stack**: React, Node.js, PostgreSQL, Redis
- **Notes**: Greenfield; no legacy integration.
```

## How to use

1. Fill this template with **past** or **analogous** project data.
2. Paste it into the estimation prompt (see `ESTIMATION-PROMPT.md`).
3. Ask for an estimate in **days (or story points) with agentic/AI-assisted development**.
4. Use the result as a range (e.g. 1–2 days) and re-estimate as work progresses.
