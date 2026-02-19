"""GHG Methodology Calculator for Hydrogen / PtX.

Verification-ready lifecycle GHG intensity calculations per certification
methodology (India GHCI, Korea Clean H2, and others).
"""

__version__ = "0.1.0"
__all__ = ["GHGCalculator", "ElectrolysisInputs", "SMRInputs", "GHGResult"]

from ghg_methodology_calculator.core.calculator import GHGCalculator
from ghg_methodology_calculator.core.models import ElectrolysisInputs, SMRInputs, GHGResult
