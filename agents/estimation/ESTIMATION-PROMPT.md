# AI Estimation Prompt

Use this prompt when you need an **implementation estimate** with agentic/AI-assisted development. **Always attach or paste the historical context** (see `HISTORICAL-CONTEXT-TEMPLATE.md`) first.

---

## Prompt (copy and customize)

```
I need an estimate for implementing the following scope with agentic/AI-assisted development (e.g. Cursor, AI pair programming, code generation).

**Historical context (prior to agentic coding):**
[PASTE filled HISTORICAL-CONTEXT-TEMPLATE here]

**Current scope to estimate:**
[Describe the scope: e.g. "Same as above" or "Subset: auth + profile only" or "New project: …"]

**Questions:**
1. Estimate the same (or analogous) scope in **days** assuming one developer using AI/agentic tools full-time. Give a range (e.g. 1–2 days).
2. What are the main risks or assumptions that could change the estimate?
3. What should be done first to reduce uncertainty?
```

---

## How to interpret the answer

- **Range**: Use the lower bound for planning with buffer; use the upper bound for external commitments.
- **Risks**: Address high-impact risks before locking the sprint.
- **Uncertainty**: If the AI asks for more detail, refine the scope or module boundaries and re-run the prompt.

## Re-estimation

- Re-run when: scope changes, a sprint completes (to calibrate next ones), or new historical data is available.
