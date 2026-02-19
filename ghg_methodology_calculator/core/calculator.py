"""Main GHGCalculator entry point.

Provides a single :class:`GHGCalculator` that accepts a methodology name and
dispatches calculations to the correct methodology implementation.
"""

from __future__ import annotations

from typing import Union

from ghg_methodology_calculator.core.models import (
    ElectrolysisInputs,
    GHGResult,
    SMRInputs,
)
from ghg_methodology_calculator.methodologies.base import BaseMethodology
from ghg_methodology_calculator.methodologies.india_ghci import IndiaGHCI
from ghg_methodology_calculator.methodologies.korea_clean_h2 import KoreaCleanH2

#: Registry of built-in methodology identifiers → class.
METHODOLOGY_REGISTRY: dict[str, type[BaseMethodology]] = {
    "india_ghci": IndiaGHCI,
    "korea_clean_h2": KoreaCleanH2,
}


class GHGCalculator:
    """High-level calculator that selects and runs a methodology.

    Parameters
    ----------
    methodology:
        Either a methodology identifier string (``"india_ghci"`` or
        ``"korea_clean_h2"``) or a pre-constructed
        :class:`~ghg_methodology_calculator.methodologies.base.BaseMethodology`
        instance.  Pass a custom instance to use non-standard parameters or a
        third-party methodology implementation.

    Examples
    --------
    >>> from ghg_methodology_calculator import GHGCalculator, ElectrolysisInputs
    >>> calc = GHGCalculator("india_ghci")
    >>> inputs = ElectrolysisInputs(
    ...     electricity_consumption_kwh_per_kg_h2=55,
    ...     grid_emission_factor_kg_co2e_per_kwh=0.0,  # 100 % renewable
    ... )
    >>> result = calc.calculate_electrolysis(inputs)
    >>> result.passes_certification
    True
    """

    def __init__(self, methodology: Union[str, BaseMethodology]) -> None:
        if isinstance(methodology, str):
            key = methodology.lower().strip()
            if key not in METHODOLOGY_REGISTRY:
                available = ", ".join(sorted(METHODOLOGY_REGISTRY))
                raise ValueError(
                    f"Unknown methodology '{methodology}'. "
                    f"Available: {available}"
                )
            self._method: BaseMethodology = METHODOLOGY_REGISTRY[key]()
        elif isinstance(methodology, BaseMethodology):
            self._method = methodology
        else:
            raise TypeError(
                "methodology must be a string identifier or a BaseMethodology instance."
            )

    # ------------------------------------------------------------------
    # Properties
    # ------------------------------------------------------------------

    @property
    def methodology(self) -> BaseMethodology:
        """The active :class:`BaseMethodology` instance."""
        return self._method

    @staticmethod
    def available_methodologies() -> list[str]:
        """Return the list of built-in methodology identifiers."""
        return sorted(METHODOLOGY_REGISTRY.keys())

    # ------------------------------------------------------------------
    # Calculation dispatch
    # ------------------------------------------------------------------

    def calculate_electrolysis(self, inputs: ElectrolysisInputs) -> GHGResult:
        """Run the methodology calculation for electrolytic hydrogen.

        Parameters
        ----------
        inputs:
            :class:`~ghg_methodology_calculator.core.models.ElectrolysisInputs`.

        Returns
        -------
        GHGResult
        """
        return self._method.calculate_electrolysis(inputs)

    def calculate_smr(self, inputs: SMRInputs) -> GHGResult:
        """Run the methodology calculation for SMR/ATR hydrogen.

        Parameters
        ----------
        inputs:
            :class:`~ghg_methodology_calculator.core.models.SMRInputs`.

        Returns
        -------
        GHGResult
        """
        return self._method.calculate_smr(inputs)
