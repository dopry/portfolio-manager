import { describe, expect, it } from "vitest";
import { mockIAddress, mockIProperty, mockMeter, stamp } from "./Mocks.js";

describe("Mocks helpers", () => {
  it("stamp normalizes forbidden filename characters", () => {
    const value = stamp();
    expect(value).to.be.a("string");
    expect(value).not.to.include(":");
    expect(value).not.to.include(".");
  });

  it("creates valid default property and meter mocks", () => {
    const property = mockIProperty();
    const meter = mockMeter();

    expect(mockIAddress()["@_country"]).to.equal("US");
    expect(property.name).to.be.a("string");
    expect(meter.name).to.be.a("string");
  });
});
