"""Tests for core data models."""

import pytest

from ghg_methodology_calculator.core.models import (
    ElectrolysisInputs,
    GHGBreakdown,
    GHGResult,
    HydrogenPathway,
    SMRInputs,
)


class TestElectrolysisInputs:
    def test_valid_inputs(self):
        inputs = ElectrolysisInputs(
            electricity_consumption_kwh_per_kg_h2=55.0,
            grid_emission_factor_kg_co2e_per_kwh=0.05,
        )
        assert inputs.electricity_consumption_kwh_per_kg_h2 == 55.0
        assert inputs.grid_emission_factor_kg_co2e_per_kwh == 0.05
        # Defaults
        assert inputs.water_consumption_l_per_kg_h2 == 9.0
        assert inputs.water_treatment_energy_kwh_per_l == 0.001
        assert inputs.transport_and_storage_kg_co2e_per_kg_h2 == 0.0
        assert inputs.upstream_electricity_losses_fraction == 0.0

    def test_zero_emission_factor_is_valid(self):
        inputs = ElectrolysisInputs(
            electricity_consumption_kwh_per_kg_h2=55.0,
            grid_emission_factor_kg_co2e_per_kwh=0.0,
        )
        assert inputs.grid_emission_factor_kg_co2e_per_kwh == 0.0

    def test_negative_electricity_raises(self):
        with pytest.raises(ValueError, match="electricity_consumption"):
            ElectrolysisInputs(
                electricity_consumption_kwh_per_kg_h2=-1.0,
                grid_emission_factor_kg_co2e_per_kwh=0.05,
            )

    def test_negative_emission_factor_raises(self):
        with pytest.raises(ValueError, match="grid_emission_factor"):
            ElectrolysisInputs(
                electricity_consumption_kwh_per_kg_h2=55.0,
                grid_emission_factor_kg_co2e_per_kwh=-0.01,
            )

    def test_invalid_td_losses_raises(self):
        with pytest.raises(ValueError, match="upstream_electricity_losses"):
            ElectrolysisInputs(
                electricity_consumption_kwh_per_kg_h2=55.0,
                grid_emission_factor_kg_co2e_per_kwh=0.05,
                upstream_electricity_losses_fraction=1.0,  # must be < 1
            )

    def test_negative_transport_raises(self):
        with pytest.raises(ValueError, match="transport_and_storage"):
            ElectrolysisInputs(
                electricity_consumption_kwh_per_kg_h2=55.0,
                grid_emission_factor_kg_co2e_per_kwh=0.05,
                transport_and_storage_kg_co2e_per_kg_h2=-0.1,
            )


class TestSMRInputs:
    def test_default_values(self):
        inputs = SMRInputs()
        assert inputs.natural_gas_consumption_mj_per_kg_h2 == 185.0
        assert inputs.ccs_capture_rate == 0.0

    def test_ccs_rate_out_of_range_raises(self):
        with pytest.raises(ValueError, match="ccs_capture_rate"):
            SMRInputs(ccs_capture_rate=1.5)

    def test_ccs_rate_zero_valid(self):
        inputs = SMRInputs(ccs_capture_rate=0.0)
        assert inputs.ccs_capture_rate == 0.0

    def test_ccs_rate_one_valid(self):
        inputs = SMRInputs(ccs_capture_rate=1.0)
        assert inputs.ccs_capture_rate == 1.0

    def test_negative_ng_consumption_raises(self):
        with pytest.raises(ValueError, match="natural_gas_consumption"):
            SMRInputs(natural_gas_consumption_mj_per_kg_h2=-10.0)


class TestGHGBreakdown:
    def test_total_is_sum(self):
        bd = GHGBreakdown(
            upstream_emissions=1.0,
            production_emissions=2.0,
            transport_and_storage_emissions=0.5,
            ccs_credit=0.8,
        )
        assert bd.total == pytest.approx(1.0 + 2.0 + 0.5 - 0.8)

    def test_to_dict_contains_total(self):
        bd = GHGBreakdown(production_emissions=3.0)
        d = bd.to_dict()
        assert "total" in d
        assert d["total"] == pytest.approx(3.0)


class TestGHGResult:
    def _make_result(self, total=1.5, passes=True):
        bd = GHGBreakdown(production_emissions=total)
        return GHGResult(
            methodology="Test",
            methodology_version="v1",
            pathway=HydrogenPathway.ELECTROLYSIS.value,
            total_intensity_kg_co2e_per_kg_h2=total,
            breakdown=bd,
            certification_tier="Green",
            threshold_kg_co2e_per_kg_h2=2.0,
            passes_certification=passes,
        )

    def test_to_dict_keys(self):
        result = self._make_result()
        d = result.to_dict()
        for key in (
            "methodology",
            "methodology_version",
            "pathway",
            "total_intensity_kg_co2e_per_kg_h2",
            "breakdown",
            "certification_tier",
            "threshold_kg_co2e_per_kg_h2",
            "passes_certification",
            "assumptions",
            "notes",
        ):
            assert key in d, f"Missing key: {key}"

    def test_summary_contains_intensity(self):
        result = self._make_result(total=1.23)
        summary = result.summary()
        assert "1.2300" in summary
        assert "PASSES" in summary

    def test_summary_fail(self):
        result = self._make_result(total=3.5, passes=False)
        summary = result.summary()
        assert "DOES NOT PASS" in summary
