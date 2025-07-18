import { InvalidArgumentError } from "commander";
import { describe, expect, beforeEach, afterEach, it, vi } from "vitest";
import { PortfolioManager } from "../PortfolioManager.js";
import { PortfolioManagerApiError } from "../PortfolioManagerApi.js";
import { parseIntArg, PortfolioManagerBaseCommand } from "./PortfolioManagerBaseCommand.js";
import { setupCliHarness, type CliHarness } from "../test/cli/cliTestHarness.js";

describe("parseIntArg", () => {
  it("parses valid integers", () => {
    expect(parseIntArg("42")).to.equal(42);
  });

  it("throws InvalidArgumentError on invalid integers", () => {
    expect(() => parseIntArg("abc")).to.throw(InvalidArgumentError);
  });
});

describe("PortfolioManagerBaseCommand.getPortfolioManagerClient", () => {
  it("throws InvalidArgumentError when addPortfolioManagerOptions was not called", () => {
    class TestCommand extends PortfolioManagerBaseCommand {
      constructor() {
        super("test");
      }
    }
    const cmd = new TestCommand();
    expect(() => cmd.getPortfolioManagerClient()).to.throw(InvalidArgumentError);
  });
});

describe("PortfolioManagerCommand (parse)", () => {
  let harness: CliHarness;

  beforeEach(() => {
    harness = setupCliHarness();
  });

  afterEach(() => {
    harness.restore();
  });

  it("parses and executes property list entities with selected fields", async () => {
    harness.fakeClient.getProperties.mockResolvedValueOnce([
      {
        id: 101,
        name: "HQ",
        yearBuilt: 2002,
      },
    ]);

    await harness.parseCli([
      "property",
      "list",
      "entities",
      "--fields",
      "id",
      "name",
    ]);

    expect(harness.fakeClient.getProperties).toHaveBeenCalledTimes(1);
    expect(console.log).toHaveBeenCalledWith(
      JSON.stringify([{ id: 101, name: "HQ" }], null, 0)
    );
  });

  it("renders help for property list entities", async () => {
    await harness.parseCliHelp(["property", "list", "entities"]);
  });

  it("fills missing selected fields as undefined during field picking", async () => {
    harness.fakeClient.getProperties.mockResolvedValueOnce([{ id: 101 }]);

    await harness.parseCli([
      "property",
      "list",
      "entities",
      "--fields",
      "id",
      "name",
    ]);

    expect(console.log).toHaveBeenCalledWith(
      JSON.stringify([{ id: 101, name: undefined }], null, 0)
    );
  });

  it("parses and executes meter association get", async () => {
    harness.fakeClient.getAssociatedMeters.mockResolvedValueOnce({
      propertyId: "123",
      meterIds: [11, 12],
    });

    await harness.parseCli([
      "meter",
      "association",
      "get",
      "--propertyId",
      "123",
    ]);

    expect(harness.fakeClient.getAssociatedMeters).toHaveBeenCalledWith("123");
    expect(console.log).toHaveBeenCalledWith(
      JSON.stringify({ propertyId: "123", meterIds: [11, 12] }, null, 0)
    );
  });

  it("renders help for meter association get", async () => {
    await harness.parseCliHelp(["meter", "association", "get"]);
  });

  it("parses and executes meter association list", async () => {
    harness.fakeClient.getMetersPropertiesAssociation.mockResolvedValueOnce([
      { propertyId: "10", meterIds: [100] },
      { propertyId: "11", meterIds: [101, 102] },
    ]);

    await harness.parseCli([
      "meter",
      "association",
      "list",
      "--propertyIds",
      "10",
      "11",
      "12",
    ]);

    expect(harness.fakeClient.getMetersPropertiesAssociation).toHaveBeenCalledWith([
      "10",
      "11",
      "12",
    ]);
    expect(console.log).toHaveBeenCalledWith(
      JSON.stringify(
        [
          { propertyId: "10", meterIds: [100] },
          { propertyId: "11", meterIds: [101, 102] },
        ],
        null,
        0
      )
    );
  });

  it("renders help for meter association list", async () => {
    await harness.parseCliHelp(["meter", "association", "list"]);
  });

  it("parses and executes meter list links with field filtering", async () => {
    harness.fakeClient.getMeterLinks.mockResolvedValueOnce([
      {
        "@_id": "22",
        "@_hint": "Main Meter",
        "@_link": "/meter/22",
        "@_httpMethod": "GET",
      },
    ]);

    await harness.parseCli([
      "meter",
      "list",
      "links",
      "--propertyId",
      "99",
      "--myAccessOnly",
      "--fields",
      "@_id",
      "@_hint",
    ]);

    expect(harness.fakeClient.getMeterLinks).toHaveBeenCalledWith("99", true);
    expect(console.log).toHaveBeenCalledWith(
      JSON.stringify([{ "@_id": "22", "@_hint": "Main Meter" }], null, 0)
    );
  });

  it("renders help for meter list links", async () => {
    await harness.parseCliHelp(["meter", "list", "links"]);
  });

  it("fails on invalid selected fields for meter list links", async () => {
    harness.fakeClient.getMeterLinks.mockResolvedValueOnce([]);

    await expect(
      harness.parseCli([
        "meter",
        "list",
        "links",
        "--propertyId",
        "99",
        "--fields",
        "@_id",
        "notAField",
      ])
    ).rejects.toThrow("Invalid field(s): notAField");

    expect(harness.fakeClient.getMeterLinks).not.toHaveBeenCalled();
  });

  it("parses and executes meter consumption get with date bounds", async () => {
    harness.fakeClient.getMeterConsumption.mockResolvedValueOnce([
      {
        id: 1,
        "@_estimatedValue": "N",
        startDate: "2026-01-01",
        endDate: "2026-01-31",
        usage: 12,
        cost: 5,
      },
    ]);

    await harness.parseCli([
      "meter",
      "consumption",
      "get",
      "--meterId",
      "500",
      "--start",
      "2026-01-01",
      "--end",
      "2026-01-31",
      "--fields",
      "id",
      "usage",
    ]);

    expect(harness.fakeClient.getMeterConsumption).toHaveBeenCalledWith(
      "500",
      "2026-01-01",
      "2026-01-31"
    );
    expect(console.log).toHaveBeenCalledWith(
      JSON.stringify([{ id: 1, usage: 12 }], null, 0)
    );
  });

  it("renders help for meter consumption get", async () => {
    await harness.parseCliHelp(["meter", "consumption", "get"]);
  });

  it("fails on invalid selected fields for meter consumption get", async () => {
    harness.fakeClient.getMeterConsumption.mockResolvedValueOnce([]);

    await expect(
      harness.parseCli([
        "meter",
        "consumption",
        "get",
        "--meterId",
        "500",
        "--fields",
        "id",
        "badField",
      ])
    ).rejects.toThrow("Invalid field(s): badField");

    expect(harness.fakeClient.getMeterConsumption).not.toHaveBeenCalled();
  });

  it("parses and executes property metrics monthly", async () => {
    harness.fakeClient.getPropertyMonthlyMetrics.mockResolvedValueOnce([
      {
        propertyId: "900",
        name: "score",
        year: 2025,
        month: 12,
        value: 75,
      },
    ]);

    await harness.parseCli([
      "property",
      "metrics",
      "monthly",
      "--propertyId",
      "900",
      "--year",
      "2025",
      "--month",
      "12",
      "--metrics",
      "score",
      "siteIntensity",
      "--include_null",
      "--fields",
      "name",
      "value",
    ]);

    expect(harness.fakeClient.getPropertyMonthlyMetrics).toHaveBeenCalledWith(
      "900",
      "2025",
      "12",
      ["score", "siteIntensity"],
      false
    );
    expect(console.log).toHaveBeenCalledWith(
      JSON.stringify([{ name: "score", value: 75 }], null, 0)
    );
  });

  it("renders help for property metrics monthly", async () => {
    await harness.parseCliHelp(["property", "metrics", "monthly"]);
  });

  it("sets exitCode and logs api error for monthly metrics API failures", async () => {
    harness.fakeClient.getPropertyMonthlyMetrics.mockRejectedValueOnce(
      new PortfolioManagerApiError(400, "Bad Request", "invalid payload")
    );

    await harness.parseCli([
      "property",
      "metrics",
      "monthly",
      "--propertyId",
      "900",
      "--year",
      "2025",
      "--month",
      "12",
    ]);

    expect(process.exitCode).to.equal(1);
    expect(console.error).toHaveBeenCalledWith(
      "api error",
      "Bad Request",
      400,
      "Bad Request",
      "invalid payload"
    );
  });

  it("sets exitCode and logs unknown error for monthly metrics failures", async () => {
    harness.fakeClient.getPropertyMonthlyMetrics.mockRejectedValueOnce(
      new Error("boom")
    );

    await harness.parseCli([
      "property",
      "metrics",
      "monthly",
      "--propertyId",
      "900",
      "--year",
      "2025",
      "--month",
      "12",
    ]);

    expect(process.exitCode).to.equal(1);
    expect(console.error).toHaveBeenCalledWith(
      "unknown error",
      expect.any(Error)
    );
  });

  it("parses and executes property metrics annual", async () => {
    harness.fakeClient.getPropertyMetrics.mockResolvedValueOnce({
      score: {
        propertyId: "901",
        name: "score",
        year: 2025,
        month: 12,
        value: 81,
      },
    });

    await harness.parseCli([
      "property",
      "metrics",
      "annual",
      "--propertyId",
      "901",
      "--year",
      "2025",
      "--month",
      "12",
      "--fields",
      "propertyId",
      "value",
    ]);

    expect(harness.fakeClient.getPropertyMetrics).toHaveBeenCalledWith(
      "901",
      "2025",
      "12",
      undefined,
      true
    );
    expect(console.log).toHaveBeenCalledWith(
      JSON.stringify([{ propertyId: "901", value: 81 }], null, 0)
    );
  });

  it("renders help for property metrics annual", async () => {
    await harness.parseCliHelp(["property", "metrics", "annual"]);
  });

  it("sets exitCode and logs api error for annual metrics API failures", async () => {
    harness.fakeClient.getPropertyMetrics.mockRejectedValueOnce(
      new PortfolioManagerApiError(500, "Server Error", "pm outage")
    );

    await harness.parseCli([
      "property",
      "metrics",
      "annual",
      "--propertyId",
      "901",
      "--year",
      "2025",
      "--month",
      "12",
    ]);

    expect(process.exitCode).to.equal(1);
    expect(console.error).toHaveBeenCalledWith(
      "api error",
      "Server Error",
      500,
      "Server Error",
      "pm outage"
    );
  });

  it("sets exitCode and logs unknown error for annual metrics failures", async () => {
    harness.fakeClient.getPropertyMetrics.mockRejectedValueOnce(new Error("boom"));

    await harness.parseCli([
      "property",
      "metrics",
      "annual",
      "--propertyId",
      "901",
      "--year",
      "2025",
      "--month",
      "12",
    ]);

    expect(process.exitCode).to.equal(1);
    expect(console.error).toHaveBeenCalledWith(
      "unknown error",
      expect.any(Error)
    );
  });

  it("throws when a mapped item is not a record", async () => {
    harness.fakeClient.getPropertyLinks.mockResolvedValueOnce({
      bad: null,
    });

    await expect(
      harness.parseCli(["property", "list", "links", "--fields", "@_id"])
    ).rejects.toThrow("Expected entity to be a record");
  });

  it("parses and executes connection list-pending", async () => {
    harness.fakeClient.getPendingConnections.mockResolvedValueOnce([
      {
        accountId: 41,
        username: "sender",
        email: "sender@example.test",
      },
    ]);

    await harness.parseCli(["connection", "list-pending"]);

    expect(harness.fakeClient.getPendingConnections).toHaveBeenCalledTimes(1);
    expect(console.log).toHaveBeenCalledWith(
      JSON.stringify(
        [
          {
            accountId: 41,
            username: "sender",
            email: "sender@example.test",
          },
        ],
        null,
        0
      )
    );
  });

  it("shows empty message for connection list-pending", async () => {
    harness.fakeClient.getPendingConnections.mockResolvedValueOnce([]);

    await harness.parseCli(["connection", "list-pending"]);

    expect(console.error).toHaveBeenCalledWith(
      "No pending connection requests found."
    );
  });

  it("parses and executes connection accept with optional note", async () => {
    await harness.parseCli([
      "connection",
      "accept",
      "--accountId",
      "512",
      "--note",
      "approved",
    ]);

    expect(harness.fakeClient.acceptConnection).toHaveBeenCalledWith(
      "512",
      "approved"
    );
  });

  it("parses and executes connection reject", async () => {
    await harness.parseCli([
      "connection",
      "reject",
      "--accountId",
      "700",
    ]);

    expect(harness.fakeClient.rejectConnection).toHaveBeenCalledWith(
      "700",
      undefined
    );
  });

  it("parses and executes connection disconnect with keep-shares", async () => {
    await harness.parseCli([
      "connection",
      "disconnect",
      "--accountId",
      "700",
      "--keep-shares",
      "--note",
      "done",
    ]);

    expect(harness.fakeClient.disconnect).toHaveBeenCalledWith("700", {
      keepShares: true,
      note: "done",
    });
  });

  it("parses and executes share list-pending", async () => {
    harness.fakeClient.getPendingPropertyShares.mockResolvedValueOnce([
      { type: "property", id: 1001 },
    ]);
    harness.fakeClient.getPendingMeterShares.mockResolvedValueOnce([
      { type: "meter", id: 2001 },
    ]);

    await harness.parseCli(["share", "list-pending"]);

    expect(harness.fakeClient.getPendingPropertyShares).toHaveBeenCalledTimes(1);
    expect(harness.fakeClient.getPendingMeterShares).toHaveBeenCalledTimes(1);
    expect(console.log).toHaveBeenCalledWith(
      JSON.stringify(
        [
          { type: "property", id: 1001 },
          { type: "meter", id: 2001 },
        ],
        null,
        0
      )
    );
  });

  it("shows empty message for share list-pending", async () => {
    harness.fakeClient.getPendingPropertyShares.mockResolvedValueOnce([]);
    harness.fakeClient.getPendingMeterShares.mockResolvedValueOnce([]);

    await harness.parseCli(["share", "list-pending"]);

    expect(console.error).toHaveBeenCalledWith("No pending share requests found.");
  });

  it("parses and executes share accept for property", async () => {
    await harness.parseCli([
      "share",
      "accept",
      "--type",
      "property",
      "--id",
      "321",
      "--note",
      "accepted",
    ]);

    expect(harness.fakeClient.acceptPropertyShare).toHaveBeenCalledWith(
      "321",
      "accepted"
    );
    expect(harness.fakeClient.acceptMeterShare).not.toHaveBeenCalled();
  });

  it("parses and executes share accept for meter", async () => {
    await harness.parseCli([
      "share",
      "accept",
      "--type",
      "meter",
      "--id",
      "322",
      "--note",
      "accepted-meter",
    ]);

    expect(harness.fakeClient.acceptMeterShare).toHaveBeenCalledWith(
      "322",
      "accepted-meter"
    );
    expect(harness.fakeClient.acceptPropertyShare).not.toHaveBeenCalled();
  });

  it("parses and executes share reject for meter", async () => {
    await harness.parseCli([
      "share",
      "reject",
      "--type",
      "meter",
      "--id",
      "654",
    ]);

    expect(harness.fakeClient.rejectMeterShare).toHaveBeenCalledWith(
      "654",
      undefined
    );
    expect(harness.fakeClient.rejectPropertyShare).not.toHaveBeenCalled();
  });

  it("parses and executes share reject for property", async () => {
    await harness.parseCli([
      "share",
      "reject",
      "--type",
      "property",
      "--id",
      "655",
      "--note",
      "reject-property",
    ]);

    expect(harness.fakeClient.rejectPropertyShare).toHaveBeenCalledWith(
      "655",
      "reject-property"
    );
    expect(harness.fakeClient.rejectMeterShare).not.toHaveBeenCalled();
  });

  it("parses and executes share remove for property", async () => {
    await harness.parseCli([
      "share",
      "remove",
      "--type",
      "property",
      "--id",
      "777",
      "--note",
      "cleanup",
    ]);

    expect(harness.fakeClient.unshareProperty).toHaveBeenCalledWith(
      "777",
      "cleanup"
    );
    expect(harness.fakeClient.unshareMeter).not.toHaveBeenCalled();
  });

  it("parses and executes share remove for meter", async () => {
    await harness.parseCli([
      "share",
      "remove",
      "--type",
      "meter",
      "--id",
      "778",
      "--note",
      "cleanup-meter",
    ]);

    expect(harness.fakeClient.unshareMeter).toHaveBeenCalledWith(
      "778",
      "cleanup-meter"
    );
    expect(harness.fakeClient.unshareProperty).not.toHaveBeenCalled();
  });

  it("parses and executes notifications list with --no-clear", async () => {
    harness.fakeClient.getNotifications.mockResolvedValueOnce([
      { id: 11, type: "DISCONNECT" },
    ]);

    await harness.parseCli(["notifications", "list", "--no-clear"]);

    expect(harness.fakeClient.getNotifications).toHaveBeenCalledWith({
      markAsRead: false,
    });
    expect(console.log).toHaveBeenCalledWith(
      JSON.stringify([{ id: 11, type: "DISCONNECT" }], null, 0)
    );
  });

  it("uses default notification clear behavior", async () => {
    harness.fakeClient.getNotifications.mockResolvedValueOnce([
      { id: 12, type: "UNSHARE" },
    ]);

    await harness.parseCli(["notifications", "list"]);

    expect(harness.fakeClient.getNotifications).toHaveBeenCalledWith({
      markAsRead: true,
    });
    expect(console.log).toHaveBeenCalledWith(
      JSON.stringify([{ id: 12, type: "UNSHARE" }], null, 0)
    );
  });

  it("shows empty message for notifications list", async () => {
    harness.fakeClient.getNotifications.mockResolvedValueOnce([]);

    await harness.parseCli(["notifications", "list"]);

    expect(console.error).toHaveBeenCalledWith("No new notifications found.");
  });

  it("uses the real base client construction path", async () => {
    vi.restoreAllMocks();
    vi.spyOn(console, "log").mockImplementation(() => undefined);
    vi.spyOn(console, "error").mockImplementation(() => undefined);

    const getPropertiesSpy = vi
      .spyOn(PortfolioManager.prototype, "getProperties")
      .mockResolvedValueOnce([{ id: 501, name: "Real Path" }] as never[]);

    await harness.parseCli([
      "property",
      "list",
      "entities",
      "--fields",
      "id",
      "name",
    ]);

    expect(getPropertiesSpy).toHaveBeenCalledTimes(1);
    expect(console.log).toHaveBeenCalledWith(
      JSON.stringify([{ id: 501, name: "Real Path" }], null, 0)
    );
  });

  it("shows group help via default action when no subcommand is provided", async () => {
    await harness.parseCliHelp(["meter"], false);
  });
});
