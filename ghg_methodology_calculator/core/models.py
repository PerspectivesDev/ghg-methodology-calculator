"""Data models for GHG intensity inputs and results.

All emission intensities are expressed in kg CO₂e per kg H₂ (functional unit).
Global Warming Potentials (GWP) follow IPCC AR6 100-year values by default:
  CH₄ GWP100 = 29.8 (fossil methane, AR6)
  N₂O GWP100 = 273

Units guide
-----------
* Energy  : kWh (electricity), MJ (heat / fuel LHV)
* Mass    : kg
* Volume  : litres (water)
* Emission factor : kg CO₂e / kWh  or  kg CO₂e / MJ
* GHG intensity   : kg CO₂e / kg H₂
"""

from __future__ import annotations

from dataclasses import dataclass, field
from enum import Enum
from typing import Dict, List, Optional


class HydrogenPathway(str, Enum):
    """Supported hydrogen production pathways."""

    ELECTROLYSIS = "electrolysis"
    SMR_WITH_CCS = "smr_with_ccs"
    SMR_WITHOUT_CCS = "smr_without_ccs"
    BIOMASS_GASIFICATION = "biomass_gasification"


@dataclass
class ElectrolysisInputs:
    """Inputs for electrolytic hydrogen production (PEM, Alkaline, SOEC).

    The functional unit is 1 kg of hydrogen produced at the plant gate.

    Parameters
    ----------
    electricity_consumption_kwh_per_kg_h2:
        AC electricity consumed by the electrolyser system per kg H₂ produced,
        including balance-of-plant auxiliary loads [kWh/kg H₂].
        Typical range: 47–65 kWh/kg H₂.
    grid_emission_factor_kg_co2e_per_kwh:
        Lifecycle emission factor of the electricity supply
        [kg CO₂e/kWh].  Use the annual average grid factor for the
        relevant market or the certified renewable-source factor.
    water_consumption_l_per_kg_h2:
        Purified water consumed per kg H₂ produced [L/kg H₂].
        Typical value ≈ 9 L/kg H₂ (stoichiometric requirement ~9 L).
    water_treatment_energy_kwh_per_l:
        Energy required to demineralise / purify feed water
        [kWh/L].  Default 0.001 kWh/L is a conservative upper bound.
    transport_and_storage_kg_co2e_per_kg_h2:
        Downstream compression, storage, and transport emissions
        [kg CO₂e/kg H₂]. Set to 0 for well-to-gate calculations.
    upstream_electricity_losses_fraction:
        Fraction representing upstream transmission and distribution
        losses to be added to the site electricity consumption.
        E.g. 0.05 for 5 % T&D losses.  Default 0 (losses already in
        the emission factor for many grid datasets).
    """

    electricity_consumption_kwh_per_kg_h2: float
    grid_emission_factor_kg_co2e_per_kwh: float
    water_consumption_l_per_kg_h2: float = 9.0
    water_treatment_energy_kwh_per_l: float = 0.001
    transport_and_storage_kg_co2e_per_kg_h2: float = 0.0
    upstream_electricity_losses_fraction: float = 0.0

    def __post_init__(self) -> None:
        if self.electricity_consumption_kwh_per_kg_h2 <= 0:
            raise ValueError("electricity_consumption_kwh_per_kg_h2 must be positive")
        if self.grid_emission_factor_kg_co2e_per_kwh < 0:
            raise ValueError("grid_emission_factor_kg_co2e_per_kwh cannot be negative")
        if self.water_consumption_l_per_kg_h2 < 0:
            raise ValueError("water_consumption_l_per_kg_h2 cannot be negative")
        if self.water_treatment_energy_kwh_per_l < 0:
            raise ValueError("water_treatment_energy_kwh_per_l cannot be negative")
        if self.transport_and_storage_kg_co2e_per_kg_h2 < 0:
            raise ValueError("transport_and_storage_kg_co2e_per_kg_h2 cannot be negative")
        if not 0.0 <= self.upstream_electricity_losses_fraction < 1.0:
            raise ValueError("upstream_electricity_losses_fraction must be in [0, 1)")


@dataclass
class SMRInputs:
    """Inputs for Steam Methane Reforming (SMR / ATR) hydrogen production.

    Parameters
    ----------
    natural_gas_consumption_mj_per_kg_h2:
        Natural gas consumed as feedstock + fuel per kg H₂ [MJ LHV/kg H₂].
        Typical value ≈ 170–200 MJ/kg H₂ (SMR without pre-reforming).
    natural_gas_upstream_emission_factor_kg_co2e_per_mj:
        Upstream (extraction, processing, transport) lifecycle emission factor
        for natural gas [kg CO₂e/MJ LHV].  Default includes ~2 % methane
        leakage rate assuming fossil CH₄ GWP100 = 29.8.
    process_co2_direct_kg_per_kg_h2:
        Direct CO₂ released at the SMR/ATR plant per kg H₂ produced
        [kg CO₂/kg H₂]. Typically ≈ 8–10 kg CO₂/kg H₂ for conventional SMR.
    ccs_capture_rate:
        Fraction of direct process CO₂ captured and permanently stored [0–1].
        Set to 0 for SMR without CCS; 0.85–0.95 for SMR+CCS.
    transport_and_storage_kg_co2e_per_kg_h2:
        Downstream compression, storage, and transport emissions
        [kg CO₂e/kg H₂].
    gwp100_ch4:
        GWP100 for methane used to convert upstream CH₄ leakage to CO₂e.
        Default 29.8 (IPCC AR6 fossil methane).
    """

    natural_gas_consumption_mj_per_kg_h2: float = 185.0
    natural_gas_upstream_emission_factor_kg_co2e_per_mj: float = 0.0053
    process_co2_direct_kg_per_kg_h2: float = 9.0
    ccs_capture_rate: float = 0.0
    transport_and_storage_kg_co2e_per_kg_h2: float = 0.0
    gwp100_ch4: float = 29.8

    def __post_init__(self) -> None:
        if self.natural_gas_consumption_mj_per_kg_h2 <= 0:
            raise ValueError("natural_gas_consumption_mj_per_kg_h2 must be positive")
        if self.natural_gas_upstream_emission_factor_kg_co2e_per_mj < 0:
            raise ValueError(
                "natural_gas_upstream_emission_factor_kg_co2e_per_mj cannot be negative"
            )
        if self.process_co2_direct_kg_per_kg_h2 < 0:
            raise ValueError("process_co2_direct_kg_per_kg_h2 cannot be negative")
        if not 0.0 <= self.ccs_capture_rate <= 1.0:
            raise ValueError("ccs_capture_rate must be in [0, 1]")
        if self.transport_and_storage_kg_co2e_per_kg_h2 < 0:
            raise ValueError("transport_and_storage_kg_co2e_per_kg_h2 cannot be negative")


@dataclass
class GHGBreakdown:
    """Step-by-step breakdown of lifecycle GHG emissions [kg CO₂e/kg H₂].

    All values are per kg of hydrogen produced (functional unit).
    Negative values represent credits (e.g. CCS sequestration).
    """

    upstream_emissions: float = 0.0
    """Upstream feedstock extraction, processing, and energy supply emissions."""

    production_emissions: float = 0.0
    """Direct process emissions at the hydrogen production plant."""

    transport_and_storage_emissions: float = 0.0
    """Post-gate compression, storage, and transport emissions."""

    ccs_credit: float = 0.0
    """CO₂ sequestration credit (positive value = emission reduction applied)."""

    @property
    def total(self) -> float:
        """Total lifecycle GHG intensity [kg CO₂e/kg H₂]."""
        return (
            self.upstream_emissions
            + self.production_emissions
            + self.transport_and_storage_emissions
            - self.ccs_credit
        )

    def to_dict(self) -> Dict[str, float]:
        return {
            "upstream_emissions": round(self.upstream_emissions, 6),
            "production_emissions": round(self.production_emissions, 6),
            "transport_and_storage_emissions": round(
                self.transport_and_storage_emissions, 6
            ),
            "ccs_credit": round(self.ccs_credit, 6),
            "total": round(self.total, 6),
        }


@dataclass
class GHGResult:
    """Verification-ready result of a lifecycle GHG intensity calculation.

    Contains the total GHG intensity, a detailed per-stage breakdown, the
    methodology name and version, the certification outcome, and a full audit
    trail of assumptions and calculation notes.

    Attributes
    ----------
    methodology:
        Short identifier for the certification methodology
        (e.g. ``"India GHCI"``).
    methodology_version:
        Version or year of the methodology document used.
    pathway:
        Hydrogen production pathway (value from :class:`HydrogenPathway`).
    total_intensity_kg_co2e_per_kg_h2:
        Total well-to-gate lifecycle GHG intensity [kg CO₂e/kg H₂].
    breakdown:
        Per-stage emission breakdown.
    certification_tier:
        Human-readable certification outcome label for this methodology.
    threshold_kg_co2e_per_kg_h2:
        The emission threshold associated with ``certification_tier``.
    passes_certification:
        ``True`` if the calculated intensity qualifies under the relevant
        threshold for this methodology.
    assumptions:
        Dictionary of key input assumptions used in the calculation.
    notes:
        Ordered list of calculation notes providing a full audit trail.
    """

    methodology: str
    methodology_version: str
    pathway: str
    total_intensity_kg_co2e_per_kg_h2: float
    breakdown: GHGBreakdown
    certification_tier: str
    threshold_kg_co2e_per_kg_h2: float
    passes_certification: bool
    assumptions: Dict[str, object] = field(default_factory=dict)
    notes: List[str] = field(default_factory=list)

    def to_dict(self) -> Dict[str, object]:
        """Serialise to a plain dictionary (suitable for JSON output)."""
        return {
            "methodology": self.methodology,
            "methodology_version": self.methodology_version,
            "pathway": self.pathway,
            "total_intensity_kg_co2e_per_kg_h2": round(
                self.total_intensity_kg_co2e_per_kg_h2, 4
            ),
            "breakdown": self.breakdown.to_dict(),
            "certification_tier": self.certification_tier,
            "threshold_kg_co2e_per_kg_h2": self.threshold_kg_co2e_per_kg_h2,
            "passes_certification": self.passes_certification,
            "assumptions": self.assumptions,
            "notes": self.notes,
        }

    def summary(self) -> str:
        """Return a human-readable one-page calculation summary."""
        lines = [
            f"{'=' * 60}",
            f"GHG Intensity Calculation — {self.methodology} ({self.methodology_version})",
            f"{'=' * 60}",
            f"Pathway           : {self.pathway}",
            f"Total Intensity   : {self.total_intensity_kg_co2e_per_kg_h2:.4f} kg CO₂e/kg H₂",
            "",
            "Emission Breakdown (kg CO₂e/kg H₂):",
            f"  Upstream                  : {self.breakdown.upstream_emissions:.4f}",
            f"  Production (direct)       : {self.breakdown.production_emissions:.4f}",
            f"  Transport & Storage       : {self.breakdown.transport_and_storage_emissions:.4f}",
            f"  CCS Credit (deducted)     : {self.breakdown.ccs_credit:.4f}",
            f"  {'─' * 36}",
            f"  TOTAL                     : {self.breakdown.total:.4f}",
            "",
            f"Certification Outcome:",
            f"  Tier      : {self.certification_tier}",
            f"  Threshold : ≤ {self.threshold_kg_co2e_per_kg_h2} kg CO₂e/kg H₂",
            f"  Result    : {'✓ PASSES' if self.passes_certification else '✗ DOES NOT PASS'}",
            "",
            "Assumptions:",
        ]
        for key, value in self.assumptions.items():
            lines.append(f"  {key}: {value}")
        lines += ["", "Calculation Notes:"]
        for note in self.notes:
            lines.append(f"  • {note}")
        lines.append("=" * 60)
        return "\n".join(lines)
