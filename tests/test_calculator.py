"""Tests for the GHGCalculator entry point and CLI."""

import json
import pytest

from ghg_methodology_calculator.core.calculator import GHGCalculator
from ghg_methodology_calculator.core.models import ElectrolysisInputs, SMRInputs
from ghg_methodology_calculator.methodologies.india_ghci import IndiaGHCI
from ghg_methodology_calculator.methodologies.korea_clean_h2 import KoreaCleanH2


class TestGHGCalculator:
    def test_string_identifier_india(self):
        calc = GHGCalculator("india_ghci")
        assert isinstance(calc.methodology, IndiaGHCI)

    def test_string_identifier_korea(self):
        calc = GHGCalculator("korea_clean_h2")
        assert isinstance(calc.methodology, KoreaCleanH2)

    def test_case_insensitive(self):
        calc = GHGCalculator("India_GHCI")
        assert isinstance(calc.methodology, IndiaGHCI)

    def test_unknown_methodology_raises(self):
        with pytest.raises(ValueError, match="Unknown methodology"):
            GHGCalculator("unknown_methodology")

    def test_instance_methodology(self):
        method = IndiaGHCI()
        calc = GHGCalculator(method)
        assert calc.methodology is method

    def test_invalid_type_raises(self):
        with pytest.raises(TypeError):
            GHGCalculator(42)

    def test_available_methodologies(self):
        avail = GHGCalculator.available_methodologies()
        assert "india_ghci" in avail
        assert "korea_clean_h2" in avail

    def test_calculate_electrolysis_india(self):
        calc = GHGCalculator("india_ghci")
        inputs = ElectrolysisInputs(
            electricity_consumption_kwh_per_kg_h2=55.0,
            grid_emission_factor_kg_co2e_per_kwh=0.0,
        )
        result = calc.calculate_electrolysis(inputs)
        assert result.passes_certification is True
        assert result.methodology == "India GHCI"

    def test_calculate_electrolysis_korea(self):
        calc = GHGCalculator("korea_clean_h2")
        inputs = ElectrolysisInputs(
            electricity_consumption_kwh_per_kg_h2=55.0,
            grid_emission_factor_kg_co2e_per_kwh=0.0,
        )
        result = calc.calculate_electrolysis(inputs)
        assert result.passes_certification is True
        assert "Korea" in result.methodology

    def test_calculate_smr_india(self):
        calc = GHGCalculator("india_ghci")
        inputs = SMRInputs(ccs_capture_rate=0.0)
        result = calc.calculate_smr(inputs)
        assert result.passes_certification is False

    def test_calculate_smr_korea(self):
        calc = GHGCalculator("korea_clean_h2")
        inputs = SMRInputs(ccs_capture_rate=0.0)
        result = calc.calculate_smr(inputs)
        assert result.passes_certification is False

    def test_results_differ_between_methodologies(self):
        """Different methodologies may produce different certification outcomes."""
        # An intensity between 2 and 4 kg CO₂e passes Korea but not India
        india = GHGCalculator("india_ghci")
        korea = GHGCalculator("korea_clean_h2")
        # Construct inputs giving ~3 kg CO₂e/kg H₂
        inputs = ElectrolysisInputs(
            electricity_consumption_kwh_per_kg_h2=55.0,
            grid_emission_factor_kg_co2e_per_kwh=3.0 / 55.0,
            water_consumption_l_per_kg_h2=0.0,
            water_treatment_energy_kwh_per_l=0.0,
        )
        india_result = india.calculate_electrolysis(inputs)
        korea_result = korea.calculate_electrolysis(inputs)
        assert india_result.passes_certification is False  # > 2.0
        assert korea_result.passes_certification is True   # ≤ 4.0


class TestCLI:
    """Smoke tests for the command-line interface."""

    def _run(self, argv):
        from ghg_methodology_calculator.cli import main
        return main(argv)

    def test_list_methodologies(self, capsys):
        rc = self._run(["list-methodologies"])
        assert rc == 0
        out = capsys.readouterr().out
        assert "india_ghci" in out
        assert "korea_clean_h2" in out

    def test_electrolysis_india_text(self, capsys):
        rc = self._run([
            "electrolysis",
            "--methodology", "india_ghci",
            "--electricity-kwh", "55",
            "--emission-factor", "0.0",
        ])
        assert rc == 0
        out = capsys.readouterr().out
        assert "India GHCI" in out
        assert "PASSES" in out

    def test_electrolysis_korea_json(self, capsys):
        rc = self._run([
            "electrolysis",
            "--methodology", "korea_clean_h2",
            "--electricity-kwh", "55",
            "--emission-factor", "0.0",
            "--json",
        ])
        assert rc == 0
        data = json.loads(capsys.readouterr().out)
        assert data["passes_certification"] is True
        assert "Korea" in data["methodology"]

    def test_smr_india_json(self, capsys):
        rc = self._run([
            "smr",
            "--methodology", "india_ghci",
            "--ccs-rate", "0.95",
            "--json",
        ])
        assert rc == 0
        data = json.loads(capsys.readouterr().out)
        assert "passes_certification" in data

    def test_smr_korea_no_ccs_fails(self, capsys):
        rc = self._run([
            "smr",
            "--methodology", "korea_clean_h2",
            "--ccs-rate", "0.0",
            "--json",
        ])
        assert rc == 0
        data = json.loads(capsys.readouterr().out)
        assert data["passes_certification"] is False
