import { describe, it, expect } from "vitest";
import { readFileSync, existsSync } from "fs";
import { join } from "path";
import { APP_NAME } from "../src/index.js";

/** App root (package.json directory). Vitest runs with cwd = app root when tests are under app/tests. */
const appRoot = process.cwd();

describe("setup (S1.1 — project setup and test harness)", () => {
  it("Vitest runs and can import app code", () => {
    expect(APP_NAME).toBe("ghg-methodology-calculator");
  });

  it("coverage is configured with 95% thresholds", () => {
    const configContent = readFileSync(join(appRoot, "vitest.config.ts"), "utf-8");
    expect(configContent).toMatch(/coverage/);
    expect(configContent).toMatch(/thresholds/);
    expect(configContent).toMatch(/\blines:\s*95\b/);
    expect(configContent).toMatch(/\bstatements:\s*95\b/);
  });

  it("coverage report is generatable via npm script", () => {
    const pkg = JSON.parse(readFileSync(join(appRoot, "package.json"), "utf-8"));
    const coverageScript = pkg.scripts?.coverage;
    expect(coverageScript).toBeDefined();
    expect(coverageScript).toMatch(/vitest.*coverage|coverage.*vitest/);
  });

  it("project layout has src/ and tests/ for domain and test placement", () => {
    expect(existsSync(join(appRoot, "src"))).toBe(true);
    expect(existsSync(join(appRoot, "tests"))).toBe(true);
  });

  it("95% coverage target is documented", () => {
    const coverageDocPath = join(appRoot, "docs", "COVERAGE.md");
    expect(existsSync(coverageDocPath)).toBe(true);
    const content = readFileSync(coverageDocPath, "utf-8");
    expect(content).toMatch(/95%|95 %/);
  });
});
