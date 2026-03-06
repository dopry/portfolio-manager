import { describe, expect, it } from "vitest";
import * as cliExports from "./index.js";

describe("cli index exports", () => {
  it("re-exports core CLI command constructors", () => {
    expect(cliExports.PortfolioManagerCommand).toBeDefined();
    expect(cliExports.PortfolioManagerBaseCommand).toBeDefined();
    expect(cliExports.PortfolioManagerMeterCommand).toBeDefined();
    expect(cliExports.PortfolioManagerPropertyCommand).toBeDefined();
  });
});
