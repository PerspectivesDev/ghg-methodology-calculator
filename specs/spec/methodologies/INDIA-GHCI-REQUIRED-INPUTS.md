# India Green Hydrogen Certification Scheme (GHCI) — Required Inputs for Exact Calculation

**Source**: Indian Green Hydrogen Certification Scheme (April 2025), **electrolysis pathway**, equations on **pages 19–23**. This list is derived from the product spec Methodology Data Model and the scheme structure. The app must collect these (or their equivalents via scheme default factors) so that **all calculations are based exactly on the PDF**.

---

## Principle

- **No calculation without PDF basis**: Every term in total lifecycle GHG intensity must be computed using the equations and symbol definitions in the official PDF (pages 19–23).
- **User input or scheme default**: For each variable below, the tool either collects it from the user (Site Data / Design Data) or supplies it from scheme-specified default/standard factors. The UI must allow the user to enter everything the PDF requires for the electrolysis pathway.
- **Implementer note**: When implementing, align symbol names and formula structure with the official PDF. This doc provides the structural mapping; exact equation references (e.g. formula numbers, symbols) must be filled from the PDF and stored in the audit trail.

---

## 1. Total emissions

| Output | Description | Unit | Source |
|--------|-------------|------|--------|
| Total lifecycle GHG intensity | Sum of all component emissions below, after allocation | kgCO₂eq/kg H₂ | Calculated |

Evaluation period: typically annual; monthly reconciliation may be required per scheme. Single intensity figure per evaluation period.

---

## 2. Feedstock (E_feedstock or equivalent per scheme)

| Symbol / concept (PDF) | Description | Unit | Source |
|-------------------------|-------------|------|--------|
| Water volume/type | Feedstock for electrolysis (e.g. demineralised, raw) | kg/kg H₂ or m³/kg H₂ | User (Site/Design) |
| Upstream LCI (feedstock) | Lifecycle emission factor for water/feedstock supply | kgCO₂eq/kg or per unit | Scheme default or User |

For electrolysis, feedstock is typically water; upstream LCI covers extraction, treatment, transport as defined in the scheme (pages 19–23).

---

## 3. Electricity (E_electricity)

| Symbol / concept (PDF) | Description | Unit | Source |
|------------------------|-------------|------|--------|
| Grid electricity | Electricity from grid | kWh/kg H₂ or kWh/year | User |
| Renewable electricity | Electricity from renewable sources (100% dedicated or PPA) | kWh/kg H₂ or kWh/year | User |
| Grid emission factor | Emission factor for grid electricity (with T&D if applicable) | kgCO₂eq/kWh | User or scheme default |
| T&D loss | Transmission and distribution loss (if applied by scheme) | % or factor | User or scheme default |

Scheme may define LCI = 0 for eligible renewable electricity. Grid LCI and T&D treatment must follow PDF equations exactly.

---

## 4. Fuel (E_fuel)

| Symbol / concept (PDF) | Description | Unit | Source |
|------------------------|-------------|------|--------|
| Fuel type | Process fuels (if any) | — | User |
| Fuel amount | Amount per kg H₂ or per period | MJ/kg H₂ or kg/kg H₂ | User (Site/Design) |
| Emission factor per fuel | kgCO₂eq/MJ or kgCO₂eq/kg | Scheme default or User |

For electrolysis, process fuel may be zero; include if scheme requires.

---

## 5. Steam (E_steam)

| Symbol / concept (PDF) | Description | Unit | Source |
|------------------------|-------------|------|--------|
| Steam amount | Heat/steam supply | MJ/kg H₂ | User |
| Steam source | Internal or external | — | User (for allocation/LCI) |
| Steam emission factor | LCI of steam | kgCO₂eq/MJ | Scheme default or User |

---

## 6. Input materials (E_input_materials)

| Symbol / concept (PDF) | Description | Unit | Source |
|------------------------|-------------|------|--------|
| Material type “o” | Chemicals, catalysts, water treatment, etc. | — | User |
| Amount per kg H₂ (i_o equivalent) | Input amount of material “o” per kg H₂ | kg/kg H₂ | User (Site/Design) |
| LCI per material (LCI_o) | Upstream emission factor per material | kgCO₂eq/kg | Scheme default or User |

Examples: NaOH, HCl, PEM electrolyte, other consumables as listed in the scheme.

---

## 7. Co-product allocation

| Symbol / concept (PDF) | Description | Unit | Source |
|------------------------|-------------|------|--------|
| Allocation method | Energy or mass (as per scheme) | — | Scheme rule |
| LHV of H₂ (gas) | Lower heating value of hydrogen | MJ/kg | Constant or User |
| LHV of co-product(s) | LHV of by-products (e.g. O₂) | MJ/kg | User |
| Mass of H₂ | Mass of hydrogen produced | kg | User |
| Mass of co-product(s) | Mass of by-product(s) produced | kg | User |

**Note**: India’s exact allocation rule (energy vs mass, LHV source) to be confirmed from the scheme (pages 19–23). Output: allocation factor (AF) or equivalent; net emissions allocated to H₂. Ensure parity with Korea’s AF and carbon by-product handling where applicable (India electrolysis typically has O₂ as non-carbon by-product).

---

## 8. Boundary and logic rules (from scheme)

- **System boundary**: Well-to-gate (feedstock procurement to hydrogen production facility gate). Electrolysis pathway in scope.
- **Functional unit**: kgCO₂eq/kg H₂ (confirm in PDF).
- **GWP**: Per scheme (e.g. IPCC AR5 100-year if specified).
- **Hydrogen purity**: Minimum purity condition may apply for eligibility; document per PDF.
- **Data types**: Site Data (measured) vs Design Data (predicted) — distinguish and record in audit.
- **Tier approaches**: Support measured (site) vs default factors per methodology; user manual must explain error-prone areas and when to use standard factors vs measurements.

---

## 9. Mapping to canonical project inputs

The **canonical input model** in the product spec must include fields that map to every user-provided variable above (or explicitly state when scheme default is used instead). The India adapter must **only** use these inputs and the formulas in the official PDF (pages 19–23) to compute total and components—no ad hoc formulas.

When the exact equation symbols and formula references from the PDF are available, update this document to include:
- Exact formula identifiers (e.g. equation numbers) and page references.
- Symbol table matching PDF (e.g. E_feedstock vs Efeedstock supply naming) for audit trail and adapter implementation.

---

## 10. Reference

- **Official document**: Indian Green Hydrogen Certification Scheme (April 2025).
- **Relevant pages**: 19–23 (equations and rules for electrolysis pathway).
- **Product spec**: `specs/spec/product.md` — Methodology Data Model (India table), Shared Canonical Inputs, Factor resolution priority.
