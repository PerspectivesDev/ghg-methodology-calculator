# South Korea Clean Hydrogen — Required Inputs for Exact Calculation

**Source**: Operational Rules for the Clean Hydrogen Certification Operating Agency (2025.4.24), **Attached Form 1** (GHG Emissions Calculation Standards). This list is derived from the formula symbol tables in the PDF. The app must collect these (or their equivalents via Basic Data Provided) so that **all calculations are based exactly on the PDF**.

---

## Principle

- **No calculation without PDF basis**: Every term in Etotal must be computed using the formulas (A-1–A-4, B-1–B-6, C-1, D-1–D-2, E-1, E-2, F-1, G-1–G-3) and symbol definitions in Attached Form 1.
- **User input or Basic Data Provided**: For each variable below, the tool either collects it from the user (Site Data / Design Data) or supplies it from Basic Data Provided (Attached Form 2) per the Rules. The UI must allow the user to enter everything the PDF requires for their pathway (e.g. water electrolysis).

---

## 1. Feedstock supply (Efeedstock supply) — A-1 to A-4

| Symbol (PDF) | Description | Unit | Source |
|--------------|-------------|------|--------|
| m, R | Feedstock “m”, category “R” | — | User (which feedstock) |
| rm | Input amount of feedstock “m” | MJ/kg H₂-product | User (Site/Design) |
| LCIm | Upstream LCI of feedstock “m” | kgCO₂e/MJ | Basic Data Provided (e.g. natural gas by country) or User |
| i, N, t | Process indices; last process | — | Formula structure |
| l_t^m | Feedstock energy loss factor, process t | — | User or default |
| GHG_i^m (direct, life-cycle, non-combustion) | Per-process emissions | kgCO₂e/MJ | Basic Data or User |
| η_i^m | Process efficiency | — | User or default |

**For water electrolysis**: Feedstock is typically water; rm (water input per kg H₂), LCIm (upstream water LCI). Basic Data Provided covers indirect emissions for feedstock supply for water-electrolysis pathways.

---

## 2. Process fuel supply (Eenergy supply) — B-1 to B-6

### Electricity (B-2, B-5)

| Symbol (PDF) | Description | Unit | Source |
|--------------|-------------|------|--------|
| fGrid Elec | Electricity from grid | kWh/kg H₂-product | User |
| fRe Elec | Electricity from renewable sources | kWh/kg H₂-product | User |
| fOther Elec | Electricity from other sources | kWh/kg H₂-product | User |
| LCIGrid Elec | LCI of grid electricity | kgCO₂e/kWh | B-5 or Basic Data |
| LCIRe Elec | LCI of renewable (= 0 when eligible) | kgCO₂e/kWh | 0 per Rules |
| LCIOther Elec | LCI of other electricity | kgCO₂e/kWh | User or Basic Data |

**Grid LCI (B-5)** requires (when not using pre-calculated Basic Data): MIX_k (generation mix by source k), θ (technology ratio), ε (conversion efficiency), Losstrans (T&D loss), Corr (correction factor), LCI_k (fuel LCI per source). Basic Data Provided supplies grid LCI for domestic/overseas water-electrolysis hydrogen.

### Heat / steam (B-3, B-6)

| Symbol (PDF) | Description | Unit | Source |
|--------------|-------------|------|--------|
| fSteam | Heat (steam) input | MJ/kg H₂-product | User |
| fOther heat | Other heat sources | MJ/kg H₂-product | User |
| LCISteam | LCI of heat (steam) | kgCO₂e/MJ | B-6 or supplier or Basic Data |
| LCIOther heat | LCI of other heat | kgCO₂e/MJ | User or Basic Data |

B-6: LCIs, IPCCs, ηs,boiler for fuel “s” used to produce steam.

### Fuels (B-4)

| Symbol (PDF) | Description | Unit | Source |
|--------------|-------------|------|--------|
| n, F | Process fuel “n”, category “F” | — | User |
| fn | Input amount of process fuel “n” | MJ/kg H₂-product | User |
| LCIn | LCI of process fuel “n” | kgCO₂e/MJ | Basic Data or User |

---

## 3. Input materials (Einput materials) — C-1

| Symbol (PDF) | Description | Unit | Source |
|--------------|-------------|------|--------|
| i_o | Input amount of input material “o” | kg/kg H₂-product | User |
| I | Input material category | — | User |
| LCI_o | LCI of input material “o” | kgCO₂e/kg “o” | Basic Data or User |

Examples from PDF: water, salt, chemicals (NaOH, HCl), PEM electrolyte, etc. Basic Data Provided for primary input materials for water electrolysis.

---

## 4. Process emissions (Eprocess) — D-1, D-2

| Symbol (PDF) | Description | Unit | Source |
|--------------|-------------|------|--------|
| Enon-combustion | Non-combustion process emissions | kgCO₂e/kg H₂-product | User (Site/Design) |
| Ecombustion | Combustion emissions | kgCO₂e/kg H₂-product | D-2 or User |
| Fn | Input amount of process fuel “n” (for combustion) | MJ/kg H₂-product | User |
| IPCCn | Combustion GHG of process fuel “n” | kgCO₂e/MJ | User or default |

For water electrolysis, direct process emissions are typically zero or small; fossil pathways use Site/Design Data.

---

## 5. Fugitive non-CO₂ (Efugitive non-CO2)

| Source | Description |
|--------|-------------|
| User (Site Data) | Leakage rates, mass balance per stage |
| IPCC / recognized coefficients | When Site Data not available; must be reported |

---

## 6. By-products — EC-credit (E-1), EC-tracking (E-2), AF (F-1)

### Carbon-containing by-products (E-1, E-2)

| Symbol (PDF) | Description | Unit | Source |
|--------------|-------------|------|--------|
| Pq | Sales amount of carbon-containing by-product “q” | kg/kg H₂-product | User |
| LCIq | LCI of by-product “q” (alternative system) | kgCO₂e/kg “q” | User or reference data |
| impq | Production ratio of carbon-containing by-product “q” | kg by-product/kg H₂-product | User |
| CCFq | Carbon content in by-product “q” | kg-C/kg by-product | User |

### Energy allocation factor (F-1) — by-products without carbon

| Symbol (PDF) | Description | Unit | Source |
|--------------|-------------|------|--------|
| LHVH2 (gas) | LHV of sold hydrogen | MJ/kg H₂-product | Constant or User |
| LHVq | LHV of by-product “q” (no carbon) | MJ/kg by-product “q” | User |
| MassH2 (gas) | Mass of hydrogen produced | kg H₂-product | User |
| Massq | Mass of by-product “q” produced | kg by-product “q” | User |

For heat/steam by-products: allocation uses available energy (enthalpy difference × Carnot efficiency η). Tsource, Treference (273.15 K).

---

## 7. CCS (G-1 to G-3, ECO2 sequestrated)

| Symbol (PDF) | Description | Unit | Source |
|--------------|-------------|------|--------|
| ECCS process | CCS process emissions | kgCO₂e/kg H₂-product | G-1–G-3; capture from Site Data, transport/storage from Basic Data |
| ECO2 sequestrated | Permanently sequestered CO₂ (credit) | kgCO₂/kg H₂-product | User (Site Data) + verification |
| Per process i: GHGi,direct, GHGi,life cycle, GHGi,non-combustion, Yi, lt, etc. | Per G-2, G-3 | — | Site Data for capture; Basic Data for transport/storage |

---

## 8. Rounding and unit (Article 7)

- Unit: **kgCO₂eq/kg H₂**.
- Sum at 4th decimal place; round to 3rd for calculation, 2nd for grade.
- GWP: IPCC AR5 100-year.

---

## 9. Hydrogen purity (Section 9 of Attached Form 1)

- Minimum **99% (vol)** after refinement. User may need to confirm purity; emissions calculated until refinement process.

---

## Mapping to canonical project inputs

The **canonical input model** in the product spec must include fields that map to every user-provided variable above (or explicitly state when Basic Data Provided is used instead). The Korea adapter must **only** use these inputs and the formulas in Attached Form 1 to compute Etotal and components—no ad hoc formulas.
