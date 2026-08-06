import { describe, expect, it, vi } from "vitest";
import { mockIProperty } from "./Mocks.js";
import { PortfolioManager } from "./PortfolioManager.js";
import type { PortfolioManagerApi } from "./PortfolioManagerApi.js";
import {
  PROPERTY_BUNDLE_FORMAT,
  PROPERTY_BUNDLE_SCHEMA,
  PROPERTY_BUNDLE_VERSION,
  type IPropertyBundleV1,
} from "./types/index.js";

function createClient(): PortfolioManager {
  return new PortfolioManager({} as PortfolioManagerApi, { concurrency: 2 });
}

function bundle(names = ["One"]): IPropertyBundleV1 {
  return {
    $schema: PROPERTY_BUNDLE_SCHEMA,
    format: PROPERTY_BUNDLE_FORMAT,
    formatVersion: PROPERTY_BUNDLE_VERSION,
    capabilities: ["property"],
    properties: names.map((name, index) => ({
      ref: `property:${index + 1}`,
      property: { ...mockIProperty(), name },
    })),
  };
}

describe("PortfolioManager property bundle facade", () => {
  it("creates a property in an explicitly selected account", async () => {
    const property = mockIProperty();
    const post = vi.fn().mockResolvedValue({
      response: { "@_status": "Ok", id: 100, links: { link: [] } },
    });
    const client = new PortfolioManager({
      propertyPropertyPost: post,
    } as unknown as PortfolioManagerApi);
    vi.spyOn(client, "getProperty").mockResolvedValue({
      ...property,
      id: 100,
    });

    await expect(client.createProperty(property, 55)).resolves.toMatchObject({
      id: 100,
    });
    expect(post).toHaveBeenCalledWith(property, 55);
  });

  it("exports properties in stable id order without response metadata", async () => {
    const client = createClient();
    vi.spyOn(client, "getProperty").mockImplementation(async (id) => ({
      ...mockIProperty(),
      id,
      name: `Property ${id}`,
      accessLevel: "Full",
      audit: { createdBy: "user" },
    }));

    const result = await client.exportProperties([20, 10]);

    expect(client.getProperty).toHaveBeenCalledWith(10);
    expect(client.getProperty).toHaveBeenCalledWith(20);
    expect(result.properties.map((entry) => entry.ref)).toEqual([
      "property:1",
      "property:2",
    ]);
    expect(result.properties.map((entry) => entry.property.name)).toEqual([
      "Property 10",
      "Property 20",
    ]);
    expect(result.properties[0].property).not.toHaveProperty("id");
    expect(result.properties[0].property).not.toHaveProperty("audit");
    expect(result.properties[0].property).not.toHaveProperty("accessLevel");
  });

  it("exports one property and reports progress", async () => {
    const client = createClient();
    vi.spyOn(client, "getProperty").mockResolvedValue({
      ...mockIProperty(),
      id: 10,
    });
    const onProgress = vi.fn();

    await expect(
      client.exportProperty(10, { onProgress }),
    ).resolves.toMatchObject({
      properties: [{ ref: "property:1" }],
    });
    expect(onProgress).toHaveBeenCalledWith({
      operation: "export",
      propertyRef: "property:1",
      completed: 1,
      total: 1,
    });
  });

  it("rejects invalid property id selections", async () => {
    const client = createClient();

    await expect(client.exportProperties([])).rejects.toThrow(
      "At least one property id is required",
    );
    await expect(client.exportProperties([0])).rejects.toThrow(
      "positive integers",
    );
    await expect(client.exportProperties([1.5])).rejects.toThrow(
      "positive integers",
    );
    await expect(client.exportProperties([1, 1])).rejects.toThrow(
      "must not contain duplicates",
    );
  });

  it("validates a dry run without making API calls", async () => {
    const client = createClient();
    const create = vi.spyOn(client, "createProperty");

    await expect(
      client.importProperties(bundle(["One", "Two"]), { dryRun: true }),
    ).resolves.toEqual({
      status: "dry-run",
      properties: [
        { ref: "property:1", status: "planned" },
        { ref: "property:2", status: "planned" },
      ],
    });
    expect(create).not.toHaveBeenCalled();
  });

  it("preflights target account ids and modified property names", async () => {
    const client = createClient();
    const create = vi.spyOn(client, "createProperty");

    await expect(
      client.importProperties(bundle(), { accountId: 0, dryRun: true }),
    ).rejects.toThrow("Target account id must be a positive integer");
    await expect(
      client.importProperties(bundle(), {
        dryRun: true,
        namePrefix: "x".repeat(80),
      }),
    ).rejects.toThrow("must contain 1-80 characters");
    expect(create).not.toHaveBeenCalled();
  });

  it("imports into an explicit account and modifies names only when asked", async () => {
    const client = createClient();
    const create = vi
      .spyOn(client, "createProperty")
      .mockResolvedValue({ ...mockIProperty(), id: 100 } as never);

    await expect(
      client.importProperties(bundle(), {
        accountId: 55,
        namePrefix: "Copy of ",
        nameSuffix: " (fixture)",
      }),
    ).resolves.toEqual({
      status: "complete",
      properties: [{ ref: "property:1", status: "created", id: 100 }],
    });
    expect(create).toHaveBeenCalledWith(
      { ...mockIProperty(), name: "Copy of One (fixture)" },
      55,
    );
  });

  it("converts portable floor-area dates back to API dates", async () => {
    const client = createClient();
    const create = vi
      .spyOn(client, "createProperty")
      .mockResolvedValue({ ...mockIProperty(), id: 100 } as never);
    const value = bundle();
    value.properties[0].property.grossFloorArea.currentAsOf = "2026-08-05";

    await client.importProperties(value);

    expect(create).toHaveBeenCalledWith(
      {
        ...mockIProperty(),
        name: "One",
        grossFloorArea: {
          ...mockIProperty().grossFloorArea,
          currentAsOf: new Date("2026-08-05T00:00:00Z"),
        },
      },
      undefined,
    );
  });

  it("reports import and cleanup progress", async () => {
    const client = createClient();
    vi.spyOn(client, "createProperty")
      .mockResolvedValueOnce({ ...mockIProperty(), id: 100 } as never)
      .mockRejectedValueOnce("create failed");
    vi.spyOn(client, "deleteProperty").mockResolvedValue(true);
    const onProgress = vi.fn();

    await expect(
      client.importProperties(bundle(["One", "Two"]), { onProgress }),
    ).resolves.toMatchObject({ status: "failed", error: "create failed" });
    expect(onProgress).toHaveBeenNthCalledWith(1, {
      operation: "import",
      propertyRef: "property:1",
      completed: 1,
      total: 2,
    });
    expect(onProgress).toHaveBeenNthCalledWith(2, {
      operation: "cleanup",
      propertyRef: "property:1",
      completed: 1,
      total: 1,
    });
  });

  it("rolls back properties from the current import after a failure", async () => {
    const client = createClient();
    vi.spyOn(client, "createProperty")
      .mockResolvedValueOnce({ ...mockIProperty(), id: 100 } as never)
      .mockRejectedValueOnce(new Error("create failed"));
    const remove = vi.spyOn(client, "deleteProperty").mockResolvedValue(true);

    await expect(
      client.importProperties(bundle(["One", "Two"])),
    ).resolves.toEqual({
      status: "failed",
      error: "create failed",
      properties: [
        { ref: "property:1", status: "rolled-back", id: 100 },
        { ref: "property:2", status: "failed", error: "create failed" },
      ],
    });
    expect(remove).toHaveBeenCalledWith(100);
  });

  it("can keep successfully created properties after a failure", async () => {
    const client = createClient();
    vi.spyOn(client, "createProperty")
      .mockResolvedValueOnce({ ...mockIProperty(), id: 100 } as never)
      .mockRejectedValueOnce(new Error("create failed"));
    const remove = vi.spyOn(client, "deleteProperty");

    const result = await client.importProperties(bundle(["One", "Two"]), {
      keepPartial: true,
    });

    expect(result.properties[0]).toEqual({
      ref: "property:1",
      status: "created",
      id: 100,
    });
    expect(remove).not.toHaveBeenCalled();
  });

  it("reports cleanup failures without hiding the import error", async () => {
    const client = createClient();
    vi.spyOn(client, "createProperty")
      .mockResolvedValueOnce({ ...mockIProperty(), id: 100 } as never)
      .mockResolvedValueOnce({ ...mockIProperty(), id: 200 } as never)
      .mockRejectedValueOnce(new Error("create failed"));
    vi.spyOn(client, "deleteProperty")
      .mockRejectedValueOnce(new Error("cleanup error"))
      .mockRejectedValueOnce("cleanup string");

    await expect(
      client.importProperties(bundle(["One", "Two", "Three"])),
    ).resolves.toEqual({
      status: "failed",
      error: "create failed",
      properties: [
        {
          ref: "property:1",
          status: "cleanup-failed",
          id: 100,
          error: "cleanup string",
        },
        {
          ref: "property:2",
          status: "cleanup-failed",
          id: 200,
          error: "cleanup error",
        },
        { ref: "property:3", status: "failed", error: "create failed" },
      ],
    });
  });
});
