# Product spec: GHG Methodology Calculator for Hydrogen / PtX

> User enters project data once, selects 1–5 methodologies/standards; tool computes lifecycle GHG intensity per methodology and a comparison view. Verification-ready outputs with audit trail. WP3 deliverable for GIZ: user-friendly digital tool (Excel or web) for hydrogen/PtX project developers.

---

## What “4–5 methodologies” means

- The **tool** is intended to cover **4–5 methodologies in total** (to be confirmed with GIZ). Each methodology is a **different standard** (a different PDF or official document).
- **Two of them are the PDFs you have**: (1) **India** — Green Hydrogen Certification Scheme (GHCI), (2) **South Korea** — Clean Hydrogen Certification (Operational Rules, Attached Form 1/2).
- The **other 2–3** would be additional standards, e.g. **EU RFNBO**, **IPHE**, **ISO** (or others GIZ selects). Each would have its own official document/PDF.
- So: **1–5** = user can select **up to 5 methodologies per project**; the **app** is designed to support **4–5 methodologies total** (we build 2 now; more can be added later). It is **not** “1–5 per PDF”—it’s one tool with several standards, and each standard (India, Korea, EU, etc.) is one methodology.

---

## Calculation authority (PDF-first)

- **All calculations are based exclusively on the two standards**:
  1. **South Korea**: Operational Rules for the Clean Hydrogen Certification Operating Agency (2025.4.24), Attached Form 1 (GHG Emissions Calculation Standards), Attached Form 2 (Basic Data Provided).
  2. **India**: Indian Green Hydrogen Certification Scheme (April 2025), equations and rules as published (electrolysis pathway; equations on pages 19–23).
- **No deviation**: Methodology adapters must implement the equations and rules from these PDFs exactly. No ad hoc or alternative formulas. Where the PDF references a formula (e.g. A-1, B-5, C-1), the code must implement that formula as written.
- **User input = what the PDFs need**: The app must collect from the user (or supply from Basic Data Provided / defaults) **every input variable required by each selected methodology** so that carbon emissions can be calculated exactly as in the PDF. The canonical input model and UI forms are derived from the methodology requirements (see `specs/spec/methodologies/KOREA-REQUIRED-INPUTS.md` for Korea and `specs/spec/methodologies/INDIA-GHCI-REQUIRED-INPUTS.md` for India).
- **Future standards (1–5)**: The tool is designed to support 1–5 methodologies. New standards (e.g. EU RFNBO, IPHE, ISO) are added by implementing a new adapter that follows the same rule: calculations strictly per that standard’s official document; user inputs sufficient for exact calculation.

---

## Methodology Data Model

This section defines methodology-specific and shared data structures, equations, and rules for India (GHCI) and South Korea (Clean Hydrogen Certification). It is the single source of truth for inputs, outputs, equation versions, and default factors.

### India: Green Hydrogen Certification Scheme (GHCI) — Electrolysis Pathway

**Source**: Indian Green Hydrogen Certification Scheme (April 2025), equations on pages 19–23.

**Boundary**: Well-to-gate (feedstock procurement to hydrogen production facility gate). Electrolysis pathway in scope.

| Category | Description | Inputs / factors | Outputs |
|----------|-------------|------------------|--------|
| **Total emissions** | Lifecycle GHG intensity (e.g. kgCO₂eq/kg H₂) | All component emissions below | Single intensity figure per evaluation period |
| **Feedstock** | Water and other feedstocks for electrolysis | Water volume/type, upstream LCI factors | E_feedstock (or equivalent term per scheme) |
| **Electricity** | Grid and renewable electricity | Grid kWh, renewable kWh, grid emission factor, T&D losses | E_electricity |
| **Fuel** | Process fuels (if any) | Fuel type, amount (MJ or kg), emission factors | E_fuel |
| **Steam** | Heat/steam supply | Steam amount (MJ), source (internal/external), emission factor | E_steam |
| **Input materials** | Chemicals, catalysts, water treatment, etc. | Amount per kg H₂, LCI per material | E_input_materials |
| **Co-product allocation** | Allocation when co-products (e.g. O₂) are produced | Allocation method (e.g. energy, mass), LHV or mass of H₂ and co-products | Allocation factor (AF) or equivalent; net emissions allocated to H₂ |

**Equations (reference)**: The scheme defines equations for total emissions and each component on pages 19–23 of the official PDF. The tool shall implement these equations exactly as published; equation version and page reference must be stored in the audit trail. *Implementer note: align symbol names and formula structure with the PDF when integrating.*

**Logic / boundary rules**:
- Minimum hydrogen purity condition may apply (e.g. for eligibility).
- Evaluation cycle is typically annual; monthly reconciliation may be required.
- Data types: Site Data (measured) vs Design Data (predicted) — distinguish and record in audit.
- **Tier approaches**: Support measured (site) vs default factors per methodology; user manual must explain error-prone areas and when to use standard factors vs measurements.

---

### South Korea: Clean Hydrogen Certification — Etotal Structure

**Source**: Operational Rules for the Clean Hydrogen Certification Operating Agency (2025.4.24), Attached Form 1 (GHG Emissions Calculation Standards), Attached Form 2 (Basic Data Provided).

**Main formula**:

```
Etotal = [(Efeedstock supply + Eenergy supply + Einput materials + Eprocess + Efugitive non-CO2 – EC-credit + EC-tracking) × AF + ECCS process − ECO2 sequestrated]
```

**Components** (all in kgCO₂eq/kg H₂-product unless noted):

| Symbol | Name | Description | Formula ref | Data type |
|--------|------|-------------|-------------|-----------|
| **Efeedstock supply** | Feedstock supply emissions | Upstream emissions (extraction, processing, storage, transport) for feedstocks | A-1 to A-4 | Site Data; or Basic Data Provided for average natural gas by country |
| **Eenergy supply** | Process fuel supply emissions | Upstream emissions for electricity, heat (steam), and fuels | B-1 to B-6 | Basic Data Provided for Scope 2/3 where applicable |
| **Einput materials** | Input materials emissions | Upstream emissions for materials not used as feedstock/fuel (water, salt, chemicals, catalysts, etc.) | C-1 | Basic Data Provided or Site/Design |
| **Eprocess** | Process emissions | Direct emissions from process (combustion + non-combustion) | D-1, D-2 | Site Data or Design Data |
| **Efugitive non-CO2** | Fugitive non-CO₂ GHG | Methane, N₂O, refrigerants, leakage/venting | — | Site Data or IPCC/recognized coefficients |
| **EC-credit** | C-credit (system expansion) | Credit for carbon-containing by-products (system expansion) | E-1 | Site Data + LCI of alternative product |
| **EC-tracking** | C-tracking | Tracked emissions when carbon in by-products is ultimately emitted as CO₂ | E-2 | Site Data (production ratio, carbon content) |
| **AF** | Energy allocation factor | For by-products without carbon; LHV-based allocation | F-1 | Site Data (LHV, masses) |
| **ECCS process** | CCS process emissions | Lifecycle emissions of capture, transport, injection (excl. capture process if in 1–5) | G-1 to G-3 | Site Data for capture; Basic Data Provided for transport/storage |
| **ECO2 sequestrated** | CO₂ sequestrated credit | Amount of CO₂ permanently stored (e.g. geological); deductible only if ≥90% capture | — | Site Data + verification |

**Electricity sub-components (Eenergy supply)**:
- **Eelectricity supply**: B-2. Grid (B-5: LCI from generation mix, T&D loss, correction factor), renewable (LCI = 0 where eligible), other.
- **Eheat supply**: B-3, B-6 (steam LCI from fuel LCI, boiler efficiency).
- **Efuel supply**: B-4 (LCI per fuel n).

**Boundary / logic rules**:
- System boundary: Well-to-gate (feedstock procurement to shipment point at H₂ facility).
- Unit: kgCO₂eq/kg H₂; sum to 4th decimal, round to 3rd for calculation, 2nd for grade.
- GWP: IPCC AR5 100-year.
- Hydrogen purity: ≥99% (vol) after refinement; specific rules for ammonia-integrated flows.
- By-products: carbon-containing → system expansion (EC-credit, EC-tracking); others → energy allocation (AF).
- RECs: limited recognition; exclusions per Article 10.

---

### User inputs required for exact calculation

The app must collect **all inputs required by each selected methodology** so that emissions are computed exactly as in the official PDFs. The canonical input set is the union of:

- **Korea (Attached Form 1)**: See `specs/spec/methodologies/KOREA-REQUIRED-INPUTS.md` for the list of variables (e.g. fGrid Elec, fRe Elec, fSteam, rm, i_o, LHV, Mass, by-product and CCS terms). Where the PDF allows Basic Data Provided, the tool may supply default factors; otherwise the user must enter Site/Design Data.
- **India (electrolysis)**: See `specs/spec/methodologies/INDIA-GHCI-REQUIRED-INPUTS.md` for required inputs (feedstock, electricity, fuel, steam, input materials, co-product allocation). Exact equation symbols and formula refs to be aligned with the India PDF (pages 19–23) in the adapter; the India Methodology Data Model table in this spec and the India methodology doc define the structure.

Forms and validation must ensure that, for the selected methodologies, every required input is either provided by the user or supplied by the tool (Basic Data Provided / methodology default / tool default). Missing required inputs must block calculation or be clearly flagged with explainable errors.

---

### Shared Canonical Inputs (Cross-Methodology)

These inputs are normalized once per project and mapped into each methodology’s model. Stored as **canonical project inputs** with units and source (site/design/default). They are derived from and must cover the requirements in the two PDFs (see above).

| Canonical input | Unit | Typical use | Notes |
|-----------------|------|-------------|--------|
| Grid electricity | kWh/kg H₂ or kWh/year | India, Korea (Eenergy supply) | Per period (e.g. monthly/annual) |
| Renewable electricity | kWh/kg H₂ or kWh/year | India, Korea | Off-grid / PPA / REC per scheme rules |
| Energy source type | — | Reporting / WP3 | Optional: PV, wind, grid, combinations (for display and reporting) |
| Other electricity | kWh/kg H₂ or kWh/year | Korea | Other sources |
| Grid emission factor | kgCO₂eq/kWh | Both | With T&D loss; versioned |
| T&D loss | % or factor | Both | Applied to grid LCI |
| Electrolyser capacity | kW or kg H₂/hr | Both | For scaling / design checks |
| Annual H₂ output | kg H₂/year | Both | Primary output quantity |
| Water (feedstock) | kg or m³/kg H₂ | Both | Demineralised / raw; upstream LCI |
| Steam | MJ/kg H₂ | Both | Internal or external |
| Fuels (process) | MJ/kg H₂ or kg/kg H₂ by type | Both | Natural gas, diesel, etc. |
| Input materials | kg/kg H₂ (per material) | Both | NaOH, HCl, PEM electrolyte, etc. |
| Co-products (by-products) | kg/kg H₂, LHV, carbon content | Both | O₂, carbon black, etc.; allocation |
| Fugitive / non-CO₂ | Per scheme | Korea (Efugitive non-CO2) | Leakage rates or mass balance |
| CCS (if any) | CO₂ captured, transported, stored | Korea | ECCS process, ECO2 sequestrated |
| Period (e.g. month, year) | — | Both | For reconciliation and reporting |

**Derived / common factors**:
- LHV of H₂ (gas): MJ/kg (constant or user override).
- LHV of by-products: MJ/kg for energy allocation.
- GWP values: IPCC AR5 100-year (or per methodology).

---

### Basic Data Provided vs Site Data vs Defaults — Versioning

| Concept | Definition | Who provides | Versioning |
|---------|------------|--------------|------------|
| **Basic Data Provided** | Standard emission factors and LCIs provided by the certification body (e.g. Korea: president of Certification Operating Agency). Covers indirect emissions for feedstock supply, process fuel supply, input materials, and (for Korea) CO₂ transport/storage. | Certification body (authoritative list in Attached Form 2) | **Versioned by body and publication date.** Tool stores factor set id (e.g. `KR-BasicData-2025-04`) and effective date. Updates when scheme updates. |
| **Site Data** | Measured or calculated from actual operation (e.g. monthly electricity consumption, H₂ output, fuel use). | User / producer | Stored per project and period; no “version” of the value itself, but **audit trail** records when and how it was entered. |
| **Design Data** | Predicted operation data from facility design. | User / producer | Same as Site Data for audit; label as “design” vs “site” for reporting. |
| **Default factors (tool)** | Tool-provided defaults for grid emission factors, T&D loss, or other inputs when user does not supply them (e.g. country default grid factor). | Tool / config | **Versioned in app config or DB:** e.g. `default_factors_v1`, source (e.g. IEA, national grid), and date. Clearly distinguished from Basic Data Provided in UI and export. |

**Factor resolution priority** (when resolving a factor for a given input):
1. **User override** — project-level factor overrides (stored per project).
2. **Methodology default / Basic Data Provided** — scheme-specific default or certification-body data for that methodology and version.
3. **Tool default** — fallback default (e.g. country grid factor); clearly labeled and versioned.

**Rules**:
- **India**: Use scheme-specified default/standard factors where defined; record factor source and version in audit trail.
- **Korea**: For Scope 2 and Scope 3 (indirect), use Basic Data Provided when available; otherwise follow Article 8(3) (consultation / own data with approval). Direct emissions, fugitive, capture process, and stored CO₂ amount: Site/Design Data only; no Basic Data Provided.
- **Audit trail**: Every calculation must record: methodology id, equation version (or Form/version), list of Basic Data Provided factors used (id + version), list of default factors used (id + version), all site/design inputs and any factor overrides (with timestamps). Export must be verification-ready (intermediate steps visible) and reproducible.

---

## 1. Goals

- **Primary goal**: Enable hydrogen/PtX project developers to enter project data once, select up to 4–5 GHG methodologies/standards (to be agreed with GIZ), and obtain lifecycle GHG intensity results per methodology plus a comparison view, with verification-ready outputs and a clear audit trail.

- **Secondary goals**:
  - Replace or complement Excel-based calculations with a user-friendly digital tool (Excel or web app; format to be agreed with GIZ; Excel export at least).
  - Provide a consistent, structured data-entry experience across methodologies.
  - Ensure transparent, auditable calculations (inputs, defaults, intermediate values, equation versions) and side-by-side comparison of results.
  - Enforce error checking, conditional logic for boundaries and allocation, default values per methodology, and consistent validation.
  - Support WP3 deliverable: a tool suitable for verification and certification preparation (India GHCI, South Korea Clean Hydrogen, and future schemes such as EU RFNBO, IPHE, ISO).
  - Allow adding new methodologies later via a plugin/adapter pattern with minimal refactoring of core logic.
  - Serve as a decision-support instrument for project developers and provide reliable, comparable GHG results under several methodologies.

---

## 2. Scope

### In scope

- **Single project**: One project per workspace/session; one set of canonical inputs.
- **Production pathways (WP3)**: At least hydrogen production with (1) one scenario with 100% dedicated renewable energy and (2) one scenario with (limited) grid electricity use; scope is hydrogen-to-gate (PtX conversion downstream is out of scope for MVP).
- **Methodologies (MVP)**: India GHCI (electrolysis pathway) and South Korea Clean Hydrogen (Etotal structure); tool designed for 4–5 methodologies (final selection with GIZ; candidates include EU RFNBO, IPHE, ISO). Up to 5 methodologies selectable per run.
- **Compute**: Calculate lifecycle GHG intensity (e.g. kgCO₂eq/kg H₂) per methodology using the Methodology Data Model (equations, boundaries, allocation).
- **Verification-ready outputs**: Per-methodology breakdown (intermediate steps: Efeedstock, Eenergy, Eprocess, etc., not only final number); output forms per methodology; exportable report.
- **Save / load**: Persist project (canonical inputs, selected methodologies, factor versions, factor overrides per project); load for edit and re-run.
- **Export report**: Export report (PDF, Excel, and JSON for machine-readable audit) including inputs, default/Basic Data factors used, equation versions, intermediate results, and final intensity per methodology.
- **Validation**: Required-field and unit-consistency checks; cross-field consistency (e.g. electricity breakdown sums, allocation logic, missing factors); conditional logic for system boundaries and allocation rules; explainable error messages; optional defaults per methodology where defined.
- **Audit trail**: Record inputs, Basic Data Provided and default factor versions, equation versions, and computation timestamp for each run.
- **User manual**: Short user manual (purpose, scope, step-by-step data entry, interpretation of results, limitations and assumptions) integrated into the tool; explain error-prone areas and use of standard factors vs measurements (tier approaches).
- **Best-practice example**: One bundled example project (ideally from WP2 case study) as orientation for users.
- **Testing with case studies**: Tool test-run with data from WP2 case studies to check functionality and consistency.
- **Extensibility**: Plugin/adapter pattern to add further methodologies without changing core orchestration.

### Out of scope (MVP)

- PtX products (ammonia, methanol, etc.) and their conversion emissions; scope is hydrogen production only (well-to-gate H₂).
- Multi-project comparison in one view; user manages one project at a time.
- Direct submission to certification portals (no API integration with India/Korea systems).
- Real-time sync with external data (e.g. live grid factors); user or config provides factors.
- Collaborative editing or role-based access control.
- Mobile-native UI (responsive web is in scope).
- Digital Product Passport (to be evaluated separately; alternatives may be presented to GIZ).
- Full replication of every Korea sub-equation in MVP only if required for WP3 acceptance; otherwise implement top-level Etotal structure and key components with agreed granularity.

---

## 3. Tech stack

- **Runtime / framework**: Node.js 20 LTS; TypeScript throughout.
- **Backend / compute**: Node + TypeScript; calculation engine as a set of pure functions per methodology (adapters), orchestrated by a single runner.
- **Data / persistence**: SQLite (file-based) for MVP: projects, canonical inputs, saved runs, audit records. Schema supports factor versioning and methodology version.
- **Frontend**: React 18 + TypeScript; single-page app for project form, methodology selection, results, and comparison view. No heavy Excel-in-browser — export to file instead.
- **Tests**: Vitest (unit + integration); coverage target 95% for calculation and validation code. Playwright or React Testing Library for critical UI flows (save/load, compute, export).
- **Export**: PDF (e.g. react-pdf or server-side template); Excel (e.g. ExcelJS) for tabular report; JSON for machine-readable audit.
- **Config / env**: `.env` for environment (e.g. paths); no secrets in repo. Factor and equation version metadata in DB or versioned JSON/TS in repo.
- **Alternative stack** (if full-stack framework preferred): Next.js (App Router), PostgreSQL, Prisma, Zod for shared validation — see Open questions for deliverable and hosting choices.

---

## 4. Modules

- **Project (core)**: Canonical project model (single project), canonical inputs schema, load/save project, list of methodologies selected, **factor overrides** (per-project overrides of default/Basic Data factors). Owns project layout and persistence contract.

- **Methodology adapters (plugins)**: One adapter per methodology (India GHCI, Korea Clean Hydrogen). Each adapter exposes: required inputs schema, calculation logic (equation graph), output schema, optional report fragment. Maps canonical inputs → methodology-specific inputs; runs methodology equations; returns structured result (components + total + metadata, warnings, errors). Implements a common interface (e.g. `compute(projectInputs, factorProvider): MethodologyResult`). No UI; no persistence. For Korea, Allocation Factor (AF) is a first-class output in the breakdown.

- **Factor store (Factors & defaults registry)**: Provides Basic Data Provided and default factors by methodology and version. **Resolution priority**: (1) user override per project, (2) methodology default / Basic Data Provided, (3) tool default. Reads from versioned config/DB; used by adapters and audit. Single source for factor versions; stores and applies project-level factor overrides.

- **Calculation orchestration (Calculation engine)**: Given project + selected methodologies, calls each methodology adapter, produces total + intermediate breakdown, warnings and errors (e.g. missing factors, allocation edge cases), and audit metadata. Aggregates results, builds comparison view payload, writes audit trail (inputs, factor versions, equation versions, timestamp).

- **Validation**: Input validation at API/form boundary (required fields, ranges, units, unit consistency); cross-field validation (electricity breakdown sums, allocation logic, missing factors); per-methodology rules where needed. Returns structured, explainable errors; no silent defaults for required site data.

- **Export**: Generates verification-ready report: PDF and Excel (human-readable), JSON (machine-readable audit: inputs, factors used, breakdown, allocation logic). All include inputs, factor versions, intermediate steps per methodology, comparison table, audit info.

- **API / backend**: REST or minimal RPC over HTTP: project CRUD, compute (trigger run), get run result, export (return file or link). Thin layer over project + orchestration + export.

- **UI**: Forms for canonical inputs and methodology selection; results view (per-methodology breakdown + comparison); save/load; export trigger; display of validation errors and audit summary; in-tool user manual (purpose, scope, step-by-step, interpretation, limitations, tier approaches).

---

## 5. API / contracts

- **POST /api/projects** — Create project. Body: optional `name`, optional initial `inputs`, optional `factorOverrides`. Response: `{ id, name, createdAt }`. Errors: 400 validation.

- **GET /api/projects/:id** — Load project. Response: `{ id, name, inputs, factorOverrides, selectedMethodologies, createdAt, updatedAt }`. 404 if missing.

- **PUT /api/projects/:id** — Update project. Body: `inputs`, `factorOverrides`, `selectedMethodologies`. Response: updated project. Errors: 400 validation, 404.

- **POST /api/projects/:id/compute** — Run calculation. Body: `{ methodologies: string[] }` (e.g. `["india_ghci_v2025", "korea_clean_v2025"]` — versioned methodology ids). Response: `{ runId, results: [{ methodologyId, unit, total, breakdown, inputsUsed, factorsUsed, warnings, errors }, ...], comparison, auditSummary }`. Errors: 400 validation, 404, 422 if calculation fails.

- **GET /api/projects/:id/runs/:runId** — Get run result and full audit (inputs, factor versions, equation versions). Response: same as compute result + full audit. 404 if missing.

- **GET /api/projects/:id/runs/:runId/export** — Query: `?format=pdf|excel|json`. Response: file download (verification-ready report) or JSON object for `format=json`. 404 if run missing.

- **GET /api/factors** — List available factor sets (Basic Data Provided / defaults) per methodology and version. Response: `{ methodologyId, factorSetId, version, effectiveDate }`. Used by UI and audit.

Contracts: request/response JSON; errors with `code` and `message`; validation errors list fields and messages.

---

## 6. Project layout

- **Application code**:
  - `src/` — Backend and shared:
    - `domain/` — Canonical input types, methodology result types, value objects.
    - `adapters/` — Per-methodology modules (e.g. `india-ghci/`, `korea-clean-h2/`): equations, mapping from canonical → methodology inputs.
    - `factor-store/` — Factor resolution and versioning.
    - `orchestration/` — Compute runner, audit writer.
    - `validation/` — Input validators.
    - `export/` — PDF and Excel report generation.
    - `api/` — HTTP routes (projects, compute, runs, export, factors).
  - `client/` or `frontend/` — React app: project form, methodology selector, results, comparison, export button.

- **Tests**: `tests/` at repo root (or `src/**/*.test.ts` and `client/**/*.test.tsx`); integration tests for API and compute. Coverage for `domain/`, `adapters/`, `validation/`, `orchestration/`.

- **Config / env**: `.env.example` with placeholders (e.g. `DB_PATH`, `PORT`); no secrets. Factor and equation version metadata in `config/factors/` or DB migrations.

- **Spec and methodology docs**: `specs/spec/product.md` (this file); methodology equation refs and factor tables can live under `specs/spec/methodologies/` or in adapter folders with clear version tags.

---

## 7. Success criteria

- User can create a project, enter all inputs required by the selected methodology/PDFs once, run compute, and obtain carbon emissions calculated exactly as in the South Korea and India PDFs; per-methodology breakdown and comparison are shown.
- At least two scenarios are supported: 100% dedicated renewable electricity and (limited) grid electricity use.
- Outputs are verification-ready: intermediate components (e.g. Efeedstock supply, Eenergy supply, …) and equation/factor versions visible in UI and export; output forms match chosen methodology.
- User can save project and reload; re-run uses same or updated factor versions; audit trail stores inputs, factor versions, equation versions, timestamp.
- Validation rejects invalid inputs with clear messages; no silent wrong values; conditional logic for boundaries and allocation applied correctly.
- Export produces PDF, Excel, and/or JSON report that includes inputs, factor versions, intermediate steps, and final intensity per methodology; PDF/Excel are verification-ready and reproducible.
- User manual is integrated into the tool (purpose, scope, step-by-step, interpretation, limitations, standard factors vs measurements).
- Tool runs successfully with WP2 case study data; bundled best-practice example project is provided.
- New methodology (e.g. EU RFNBO, IPHE, ISO) can be added by implementing the adapter interface and registering; no change to core orchestration or project model beyond optional new canonical fields if needed.

---

## 8. Open questions

A consolidated list with current assumptions is in **`specs/assumptions-and-open-questions.md`**. Resolve with GIZ or the team; document decisions there and update this section as needed.

- **Deliverable format**: Agree with GIZ whether the tool is delivered as Excel, web app, or both; cost–benefit of web vs Excel was to be assessed by IT backstopping.
- **Final 4–5 methodologies**: Confirm with GIZ the exact list (India GHCI and Korea Clean H2 are in; EU RFNBO, IPHE, ISO are candidates).
- **India equations**: Confirm exact equation symbols and formulas from official PDF pages 19–23 and align adapter implementation and Methodology Data Model table (e.g. E_feedstock vs Efeedstock supply naming).
- **Basic Data Provided availability**: For Korea, obtain or mirror the actual Basic Data Provided (Attached Form 2) values for grid mix, steam, input materials, CCS transport/storage; decide whether to ship a default set or require upload.
- **Default grid factors**: Source for country-level default grid emission factors (e.g. IEA, national registry) and update policy (versioning, frequency).
- **Co-product allocation**: India’s exact allocation rule (energy vs mass, LHV source) to be confirmed from scheme; ensure parity with Korea’s AF and carbon by-product handling where applicable.
- **Multi-period (monthly)**: Whether MVP supports only annual aggregation or also monthly reconciliation for schemes that require it (e.g. Korea “at least monthly”); impacts input schema and report layout.
- **Energy source detail**: Whether to capture energy source type (PV, wind, etc.) for display/reporting; WP3 lists “PV, wind, grid, combinations”.
- **Transport routes and modes**: WP3 mentions “potentially” — confirm if needed for hydrogen-to-gate or only for future PtX extension.
- **Digital Product Passport**: Whether and how to present alternatives to GIZ for creative forms of a Digital Product Passport.
- **Functional unit harmonization**: Ensure consistent functional unit (e.g. kgCO₂eq/kg H₂) and reporting basis across methodologies for comparison.
- **Lifecycle boundary**: Whether construction, transport to gate, or storage are in scope for any methodology; document assumptions.
- **Incomplete methodology implementation**: How to handle partial implementation (e.g. Korea sub-equations) or missing factors — warnings vs block calculation.
- **Single-user vs multi-user**: Whether the tool is single-user (e.g. desktop or local) or multi-user with optional permissions.
- **Hosting**: Local/desktop vs web deployment; impacts tech choice (e.g. Electron vs browser-only).
- **Korea sub-equation granularity**: Required level of granularity for Korea sub-equations in MVP (full replication vs top-level structure and key components).
- **Admin panel + DB for new standards**: Whether to add a post-MVP feature so new methodologies can be defined in the database (inputs, formula structure, factors) and calculations run from that data, allowing new PDFs to be added without code changes. Would require generic formula engine and admin UI.

---

## 9. Recommended development approach

Before coding:

1. **Extract Methodology Data Model** from each standard (inputs, outputs, equations, allocation rules, required defaults) — this spec’s Methodology Data Model section is the starting point.
2. **Normalize shared canonical inputs** and persist with factor override support.
3. **Implement methodologies as plugins** using the adapter pattern; validation and factor resolution first.
4. **Build validation** (required fields, units, cross-field, allocation) before full calculation paths.
5. **Add reporting and export** last (PDF, Excel, JSON) so audit format stays consistent.

This order supports extensibility, auditability, and future-proofing while keeping the MVP manageable.

---

## 10. Adding new standards (how it works today and future option)

### Current approach (MVP): adapter per standard

- Each methodology (India, Korea, and any future one) is implemented as a **code adapter** that reads the official PDF’s equations and required inputs.
- **To add a new standard (e.g. a new PDF)**:
  1. Obtain the official PDF (or document) for that standard.
  2. Add a **methodology reference doc** under `specs/spec/methodologies/` (required inputs, formula references, symbol tables)—you can give the PDF to the AI and ask it to generate this doc.
  3. Implement a **new adapter** (e.g. `src/adapters/eu-rfnbo/`) that implements the equations exactly as in the PDF and implements the common adapter interface.
  4. **Register** the adapter in the app (e.g. methodology registry or config) so the UI and compute API can run it.
  5. No change to orchestration, project model, or UI structure beyond optionally extending canonical inputs if the new standard needs extra fields.
- **You can give a new PDF to the AI** and ask: “Add this standard to the app per the product spec (methodology doc + adapter).” The AI can add the methodology doc and adapter code; you review and run tests.

### Future option (post-MVP): admin panel + database-driven methodologies

- An alternative is to store **methodology definitions in the database** (e.g. list of input variables, formula steps or equation structure, default factors) and have an **admin panel** where someone enters or edits what each standard requires. A **generic calculation engine** would then run calculations from that data so **new standards could be added without code** (admin enters the new standard’s rules into the DB).
- **Trade-offs**: (1) **MVP adapter approach**: simpler, calculations are clearly tied to PDFs and easy to audit; adding a standard requires a developer or AI to write an adapter. (2) **Data-driven approach**: new PDFs could be added by non-developers via admin; but representing arbitrary PDF equations (nested formulas, allocation rules, conditions) in the DB is complex and would require a flexible formula/expression language and careful design.
- **Recommendation for now**: Ship MVP with the **adapter approach**. After MVP, if GIZ or you need “add new PDF via admin only,” we can design and add a **methodology definition store + admin UI + generic engine** as a separate phase (see Open questions).

---

## 11. Deliverable checklist (email + PDFs → end of project)

Use this at **project end** to confirm the tool matches what GIZ/WP3 and the standards require.

### From Sonja’s email / WP3 text

| Requirement | Where in spec / tasks | Status at end |
|-------------|------------------------|----------------|
| Tool: enter project data once, calculate CO₂ under 4–5 standards | Goals, Scope; S3, S4, S6 | ☐ |
| User-friendly digital tool (Excel or other app) | Goals; Excel export + web app | ☐ |
| Hydrogen: 100% renewable scenario + (limited) grid scenario | Scope, Success criteria; S6.2 | ☐ |
| Methodology selection (e.g. EU RFNBO, IPHE, ISO; India, Korea in) | Scope; S3.2, S3.3, S6.3 | ☐ |
| Input: energy source (PV, wind, grid), electrolyser capacity, annual production, water, grid emission factor, processing energy | Canonical inputs; S1.2, S6.2 | ☐ |
| Automatic calculation and comparison across standards | Scope, API; S4.1, S4.2, S6.4 | ☐ |
| Calculation formulas for selected methodologies | Methodology Data Model; S3.2, S3.3 | ☐ |
| Conditional logic for system boundaries and allocation | Scope, Validation; S2.2, S3.2, S3.3 | ☐ |
| Error-checking to prevent incorrect data entry | Validation; S2.2, S6.2 | ☐ |
| Default values as per methodology | Factor store, resolution priority; S2.1, S3.2, S3.3 | ☐ |
| Output forms verification-ready | Scope, Export; S5.1–S5.4, S6.4 | ☐ |
| Test-run with case study data; best-practice example | Scope; S7.1, S7.2 | ☐ |
| Adaptability for methodology updates / new standards | Adapter pattern; S3.1 | ☐ |
| User manual: purpose, scope, step-by-step, interpretation, limitations; tier approaches (standard factors vs measurements) | Scope, UI; S6.5 | ☐ |

### From South Korea PDF (Attached Form 1, from p.20)

| Requirement | Where in spec / tasks | Status at end |
|-------------|------------------------|----------------|
| Etotal formula and all components (Efeedstock supply … ECO2 sequestrated) | Methodology Data Model; S3.3 | ☐ |
| Basic Data Provided vs Site Data; factor versioning | Basic Data table, Factor store; S2.1, S3.3 | ☐ |
| Well-to-gate; kgCO₂eq/kg H₂; GWP AR5; purity ≥99%; by-product rules | Boundary rules; S3.3 | ☐ |
| Audit trail (inputs, factor versions, equation versions) | Scope, API response; S4.1, S5.1–S5.3 | ☐ |

### From India PDF (electrolysis, structure from p.19–23)

| Requirement | Where in spec / tasks | Status at end |
|-------------|------------------------|----------------|
| Total emissions; feedstock, electricity, fuel, steam, input materials, co-product allocation | Methodology Data Model India table; S3.2 | ☐ |
| Equations implemented per official PDF (align when PDF available) | Open question; S3.2 implementer note | ☐ |
| Tier approaches (measured vs default) | India logic, User manual; S2.1, S6.5 | ☐ |

### Agreed with GIZ before or during project

| Item | Spec section | Status |
|------|--------------|--------|
| Deliverable format: Excel vs web app vs both | Open questions | ☐ |
| Final list of 4–5 methodologies | Open questions | ☐ |
| Korea Basic Data Provided values or placeholder | Open questions, S2.1/S3.3 | ☐ |

---

**Next**: Implement task by task, test first (start with **S1.1**). When adding a methodology, extend the Methodology Data Model and add an adapter; keep audit trail and export format consistent. See §10 for how to add a new standard (adapter approach; optional future: admin + DB).
