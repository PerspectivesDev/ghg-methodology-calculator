# GHG Methodology Calculator for Hydrogen / PtX

A **verification-ready** Python library and CLI for computing lifecycle GHG
intensity (kg CO₂e / kg H₂) of hydrogen and Power-to-X (PtX) production
pathways, applying the rules of specific certification methodologies.

Currently supported methodologies:

| Identifier | Methodology | Threshold |
|---|---|---|
| `india_ghci` | India MNRE Green Hydrogen Standard (S.O. 3769(E), Aug 2023) | ≤ 2 kg CO₂e/kg H₂ |
| `korea_clean_h2` | Korea CHPS Clean Hydrogen (Law No. 16942, amended 2022) | Grade 1 ≤ 1, Grade 2 ≤ 4 kg CO₂e/kg H₂ |

---

## Features

- **Verification-ready outputs** — every result includes a step-by-step
  calculation audit trail, full input assumption log, and structured
  serialisation (dict / JSON).
- **Two production pathways** — electrolytic hydrogen (PEM, Alkaline, SOEC)
  and steam methane reforming (SMR / ATR), with optional CCS.
- **Extensible** — add new methodologies by subclassing `BaseMethodology`.
- **CLI** — run calculations directly from the terminal, with text or JSON
  output.
- **Pure Python, no dependencies** — works out of the box with the standard
  library; Python ≥ 3.9.

---

## Installation

```bash
pip install -e .           # from source (development)
```

---

## Quick start — Python API

```python
from ghg_methodology_calculator import GHGCalculator, ElectrolysisInputs, SMRInputs

# --- Electrolysis from 100 % renewable electricity (India GHCI) ---
calc = GHGCalculator("india_ghci")
inputs = ElectrolysisInputs(
    electricity_consumption_kwh_per_kg_h2=55,   # kWh/kg H₂
    grid_emission_factor_kg_co2e_per_kwh=0.0,   # renewable → 0
)
result = calc.calculate_electrolysis(inputs)
print(result.summary())
# → Total Intensity : 0.0000 kg CO₂e/kg H₂  ✓ PASSES  (Green Hydrogen)

# --- SMR + 95 % CCS (Korea Clean H2) ---
calc2 = GHGCalculator("korea_clean_h2")
smr_inputs = SMRInputs(ccs_capture_rate=0.95)
result2 = calc2.calculate_smr(smr_inputs)
print(result2.certification_tier)   # → "Grade 2 — Clean Hydrogen"

# --- JSON output for audit / verification systems ---
import json
print(json.dumps(result.to_dict(), indent=2))
```

---

## CLI usage

```bash
# List available methodologies
ghg-calc list-methodologies

# Electrolysis — India GHCI, 100 % solar PV, human-readable report
ghg-calc electrolysis \
    --methodology india_ghci \
    --electricity-kwh 55 \
    --emission-factor 0.0

# Electrolysis — Korea CHPS, mixed grid, JSON output
ghg-calc electrolysis \
    --methodology korea_clean_h2 \
    --electricity-kwh 55 \
    --emission-factor 0.04 \
    --json

# SMR + CCS — India GHCI, 90 % capture rate
ghg-calc smr \
    --methodology india_ghci \
    --ng-consumption 185 \
    --process-co2 9 \
    --ccs-rate 0.90

# All options for electrolysis
ghg-calc electrolysis --help
```

### Example human-readable output

```
============================================================
GHG Intensity Calculation — India GHCI (MNRE Notification S.O. 3769(E), 18 Aug 2023)
============================================================
Pathway           : electrolysis
Total Intensity   : 1.1009 kg CO₂e/kg H₂

Emission Breakdown (kg CO₂e/kg H₂):
  Upstream                  : 0.0009
  Production (direct)       : 1.1000
  Transport & Storage       : 0.0000
  CCS Credit (deducted)     : 0.0000
  ────────────────────────────────────
  TOTAL                     : 1.1009

Certification Outcome:
  Tier      : Green Hydrogen
  Threshold : ≤ 2.0 kg CO₂e/kg H₂
  Result    : ✓ PASSES
...
```

---

## Methodology details

### India GHCI — Green Hydrogen Standard for India

**Reference:** Ministry of New and Renewable Energy (MNRE), Notification
S.O. 3769(E), Gazette of India, 18 August 2023.

**System boundary:** Well-to-gate (extraction of raw materials → plant gate).
End-use combustion emissions are excluded.

**Certification:** Hydrogen is classified as *Green Hydrogen* when lifecycle
GHG intensity ≤ **2 kg CO₂e / kg H₂**.

**Formula (electrolysis):**

```
CI = (E_elec × (1 + T&D_loss) × EF_elec)
   + (V_water × E_water_treat × EF_elec)
   + transport_storage
```

**Formula (SMR ± CCS):**

```
CI = NG_consumption × EF_NG_upstream
   + process_CO₂_gross
   - CCS_credit
   + transport_storage

where CCS_credit = process_CO₂_gross × CCS_capture_rate
```

### Korea Clean H2 — CHPS

**Reference:** Republic of Korea, Act on Promotion of Hydrogen Economy and
Hydrogen Safety Management (Law No. 16942, 5 Feb 2020, amended 2022).
Certified by Korea New and Renewable Energy Center (KNREC).

**Certification tiers:**

| Grade | Label | Threshold |
|---|---|---|
| Grade 1 | Very Clean Hydrogen | ≤ 1.0 kg CO₂e/kg H₂ |
| Grade 2 | Clean Hydrogen | ≤ 4.0 kg CO₂e/kg H₂ |
| — | Not Certified | > 4.0 kg CO₂e/kg H₂ |

Only Grade 1 and Grade 2 hydrogen is eligible under the CHPS mandate.

---

## Running the tests

```bash
pip install -e ".[dev]"
pytest
```

---

## Extending with a new methodology

```python
from ghg_methodology_calculator.methodologies.base import BaseMethodology
from ghg_methodology_calculator.core.models import ElectrolysisInputs, SMRInputs, GHGResult

class MyMethodology(BaseMethodology):
    name = "My Standard"
    version = "v1.0"
    reference = "https://example.com"

    def calculate_electrolysis(self, inputs: ElectrolysisInputs) -> GHGResult:
        ...

    def calculate_smr(self, inputs: SMRInputs) -> GHGResult:
        ...

    def _classify(self, intensity: float):
        if intensity <= 2.0:
            return ("Certified", 2.0, True)
        return ("Not Certified", 2.0, False)

# Use it directly
from ghg_methodology_calculator import GHGCalculator
calc = GHGCalculator(MyMethodology())
```

---

## License

MIT
