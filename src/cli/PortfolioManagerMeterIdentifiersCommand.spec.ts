import { afterEach, beforeEach, describe, expect, it } from "vitest";
import {
  setupCliHarness,
  type CliHarness,
} from "../test/cli/cliTestHarness.js";

describe("PortfolioManagerMeterIdentifiersCommand (parse)", () => {
  let harness: CliHarness;

  beforeEach(() => {
    harness = setupCliHarness();
  });

  afterEach(() => {
    harness.restore();
  });

  it("parses and executes meter identifiers", async () => {
    harness.fakeClient.getMeterAdditionalIdentifiers.mockResolvedValueOnce([
      {
        "@_id": "id-1",
        value: "abc",
        description: "legacy",
        "additionalIdentifierType.@_description": "Custom",
      },
    ]);

    await harness.parseCli([
      "meter",
      "identifiers",
      "--meterId",
      "1000",
      "--fields",
      "@_id",
      "description",
    ]);

    expect(harness.fakeClient.getMeterAdditionalIdentifiers).toHaveBeenCalledWith(
      "1000"
    );
    expect(console.log).toHaveBeenCalledWith(
      JSON.stringify([{ "@_id": "id-1", description: "legacy" }], null, 0)
    );
  });

  it("renders help for meter identifiers", async () => {
    await harness.parseCliHelp(["meter", "identifiers"]);
  });

  it("fails on invalid selected fields", async () => {
    harness.fakeClient.getMeterAdditionalIdentifiers.mockResolvedValueOnce([]);

    await expect(
      harness.parseCli([
        "meter",
        "identifiers",
        "--meterId",
        "1000",
        "--fields",
        "@_id",
        "badField",
      ])
    ).rejects.toThrow("Invalid field(s): badField");

    expect(harness.fakeClient.getMeterAdditionalIdentifiers).not.toHaveBeenCalled();
  });
});
