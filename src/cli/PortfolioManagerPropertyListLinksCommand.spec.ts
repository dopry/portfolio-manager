import { afterEach, beforeEach, describe, expect, it } from "vitest";
import {
  setupCliHarness,
  type CliHarness,
} from "../test/cli/cliTestHarness.js";

describe("PortfolioManagerPropertyListLinksCommand (parse)", () => {
  let harness: CliHarness;

  beforeEach(() => {
    harness = setupCliHarness();
  });

  afterEach(() => {
    harness.restore();
  });

  it("parses and executes property list links", async () => {
    harness.fakeClient.getPropertyLinks.mockResolvedValueOnce({
      a: {
        "@_id": "1",
        "@_hint": "HQ",
        "@_link": "/property/1",
        "@_httpMethod": "GET",
      },
      b: {
        "@_id": "2",
        "@_hint": "Warehouse",
        "@_link": "/property/2",
        "@_httpMethod": "GET",
      },
    });

    await harness.parseCli([
      "property",
      "list",
      "links",
      "--fields",
      "@_id",
      "@_hint",
    ]);

    expect(harness.fakeClient.getPropertyLinks).toHaveBeenCalledTimes(1);
    expect(console.log).toHaveBeenCalledWith(
      JSON.stringify(
        [
          { "@_id": "1", "@_hint": "HQ" },
          { "@_id": "2", "@_hint": "Warehouse" },
        ],
        null,
        0
      )
    );
  });

  it("renders help for property list links", async () => {
    await harness.parseCliHelp(["property", "list", "links"]);
  });
});
