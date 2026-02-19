"""Abstract base class for GHG certification methodologies.

New methodologies should subclass :class:`BaseMethodology` and implement the
``calculate_electrolysis`` and ``calculate_smr`` abstract methods.
"""

from __future__ import annotations

from abc import ABC, abstractmethod
from typing import Optional

from ghg_methodology_calculator.core.models import (
    ElectrolysisInputs,
    GHGResult,
    SMRInputs,
)


class BaseMethodology(ABC):
    """Abstract base for a GHG certification methodology.

    Subclasses encapsulate a specific certification standard's:

    * System boundary definition
    * Emission factor requirements
    * Certification tier structure (thresholds and labels)
    * Calculation formula and audit-trail generation
    """

    #: Human-readable name for the methodology.
    name: str = ""

    #: Version or year string of the methodology document.
    version: str = ""

    #: Short URL or citation reference.
    reference: str = ""

    @abstractmethod
    def calculate_electrolysis(self, inputs: ElectrolysisInputs) -> GHGResult:
        """Calculate GHG intensity for electrolytic hydrogen.

        Parameters
        ----------
        inputs:
            All process-specific parameters needed for the calculation.

        Returns
        -------
        GHGResult
            Verification-ready result including full breakdown and audit trail.
        """

    @abstractmethod
    def calculate_smr(self, inputs: SMRInputs) -> GHGResult:
        """Calculate GHG intensity for SMR/ATR hydrogen (with or without CCS).

        Parameters
        ----------
        inputs:
            All process-specific parameters needed for the calculation.

        Returns
        -------
        GHGResult
            Verification-ready result including full breakdown and audit trail.
        """

    @abstractmethod
    def _classify(self, intensity: float) -> tuple[str, float, bool]:
        """Map a GHG intensity to a certification tier label, threshold, and pass/fail.

        Parameters
        ----------
        intensity:
            Total lifecycle GHG intensity [kg CO₂e/kg H₂].

        Returns
        -------
        (tier_label, threshold, passes)
        """
