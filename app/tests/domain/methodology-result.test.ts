/**
 * S1.2 — Methodology result types and value objects from product spec Methodology Data Model.
 * Result: breakdown, total, unit, warnings, errors; value objects for India and Korea components.
 */
import { describe, it, expect } from "vitest";
import type {
  MethodologyResult,
  MethodologyBreakdown,
  IndiaBreakdown,
  KoreaBreakdown,
} from "../../src/domain/methodology-result.js";
import {
  UNIT_KG_CO2EQ_PER_KG_H2,
  createMethodologyResult,
} from "../../src/domain/methodology-result.js";

describe("methodology-result (S1.2)", () => {
  describe("result types: breakdown, total, unit, warnings, errors", () => {
    it("MethodologyResult has methodologyId, unit, total, breakdown, warnings, errors", () => {
      const result: MethodologyResult = {
        methodologyId: "india_ghci_v2025",
        unit: UNIT_KG_CO2EQ_PER_KG_H2,
        total: 2.5,
        breakdown: {},
        warnings: [],
        errors: [],
      };
      expect(result.methodologyId).toBe("india_ghci_v2025");
      expect(result.unit).toBe(UNIT_KG_CO2EQ_PER_KG_H2);
      expect(result.total).toBe(2.5);
      expect(result.warnings).toEqual([]);
      expect(result.errors).toEqual([]);
    });

    it("MethodologyResult may include inputsUsed and factorsUsed for audit", () => {
      const result: MethodologyResult = {
        methodologyId: "korea_clean_v2025",
        unit: UNIT_KG_CO2EQ_PER_KG_H2,
        total: 3.0,
        breakdown: {},
        inputsUsed: {},
        factorsUsed: {},
        warnings: [],
        errors: [],
      };
      expect(result.inputsUsed).toEqual({});
      expect(result.factorsUsed).toEqual({});
    });

    it("warnings and errors are string arrays", () => {
      const result: MethodologyResult = {
        methodologyId: "india_ghci_v2025",
        unit: UNIT_KG_CO2EQ_PER_KG_H2,
        total: 0,
        breakdown: {},
        warnings: ["Missing optional factor; using default"],
        errors: ["Required input gridEmissionFactor missing"],
      };
      expect(result.warnings).toHaveLength(1);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0]).toContain("gridEmissionFactor");
    });
  });

  describe("MethodologyBreakdown value object", () => {
    it("breakdown is a record of component name to number", () => {
      const breakdown: MethodologyBreakdown = {
        feedstock: 0.1,
        electricity: 2.0,
        fuel: 0,
        steam: 0,
        inputMaterials: 0.05,
        coProductAllocation: 0,
      };
      expect(breakdown.feedstock).toBe(0.1);
      expect(breakdown.electricity).toBe(2.0);
    });
  });

  describe("IndiaBreakdown (Methodology Data Model India table)", () => {
    it("has E_feedstock, E_electricity, E_fuel, E_steam, E_input_materials, coProductAllocation", () => {
      const breakdown: IndiaBreakdown = {
        feedstock: 0.01,
        electricity: 2.2,
        fuel: 0,
        steam: 0,
        inputMaterials: 0.02,
        coProductAllocation: 0,
      };
      expect(breakdown.feedstock).toBe(0.01);
      expect(breakdown.electricity).toBe(2.2);
      expect(breakdown.fuel).toBe(0);
      expect(breakdown.steam).toBe(0);
      expect(breakdown.inputMaterials).toBe(0.02);
      expect(breakdown.coProductAllocation).toBe(0);
    });
  });

  describe("KoreaBreakdown (Etotal structure)", () => {
    it("has Efeedstock supply, Eenergy supply, Einput materials, Eprocess, Efugitive non-CO2, EC-credit, EC-tracking, AF, ECCS process, ECO2 sequestrated", () => {
      const breakdown: KoreaBreakdown = {
        eFeedstockSupply: 0.05,
        eEnergySupply: 2.5,
        eInputMaterials: 0.03,
        eProcess: 0,
        eFugitiveNonCo2: 0,
        eCCredit: 0,
        eCTracking: 0,
        af: 1,
        eCCSProcess: 0,
        eCo2Sequestrated: 0,
      };
      expect(breakdown.eFeedstockSupply).toBe(0.05);
      expect(breakdown.eEnergySupply).toBe(2.5);
      expect(breakdown.af).toBe(1);
      expect(breakdown.eCo2Sequestrated).toBe(0);
    });
  });

  describe("createMethodologyResult factory", () => {
    it("returns MethodologyResult with required fields and optional breakdown/warnings/errors", () => {
      const result = createMethodologyResult({
        methodologyId: "india_ghci_v2025",
        total: 1.8,
        breakdown: { feedstock: 0.01, electricity: 1.79, fuel: 0, steam: 0, inputMaterials: 0, coProductAllocation: 0 },
        warnings: [],
        errors: [],
      });
      expect(result.methodologyId).toBe("india_ghci_v2025");
      expect(result.unit).toBe(UNIT_KG_CO2EQ_PER_KG_H2);
      expect(result.total).toBe(1.8);
      expect(result.breakdown).toBeDefined();
      expect(result.breakdown.feedstock).toBe(0.01);
      expect(result.warnings).toEqual([]);
      expect(result.errors).toEqual([]);
    });

    it("defaults breakdown to empty object and warnings/errors to empty arrays when omitted", () => {
      const result = createMethodologyResult({
        methodologyId: "korea_clean_v2025",
        total: 2.0,
      });
      expect(result.breakdown).toEqual({});
      expect(result.warnings).toEqual([]);
      expect(result.errors).toEqual([]);
    });

    it("forwards inputsUsed and factorsUsed for audit when provided", () => {
      const result = createMethodologyResult({
        methodologyId: "india_ghci_v2025",
        total: 1.5,
        inputsUsed: { gridKwhPerKgH2: 55, renewableKwhPerKgH2: 0 },
        factorsUsed: { gridEmissionFactor: "0.4" },
      });
      expect(result.inputsUsed).toEqual({ gridKwhPerKgH2: 55, renewableKwhPerKgH2: 0 });
      expect(result.factorsUsed).toEqual({ gridEmissionFactor: "0.4" });
    });
  });
});
