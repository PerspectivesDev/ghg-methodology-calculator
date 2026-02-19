"""India Green Hydrogen Certification of India (GHCI) methodology.

Reference
---------
Ministry of New and Renewable Energy (MNRE), Government of India.
"Green Hydrogen Standard for India."
Notification S.O. 3769(E), Gazette of India, 18 August 2023.

Scope & System Boundary
-----------------------
Well-to-gate lifecycle assessment (extraction of raw materials →
production of hydrogen at the plant gate).  End-use (combustion)
emissions are excluded.

Certification Threshold
-----------------------
≤ 2 kg CO₂e/kg H₂  →  "Green Hydrogen"

GHG Accounting Formula (Electrolysis)
--------------------------------------
    CI = (E_elec_total × EF_elec + E_water × EF_water) / H₂_output
         + transport_storage

where
    E_elec_total  = electricity consumption including upstream T&D losses
    EF_elec       = lifecycle emission factor of electricity supply
    E_water       = energy for water demineralisation
    EF_water      = emission factor of that energy (uses same EF_elec)
    transport_storage = downstream compression/storage/transport emissions

GHG Accounting Formula (SMR + CCS)
-------------------------------------
    CI = E_NG_upstream + (1 − CCS_rate) × process_CO₂ + transport_storage

where
    E_NG_upstream = natural_gas_consumption × NG_upstream_EF
    process_CO₂   = direct CO₂ released at the SMR plant per kg H₂
    CCS_rate      = fraction of direct CO₂ captured and stored
"""

from __future__ import annotations

from ghg_methodology_calculator.core.models import (
    ElectrolysisInputs,
    GHGBreakdown,
    GHGResult,
    HydrogenPathway,
    SMRInputs,
)
from ghg_methodology_calculator.methodologies.base import BaseMethodology


class IndiaGHCI(BaseMethodology):
    """India MNRE Green Hydrogen Standard (August 2023).

    Applies the well-to-gate lifecycle boundary defined in the MNRE
    notification to produce a verification-ready GHG intensity result.

    Parameters
    ----------
    include_water_treatment:
        Whether to include water demineralisation energy in the calculation.
        The MNRE notification requires all energy inputs to be accounted for;
        default ``True``.
    """

    name = "India GHCI"
    version = "MNRE Notification S.O. 3769(E), 18 Aug 2023"
    reference = "https://mnre.gov.in/green-hydrogen-standard-for-india"

    #: MNRE Green Hydrogen threshold [kg CO₂e/kg H₂]
    GREEN_HYDROGEN_THRESHOLD: float = 2.0

    def __init__(self, include_water_treatment: bool = True) -> None:
        self.include_water_treatment = include_water_treatment

    # ------------------------------------------------------------------
    # Public API
    # ------------------------------------------------------------------

    def calculate_electrolysis(self, inputs: ElectrolysisInputs) -> GHGResult:
        """Calculate GHCI-compliant GHG intensity for electrolytic hydrogen.

        Parameters
        ----------
        inputs:
            :class:`~ghg_methodology_calculator.core.models.ElectrolysisInputs`
            describing the electrolysis plant.

        Returns
        -------
        GHGResult
        """
        notes: list[str] = [
            "Methodology: MNRE Green Hydrogen Standard, S.O. 3769(E), 18 Aug 2023.",
            "System boundary: well-to-gate (excludes end-use combustion).",
            "Functional unit: 1 kg H₂ produced at the plant gate.",
        ]

        # Step 1 – Effective electricity consumption (including T&D losses)
        e_elec_effective = inputs.electricity_consumption_kwh_per_kg_h2 * (
            1.0 + inputs.upstream_electricity_losses_fraction
        )
        notes.append(
            f"Step 1 – Effective electricity: "
            f"{inputs.electricity_consumption_kwh_per_kg_h2} kWh/kg H₂ × "
            f"(1 + {inputs.upstream_electricity_losses_fraction}) = "
            f"{e_elec_effective:.4f} kWh/kg H₂"
        )

        # Step 2 – Production emissions from electricity
        production_elec = e_elec_effective * inputs.grid_emission_factor_kg_co2e_per_kwh
        notes.append(
            f"Step 2 – Production (electricity): "
            f"{e_elec_effective:.4f} kWh/kg H₂ × "
            f"{inputs.grid_emission_factor_kg_co2e_per_kwh} kg CO₂e/kWh = "
            f"{production_elec:.4f} kg CO₂e/kg H₂"
        )

        # Step 3 – Upstream emissions from water treatment (optional)
        upstream = 0.0
        if self.include_water_treatment:
            water_energy = (
                inputs.water_consumption_l_per_kg_h2
                * inputs.water_treatment_energy_kwh_per_l
            )
            upstream = water_energy * inputs.grid_emission_factor_kg_co2e_per_kwh
            notes.append(
                f"Step 3 – Upstream (water treatment): "
                f"{inputs.water_consumption_l_per_kg_h2} L/kg H₂ × "
                f"{inputs.water_treatment_energy_kwh_per_l} kWh/L × "
                f"{inputs.grid_emission_factor_kg_co2e_per_kwh} kg CO₂e/kWh = "
                f"{upstream:.6f} kg CO₂e/kg H₂"
            )
        else:
            notes.append("Step 3 – Water treatment upstream emissions: excluded (user choice).")

        # Step 4 – Transport & storage (well-to-gate excludes this unless specified)
        t_s = inputs.transport_and_storage_kg_co2e_per_kg_h2
        notes.append(
            f"Step 4 – Transport & storage: {t_s:.4f} kg CO₂e/kg H₂ "
            f"({'included per user input' if t_s > 0 else 'zero — well-to-gate boundary'})."
        )

        breakdown = GHGBreakdown(
            upstream_emissions=upstream,
            production_emissions=production_elec,
            transport_and_storage_emissions=t_s,
            ccs_credit=0.0,
        )

        tier, threshold, passes = self._classify(breakdown.total)

        assumptions = {
            "electricity_consumption_kwh_per_kg_h2": inputs.electricity_consumption_kwh_per_kg_h2,
            "grid_emission_factor_kg_co2e_per_kwh": inputs.grid_emission_factor_kg_co2e_per_kwh,
            "water_consumption_l_per_kg_h2": inputs.water_consumption_l_per_kg_h2,
            "water_treatment_energy_kwh_per_l": inputs.water_treatment_energy_kwh_per_l,
            "upstream_electricity_losses_fraction": inputs.upstream_electricity_losses_fraction,
            "transport_and_storage_kg_co2e_per_kg_h2": t_s,
            "include_water_treatment": self.include_water_treatment,
        }

        notes.append(
            f"Result: {breakdown.total:.4f} kg CO₂e/kg H₂ → tier '{tier}' "
            f"(threshold ≤ {threshold} kg CO₂e/kg H₂, "
            f"{'PASSES' if passes else 'DOES NOT PASS'})."
        )

        return GHGResult(
            methodology=self.name,
            methodology_version=self.version,
            pathway=HydrogenPathway.ELECTROLYSIS.value,
            total_intensity_kg_co2e_per_kg_h2=breakdown.total,
            breakdown=breakdown,
            certification_tier=tier,
            threshold_kg_co2e_per_kg_h2=threshold,
            passes_certification=passes,
            assumptions=assumptions,
            notes=notes,
        )

    def calculate_smr(self, inputs: SMRInputs) -> GHGResult:
        """Calculate GHCI-compliant GHG intensity for SMR/ATR hydrogen.

        Covers both conventional SMR (CCS rate = 0) and SMR/ATR with CCS.

        Parameters
        ----------
        inputs:
            :class:`~ghg_methodology_calculator.core.models.SMRInputs`.

        Returns
        -------
        GHGResult
        """
        notes: list[str] = [
            "Methodology: MNRE Green Hydrogen Standard, S.O. 3769(E), 18 Aug 2023.",
            "System boundary: well-to-gate (excludes end-use combustion).",
            "Functional unit: 1 kg H₂ produced at the plant gate.",
        ]

        pathway = (
            HydrogenPathway.SMR_WITH_CCS.value
            if inputs.ccs_capture_rate > 0
            else HydrogenPathway.SMR_WITHOUT_CCS.value
        )

        # Step 1 – Upstream NG emissions
        upstream = (
            inputs.natural_gas_consumption_mj_per_kg_h2
            * inputs.natural_gas_upstream_emission_factor_kg_co2e_per_mj
        )
        notes.append(
            f"Step 1 – Upstream (NG extraction & transport): "
            f"{inputs.natural_gas_consumption_mj_per_kg_h2} MJ/kg H₂ × "
            f"{inputs.natural_gas_upstream_emission_factor_kg_co2e_per_mj} kg CO₂e/MJ = "
            f"{upstream:.4f} kg CO₂e/kg H₂"
        )

        # Step 2 – Gross direct process CO₂ at the SMR plant (before CCS)
        gross_process_co2 = inputs.process_co2_direct_kg_per_kg_h2
        notes.append(
            f"Step 2 – Gross direct process CO₂: "
            f"{gross_process_co2:.4f} kg CO₂/kg H₂"
        )

        # Step 3 – CCS credit (amount sequestered)
        ccs_credit = gross_process_co2 * inputs.ccs_capture_rate
        net_process_co2 = gross_process_co2 - ccs_credit
        notes.append(
            f"Step 3 – CCS credit: {gross_process_co2} × {inputs.ccs_capture_rate} = "
            f"{ccs_credit:.4f} kg CO₂/kg H₂ sequestered; "
            f"net process CO₂ = {net_process_co2:.4f} kg CO₂e/kg H₂"
        )

        # Step 4 – Transport & storage
        t_s = inputs.transport_and_storage_kg_co2e_per_kg_h2
        notes.append(
            f"Step 4 – Transport & storage: {t_s:.4f} kg CO₂e/kg H₂."
        )

        breakdown = GHGBreakdown(
            upstream_emissions=upstream,
            production_emissions=gross_process_co2,
            transport_and_storage_emissions=t_s,
            ccs_credit=ccs_credit,
        )

        tier, threshold, passes = self._classify(breakdown.total)

        assumptions = {
            "natural_gas_consumption_mj_per_kg_h2": inputs.natural_gas_consumption_mj_per_kg_h2,
            "natural_gas_upstream_emission_factor_kg_co2e_per_mj": (
                inputs.natural_gas_upstream_emission_factor_kg_co2e_per_mj
            ),
            "process_co2_direct_kg_per_kg_h2": inputs.process_co2_direct_kg_per_kg_h2,
            "ccs_capture_rate": inputs.ccs_capture_rate,
            "transport_and_storage_kg_co2e_per_kg_h2": t_s,
            "gwp100_ch4": inputs.gwp100_ch4,
        }

        notes.append(
            f"Result: {breakdown.total:.4f} kg CO₂e/kg H₂ → tier '{tier}' "
            f"(threshold ≤ {threshold} kg CO₂e/kg H₂, "
            f"{'PASSES' if passes else 'DOES NOT PASS'})."
        )

        return GHGResult(
            methodology=self.name,
            methodology_version=self.version,
            pathway=pathway,
            total_intensity_kg_co2e_per_kg_h2=breakdown.total,
            breakdown=breakdown,
            certification_tier=tier,
            threshold_kg_co2e_per_kg_h2=threshold,
            passes_certification=passes,
            assumptions=assumptions,
            notes=notes,
        )

    # ------------------------------------------------------------------
    # Internal helpers
    # ------------------------------------------------------------------

    def _classify(self, intensity: float) -> tuple[str, float, bool]:
        """Classify intensity against the MNRE Green Hydrogen threshold.

        Parameters
        ----------
        intensity:
            Total lifecycle GHG intensity [kg CO₂e/kg H₂].

        Returns
        -------
        (tier_label, threshold_used, passes)
        """
        if intensity <= self.GREEN_HYDROGEN_THRESHOLD:
            return ("Green Hydrogen", self.GREEN_HYDROGEN_THRESHOLD, True)
        return ("Not Certified (exceeds Green Hydrogen threshold)", self.GREEN_HYDROGEN_THRESHOLD, False)
