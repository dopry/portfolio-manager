import { describe, expect, it } from "vitest";
import { isIMeterDelivery } from "./IMeterDelivery.js";

describe("isIMeterDelivery", () => {
  it("returns true for a minimal compatible shape", () => {
    expect(
      isIMeterDelivery({
        id: 1,
        deliveryDate: new Date("2024-01-01"),
        quantity: 100,
      })
    ).to.equal(true);
  });

  it("returns false when required fields are missing", () => {
    expect(
      isIMeterDelivery({
        id: 1,
        deliveryDate: new Date("2024-01-01"),
      })
    ).to.equal(false);
  });

  it("returns false for non-object values", () => {
    expect(isIMeterDelivery("nope")).to.equal(false);
  });
});
