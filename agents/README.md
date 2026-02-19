# Agents — prompts and runbook for AI-assisted workflow

This folder holds **prompts and a runbook** for working with Cursor (one AI, different prompts). There are no separate agent processes; you get "one agent for spec, one for tasks" by using **separate conversations** and the right prompt for each step.

## Purpose

- **Spec**: Draft a product spec from your app idea → `prompts/SPEC-DRAFTING-PROMPT.md`
- **Tasks and sprints**: Turn that spec into `specs/sprints.yaml` and `specs/tasks.yaml` → `prompts/SPEC-TO-YAML-PROMPT.md`
- **Refinement**: Module boundaries, estimation, next task, test-first → see `AGENT-RUNBOOK.md`

## Is it complete for our purpose?

Yes. The flow is: **idea → spec (prompt) → sprints/tasks (prompt) → implement (task by task)**. The runbook covers when to use each prompt, estimation with historical context, module boundaries, and implementation (next task, test-first). For building an app with this scaffolding, nothing else is required.

## Best practices reflected here

- **Structured prompts**: Each prompt has a clear goal and place to paste input (idea or spec). Reduces ambiguity and improves output.
- **One job per prompt**: Spec drafting vs spec→YAML vs module boundaries are separate prompts so context stays focused.
- **Runbook**: One place that says when to use which prompt and what to include (see AGENT-RUNBOOK.md).
- **Historical context for estimation**: Estimation prompt requires past project data (e.g. 3 people, 2 months) before asking for an AI estimate. Aligns with current recommendations.
- **Separate conversations per step**: Recommended in the runbook so the AI doesn't mix spec, plan, and implementation context.

## How to use multi-"agents" (separate conversations)

- **Chat 1 — Spec only**: Open SPEC-DRAFTING-PROMPT, paste your app idea, get spec. Save to `specs/spec/product.md`. Stop there or do a few refinements in the same chat.
- **Chat 2 — Tasks/sprints only**: Open SPEC-TO-YAML-PROMPT, paste your spec, get YAML. Save to `specs/sprints.yaml` and `specs/tasks.yaml`.
- **Chat 3 (or Composer) — Implementation**: For each task in `specs/tasks.yaml`, start a conversation or Composer with the task and codebase. "Implement task S1.1" or "Write the test for S1.2 first, then implement."

When to use a **new** conversation: when starting a new step (spec vs tasks vs implementation), when the current thread is long, or when you want clean context for the next deliverable. See **AGENT-RUNBOOK.md** for full guidance.
