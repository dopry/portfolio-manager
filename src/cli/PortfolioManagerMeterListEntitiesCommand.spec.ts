import { afterEach, beforeEach, describe, expect, it } from "vitest";
import {
  setupCliHarness,
  type CliHarness,
} from "../test/cli/cliTestHarness.js";

describe("PortfolioManagerMeterListEntitiesCommand (parse)", () => {
  let harness: CliHarness;

  beforeEach(() => {
    harness = setupCliHarness();
  });

  afterEach(() => {
    harness.restore();
  });

  it("parses and executes meter list entities", async () => {
    harness.fakeClient.getMeters.mockResolvedValueOnce([
      {
        id: 55,
        type: "Electric",
        name: "Main",
        metered: true,
      },
    ]);

    await harness.parseCli([
      "meter",
      "list",
      "entities",
      "--propertyId",
      "99",
      "--fields",
      "id",
      "name",
    ]);

    expect(harness.fakeClient.getMeters).toHaveBeenCalledWith("99");
    expect(console.log).toHaveBeenCalledWith(
      JSON.stringify([{ id: 55, name: "Main" }], null, 0)
    );
  });

  it("renders help for meter list entities", async () => {
    await harness.parseCliHelp(["meter", "list", "entities"]);
  });

  it("fails on invalid selected fields", async () => {
    harness.fakeClient.getMeters.mockResolvedValueOnce([]);

    await expect(
      harness.parseCli([
        "meter",
        "list",
        "entities",
        "--propertyId",
        "99",
        "--fields",
        "id",
        "badField",
      ])
    ).rejects.toThrow("Invalid field(s): badField");

    expect(harness.fakeClient.getMeters).not.toHaveBeenCalled();
  });
});
