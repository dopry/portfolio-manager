import { describe, expect, it } from "vitest";
import { METRICS } from "./METRICS.js";

describe("METRICS (generated from the metric inventory)", () => {
  it("has unique slugs", () => {
    const slugs = METRICS.map((m) => m[0]);
    expect(new Set(slugs).size).to.equal(slugs.length);
  });

  it("keeps the slugs the CLI and facade defaults depend on", () => {
    const slugs = new Set(METRICS.map((m) => m[0]));
    for (const slug of [
      "score",
      "propertyName",
      "siteElectricityUseMonthly",
      "siteNaturalGasUseMonthly",
      "siteEnergyUseFuelOil1Monthly",
      "siteElectricityUseOnsiteRenewablesMonthly",
    ]) {
      expect(slugs.has(slug), slug).toBe(true);
    }
  });

  it("derives availability flags from the Web Service Call Method column", () => {
    const monthly = METRICS.find((m) => m[0] === "siteElectricityUseMonthly");
    expect(monthly?.[14], "getMonthlyMetrics").toBe(true);
    expect(monthly?.[7], "getMetrics").toBe(false);

    const score = METRICS.find((m) => m[0] === "score");
    expect(score?.[7], "getMetrics").toBe(true);
  });

  it("exposes at least one metric per availability flag", () => {
    // Indexes 7..15 plus the trailing PGP flag (18).
    for (const index of [7, 8, 9, 10, 11, 12, 13, 14, 15, 18] as const) {
      expect(
        METRICS.some((m) => m[index] === true),
        `flag index ${index}`,
      ).toBe(true);
    }
  });
});
