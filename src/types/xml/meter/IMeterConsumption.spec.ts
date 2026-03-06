import { describe, expect, it } from "vitest";
import { isIMeterConsumption } from "./IMeterConsumption.js";

describe("isIMeterConsumption", () => {
  it("returns true for a minimal compatible shape", () => {
    expect(
      isIMeterConsumption({
        id: 1,
        startDate: new Date("2024-01-01"),
        endDate: new Date("2024-01-31"),
        usage: 100,
      })
    ).to.equal(true);
  });

  it("returns false when required properties are missing", () => {
    expect(
      isIMeterConsumption({
        id: 1,
        startDate: new Date("2024-01-01"),
      })
    ).to.equal(false);
  });

  it("returns false for null/undefined", () => {
    expect(isIMeterConsumption(null)).to.equal(false);
    expect(isIMeterConsumption(undefined)).to.equal(false);
  });
});
