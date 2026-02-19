"""Korea Clean Hydrogen (Clean Hydrogen Portfolio Standard — CHPS) methodology.

Reference
---------
Republic of Korea.
"Act on Promotion of Hydrogen Economy and Hydrogen Safety Management"
(수소경제 육성 및 수소 안전관리에 관한 법률), Law No. 16942, 05 Feb 2020,
amended 2022.

Korea's Clean Hydrogen Portfolio Standard (CHPS), enforced by the
Ministry of Trade, Industry and Energy (MOTIE) and certified by the
Korea New and Renewable Energy Center (KNREC).

Certification Tiers (GHG intensity per kg H₂ produced)
-------------------------------------------------------
Grade 1 — Very Clean Hydrogen  : ≤ 1.0 kg CO₂e/kg H₂
Grade 2 — Clean Hydrogen       : ≤ 4.0 kg CO₂e/kg H₂
Not Certified                  : > 4.0 kg CO₂e/kg H₂

Only Grade 1 and Grade 2 hydrogen is eligible to supply obligated
power generators under the CHPS mandate.

System Boundary
---------------
Well-to-gate (consistent with ISO 14040/14044 cradle-to-gate LCA).
Excludes end-use (combustion) CO₂ which is accounted for separately
under the power-sector accounting rules.

GHG Accounting Formula (Electrolysis)
--------------------------------------
    CI = (E_elec_total × EF_elec + E_water × EF_water) / H₂_output
         + transport_storage

GHG Accounting Formula (SMR + optional CCS)
---------------------------------------------
    CI = E_NG_upstream + (1 − CCS_rate) × process_CO₂ + transport_storage
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


class KoreaCleanH2(BaseMethodology):
    """Korea CHPS Clean Hydrogen certification methodology.

    Applies Korea's well-to-gate system boundary and the two-tier
    (Grade 1 / Grade 2) certification structure.
    """

    name = "Korea Clean H2 (CHPS)"
    version = "Korea Hydrogen Act (Law No. 16942, 2020 / amended 2022)"
    reference = "https://www.knrec.or.kr/business/hydrogen_certification.do"

    #: Grade thresholds [kg CO₂e/kg H₂]
    GRADE_1_THRESHOLD: float = 1.0   # Very Clean Hydrogen
    GRADE_2_THRESHOLD: float = 4.0   # Clean Hydrogen

    # ------------------------------------------------------------------
    # Public API
    # ------------------------------------------------------------------

    def calculate_electrolysis(self, inputs: ElectrolysisInputs) -> GHGResult:
        """Calculate CHPS-compliant GHG intensity for electrolytic hydrogen.

        Parameters
        ----------
        inputs:
            :class:`~ghg_methodology_calculator.core.models.ElectrolysisInputs`.

        Returns
        -------
        GHGResult
        """
        notes: list[str] = [
            "Methodology: Korea CHPS Clean Hydrogen, Law No. 16942 (amended 2022).",
            "System boundary: well-to-gate (excludes end-use combustion).",
            "Functional unit: 1 kg H₂ produced at the plant gate.",
            f"Certification tiers: Grade 1 ≤ {self.GRADE_1_THRESHOLD} kg CO₂e/kg H₂; "
            f"Grade 2 ≤ {self.GRADE_2_THRESHOLD} kg CO₂e/kg H₂.",
        ]

        # Step 1 – Effective electricity (with T&D losses)
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

        # Step 3 – Upstream from water treatment
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

        # Step 4 – Transport & storage
        t_s = inputs.transport_and_storage_kg_co2e_per_kg_h2
        notes.append(
            f"Step 4 – Transport & storage: {t_s:.4f} kg CO₂e/kg H₂ "
            f"({'included' if t_s > 0 else 'zero — well-to-gate boundary'})."
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
        }

        notes.append(
            f"Result: {breakdown.total:.4f} kg CO₂e/kg H₂ → '{tier}' "
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
        """Calculate CHPS-compliant GHG intensity for SMR/ATR hydrogen.

        Parameters
        ----------
        inputs:
            :class:`~ghg_methodology_calculator.core.models.SMRInputs`.

        Returns
        -------
        GHGResult
        """
        notes: list[str] = [
            "Methodology: Korea CHPS Clean Hydrogen, Law No. 16942 (amended 2022).",
            "System boundary: well-to-gate (excludes end-use combustion).",
            "Functional unit: 1 kg H₂ produced at the plant gate.",
            f"Certification tiers: Grade 1 ≤ {self.GRADE_1_THRESHOLD} kg CO₂e/kg H₂; "
            f"Grade 2 ≤ {self.GRADE_2_THRESHOLD} kg CO₂e/kg H₂.",
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
        notes.append(f"Step 4 – Transport & storage: {t_s:.4f} kg CO₂e/kg H₂.")

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
            f"Result: {breakdown.total:.4f} kg CO₂e/kg H₂ → '{tier}' "
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
        """Map intensity to a Korea CHPS certification tier.

        Parameters
        ----------
        intensity:
            Total lifecycle GHG intensity [kg CO₂e/kg H₂].

        Returns
        -------
        (tier_label, threshold_used, passes)
            The ``threshold_used`` is the threshold for the *highest*
            grade achieved (or the Grade 2 threshold if not certified).
        """
        if intensity <= self.GRADE_1_THRESHOLD:
            return ("Grade 1 — Very Clean Hydrogen", self.GRADE_1_THRESHOLD, True)
        if intensity <= self.GRADE_2_THRESHOLD:
            return ("Grade 2 — Clean Hydrogen", self.GRADE_2_THRESHOLD, True)
        return ("Not Certified (exceeds Grade 2 threshold)", self.GRADE_2_THRESHOLD, False)
