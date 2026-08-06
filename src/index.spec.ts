import { describe, expect, it } from "vitest";

describe("library entrypoint", () => {
  it("exports the SDK surface without the CLI", async () => {
    const root = await import("./index.js");

    expect(root.PortfolioManager).to.be.a("function");
    expect(root.PortfolioManagerApi).to.be.a("function");
    expect(root.PortfolioManagerApiError).to.be.a("function");
    expect(root.validatePropertyBundle).to.be.a("function");
    expect(root.serializePropertyBundle).to.be.a("function");
    expect(root.PROPERTY_BUNDLE_FORMAT).to.equal(
      "portfolio-manager/property-bundle",
    );
    expect(root.PROPERTY_BUNDLE_SCHEMA_DOCUMENT.$id).to.equal(
      root.PROPERTY_BUNDLE_SCHEMA,
    );
    // The CLI moved to the dedicated ./cli entry so SDK consumers no longer
    // load Commander and the command classes.
    expect(root).to.not.have.property("PortfolioManagerCommand");
  });
});
