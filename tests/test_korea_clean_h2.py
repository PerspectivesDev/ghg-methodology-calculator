"""Tests for the Korea Clean H2 (CHPS) methodology."""

import pytest

from ghg_methodology_calculator.core.models import ElectrolysisInputs, SMRInputs
from ghg_methodology_calculator.methodologies.korea_clean_h2 import KoreaCleanH2


class TestKoreaCleanH2Electrolysis:
    def setup_method(self):
        self.method = KoreaCleanH2()

    # ------------------------------------------------------------------ tier classification

    def test_renewable_electricity_grade1(self):
        """Pure renewable → Grade 1 (≤ 1 kg CO₂e/kg H₂)."""
        inputs = ElectrolysisInputs(
            electricity_consumption_kwh_per_kg_h2=55.0,
            grid_emission_factor_kg_co2e_per_kwh=0.0,
        )
        result = self.method.calculate_electrolysis(inputs)
        assert result.passes_certification is True
        assert "Grade 1" in result.certification_tier
        assert result.threshold_kg_co2e_per_kg_h2 == pytest.approx(1.0)

    def test_medium_emission_factor_grade2(self):
        """0.04 kg CO₂e/kWh × 55 ≈ 2.2 → Grade 2 (1 < x ≤ 4)."""
        inputs = ElectrolysisInputs(
            electricity_consumption_kwh_per_kg_h2=55.0,
            grid_emission_factor_kg_co2e_per_kwh=0.04,
            water_consumption_l_per_kg_h2=0.0,
            water_treatment_energy_kwh_per_l=0.0,
        )
        result = self.method.calculate_electrolysis(inputs)
        expected_intensity = 55.0 * 0.04  # 2.2
        assert result.total_intensity_kg_co2e_per_kg_h2 == pytest.approx(expected_intensity)
        assert result.passes_certification is True
        assert "Grade 2" in result.certification_tier
        assert result.threshold_kg_co2e_per_kg_h2 == pytest.approx(4.0)

    def test_high_emission_factor_not_certified(self):
        """High carbon grid → not certified (> 4 kg CO₂e/kg H₂)."""
        inputs = ElectrolysisInputs(
            electricity_consumption_kwh_per_kg_h2=55.0,
            grid_emission_factor_kg_co2e_per_kwh=0.5,
            water_consumption_l_per_kg_h2=0.0,
            water_treatment_energy_kwh_per_l=0.0,
        )
        result = self.method.calculate_electrolysis(inputs)
        assert result.passes_certification is False
        assert "Not Certified" in result.certification_tier

    def test_exact_grade1_threshold(self):
        """Intensity exactly 1.0 → Grade 1 (boundary inclusive)."""
        inputs = ElectrolysisInputs(
            electricity_consumption_kwh_per_kg_h2=55.0,
            grid_emission_factor_kg_co2e_per_kwh=1.0 / 55.0,
            water_consumption_l_per_kg_h2=0.0,
            water_treatment_energy_kwh_per_l=0.0,
        )
        result = self.method.calculate_electrolysis(inputs)
        assert result.total_intensity_kg_co2e_per_kg_h2 == pytest.approx(1.0)
        assert "Grade 1" in result.certification_tier
        assert result.passes_certification is True

    def test_exact_grade2_threshold(self):
        """Intensity exactly 4.0 → Grade 2 (boundary inclusive)."""
        inputs = ElectrolysisInputs(
            electricity_consumption_kwh_per_kg_h2=55.0,
            grid_emission_factor_kg_co2e_per_kwh=4.0 / 55.0,
            water_consumption_l_per_kg_h2=0.0,
            water_treatment_energy_kwh_per_l=0.0,
        )
        result = self.method.calculate_electrolysis(inputs)
        assert result.total_intensity_kg_co2e_per_kg_h2 == pytest.approx(4.0)
        assert "Grade 2" in result.certification_tier
        assert result.passes_certification is True

    def test_water_treatment_contribution(self):
        """Water treatment adds a small upstream emission."""
        inputs = ElectrolysisInputs(
            electricity_consumption_kwh_per_kg_h2=55.0,
            grid_emission_factor_kg_co2e_per_kwh=0.0,
            water_consumption_l_per_kg_h2=9.0,
            water_treatment_energy_kwh_per_l=0.001,
        )
        result = self.method.calculate_electrolysis(inputs)
        # Only water treatment contribution (9 × 0.001 × 0.0 = 0 for zero EF)
        assert result.breakdown.upstream_emissions == pytest.approx(0.0)

    def test_water_treatment_with_nonzero_ef(self):
        """Water treatment energy × EF adds to upstream emissions."""
        inputs = ElectrolysisInputs(
            electricity_consumption_kwh_per_kg_h2=55.0,
            grid_emission_factor_kg_co2e_per_kwh=0.01,
            water_consumption_l_per_kg_h2=9.0,
            water_treatment_energy_kwh_per_l=0.001,
        )
        result = self.method.calculate_electrolysis(inputs)
        expected_upstream = 9.0 * 0.001 * 0.01
        assert result.breakdown.upstream_emissions == pytest.approx(expected_upstream)

    def test_result_metadata(self):
        inputs = ElectrolysisInputs(
            electricity_consumption_kwh_per_kg_h2=55.0,
            grid_emission_factor_kg_co2e_per_kwh=0.0,
        )
        result = self.method.calculate_electrolysis(inputs)
        assert "Korea" in result.methodology
        assert result.pathway == "electrolysis"
        assert len(result.notes) > 0

    def test_to_dict_serialisable(self):
        import json
        inputs = ElectrolysisInputs(
            electricity_consumption_kwh_per_kg_h2=55.0,
            grid_emission_factor_kg_co2e_per_kwh=0.02,
        )
        result = self.method.calculate_electrolysis(inputs)
        json.dumps(result.to_dict())


class TestKoreaCleanH2SMR:
    def setup_method(self):
        self.method = KoreaCleanH2()

    def test_smr_no_ccs_not_certified(self):
        """Conventional SMR → well above Grade 2 threshold."""
        inputs = SMRInputs(
            natural_gas_consumption_mj_per_kg_h2=185.0,
            process_co2_direct_kg_per_kg_h2=9.0,
            ccs_capture_rate=0.0,
        )
        result = self.method.calculate_smr(inputs)
        assert result.passes_certification is False
        assert result.total_intensity_kg_co2e_per_kg_h2 > 4.0

    def test_smr_high_ccs_grade2(self):
        """SMR + 90 % CCS: upstream ~0.98 + process_net 0.9 → ≈ 1.88 → Grade 2."""
        inputs = SMRInputs(
            natural_gas_consumption_mj_per_kg_h2=185.0,
            natural_gas_upstream_emission_factor_kg_co2e_per_mj=0.0053,
            process_co2_direct_kg_per_kg_h2=9.0,
            ccs_capture_rate=0.9,
        )
        result = self.method.calculate_smr(inputs)
        assert result.passes_certification is True
        assert "Grade" in result.certification_tier

    def test_smr_very_high_ccs_grade1(self):
        """SMR + 99 % CCS + low upstream can achieve Grade 1."""
        inputs = SMRInputs(
            natural_gas_consumption_mj_per_kg_h2=100.0,
            natural_gas_upstream_emission_factor_kg_co2e_per_mj=0.003,
            process_co2_direct_kg_per_kg_h2=5.0,
            ccs_capture_rate=0.99,
        )
        result = self.method.calculate_smr(inputs)
        # upstream = 100 * 0.003 = 0.3
        # production gross = 5.0, ccs_credit = 5.0 * 0.99 = 4.95
        # total = 0.3 + 5.0 - 4.95 = 0.35 → Grade 1
        expected = 100.0 * 0.003 + 5.0 * (1.0 - 0.99)
        assert result.total_intensity_kg_co2e_per_kg_h2 == pytest.approx(expected, rel=1e-6)
        assert "Grade 1" in result.certification_tier

    def test_ccs_credit_equals_captured_co2(self):
        inputs = SMRInputs(
            process_co2_direct_kg_per_kg_h2=8.0,
            ccs_capture_rate=0.85,
        )
        result = self.method.calculate_smr(inputs)
        assert result.breakdown.ccs_credit == pytest.approx(8.0 * 0.85)

    def test_pathway_labels(self):
        with_ccs = SMRInputs(ccs_capture_rate=0.5)
        without_ccs = SMRInputs(ccs_capture_rate=0.0)
        assert self.method.calculate_smr(with_ccs).pathway == "smr_with_ccs"
        assert self.method.calculate_smr(without_ccs).pathway == "smr_without_ccs"
