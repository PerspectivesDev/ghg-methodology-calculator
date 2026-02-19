"""Tests for the India GHCI methodology."""

import pytest

from ghg_methodology_calculator.core.models import ElectrolysisInputs, SMRInputs
from ghg_methodology_calculator.methodologies.india_ghci import IndiaGHCI


class TestIndiaGHCIElectrolysis:
    def setup_method(self):
        self.method = IndiaGHCI()

    # ------------------------------------------------------------------ happy path

    def test_100pct_renewable_passes(self):
        """Pure renewable electricity → well below 2 kg CO₂e/kg H₂ threshold."""
        inputs = ElectrolysisInputs(
            electricity_consumption_kwh_per_kg_h2=55.0,
            grid_emission_factor_kg_co2e_per_kwh=0.0,
        )
        result = self.method.calculate_electrolysis(inputs)

        assert result.passes_certification is True
        assert result.certification_tier == "Green Hydrogen"
        assert result.threshold_kg_co2e_per_kg_h2 == pytest.approx(2.0)
        assert result.total_intensity_kg_co2e_per_kg_h2 == pytest.approx(0.0, abs=1e-9)

    def test_moderate_grid_factor_passes(self):
        """0.02 kg CO₂e/kWh × 55 kWh = 1.1 kg CO₂e/kg H₂ → passes."""
        inputs = ElectrolysisInputs(
            electricity_consumption_kwh_per_kg_h2=55.0,
            grid_emission_factor_kg_co2e_per_kwh=0.02,
        )
        result = self.method.calculate_electrolysis(inputs)
        assert result.passes_certification is True
        # intensity ≈ 1.1 + small water contribution
        assert result.total_intensity_kg_co2e_per_kg_h2 < 2.0

    def test_high_grid_factor_fails(self):
        """High-carbon grid → exceeds 2 kg CO₂e/kg H₂."""
        inputs = ElectrolysisInputs(
            electricity_consumption_kwh_per_kg_h2=55.0,
            grid_emission_factor_kg_co2e_per_kwh=0.5,  # typical coal grid
        )
        result = self.method.calculate_electrolysis(inputs)
        assert result.passes_certification is False
        assert "Not Certified" in result.certification_tier

    def test_exact_threshold_passes(self):
        """Intensity exactly at 2 kg CO₂e/kg H₂ should pass (≤ threshold)."""
        # Choose inputs that produce exactly 2.0 kg CO₂e/kg H₂:
        # electricity only, no water, 2.0 / 55 ≈ 0.036363…
        inputs = ElectrolysisInputs(
            electricity_consumption_kwh_per_kg_h2=55.0,
            grid_emission_factor_kg_co2e_per_kwh=2.0 / 55.0,
            water_consumption_l_per_kg_h2=0.0,
            water_treatment_energy_kwh_per_l=0.0,
        )
        result = self.method.calculate_electrolysis(inputs)
        assert result.total_intensity_kg_co2e_per_kg_h2 == pytest.approx(2.0)
        assert result.passes_certification is True

    def test_td_losses_increase_intensity(self):
        """Adding T&D losses should increase the calculated intensity."""
        base_inputs = ElectrolysisInputs(
            electricity_consumption_kwh_per_kg_h2=55.0,
            grid_emission_factor_kg_co2e_per_kwh=0.01,
            upstream_electricity_losses_fraction=0.0,
        )
        loss_inputs = ElectrolysisInputs(
            electricity_consumption_kwh_per_kg_h2=55.0,
            grid_emission_factor_kg_co2e_per_kwh=0.01,
            upstream_electricity_losses_fraction=0.05,
        )
        base_result = self.method.calculate_electrolysis(base_inputs)
        loss_result = self.method.calculate_electrolysis(loss_inputs)
        assert loss_result.total_intensity_kg_co2e_per_kg_h2 > base_result.total_intensity_kg_co2e_per_kg_h2

    def test_electricity_breakdown_calculation(self):
        """Manual verification of electricity emission step."""
        ef = 0.03
        kwh = 50.0
        inputs = ElectrolysisInputs(
            electricity_consumption_kwh_per_kg_h2=kwh,
            grid_emission_factor_kg_co2e_per_kwh=ef,
            water_consumption_l_per_kg_h2=0.0,
            water_treatment_energy_kwh_per_l=0.0,
        )
        result = self.method.calculate_electrolysis(inputs)
        expected = kwh * ef  # 1.5 kg CO₂e/kg H₂
        assert result.breakdown.production_emissions == pytest.approx(expected)
        assert result.total_intensity_kg_co2e_per_kg_h2 == pytest.approx(expected)

    def test_water_treatment_excluded_when_disabled(self):
        method_no_water = IndiaGHCI(include_water_treatment=False)
        method_with_water = IndiaGHCI(include_water_treatment=True)
        inputs = ElectrolysisInputs(
            electricity_consumption_kwh_per_kg_h2=55.0,
            grid_emission_factor_kg_co2e_per_kwh=0.01,
        )
        result_no = method_no_water.calculate_electrolysis(inputs)
        result_with = method_with_water.calculate_electrolysis(inputs)
        assert result_no.breakdown.upstream_emissions == 0.0
        assert result_with.breakdown.upstream_emissions > 0.0

    def test_result_metadata(self):
        inputs = ElectrolysisInputs(
            electricity_consumption_kwh_per_kg_h2=55.0,
            grid_emission_factor_kg_co2e_per_kwh=0.0,
        )
        result = self.method.calculate_electrolysis(inputs)
        assert result.methodology == "India GHCI"
        assert "MNRE" in result.methodology_version
        assert result.pathway == "electrolysis"
        assert len(result.notes) > 0
        assert len(result.assumptions) > 0

    def test_to_dict_serialisable(self):
        import json
        inputs = ElectrolysisInputs(
            electricity_consumption_kwh_per_kg_h2=55.0,
            grid_emission_factor_kg_co2e_per_kwh=0.01,
        )
        result = self.method.calculate_electrolysis(inputs)
        d = result.to_dict()
        # Should be JSON-serialisable without errors
        json.dumps(d)


class TestIndiaGHCISMR:
    def setup_method(self):
        self.method = IndiaGHCI()

    def test_smr_without_ccs_fails(self):
        """Conventional SMR produces ~10+ kg CO₂e/kg H₂ → does not pass."""
        inputs = SMRInputs(
            natural_gas_consumption_mj_per_kg_h2=185.0,
            natural_gas_upstream_emission_factor_kg_co2e_per_mj=0.0053,
            process_co2_direct_kg_per_kg_h2=9.0,
            ccs_capture_rate=0.0,
        )
        result = self.method.calculate_smr(inputs)
        assert result.passes_certification is False
        assert result.total_intensity_kg_co2e_per_kg_h2 > 2.0

    def test_smr_with_high_ccs_may_pass(self):
        """SMR + 95 % CCS can drop below 2 kg CO₂e/kg H₂."""
        inputs = SMRInputs(
            natural_gas_consumption_mj_per_kg_h2=185.0,
            natural_gas_upstream_emission_factor_kg_co2e_per_mj=0.0053,
            process_co2_direct_kg_per_kg_h2=9.0,
            ccs_capture_rate=0.95,
        )
        result = self.method.calculate_smr(inputs)
        # upstream ≈ 0.98 + process_net ≈ 0.45 → ~1.43 → should pass
        assert result.passes_certification is True

    def test_pathway_is_smr_with_ccs(self):
        inputs = SMRInputs(ccs_capture_rate=0.9)
        result = self.method.calculate_smr(inputs)
        assert result.pathway == "smr_with_ccs"

    def test_pathway_is_smr_without_ccs(self):
        inputs = SMRInputs(ccs_capture_rate=0.0)
        result = self.method.calculate_smr(inputs)
        assert result.pathway == "smr_without_ccs"

    def test_ccs_credit_reduces_intensity(self):
        inputs_no_ccs = SMRInputs(ccs_capture_rate=0.0)
        inputs_ccs = SMRInputs(ccs_capture_rate=0.9)
        result_no = self.method.calculate_smr(inputs_no_ccs)
        result_ccs = self.method.calculate_smr(inputs_ccs)
        assert result_ccs.total_intensity_kg_co2e_per_kg_h2 < result_no.total_intensity_kg_co2e_per_kg_h2

    def test_breakdown_ccs_credit_value(self):
        """CCS credit = process_co2 * ccs_rate."""
        inputs = SMRInputs(
            process_co2_direct_kg_per_kg_h2=9.0,
            ccs_capture_rate=0.9,
        )
        result = self.method.calculate_smr(inputs)
        assert result.breakdown.ccs_credit == pytest.approx(9.0 * 0.9)
