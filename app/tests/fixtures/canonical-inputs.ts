/**
 * Shared test fixtures for canonical inputs (DRY).
 * Single source of truth for minimal valid inputs used across domain and persistence tests.
 */

import type { CanonicalProjectInputs } from "../../src/domain/canonical-inputs.js";

/** Minimal valid canonical inputs for India/Korea calculation tests. */
export function minimalCanonicalInputs(): CanonicalProjectInputs {
  return {
    period: "annual",
    annualH2OutputKg: 1000,
    feedstock: {
      waterVolumePerKgH2: 9,
      waterType: "demineralised",
      upstreamLciPerKg: 0.001,
    },
    electricity: {
      gridKwhPerKgH2: 50,
      renewableKwhPerKgH2: 0,
      gridEmissionFactorKgCo2PerKwh: 0.4,
      tAndDLossFactor: 1.05,
    },
    fuels: [],
    steam: {
      steamMjPerKgH2: 0,
      source: "internal",
      emissionFactorKgCo2PerMj: 0.08,
    },
    inputMaterials: [],
    coProductAllocation: {
      allocationMethod: "energy",
      lhvH2GasMjPerKg: 120,
      lhvCoProductsMjPerKg: [],
      massH2Kg: 1000,
      massCoProductsKg: [],
    },
  };
}
