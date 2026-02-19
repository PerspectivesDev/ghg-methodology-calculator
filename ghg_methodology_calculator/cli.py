"""Command-line interface for the GHG Methodology Calculator.

Usage
-----
    ghg-calc electrolysis --methodology india_ghci \\
        --electricity-kwh 55 --emission-factor 0.0

    ghg-calc smr --methodology korea_clean_h2 \\
        --ccs-rate 0.90

    ghg-calc list-methodologies
"""

from __future__ import annotations

import argparse
import json
import sys

from ghg_methodology_calculator.core.calculator import GHGCalculator, METHODOLOGY_REGISTRY
from ghg_methodology_calculator.core.models import ElectrolysisInputs, SMRInputs


def _build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(
        prog="ghg-calc",
        description=(
            "Verification-ready lifecycle GHG intensity calculator for "
            "Hydrogen / PtX — India GHCI, Korea Clean H2, and more."
        ),
    )
    sub = parser.add_subparsers(dest="command", required=True)

    # ---- list-methodologies ------------------------------------------------
    sub.add_parser(
        "list-methodologies",
        help="Print all available methodology identifiers.",
    )

    # ---- electrolysis -------------------------------------------------------
    elec = sub.add_parser(
        "electrolysis",
        help="Calculate GHG intensity for electrolytic hydrogen.",
    )
    _add_common_args(elec)
    elec.add_argument(
        "--electricity-kwh",
        type=float,
        required=True,
        metavar="kWh/kgH2",
        help="AC electricity consumption [kWh/kg H₂].",
    )
    elec.add_argument(
        "--emission-factor",
        type=float,
        required=True,
        metavar="kgCO2e/kWh",
        help="Grid/source lifecycle emission factor [kg CO₂e/kWh].",
    )
    elec.add_argument(
        "--water-l",
        type=float,
        default=9.0,
        metavar="L/kgH2",
        help="Water consumption [L/kg H₂]. Default: 9.0.",
    )
    elec.add_argument(
        "--water-energy",
        type=float,
        default=0.001,
        metavar="kWh/L",
        help="Water treatment energy [kWh/L]. Default: 0.001.",
    )
    elec.add_argument(
        "--td-losses",
        type=float,
        default=0.0,
        metavar="FRACTION",
        help="Upstream T&D electricity losses fraction. Default: 0.",
    )
    elec.add_argument(
        "--transport-storage",
        type=float,
        default=0.0,
        metavar="kgCO2e/kgH2",
        help="Transport & storage emissions [kg CO₂e/kg H₂]. Default: 0.",
    )

    # ---- smr ---------------------------------------------------------------
    smr = sub.add_parser(
        "smr",
        help="Calculate GHG intensity for SMR/ATR hydrogen (with or without CCS).",
    )
    _add_common_args(smr)
    smr.add_argument(
        "--ng-consumption",
        type=float,
        default=185.0,
        metavar="MJ/kgH2",
        help="Natural gas consumption [MJ LHV/kg H₂]. Default: 185.",
    )
    smr.add_argument(
        "--ng-upstream-ef",
        type=float,
        default=0.0053,
        metavar="kgCO2e/MJ",
        help=(
            "Upstream NG emission factor [kg CO₂e/MJ LHV]. Default: 0.0053 "
            "(≈2%% leakage, IPCC AR6 GWP)."
        ),
    )
    smr.add_argument(
        "--process-co2",
        type=float,
        default=9.0,
        metavar="kgCO2/kgH2",
        help="Direct process CO₂ at SMR plant [kg CO₂/kg H₂]. Default: 9.0.",
    )
    smr.add_argument(
        "--ccs-rate",
        type=float,
        default=0.0,
        metavar="FRACTION",
        help="CCS CO₂ capture rate [0–1]. Default: 0 (no CCS).",
    )
    smr.add_argument(
        "--transport-storage",
        type=float,
        default=0.0,
        metavar="kgCO2e/kgH2",
        help="Transport & storage emissions [kg CO₂e/kg H₂]. Default: 0.",
    )

    return parser


def _add_common_args(sub: argparse.ArgumentParser) -> None:
    sub.add_argument(
        "--methodology",
        type=str,
        required=True,
        choices=sorted(METHODOLOGY_REGISTRY.keys()),
        help="Certification methodology to apply.",
    )
    sub.add_argument(
        "--json",
        action="store_true",
        default=False,
        help="Output result as JSON instead of human-readable text.",
    )


def main(argv: list[str] | None = None) -> int:
    parser = _build_parser()
    args = parser.parse_args(argv)

    if args.command == "list-methodologies":
        for key in GHGCalculator.available_methodologies():
            cls = METHODOLOGY_REGISTRY[key]
            inst = cls()
            print(f"  {key:20s}  {inst.name}  [{inst.version}]")
        return 0

    calc = GHGCalculator(args.methodology)

    if args.command == "electrolysis":
        inputs = ElectrolysisInputs(
            electricity_consumption_kwh_per_kg_h2=args.electricity_kwh,
            grid_emission_factor_kg_co2e_per_kwh=args.emission_factor,
            water_consumption_l_per_kg_h2=args.water_l,
            water_treatment_energy_kwh_per_l=args.water_energy,
            upstream_electricity_losses_fraction=args.td_losses,
            transport_and_storage_kg_co2e_per_kg_h2=args.transport_storage,
        )
        result = calc.calculate_electrolysis(inputs)

    elif args.command == "smr":
        inputs = SMRInputs(
            natural_gas_consumption_mj_per_kg_h2=args.ng_consumption,
            natural_gas_upstream_emission_factor_kg_co2e_per_mj=args.ng_upstream_ef,
            process_co2_direct_kg_per_kg_h2=args.process_co2,
            ccs_capture_rate=args.ccs_rate,
            transport_and_storage_kg_co2e_per_kg_h2=args.transport_storage,
        )
        result = calc.calculate_smr(inputs)

    else:
        parser.print_help()
        return 1

    if args.json:
        print(json.dumps(result.to_dict(), indent=2))
    else:
        print(result.summary())

    return 0


if __name__ == "__main__":
    sys.exit(main())
