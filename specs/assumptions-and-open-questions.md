# Assumptions and open questions — GHG Methodology Calculator

Pre-build phase: assumptions the team is making so development can start. Open questions are to be resolved with GIZ or the team; when resolved, update this doc and the spec (§8) accordingly.

---

## Assumptions (current)


| Area                          | Assumption                                                                                                                                                                                                       | Notes                                                                                                                                             |
| ----------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Deliverable**               | Web app with Excel (and PDF, JSON) export unless GIZ agrees otherwise.                                                                                                                                           | WP3 text: “probably Excel, but can potentially be some other form of app”; spec assumes web app + export. IT backstopping to assess alternatives. |
| **Methodologies (MVP)**       | Two methodologies in scope for first delivery: India GHCI (electrolysis), South Korea Clean Hydrogen. Tool is designed for 4–5 total; final list with GIZ.                                                       | EU RFNBO, IPHE, ISO are candidates for later.                                                                                                     |
| **Korea Basic Data Provided** | Placeholder or minimal default factor set until Attached Form 2 values are available.                                                                                                                            | Factor store and Korea adapter can use versioned placeholder; replace when official data is obtained.                                             |
| **India equations**           | Structure and required inputs are defined in `specs/spec/methodologies/INDIA-GHCI-REQUIRED-INPUTS.md`; exact equation symbols and formula refs from PDF pages 19–23 to be aligned during adapter implementation. | Implementer (or AI) should fill from the official India PDF when building S3.2.                                                                   |
| **Scope**                     | Hydrogen production only (well-to-gate H₂). PtX conversion (ammonia, methanol, etc.) out of scope for MVP.                                                                                                       | WP3: “at least hydrogen production … before being converting into a PtX product.”                                                                 |
| **Scenarios**                 | At least two scenarios: (1) 100% dedicated renewable electricity, (2) limited grid electricity use.                                                                                                              | In scope per WP3 and spec.                                                                                                                        |
| **Single project**            | One project per workspace/session; one set of canonical inputs. No multi-project comparison in one view for MVP.                                                                                                 | Spec scope.                                                                                                                                       |
| **Single-user / hosting**     | Single-user, local or simple web deployment unless GIZ requests otherwise.                                                                                                                                       | No collaborative editing or RBAC in MVP.                                                                                                          |
| **WP2 case study data**       | S7.2 (“Test-run with WP2 case study data”) runs when WP2 data is available; not a blocker for starting S1–S6.                                                                                                    | Best-practice example can be synthetic until then.                                                                                                |


---

## Open questions (for GIZ / team)

These are copied from **specs/spec/product.md §8**. Resolve before or during build where they affect scope or implementation; document decisions here and in the spec.


| #   | Question                                                                                                               | Impact                                     |
| --- | ---------------------------------------------------------------------------------------------------------------------- | ------------------------------------------ |
| 1   | **Deliverable format**: Excel vs web app vs both; cost–benefit.                                                        | Confirmed with GIZ.                        |
| 2   | **Final 4–5 methodologies**: Exact list (India + Korea in; EU RFNBO, IPHE, ISO candidates).                            | Affects roadmap; MVP stays at 2.           |
| 3   | **India equations**: Exact symbols and formulas from PDF pages 19–23; align adapter and Methodology Data Model naming. | Adapter S3.2 and audit trail.              |
| 4   | **Korea Basic Data Provided**: Obtain or mirror Attached Form 2; ship default set or require upload.                   | Factor store and Korea adapter defaults.   |
| 5   | **Default grid factors**: Source (e.g. IEA, national registry), versioning, update policy.                             | Tool defaults and factor versioning.       |
| 6   | **Co-product allocation (India)**: Exact rule (energy vs mass, LHV source); parity with Korea AF where applicable.     | India adapter and validation.              |
| 7   | **Multi-period**: MVP annual only or also monthly reconciliation (e.g. Korea “at least monthly”).                      | Input schema and report layout.            |
| 8   | **Energy source detail**: Capture PV, wind, grid, combinations for display/reporting?                                  | Optional canonical field; WP3 mentions it. |
| 9   | **Transport routes and modes**: In scope for hydrogen-to-gate or only for future PtX extension?                        | Inputs and boundaries.                     |
| 10  | **Digital Product Passport**: Whether and how to present alternatives to GIZ.                                          | Separate evaluation per WP3.               |
| 11  | **Functional unit**: Consistent kgCO₂eq/kg H₂ and reporting basis across methodologies.                                | Comparison view and export.                |
| 12  | **Lifecycle boundary**: Construction, transport to gate, storage in scope? Document assumptions.                       | Per-methodology boundaries.                |
| 13  | **Incomplete implementation**: Missing factors or partial Korea sub-equations — warn vs block calculation.             | Validation and UX.                         |
| 14  | **Single-user vs multi-user**: Desktop/local vs multi-user with permissions.                                           | Architecture and hosting.                  |
| 15  | **Hosting**: Local/desktop vs web deployment.                                                                          | Tech choice (e.g. Electron vs browser).    |
| 16  | **Korea sub-equation granularity**: Full replication vs top-level + key components for MVP.                            | S3.3 scope.                                |
| 17  | **Admin panel + DB for new standards**: Post-MVP feature to add methodologies via DB without code?                     | Future phase.                              |


---

## How to use this doc

- **Before S1.1**: Read assumptions; confirm no show-stoppers.
- **When a question is resolved**: Update this table and product.md §8; add a short “Decision” or “Resolved” note and date.
- **When adding a new assumption**: Add it to the table and mention in spec if it affects scope or contracts.

