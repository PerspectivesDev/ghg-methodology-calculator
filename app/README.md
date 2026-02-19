# GHG Methodology Calculator — Application

This folder contains **all application code** for the GHG Methodology Calculator. It is kept separate from repo-level concerns (specs, framework, docs, agents).

## Layout (per `specs/spec/product.md`)

| Path       | Purpose |
|-----------|--------|
| `src/`    | Backend and shared: domain, adapters, factor-store, orchestration, validation, export, api |
| `client/` | Frontend: React app (project form, methodology selector, results, comparison, export) |
| `tests/`  | Tests at application root; coverage for domain, adapters, validation, orchestration |
| `config/` | Env, factor metadata, migrations (no secrets in repo) |

## Requirements and plan

- **Product spec**: `../specs/spec/product.md`
- **Tasks / sprints**: `../specs/tasks.yaml`, `../specs/sprints.yaml`
- **Process**: `../framework/` (test-first, task schema)

## Prerequisites

You need **Node.js 24 LTS** (or later), which includes **npm**. Install the LTS bundle from [nodejs.org](https://nodejs.org/) — that gives you both `node` and `npm`. Then check:

```bash
node --version   # expect v24.x.x
npm --version    # expect 10.x or later
```

If `npm` is not found, Node may be installed without npm (e.g. minimal system package). Reinstall Node from the official installer or use a version manager (fnm, volta) so that `npm` is on your PATH.

**Using fnm:** After installing fnm and Node 24, open a **new terminal** or run `source ~/.zshrc`. Then `cd` into this directory (`app/`) and run `fnm use` so the correct Node version is active (`node --version` should show v24.x). The `.nvmrc` file is used by fnm.

**npm install fails with ECONNRESET:** Network or proxy issue. Retry `npm install`. If behind a proxy, set `npm config set proxy …` and `npm config set https-proxy …`. You can also try `npm install --prefer-offline --no-audit` or a different network.

## Commands (run from this directory)

- `npm install` — install dependencies (run once)
- `npm run migrate` — apply pending DB migrations
- `npm test` — run tests
- `npm run coverage` — run tests and generate coverage report (95% target; see `docs/COVERAGE.md`)

## Runtime direction

This project is currently being aligned to a desktop runtime with Electron. The standalone HTTP server entrypoint has been removed from this app package. Domain and persistence modules remain available for integration with Electron main/renderer processes.
