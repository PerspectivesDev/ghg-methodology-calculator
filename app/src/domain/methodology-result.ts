/**
 * Methodology result types and value objects (S1.2).
 * From product spec Methodology Data Model: breakdown, total, unit, warnings, errors.
 * India: E_feedstock, E_electricity, E_fuel, E_steam, E_input_materials, co-product allocation.
 * Korea: Efeedstock supply, Eenergy supply, Einput materials, Eprocess, Efugitive non-CO2, EC-credit, EC-tracking, AF, ECCS process, ECO2 sequestrated.
 */

/** Standard unit for GHG intensity (kgCO₂eq/kg H₂). */
export const UNIT_KG_CO2EQ_PER_KG_H2 = "kgCO₂eq/kg H₂";

/** Generic breakdown: component name → value (kgCO₂eq/kg H₂). */
export type MethodologyBreakdown = Record<string, number>;

/** India GHCI breakdown (electrolysis): components per Methodology Data Model. */
export interface IndiaBreakdown {
  feedstock: number;
  electricity: number;
  fuel: number;
  steam: number;
  inputMaterials: number;
  coProductAllocation: number;
}

/** Korea Clean H₂ breakdown (Etotal structure). */
export interface KoreaBreakdown {
  eFeedstockSupply: number;
  eEnergySupply: number;
  eInputMaterials: number;
  eProcess: number;
  eFugitiveNonCo2: number;
  eCCredit: number;
  eCTracking: number;
  /** Energy allocation factor (AF). */
  af: number;
  eCCSProcess: number;
  eCo2Sequestrated: number;
}

/** Methodology result: total, unit, breakdown, warnings, errors; optional audit fields. */
export interface MethodologyResult {
  methodologyId: string;
  unit: string;
  total: number;
  breakdown: MethodologyBreakdown;
  /** Optional: inputs used for audit. */
  inputsUsed?: Record<string, unknown>;
  /** Optional: factors used for audit. */
  factorsUsed?: Record<string, unknown>;
  warnings: string[];
  errors: string[];
}

/** Options for createMethodologyResult. */
export interface CreateMethodologyResultOptions {
  methodologyId: string;
  total: number;
  breakdown?: MethodologyBreakdown;
  inputsUsed?: Record<string, unknown>;
  factorsUsed?: Record<string, unknown>;
  warnings?: string[];
  errors?: string[];
}

/**
 * Factory: build MethodologyResult with default unit and optional defaults for breakdown, warnings, errors.
 */
export function createMethodologyResult(options: CreateMethodologyResultOptions): MethodologyResult {
  return {
    methodologyId: options.methodologyId,
    unit: UNIT_KG_CO2EQ_PER_KG_H2,
    total: options.total,
    breakdown: options.breakdown ?? {},
    inputsUsed: options.inputsUsed,
    factorsUsed: options.factorsUsed,
    warnings: options.warnings ?? [],
    errors: options.errors ?? [],
  };
}
