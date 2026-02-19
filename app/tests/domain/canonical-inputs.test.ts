/**
 * S1.2 — Canonical project input types.
 * Covers all inputs required for exact calculation:
 * - Korea: KOREA-REQUIRED-INPUTS.md (feedstock, electricity, steam, fuels, input materials, process, fugitive, by-products, CCS).
 * - India: feedstock, electricity, fuel, steam, input materials, co-product allocation (INDIA-GHCI-REQUIRED-INPUTS).
 */
import { describe, it, expect } from "vitest";
import type {
  CanonicalProjectInputs,
  ProcessFuelEntry,
  InputMaterialEntry,
  CoProductEntry,
  ElectricityInputs,
  FeedstockInputs,
  SteamInputs,
  CCSInputs,
  CoProductAllocationInputs,
} from "../../src/domain/canonical-inputs.js";

describe("canonical-inputs (S1.2)", () => {
  describe("types for India required inputs", () => {
    it("FeedstockInputs has water volume/type and upstream LCI", () => {
      const feedstock: FeedstockInputs = {
        waterVolumePerKgH2: 9,
        waterType: "demineralised",
        upstreamLciPerKg: 0.001,
      };
      expect(feedstock.waterVolumePerKgH2).toBe(9);
      expect(feedstock.upstreamLciPerKg).toBe(0.001);
    });

    it("ElectricityInputs has grid, renewable, grid emission factor, T&D loss", () => {
      const electricity: ElectricityInputs = {
        gridKwhPerKgH2: 55,
        renewableKwhPerKgH2: 0,
        gridEmissionFactorKgCo2PerKwh: 0.4,
        tAndDLossFactor: 1.05,
      };
      expect(electricity.gridKwhPerKgH2).toBe(55);
      expect(electricity.gridEmissionFactorKgCo2PerKwh).toBe(0.4);
    });

    it("ProcessFuelEntry supports fuel type, amount, emission factor", () => {
      const fuel: ProcessFuelEntry = {
        fuelType: "natural_gas",
        amountMjPerKgH2: 0,
        emissionFactorKgCo2PerMj: 0.06,
      };
      expect(fuel.fuelType).toBe("natural_gas");
      expect(fuel.amountMjPerKgH2).toBe(0);
    });

    it("SteamInputs has amount, source, emission factor", () => {
      const steam: SteamInputs = {
        steamMjPerKgH2: 0,
        source: "internal",
        emissionFactorKgCo2PerMj: 0.08,
      };
      expect(steam.steamMjPerKgH2).toBe(0);
      expect(steam.source).toBe("internal");
    });

    it("InputMaterialEntry has amount per kg H₂ and LCI per material", () => {
      const material: InputMaterialEntry = {
        materialId: "naoh",
        amountKgPerKgH2: 0.002,
        lciKgCo2PerKg: 1.2,
      };
      expect(material.amountKgPerKgH2).toBe(0.002);
      expect(material.lciKgCo2PerKg).toBe(1.2);
    });

    it("CoProductAllocationInputs has method, LHV H₂, LHV co-products, masses", () => {
      const allocation: CoProductAllocationInputs = {
        allocationMethod: "energy",
        lhvH2GasMjPerKg: 120,
        lhvCoProductsMjPerKg: [],
        massH2Kg: 1000,
        massCoProductsKg: [],
      };
      expect(allocation.allocationMethod).toBe("energy");
      expect(allocation.lhvH2GasMjPerKg).toBe(120);
      expect(allocation.massH2Kg).toBe(1000);
    });
  });

  describe("types for Korea required inputs (KOREA-REQUIRED-INPUTS)", () => {
    it("ElectricityInputs includes other electricity and LCI fields for Korea", () => {
      const electricity: ElectricityInputs = {
        gridKwhPerKgH2: 50,
        renewableKwhPerKgH2: 5,
        otherKwhPerKgH2: 0,
        gridEmissionFactorKgCo2PerKwh: 0.45,
        tAndDLossFactor: 1.03,
      };
      expect(electricity.otherKwhPerKgH2).toBe(0);
    });

    it("SteamInputs includes other heat and LCI for Korea", () => {
      const steam: SteamInputs = {
        steamMjPerKgH2: 2,
        otherHeatMjPerKgH2: 0,
        steamLciKgCo2PerMj: 0.07,
        source: "external",
        emissionFactorKgCo2PerMj: 0.07,
      };
      expect(steam.otherHeatMjPerKgH2).toBe(0);
      expect(steam.steamLciKgCo2PerMj).toBe(0.07);
    });

    it("CoProductEntry supports carbon-containing (Pq, LCIq, impq, CCFq) and energy allocation (LHV, Mass)", () => {
      const carbonByProduct: CoProductEntry = {
        productId: "carbon_black",
        salesAmountKgPerKgH2: 0.1,
        lciAlternativeKgCo2PerKg: 0.5,
        productionRatioKgPerKgH2: 0.1,
        carbonContentFraction: 0.9,
      };
      expect(carbonByProduct.carbonContentFraction).toBe(0.9);

      const energyByProduct: CoProductEntry = {
        productId: "o2",
        lhvMjPerKg: 0,
        massKg: 800,
        massH2Kg: 1000,
      };
      expect(energyByProduct.lhvMjPerKg).toBe(0);
      expect(energyByProduct.massKg).toBe(800);
    });

    it("CCSInputs has ECCS process and CO2 sequestrated", () => {
      const ccs: CCSInputs = {
        eccsProcessKgCo2PerKgH2: 0,
        co2SequestratedKgPerKgH2: 0,
      };
      expect(ccs.eccsProcessKgCo2PerKgH2).toBe(0);
      expect(ccs.co2SequestratedKgPerKgH2).toBe(0);
    });
  });

  describe("CanonicalProjectInputs aggregates all required inputs", () => {
    it("accepts minimal India-oriented inputs", () => {
      const inputs: CanonicalProjectInputs = {
        period: "annual",
        annualH2OutputKg: 1000,
        feedstock: {
          waterVolumePerKgH2: 9,
          waterType: "demineralised",
          upstreamLciPerKg: 0.001,
        },
        electricity: {
          gridKwhPerKgH2: 0,
          renewableKwhPerKgH2: 55,
          gridEmissionFactorKgCo2PerKwh: 0,
          tAndDLossFactor: 1,
        },
        fuels: [],
        steam: { steamMjPerKgH2: 0, source: "internal", emissionFactorKgCo2PerMj: 0 },
        inputMaterials: [],
        coProductAllocation: {
          allocationMethod: "energy",
          lhvH2GasMjPerKg: 120,
          lhvCoProductsMjPerKg: [],
          massH2Kg: 1000,
          massCoProductsKg: [],
        },
      };
      expect(inputs.period).toBe("annual");
      expect(inputs.annualH2OutputKg).toBe(1000);
      expect(inputs.feedstock.waterVolumePerKgH2).toBe(9);
      expect(inputs.electricity.renewableKwhPerKgH2).toBe(55);
    });

    it("accepts period monthly or annual", () => {
      const inputsAnnual: CanonicalProjectInputs = {
        period: "annual",
        annualH2OutputKg: 100,
        feedstock: { waterVolumePerKgH2: 9, waterType: "raw", upstreamLciPerKg: 0 },
        electricity: { gridKwhPerKgH2: 0, renewableKwhPerKgH2: 50, gridEmissionFactorKgCo2PerKwh: 0, tAndDLossFactor: 1 },
        fuels: [],
        steam: { steamMjPerKgH2: 0, source: "internal", emissionFactorKgCo2PerMj: 0 },
        inputMaterials: [],
        coProductAllocation: { allocationMethod: "mass", lhvH2GasMjPerKg: 120, lhvCoProductsMjPerKg: [], massH2Kg: 100, massCoProductsKg: [] },
      };
      expect(inputsAnnual.period).toBe("annual");
      const inputsMonthly: CanonicalProjectInputs = { ...inputsAnnual, period: "monthly" };
      expect(inputsMonthly.period).toBe("monthly");
    });

    it("accepts Korea-oriented inputs with optional electrolyser capacity, other electricity, fugitive, CCS", () => {
      const inputs: CanonicalProjectInputs = {
        period: "annual",
        annualH2OutputKg: 500,
        electrolyserCapacityKw: 1000,
        feedstock: {
          waterVolumePerKgH2: 9,
          waterType: "demineralised",
          upstreamLciPerKg: 0.001,
        },
        electricity: {
          gridKwhPerKgH2: 50,
          renewableKwhPerKgH2: 5,
          otherKwhPerKgH2: 0,
          gridEmissionFactorKgCo2PerKwh: 0.45,
          tAndDLossFactor: 1.03,
        },
        fuels: [],
        steam: {
          steamMjPerKgH2: 2,
          otherHeatMjPerKgH2: 0,
          steamLciKgCo2PerMj: 0.07,
          source: "external",
          emissionFactorKgCo2PerMj: 0.07,
        },
        inputMaterials: [],
        coProductAllocation: {
          allocationMethod: "energy",
          lhvH2GasMjPerKg: 120,
          lhvCoProductsMjPerKg: [],
          massH2Kg: 500,
          massCoProductsKg: [],
        },
        coProducts: [],
        fugitiveNonCo2: undefined,
        ccs: { eccsProcessKgCo2PerKgH2: 0, co2SequestratedKgPerKgH2: 0 },
      };
      expect(inputs.electrolyserCapacityKw).toBe(1000);
      expect(inputs.electricity.otherKwhPerKgH2).toBe(0);
      expect(inputs.ccs?.co2SequestratedKgPerKgH2).toBe(0);
    });

    it("accepts fugitive non-CO2 inputs (Korea) as key-value record", () => {
      const inputs: CanonicalProjectInputs = {
        period: "annual",
        annualH2OutputKg: 200,
        feedstock: { waterVolumePerKgH2: 9, waterType: "demineralised", upstreamLciPerKg: 0.001 },
        electricity: { gridKwhPerKgH2: 40, renewableKwhPerKgH2: 10, gridEmissionFactorKgCo2PerKwh: 0.4, tAndDLossFactor: 1.02 },
        fuels: [],
        steam: { steamMjPerKgH2: 0, source: "internal", emissionFactorKgCo2PerMj: 0 },
        inputMaterials: [],
        coProductAllocation: { allocationMethod: "energy", lhvH2GasMjPerKg: 120, lhvCoProductsMjPerKg: [], massH2Kg: 200, massCoProductsKg: [] },
        fugitiveNonCo2: { ch4LeakageRate: 0.001, n2oEmissionFactor: 0.01 },
      };
      expect(inputs.fugitiveNonCo2?.ch4LeakageRate).toBe(0.001);
      expect(inputs.fugitiveNonCo2?.n2oEmissionFactor).toBe(0.01);
    });
  });
});
