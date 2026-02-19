/**
 * Canonical project input types (S1.2).
 * Covers all inputs required for exact calculation per:
 * - Korea: KOREA-REQUIRED-INPUTS.md
 * - India: feedstock, electricity, fuel, steam, input materials, co-product allocation.
 * Single source of truth for project inputs; no persistence in this module.
 */

/** Feedstock (India/Korea): water volume per kg H₂, type, upstream LCI. */
export interface FeedstockInputs {
  /** Water input per kg H₂ (e.g. kg or m³/kg H₂). */
  waterVolumePerKgH2: number;
  /** e.g. "demineralised", "raw". */
  waterType: string;
  /** Upstream LCI for feedstock (kgCO₂eq/kg or per unit). */
  upstreamLciPerKg: number;
}

/** Electricity (India/Korea): grid, renewable, other (Korea), grid EF, T&D loss. */
export interface ElectricityInputs {
  /** Grid electricity (kWh/kg H₂ or normalized per period). */
  gridKwhPerKgH2: number;
  /** Renewable electricity (kWh/kg H₂). */
  renewableKwhPerKgH2: number;
  /** Other electricity (Korea; kWh/kg H₂). Optional. */
  otherKwhPerKgH2?: number;
  /** Grid emission factor (kgCO₂eq/kWh). */
  gridEmissionFactorKgCo2PerKwh: number;
  /** T&D loss factor (e.g. 1.05 for 5% loss). */
  tAndDLossFactor: number;
}

/** Single process fuel entry: type, amount (MJ/kg H₂), emission factor. */
export interface ProcessFuelEntry {
  fuelType: string;
  /** Amount in MJ per kg H₂. */
  amountMjPerKgH2: number;
  /** Emission factor kgCO₂eq/MJ. */
  emissionFactorKgCo2PerMj: number;
}

/** Steam (India/Korea): amount, other heat (Korea), LCI, source, emission factor. */
export interface SteamInputs {
  /** Steam (MJ/kg H₂). */
  steamMjPerKgH2: number;
  /** Other heat (Korea; MJ/kg H₂). Optional. */
  otherHeatMjPerKgH2?: number;
  /** LCI of steam (Korea; kgCO₂e/MJ). Optional. */
  steamLciKgCo2PerMj?: number;
  /** Internal or external. */
  source: "internal" | "external";
  /** Emission factor kgCO₂eq/MJ. */
  emissionFactorKgCo2PerMj: number;
}

/** Input material "o": amount per kg H₂, LCI per material. */
export interface InputMaterialEntry {
  materialId: string;
  /** Amount kg material per kg H₂. */
  amountKgPerKgH2: number;
  /** LCI kgCO₂eq/kg material. */
  lciKgCo2PerKg: number;
}

/**
 * Co-product entry. Either carbon-containing (Pq, LCIq, impq, CCFq) or energy allocation (LHV, Mass).
 * Carbon: salesAmountKgPerKgH2, lciAlternativeKgCo2PerKg, productionRatioKgPerKgH2, carbonContentFraction.
 * Energy: lhvMjPerKg, massKg, massH2Kg.
 */
export interface CoProductEntry {
  productId: string;
  /** Carbon-containing: sales amount kg/kg H₂. */
  salesAmountKgPerKgH2?: number;
  /** Carbon-containing: LCI of alternative product. */
  lciAlternativeKgCo2PerKg?: number;
  /** Carbon-containing: production ratio kg by-product/kg H₂. */
  productionRatioKgPerKgH2?: number;
  /** Carbon-containing: carbon content kg-C/kg by-product. */
  carbonContentFraction?: number;
  /** Energy allocation: LHV of by-product (MJ/kg). */
  lhvMjPerKg?: number;
  /** Energy allocation: mass of by-product (kg). */
  massKg?: number;
  /** Energy allocation: mass of H₂ (kg). */
  massH2Kg?: number;
}

/** Co-product allocation (India): method, LHV H₂, LHV co-products, masses. */
export interface CoProductAllocationInputs {
  allocationMethod: "energy" | "mass";
  /** LHV of H₂ gas (MJ/kg). */
  lhvH2GasMjPerKg: number;
  /** LHV of each co-product (MJ/kg) for energy allocation. */
  lhvCoProductsMjPerKg: number[];
  /** Mass of H₂ produced (kg). */
  massH2Kg: number;
  /** Mass of each co-product (kg). */
  massCoProductsKg: number[];
}

/** Fugitive non-CO₂ (Korea): per scheme; optional. */
export interface FugitiveNonCo2Inputs {
  /** Leakage rates or mass balance; structure per scheme. */
  [key: string]: number | undefined;
}

/** CCS (Korea): ECCS process, CO₂ sequestrated. */
export interface CCSInputs {
  /** CCS process emissions (kgCO₂e/kg H₂). */
  eccsProcessKgCo2PerKgH2: number;
  /** Permanently sequestered CO₂ credit (kg CO₂/kg H₂). */
  co2SequestratedKgPerKgH2: number;
}

/** Period for reconciliation and reporting. */
export type PeriodType = "monthly" | "annual";

/**
 * Canonical project inputs: union of all inputs required by India and Korea.
 * Stored once per project; adapters map to methodology-specific inputs.
 */
export interface CanonicalProjectInputs {
  period: PeriodType;
  /** Primary output quantity (kg H₂/year). */
  annualH2OutputKg: number;
  /** Electrolyser capacity (kW or kg H₂/hr). Optional. */
  electrolyserCapacityKw?: number;
  feedstock: FeedstockInputs;
  electricity: ElectricityInputs;
  fuels: ProcessFuelEntry[];
  steam: SteamInputs;
  inputMaterials: InputMaterialEntry[];
  coProductAllocation: CoProductAllocationInputs;
  /** By-products for Korea (carbon-containing and energy allocation). Optional. */
  coProducts?: CoProductEntry[];
  /** Korea: Efugitive non-CO2. Optional. */
  fugitiveNonCo2?: FugitiveNonCo2Inputs;
  /** Korea: ECCS process, ECO2 sequestrated. Optional. */
  ccs?: CCSInputs;
}
