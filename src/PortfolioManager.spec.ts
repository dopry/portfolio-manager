import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from "vitest";
import { mockIProperty, mockMeter } from "./Mocks.js";
import { PortfolioManager } from "./PortfolioManager.js";
import { PortfolioManagerApi, PortfolioManagerApiError } from "./PortfolioManagerApi.js";
import {
  ensureStandardMetricsFixture,
  IStandardMetricsFixture,
} from "./test/ensureStandardMetricsFixture.js";
import {
  ensureStandardProperties,
  STANDARD_PROPERTY_NAMES,
} from "./test/ensureStandardProperties.js";
import { IAccount } from "./types/index.js";

const BASE_URL = "https://portfoliomanager.energystar.gov/wstest/";
const USERNAME = process.env.PM_USERNAME || "";
const PASSWORD = process.env.PM_PASSWORD || "";
if (!USERNAME || !PASSWORD) {
  throw new Error(
    "Please set PM_USERNAME and PM_PASSWORD environment variables"
  );
}
const RUN_ID = `${Date.now()}-${Math.round(Math.random() * 1000000)}`;

function withRunId(base: string): string {
  return `${base} ${RUN_ID}`;
}

describe("PortfolioManager (integration)", () => {
  let api: PortfolioManagerApi;
  let pm: PortfolioManager;
  let account: IAccount;
  let testPropertyIds: number[];
  let metricsFixture: IStandardMetricsFixture;
  const createdPropertyIds: number[] = [];
  const createdFixturePropertyMeterIds: number[] = [];

  function untrackId(ids: number[], id?: number): void {
    if (!id) return;
    const idx = ids.lastIndexOf(id);
    if (idx >= 0) {
      ids.splice(idx, 1);
    }
  }

  async function ensureTestFixtures() {
    api = new PortfolioManagerApi(BASE_URL, USERNAME, PASSWORD);
    pm = new PortfolioManager(api);
    account = await pm.getAccount();

    testPropertyIds = await ensureStandardProperties(
      api,
      account.id || 0,
      STANDARD_PROPERTY_NAMES
    );
    metricsFixture = await ensureStandardMetricsFixture(api, testPropertyIds[0]);
  }

  beforeAll(async () => {
    await ensureTestFixtures();
  }, 60000);

  afterAll(async () => {
    // Meters created on fixture properties must be cleaned explicitly.
    const uniqueFixtureMeters = Array.from(
      new Set(createdFixturePropertyMeterIds)
    ).reverse();
    for (const meterId of uniqueFixtureMeters) {
      try {
        await pm.deleteMeter(meterId);
      } catch {
        // Best effort cleanup for shared test environment.
      }
    }

    // Property delete is authoritative and expected to delete associated meters.
    const uniqueProperties = Array.from(new Set(createdPropertyIds)).reverse();
    for (const propertyId of uniqueProperties) {
      try {
        await pm.deleteProperty(propertyId);
      } catch {
        // Best effort cleanup for shared test environment.
      }
    }
  }, 120000);

  it("can be constructed", () => {
    expect(api).to.be.an.instanceof(PortfolioManagerApi);
    expect(pm).to.be.an.instanceof(PortfolioManager);
  });

  it("getAccount + getAccountId + getPropertyLinks", async () => {
    const gotAccount = await pm.getAccount();
    expect(gotAccount.id).to.equal(account.id);

    const accountId = await pm.getAccountId();
    expect(accountId).to.equal(account.id);

    const links = await pm.getPropertyLinks(accountId);
    expect(links).to.be.an("array");
    expect(links.length).to.be.greaterThan(0);
  }, 60000);

  it("createProperty + getProperty", async () => {
    const property = {
      ...mockIProperty(),
      name: withRunId("PM Integration Property"),
    };

    const created = await pm.createProperty(property);
    if (created.id) {
      createdPropertyIds.push(created.id);
    }
    expect(created.id).to.be.a("number");
    expect(created.name).to.equal(property.name);

    const fetched = await pm.getProperty(created.id || 0);
    expect(fetched.id).to.equal(created.id);
    expect(fetched.name).to.equal(property.name);

    const deleted = await pm.deleteProperty(created.id || 0);
    expect(deleted).to.equal(true);
    untrackId(createdPropertyIds, created.id);

    await expect(pm.getProperty(created.id || 0)).rejects.toThrow();
  }, 90000);

  it("createMeter + getMeterLinks + getMeter", async () => {
    const propertyId = testPropertyIds[0];

    const meterTemplate = mockMeter(withRunId("PM Integration Meter"));
    const created = await pm.createMeter(propertyId, meterTemplate);
    if (created.id) {
      createdFixturePropertyMeterIds.push(created.id);
    }
    expect(created.id).to.be.a("number");
    expect(created.name).to.equal(meterTemplate.name);

    const links = await pm.getMeterLinks(propertyId);
    expect(links).to.be.an("array");
    expect(links.length).to.be.greaterThan(0);

    const meter = await pm.getMeter(created.id || 0);
    expect(meter.id).to.equal(created.id);

    const deleted = await pm.deleteMeter(created.id || 0);
    expect(deleted).to.equal(true);
    untrackId(createdFixturePropertyMeterIds, created.id);

    await expect(pm.getMeter(created.id || 0)).rejects.toThrow();
  }, 90000);

  it("deleteMeter + deleteProperty (client integration)", async () => {
    const property = {
      ...mockIProperty(),
      name: withRunId("PM Integration Delete Methods Property"),
    };

    const createdProperty = await pm.createProperty(property);
    if (createdProperty.id) {
      createdPropertyIds.push(createdProperty.id);
    }

    const createdMeter = await pm.createMeter(
      createdProperty.id || 0,
      mockMeter(withRunId("PM Integration Delete Methods Meter"))
    );

    const meterDeleted = await pm.deleteMeter(createdMeter.id || 0);
    expect(meterDeleted).to.equal(true);
    await expect(pm.getMeter(createdMeter.id || 0)).rejects.toThrow();

    const propertyDeleted = await pm.deleteProperty(createdProperty.id || 0);
    expect(propertyDeleted).to.equal(true);
    untrackId(createdPropertyIds, createdProperty.id);

    await expect(pm.getProperty(createdProperty.id || 0)).rejects.toThrow();
  }, 120000);

  it("getMeters on controlled property", async () => {
    const property = {
      ...mockIProperty(),
      name: withRunId("PM Integration Property For Meter List"),
    };
    const createdProperty = await pm.createProperty(property);
    if (createdProperty.id) {
      createdPropertyIds.push(createdProperty.id);
    }
    const createdMeter = await pm.createMeter(
      createdProperty.id || 0,
      mockMeter(withRunId("PM Integration Meter For List"))
    );

    const meters = await pm.getMeters(createdProperty.id || 0);
    expect(meters).to.be.an("array");
    expect(meters.length).to.be.greaterThan(0);
    const found = meters.find((meter) => meter.id === createdMeter.id);
    expect(found).to.be.an("object");

    const propertyDeleted = await pm.deleteProperty(createdProperty.id || 0);
    expect(propertyDeleted).to.equal(true);
    untrackId(createdPropertyIds, createdProperty.id);
  }, 120000);

  it("meter additionalIdentifier lifecycle", async () => {
    const property = {
      ...mockIProperty(),
      name: withRunId("PM Integration Property For Additional Identifier"),
    };
    const createdProperty = await pm.createProperty(property);
    if (createdProperty.id) {
      createdPropertyIds.push(createdProperty.id);
    }

    const createdMeter = await pm.createMeter(
      createdProperty.id || 0,
      mockMeter(withRunId("PM Integration Meter For Additional Identifier"))
    );
    if (createdMeter.id) {
      createdFixturePropertyMeterIds.push(createdMeter.id);
    }

    const meterId = createdMeter.id || 0;
    const identifiersBefore = await pm.getMeterAdditionalIdentifiers(meterId);
    expect(identifiersBefore).to.be.an("array");

    const identifierName = withRunId("Identifier");
    const initialValue = withRunId("Initial Value");
    const created = await pm.upsertMeterAdditionalIdentifier(
      meterId,
      identifierName,
      initialValue
    );
    expect(created).to.be.an("array");

    const createdIdentifier = created.find(
      (identifier) => identifier.description === identifierName
    );
    if (!createdIdentifier) {
      throw new Error("Expected created additional identifier");
    }

    const identifierId = parseInt(createdIdentifier["@_id"], 10);
    if (Number.isNaN(identifierId)) {
      throw new Error("Expected numeric additional identifier id");
    }

    const fetched = await pm.getMeterAdditionalIdentifier(meterId, identifierId);
    expect(fetched.description).to.equal(identifierName);
    expect(fetched.value).to.equal(initialValue);

    const updatedValue = withRunId("Value");

    const updatedLinks = await pm.putMeterAdditionalIdentifier(
      meterId,
      identifierId,
      { ...fetched, value: updatedValue }
    );
    expect(updatedLinks).to.be.an("array");

    const upserted = await pm.upsertMeterAdditionalIdentifier(
      meterId,
      identifierName,
      updatedValue
    );
    expect(upserted).to.be.an("array");

    const fetchedUpdated = await pm.getMeterAdditionalIdentifier(meterId, identifierId);
    expect(fetchedUpdated.value).to.equal(updatedValue);

    const meterDeleted = await pm.deleteMeter(meterId);
    expect(meterDeleted).to.equal(true);
    untrackId(createdFixturePropertyMeterIds, createdMeter.id);

    const propertyDeleted = await pm.deleteProperty(createdProperty.id || 0);
    expect(propertyDeleted).to.equal(true);
    untrackId(createdPropertyIds, createdProperty.id);
  }, 90000);

  it("getMeterConsumption (fixture meter)", async () => {
    const rows = await pm.getMeterConsumption(metricsFixture.meterId);
    expect(rows).to.be.an("array");
    expect(rows.length).to.be.greaterThan(0);
  }, 60000);

  it("getAssociatedMeters + getMetersPropertiesAssociation", async () => {
    const property = {
      ...mockIProperty(),
      name: withRunId("PM Integration Property For Association"),
    };
    const createdProperty = await pm.createProperty(property);
    if (createdProperty.id) {
      createdPropertyIds.push(createdProperty.id);
    }

    const createdMeter = await pm.createMeter(
      createdProperty.id || 0,
      mockMeter(withRunId("PM Integration Meter For Association"))
    );
    if (createdMeter.id) {
      createdFixturePropertyMeterIds.push(createdMeter.id);
    }

    const propertyId = createdProperty.id || 0;
    const meterId = createdMeter.id || 0;
    const associationPost = await api.meterPropertyAssociationSinglePost(
      propertyId,
      meterId
    );
    expect(associationPost.response["@_status"]).to.equal("Ok");

    const association = await pm.getAssociatedMeters(propertyId);
    expect(association.propertyId).to.equal(propertyId);
    const hasAnyAssociatedMeters =
      (association.energyMeterAssociation?.meters.length || 0) > 0 ||
      (association.waterMeterAssociation?.meters.length || 0) > 0 ||
      (association.wasteMeterAssociation?.meters.length || 0) > 0;
    expect(hasAnyAssociatedMeters).to.equal(true);

    const list = await pm.getMetersPropertiesAssociation([propertyId]);
    expect(list).to.be.an("array");
    expect(list.length).to.be.greaterThan(0);

    const meterDeleted = await pm.deleteMeter(meterId);
    expect(meterDeleted).to.equal(true);
    untrackId(createdFixturePropertyMeterIds, createdMeter.id);

    const propertyDeleted = await pm.deleteProperty(propertyId);
    expect(propertyDeleted).to.equal(true);
    untrackId(createdPropertyIds, createdProperty.id);
  }, 60000);

  it("getPropertyMonthlyMetrics + getPropertyMonthlyMetrics2 + getPropertyMetrics", async () => {
    const propertyId = metricsFixture.propertyId;

    const monthly = await pm.getPropertyMonthlyMetrics(
      propertyId,
      2024,
      1,
      ["siteElectricityUseMonthly"],
      false
    );
    expect(monthly).to.be.an("array");

    const monthly2 = await pm.getPropertyMonthlyMetrics2(
      propertyId,
      2024,
      1,
      ["siteTotal"],
      false
    );
    expect(monthly2).to.be.an("object");

    const annual = await pm.getPropertyMetrics(
      propertyId,
      2024,
      1,
      ["siteTotal", "sourceTotal", "score"],
      false
    );
    expect(annual).to.be.an("object");
  }, 60000);
});

function createMinimalMockApi(): PortfolioManagerApi {
  return {
    meterConsumptionDataGet: vi.fn(),
    meterMeterListGet: vi.fn(),
  } as unknown as PortfolioManagerApi;
}

function createExtendedMockApi(): PortfolioManagerApi {
  return {
    accountAccountGet: vi.fn(),
    meterMeterGet: vi.fn(),
    meterIdentifierGet: vi.fn(),
    meterIdentifierPost: vi.fn(),
    meterIdentifierPut: vi.fn(),
    meterIdentifierListGet: vi.fn(),
    meterConsumptionDataGet: vi.fn(),
    meterMeterListGet: vi.fn(),
    meterMeterPost: vi.fn(),
    meterMeterDelete: vi.fn(),
    meterPropertyAssociationGet: vi.fn(),
    propertyPropertyPost: vi.fn(),
    propertyPropertyDelete: vi.fn(),
    propertyPropertyGet: vi.fn(),
    propertyPropertyListGet: vi.fn(),
    propertyMetricsMonthlyGet: vi.fn(),
    propertyMetricsGet: vi.fn(),
    connectAccountPendingListGet: vi.fn(),
    connectAccountPost: vi.fn(),
    disconnectAccountPost: vi.fn(),
    sharePropertyPendingListGet: vi.fn(),
    sharePropertyPost: vi.fn(),
    shareMeterPendingListGet: vi.fn(),
    shareMeterPost: vi.fn(),
    unsharePropertyPost: vi.fn(),
    unshareMeterPost: vi.fn(),
    notificationListGet: vi.fn(),
    customerListGet: vi.fn(),
  } as unknown as PortfolioManagerApi;
}

describe("PortfolioManager (minimal synthetic edge cases)", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("getMeterConsumption throws on invalid next-page link format", async () => {
    const api = createMinimalMockApi();
    const pm = new PortfolioManager(api);

    vi.mocked(api.meterConsumptionDataGet)
      .mockResolvedValueOnce({
        meterData: {
          meterConsumption: [],
          links: { link: [] },
        },
      } as never)
      .mockResolvedValueOnce({
        meterData: {
          meterConsumption: [],
          links: {
            link: [
              {
                "@_linkDescription": "next page",
                "@_link": "/meter/1/consumptionData?page=bad",
                "@_httpMethod": "GET",
              },
            ],
          },
        },
      } as never);

    await expect(pm.getMeterConsumption(1)).rejects.toThrow(
      "Invalid next page link for meter 1"
    );

    vi.mocked(api.meterConsumptionDataGet)
      .mockResolvedValueOnce({
        meterData: {
          meterConsumption: [],
          links: { link: [] },
        },
      } as never)
      .mockResolvedValueOnce({
        meterData: {
          meterConsumption: [],
          links: {
            link: [
              {
                "@_linkDescription": "next page",
                "@_link": "/meter/1/consumptionData?page=",
                "@_httpMethod": "GET",
              },
            ],
          },
        },
      } as never);
    await expect(pm.getMeterConsumption(1)).rejects.toThrow(
      "Invalid next page link for meter 1"
    );
  });

  it("getMeterLinks falls back to empty for non-empty/non-populated odd response", async () => {
    const api = createMinimalMockApi();
    const pm = new PortfolioManager(api);

    vi.mocked(api.meterMeterListGet).mockResolvedValue({
      response: {
        "@_status": "Ok",
        links: {},
      },
    } as never);

    await expect(pm.getMeterLinks(1)).resolves.toEqual([]);
  });

  it("getMeters maps link ids and rejects invalid ids", async () => {
    const api = createMinimalMockApi();
    const pm = new PortfolioManager(api);

    vi.spyOn(pm, "getMeterLinks")
      .mockResolvedValueOnce([
        {
          "@_id": "3",
          "@_link": "/meter/3",
          "@_linkDescription": "This is the GET url for this Meter.",
          "@_httpMethod": "GET",
        },
      ] as never)
      .mockResolvedValueOnce([
        {
          "@_id": "bad",
          "@_link": "/meter/bad",
          "@_linkDescription": "This is the GET url for this Meter.",
          "@_httpMethod": "GET",
        },
      ] as never);
    vi.spyOn(pm, "getMeter").mockResolvedValue({ id: 3 } as never);

    await expect(pm.getMeters(1)).resolves.toEqual([{ id: 3 }]);
    await expect(pm.getMeters(1)).rejects.toThrow("Invalid meter id in link");
  });

  it("getProperties maps link ids and rejects invalid ids", async () => {
    const api = createMinimalMockApi();
    const pm = new PortfolioManager(api);

    vi.spyOn(pm, "getPropertyLinks")
      .mockResolvedValueOnce([
        {
          "@_id": "6",
          "@_link": "/property/6",
          "@_linkDescription": "This is the GET url for this Property.",
          "@_httpMethod": "GET",
        },
      ] as never)
      .mockResolvedValueOnce([
        {
          "@_id": "bad",
          "@_link": "/property/bad",
          "@_linkDescription": "This is the GET url for this Property.",
          "@_httpMethod": "GET",
        },
      ] as never);
    vi.spyOn(pm, "getProperty").mockResolvedValue({ id: 6 } as never);

    await expect(pm.getProperties(1)).resolves.toEqual([{ id: 6 }]);
    await expect(pm.getProperties(1)).rejects.toThrow("Invalid property id in link");
  });

  it("getAccountId + getMeter throw when payloads are missing required objects", async () => {
    const api = createExtendedMockApi();
    const pm = new PortfolioManager(api);

    vi.mocked(api.accountAccountGet).mockResolvedValue({ account: {} } as never);
    vi.mocked(api.meterMeterGet).mockResolvedValue({ response: {} } as never);

    await expect(pm.getAccountId()).rejects.toThrow("No account id found");
    await expect(pm.getMeter(10)).rejects.toThrow("No meter found");
  });

  it("getAccount reuses cache and refreshes when cached=false", async () => {
    const api = createExtendedMockApi();
    const pm = new PortfolioManager(api);

    vi.mocked(api.accountAccountGet)
      .mockResolvedValueOnce({ account: { id: 42 } } as never)
      .mockResolvedValueOnce({ account: { id: 43 } } as never);

    await expect(pm.getAccount()).resolves.toMatchObject({ id: 42 });
    await expect(pm.getAccount()).resolves.toMatchObject({ id: 42 });
    await expect(pm.getAccount(false)).resolves.toMatchObject({ id: 43 });
  });

  it("getAccount clears cache after rejection and can recover", async () => {
    const api = createExtendedMockApi();
    const pm = new PortfolioManager(api);

    vi.mocked(api.accountAccountGet)
      .mockRejectedValueOnce(new Error("boom"))
      .mockResolvedValueOnce({ account: { id: 44 } } as never);

    await expect(pm.getAccount()).rejects.toThrow("boom");
    await expect(pm.getAccount()).resolves.toMatchObject({ id: 44 });
  });

  it("additional identifier wrappers map 404s and handle empty responses", async () => {
    const api = createExtendedMockApi();
    const pm = new PortfolioManager(api);
    const api404 = new PortfolioManagerApiError(404, "Not Found");

    vi.mocked(api.meterIdentifierGet).mockRejectedValueOnce(api404 as never);
    await expect(pm.getMeterAdditionalIdentifier(1, 2)).rejects.toThrow(
      "Meter or additionalIdentifier not found"
    );

    vi.mocked(api.meterIdentifierPost).mockResolvedValueOnce({
      response: { "@_status": "Ok", links: "" },
    } as never);
    await expect(
      pm.postMeterAdditionalIdentifier(1, { value: "x" } as never)
    ).rejects.toThrow("Unable to create additionalIdentifier");

    vi.mocked(api.meterIdentifierPost).mockRejectedValueOnce(api404 as never);
    await expect(
      pm.postMeterAdditionalIdentifier(1, { value: "x" } as never)
    ).rejects.toThrow("Meter not found: 1");

    vi.mocked(api.meterIdentifierPut).mockResolvedValueOnce({
      response: { "@_status": "Ok", links: "" },
    } as never);
    await expect(
      pm.putMeterAdditionalIdentifier(1, 2, { value: "x" } as never)
    ).rejects.toThrow("Unable to update additionalIdentifier");

    vi.mocked(api.meterIdentifierPut).mockRejectedValueOnce(api404 as never);
    await expect(
      pm.putMeterAdditionalIdentifier(1, 2, { value: "x" } as never)
    ).rejects.toThrow("Meter not found: 1");

    vi.mocked(api.meterIdentifierListGet).mockRejectedValueOnce(api404 as never);
    await expect(pm.getMeterAdditionalIdentifiers(1)).rejects.toThrow(
      "Meter not found"
    );
  });

  it("upsertMeterAdditionalIdentifier validates id and slot availability", async () => {
    const api = createExtendedMockApi();
    const pm = new PortfolioManager(api);

    vi.spyOn(pm, "getMeterAdditionalIdentifiers")
      .mockResolvedValueOnce([
        {
          "@_id": "bad",
          description: "X",
          additionalIdentifierType: { "@_id": "1" },
        } as never,
      ])
      .mockResolvedValueOnce([
        { "@_id": "1", additionalIdentifierType: { "@_id": "1" } } as never,
        { "@_id": "2", additionalIdentifierType: { "@_id": "2" } } as never,
        { "@_id": "3", additionalIdentifierType: { "@_id": "3" } } as never,
      ]);

    await expect(pm.upsertMeterAdditionalIdentifier(8, "X", "Y")).rejects.toThrow(
      "Invalid additional identifier id"
    );
    await expect(pm.upsertMeterAdditionalIdentifier(8, "New", "Y")).rejects.toThrow(
      "No available Custom ID slots"
    );
  });

  it("meter and property CRUD wrappers throw on failed responses", async () => {
    const api = createExtendedMockApi();
    const pm = new PortfolioManager(api);

    vi.mocked(api.meterMeterPost).mockResolvedValueOnce({
      response: { "@_status": "Ok", links: "" },
    } as never);
    await expect(pm.createMeter(1, { name: "m" } as never)).rejects.toThrow(
      "Failed to create meter"
    );

    vi.mocked(api.meterMeterDelete).mockResolvedValueOnce({
      response: { "@_status": "Error" },
    } as never);
    await expect(pm.deleteMeter(1)).rejects.toThrow("Failed to delete meter");

    vi.mocked(api.propertyPropertyPost).mockResolvedValueOnce({
      response: { "@_status": "Ok", links: "" },
    } as never);
    vi.spyOn(pm, "getAccount").mockResolvedValueOnce({ id: 9 } as never);
    await expect(pm.createProperty({ name: "p" } as never)).rejects.toThrow(
      "Failed to create property"
    );

    vi.mocked(api.propertyPropertyDelete).mockResolvedValueOnce({
      response: { "@_status": "Error" },
    } as never);
    await expect(pm.deleteProperty(1)).rejects.toThrow("Failed to delete property");

    vi.mocked(api.propertyPropertyGet).mockResolvedValueOnce({ response: {} } as never);
    await expect(pm.getProperty(1)).rejects.toThrow("No property found");
  });

  it("association and property list wrappers handle missing data and failures", async () => {
    const api = createExtendedMockApi();
    const pm = new PortfolioManager(api);

    vi.mocked(api.meterPropertyAssociationGet).mockResolvedValueOnce({
      meterPropertyAssociationList: "",
    } as never);
    await expect(pm.getAssociatedMeters(1)).rejects.toThrow("No associated meters found");

    const errorSpy = vi.spyOn(console, "error").mockImplementation(() => undefined);
    vi.spyOn(pm, "getAssociatedMeters")
      .mockResolvedValueOnce({ propertyId: 1 } as never)
      .mockRejectedValueOnce(new Error("x"));
    const associations = await pm.getMetersPropertiesAssociation([1, 2]);
    expect(associations).toEqual([{ propertyId: 1 }]);
    expect(errorSpy).toHaveBeenCalled();

    vi.mocked(api.propertyPropertyListGet).mockResolvedValueOnce({
      response: { "@_status": "Ok", links: "" },
    } as never);
    await expect(pm.getPropertyLinks(1)).rejects.toThrow("No properties found");

    vi.spyOn(pm, "getAccountId").mockResolvedValueOnce(77 as never);
    vi.mocked(api.propertyPropertyListGet).mockResolvedValueOnce({
      response: {
        "@_status": "Ok",
        links: {
          link: [
            {
              "@_id": "6",
              "@_link": "/property/6",
              "@_linkDescription": "This is the GET url for this Property.",
              "@_httpMethod": "GET",
            },
          ],
        },
      },
    } as never);
    vi.spyOn(pm, "getProperty").mockResolvedValueOnce({ id: 6 } as never);
    await expect(pm.getProperties()).resolves.toEqual([{ id: 6 }]);

    vi.mocked(api.meterPropertyAssociationGet).mockResolvedValueOnce({
      meterPropertyAssociationList: {
        waterMeterAssociation: {
          meters: { meterId: [3] },
          propertyRepresentation: "Entire Property",
        },
      },
    } as never);
    const waterOnly = await pm.getAssociatedMeters(9);
    expect(waterOnly.energyMeterAssociation).to.equal(undefined);
    expect(waterOnly.waterMeterAssociation?.meters).toEqual([3]);
    expect(waterOnly.wasteMeterAssociation).to.equal(undefined);

    vi.mocked(api.meterPropertyAssociationGet).mockResolvedValueOnce({
      meterPropertyAssociationList: {
        wasteMeterAssociation: {
          meters: { meterId: [7] },
          propertyRepresentation: "Whole Property",
        },
      },
    } as never);
    const wasteOnly = await pm.getAssociatedMeters(9);
    expect(wasteOnly.wasteMeterAssociation?.meters).toEqual([7]);

    vi.spyOn(pm, "getAccountId").mockResolvedValueOnce(88 as never);
    vi.mocked(api.propertyPropertyListGet).mockResolvedValueOnce({
      response: {
        "@_status": "Ok",
        links: {
          link: [
            {
              "@_id": "8",
              "@_link": "/property/8",
              "@_linkDescription": "This is the GET url for this Property.",
              "@_httpMethod": "GET",
            },
          ],
        },
      },
    } as never);
    await expect(pm.getPropertyLinks()).resolves.toEqual([
      {
        "@_id": "8",
        "@_link": "/property/8",
        "@_linkDescription": "This is the GET url for this Property.",
        "@_httpMethod": "GET",
      },
    ]);
  });

  it("metrics wrappers validate arguments and malformed payloads", async () => {
    const api = createExtendedMockApi();
    const pm = new PortfolioManager(api);

    await expect(pm.getPropertyMonthlyMetrics2(1, 2024, 1, [])).rejects.toThrow(
      "No metrics provided"
    );
    await expect(
      pm.getPropertyMonthlyMetrics2(1, 2024, 1, Array.from({ length: 11 }, (_, i) => `m${i}`))
    ).rejects.toThrow("Too many metrics provided");
    await expect(pm.getPropertyMetrics(1, 2024, 1, [])).rejects.toThrow(
      "No metrics provided"
    );
    await expect(
      pm.getPropertyMetrics(1, 2024, 1, Array.from({ length: 11 }, (_, i) => `m${i}`))
    ).rejects.toThrow("Too many metrics provided");

    vi.mocked(api.propertyMetricsMonthlyGet).mockResolvedValueOnce({
      response: { "@_status": "Ok" },
    } as never);
    await expect(pm.getPropertyMonthlyMetrics(1, 2024, 1, ["x"])).rejects.toThrow(
      "No property monthly metrics found"
    );

    vi.mocked(api.propertyMetricsMonthlyGet).mockResolvedValueOnce({
      propertyMetrics: {
        metric: [
          {
            "@_name": "x",
            "@_uom": "kWh",
            monthlyMetric: [{ "@_month": "bad", "@_year": "2024", value: 1 }],
          },
        ],
      },
    } as never);
    await expect(pm.getPropertyMonthlyMetrics(1, 2024, 1, ["x"], false)).rejects.toThrow(
      "Invalid monthly metric date"
    );

    vi.mocked(api.propertyMetricsGet).mockResolvedValueOnce({ response: {} } as never);
    await expect(pm.getPropertyMonthlyMetrics2(1, 2024, 1, ["x"])).rejects.toThrow(
      "No property metrics found"
    );

    vi.mocked(api.propertyMetricsGet).mockResolvedValueOnce({
      propertyMetrics: {
        metric: [
          {
            "@_name": "x",
            "@_uom": "kWh",
            monthlyMetric: [{ "@_month": "bad", "@_year": "2024", value: 1 }],
          },
        ],
      },
    } as never);
    await expect(pm.getPropertyMonthlyMetrics2(1, 2024, 1, ["x"], false)).rejects.toThrow(
      "Invalid monthly metric date"
    );

    vi.mocked(api.propertyMetricsGet).mockResolvedValueOnce({ response: {} } as never);
    await expect(pm.getPropertyMetrics(1, 2024, 1, ["x"])).rejects.toThrow(
      "No property metrics found"
    );
  });

  it("getPropertyMonthlyMetrics2 builds keyed monthly metrics and filters nulls", async () => {
    const api = createExtendedMockApi();
    const pm = new PortfolioManager(api);

    vi.mocked(api.propertyMetricsGet)
      .mockResolvedValueOnce({
        propertyMetrics: {
          metric: [
            {
              "@_name": "siteTotal",
              "@_uom": "kBtu",
              monthlyMetric: [
                { "@_month": "1", "@_year": "2024", value: 10 },
                { "@_month": "2", "@_year": "2024", value: { "@_xsi:nil": "true" } },
              ],
            },
          ],
        },
      } as never)
      .mockResolvedValueOnce({
        propertyMetrics: {
          metric: [
            {
              "@_name": "siteTotal",
              "@_uom": "kBtu",
              monthlyMetric: [
                { "@_month": "2", "@_year": "2024", value: { "@_xsi:nil": "true" } },
              ],
            },
          ],
        },
      } as never);

    const includeNullFiltered = await pm.getPropertyMonthlyMetrics2(
      7,
      2024,
      1,
      ["siteTotal"],
      true
    );
    expect(includeNullFiltered.siteTotal.value).toEqual([
      { month: 1, year: 2024, value: 10 },
    ]);

    const allFilteredOut = await pm.getPropertyMonthlyMetrics2(
      7,
      2024,
      1,
      ["siteTotal"],
      true
    );
    expect(allFilteredOut).toEqual({});

    vi.mocked(api.propertyMetricsGet).mockResolvedValueOnce({
      propertyMetrics: {
        metric: [
          {
            "@_name": "siteTotal",
            monthlyMetric: [{ "@_month": "1", "@_year": "2024", value: 1 }],
          },
        ],
      },
    } as never);
    const noUom = await pm.getPropertyMonthlyMetrics2(7, 2024, 1, ["siteTotal"], false);
    expect(noUom.siteTotal.uom).to.equal("");
  });

  it("getPropertyMonthlyMetrics keeps null values when exclude_null=false and skips non-monthly series", async () => {
    const api = createExtendedMockApi();
    const pm = new PortfolioManager(api);

    vi.mocked(api.propertyMetricsMonthlyGet).mockResolvedValueOnce({
      propertyMetrics: {
        metric: [
          {
            "@_name": "annual-ish",
            "@_uom": "kBtu",
            value: 10,
          },
          {
            "@_name": "monthly",
            "@_uom": "kBtu",
            monthlyMetric: [
              {
                "@_month": "1",
                "@_year": "2024",
                value: { "@_xsi:nil": "true" },
              },
            ],
          },
        ],
      },
    } as never);

    const rows = await pm.getPropertyMonthlyMetrics(3, 2024, 1, ["monthly"], false);
    expect(rows).toEqual([
      {
        propertyId: 3,
        name: "monthly",
        uom: "kBtu",
        month: 1,
        year: 2024,
        value: null,
      },
    ]);

    vi.mocked(api.propertyMetricsMonthlyGet).mockResolvedValueOnce({
      propertyMetrics: {
        metric: [
          {
            "@_name": "monthly",
            "@_uom": "kBtu",
            monthlyMetric: [
              {
                "@_month": "1",
                "@_year": "2024",
                value: { "@_xsi:nil": "true" },
              },
            ],
          },
        ],
      },
    } as never);
    await expect(pm.getPropertyMonthlyMetrics(3, 2024, 1, ["monthly"], true)).resolves.toEqual(
      []
    );
  });

  it("getPropertyMetrics skips non-annual and handles null annual values", async () => {
    const api = createExtendedMockApi();
    const pm = new PortfolioManager(api);

    vi.mocked(api.propertyMetricsGet)
      .mockResolvedValueOnce({
        propertyMetrics: {
          metric: [
            {
              "@_name": "monthlyOnly",
              "@_uom": "kBtu",
              monthlyMetric: [{ "@_month": "1", "@_year": "2024", value: 1 }],
            },
            {
              "@_name": "score",
              "@_uom": "",
              value: { "@_xsi:nil": "true" },
            },
          ],
        },
      } as never)
      .mockResolvedValueOnce({
        propertyMetrics: {
          metric: [
            {
              "@_name": "score",
              "@_dataType": "NUMBER",
              value: { "@_xsi:nil": "true" },
            },
          ],
        },
      } as never)
      .mockResolvedValueOnce({
        propertyMetrics: {
          metric: [
            {
              "@_name": "score",
              "@_dataType": "NUMBER",
              value: "123",
            },
          ],
        },
      } as never);

    const includeNull = await pm.getPropertyMetrics(5, 2024, 1, ["score"], false);
    expect(includeNull.score.value).to.equal(null);

    const filteredNull = await pm.getPropertyMetrics(5, 2024, 1, ["score"], true);
    expect(filteredNull).toEqual({});

    const nonNull = await pm.getPropertyMetrics(5, 2024, 1, ["score"], true);
    expect(nonNull.score.value).to.equal("123");
  });

  it("getMeterConsumption returns empty list for unknown meterData shape", async () => {
    const api = createMinimalMockApi();
    const pm = new PortfolioManager(api);
    const errorSpy = vi.spyOn(console, "error").mockImplementation(() => undefined);

    vi.mocked(api.meterConsumptionDataGet).mockResolvedValue({
      meterData: {
        links: { link: [] },
      },
    } as never);

    await expect(pm.getMeterConsumption(1)).resolves.toEqual([]);
    expect(errorSpy).toHaveBeenCalled();
  });

  it("getMeterConsumption supports delivery records, pagination, and missing meterData errors", async () => {
    const api = createMinimalMockApi();
    const pm = new PortfolioManager(api);

    vi.mocked(api.meterConsumptionDataGet)
      .mockResolvedValueOnce({
        meterData: {
          meterDelivery: [{ quantity: 1 }],
          links: { link: [] },
        },
      } as never)
      .mockResolvedValueOnce({
        meterData: {
          meterDelivery: [{ quantity: 2 }],
          links: {
            link: [
              {
                "@_linkDescription": "next page",
                "@_link": "/meter/1/consumptionData?page=2",
                "@_httpMethod": "GET",
              },
            ],
          },
        },
      } as never)
      .mockResolvedValueOnce({
        meterData: {
          meterDelivery: [{ quantity: 5 }],
          links: { link: [] },
        },
      } as never);

    await expect(pm.getMeterConsumption(1)).resolves.toEqual([
      { quantity: 2 },
      { quantity: 5 },
    ]);

    vi.mocked(api.meterConsumptionDataGet).mockResolvedValueOnce({ response: {} } as never);
    await expect(pm.getMeterConsumption(1)).rejects.toThrow("No meter consumption found");
  });

  it("getMeterLinks throws when response status is not Ok", async () => {
    const api = createMinimalMockApi();
    const pm = new PortfolioManager(api);

    vi.mocked(api.meterMeterListGet).mockResolvedValue({
      response: { "@_status": "Error" },
    } as never);

    await expect(pm.getMeterLinks(1)).rejects.toThrow("Request Error, response");
  });

  it("getMeterLinks returns empty on truly empty Ok responses", async () => {
    const api = createMinimalMockApi();
    const pm = new PortfolioManager(api);

    vi.mocked(api.meterMeterListGet).mockResolvedValue({
      response: {
        "@_status": "Ok",
        links: "",
      },
    } as never);

    await expect(pm.getMeterLinks(1)).resolves.toEqual([]);
  });

  it("identifier wrappers rethrow non-404 API and non-API errors", async () => {
    const api = createExtendedMockApi();
    const pm = new PortfolioManager(api);
    const api500 = new PortfolioManagerApiError(500, "Internal Server Error");

    vi.mocked(api.meterIdentifierGet).mockRejectedValueOnce(new Error("boom-get"));
    await expect(pm.getMeterAdditionalIdentifier(1, 2)).rejects.toThrow("boom-get");
    vi.mocked(api.meterIdentifierGet).mockRejectedValueOnce(api500 as never);
    await expect(pm.getMeterAdditionalIdentifier(1, 2)).rejects.toThrow(
      "Internal Server Error"
    );

    vi.mocked(api.meterIdentifierPost).mockRejectedValueOnce(new Error("boom-post"));
    await expect(
      pm.postMeterAdditionalIdentifier(1, { value: "x" } as never)
    ).rejects.toThrow("boom-post");
    vi.mocked(api.meterIdentifierPost).mockRejectedValueOnce(api500 as never);
    await expect(
      pm.postMeterAdditionalIdentifier(1, { value: "x" } as never)
    ).rejects.toThrow("Internal Server Error");

    vi.mocked(api.meterIdentifierPut).mockRejectedValueOnce(new Error("boom-put"));
    await expect(
      pm.putMeterAdditionalIdentifier(1, 2, { value: "x" } as never)
    ).rejects.toThrow("boom-put");
    vi.mocked(api.meterIdentifierPut).mockRejectedValueOnce(api500 as never);
    await expect(
      pm.putMeterAdditionalIdentifier(1, 2, { value: "x" } as never)
    ).rejects.toThrow("Internal Server Error");

    vi.mocked(api.meterIdentifierListGet).mockRejectedValueOnce(new Error("boom-list"));
    await expect(pm.getMeterAdditionalIdentifiers(1)).rejects.toThrow("boom-list");
    vi.mocked(api.meterIdentifierListGet).mockRejectedValueOnce(api500 as never);
    await expect(pm.getMeterAdditionalIdentifiers(1)).rejects.toThrow(
      "Internal Server Error"
    );
  });

  it("_getAccount throws when account payload is missing", async () => {
    const api = createExtendedMockApi();
    const pm = new PortfolioManager(api);

    vi.mocked(api.accountAccountGet).mockResolvedValue({ response: {} } as never);
    await expect((pm as unknown as { _getAccount: () => Promise<unknown> })._getAccount()).rejects.toThrow(
      "No account found"
    );
  });

  it("getPendingConnections paginates and maps custom fields", async () => {
    const api = createExtendedMockApi();
    const pm = new PortfolioManager(api);

    vi.mocked(api.connectAccountPendingListGet)
      .mockResolvedValueOnce({
        pendingList: {
          account: [
            {
              accountId: 101,
              username: "acct-a",
              accountInfo: {
                firstName: "A",
                lastName: "One",
                email: "a@example.test",
                organization: "Org A",
              },
              connectionAudit: { createdDate: "2026-03-01" },
              customFieldList: {
                customField: [
                  { "@_name": "ticket", "#text": "T-10" },
                  { "@_name": "priority", "#text": 2 },
                ],
              },
            },
          ],
          links: {
            link: [
              {
                "@_linkDescription": "next page",
                "@_link": "/connect/account/pending/list?page=2",
                "@_httpMethod": "GET",
              },
            ],
          },
        },
      } as never)
      .mockResolvedValueOnce({
        pendingList: {
          account: [
            {
              accountId: 102,
              username: "acct-b",
              accountInfo: {
                firstName: "B",
                lastName: "Two",
                email: "b@example.test",
                organization: "Org B",
              },
            },
          ],
          links: { link: [] },
        },
      } as never);

    const pending = await pm.getPendingConnections();
    expect(api.connectAccountPendingListGet).toHaveBeenNthCalledWith(1, 1);
    expect(api.connectAccountPendingListGet).toHaveBeenNthCalledWith(2, 2);
    expect(pending).toEqual([
      {
        accountId: 101,
        username: "acct-a",
        firstName: "A",
        lastName: "One",
        email: "a@example.test",
        organization: "Org A",
        requestedDate: "2026-03-01",
        customFields: { ticket: "T-10", priority: 2 },
      },
      {
        accountId: 102,
        username: "acct-b",
        firstName: "B",
        lastName: "Two",
        email: "b@example.test",
        organization: "Org B",
        requestedDate: "",
        customFields: undefined,
      },
    ]);
  });

    it("getPendingConnections handles missing account list and singleton customField", async () => {
      const api = createExtendedMockApi();
      const pm = new PortfolioManager(api);

      vi.mocked(api.connectAccountPendingListGet)
        .mockResolvedValueOnce({
          pendingList: {
            account: [
              {
                accountId: 103,
                username: "acct-c",
                accountInfo: {
                  firstName: "C",
                  lastName: "Three",
                  email: "c@example.test",
                  organization: "Org C",
                },
                customFieldList: {
                  customField: {
                    "@_name": "ticket",
                    "#text": "T-20",
                  },
                },
              },
              {
                accountId: 104,
                username: "acct-d",
                accountInfo: {
                  firstName: "D",
                  lastName: "Four",
                  email: "d@example.test",
                  organization: "Org D",
                },
                customFieldList: {
                  customField: {
                    "@_name": "ignored",
                  },
                },
              },
            ],
            links: { link: [] },
          },
        } as never)
        .mockResolvedValueOnce({
          pendingList: {
            links: { link: [] },
          },
        } as never);

      const mapped = await pm.getPendingConnections();
      expect(mapped[0].customFields).toEqual({ ticket: "T-20" });
      expect(mapped[1].customFields).toEqual({});

      const empty = await pm.getPendingConnections();
      expect(empty).toEqual([]);
    });

  it("acceptConnection and rejectConnection send expected payloads", async () => {
    const api = createExtendedMockApi();
    const pm = new PortfolioManager(api);

    await pm.acceptConnection(33, "ok");
    await pm.rejectConnection(44, "nope");

    expect(api.connectAccountPost).toHaveBeenNthCalledWith(1, 33, {
      sharingResponse: { action: "Accept", note: "ok" },
    });
    expect(api.connectAccountPost).toHaveBeenNthCalledWith(2, 44, {
      sharingResponse: { action: "Reject", note: "nope" },
    });
  });

  it("disconnect forwards keepShares and note options", async () => {
    const api = createExtendedMockApi();
    const pm = new PortfolioManager(api);

    await pm.disconnect(71, { keepShares: true, note: "done" });
    await pm.disconnect(72);

    expect(api.disconnectAccountPost).toHaveBeenNthCalledWith(
      1,
      71,
      { terminateSharingResponse: { note: "done" } },
      true
    );
    expect(api.disconnectAccountPost).toHaveBeenNthCalledWith(
      2,
      72,
      { terminateSharingResponse: { note: undefined } },
      undefined
    );
  });

  it("getPendingPropertyShares and getPendingMeterShares map pending records", async () => {
    const api = createExtendedMockApi();
    const pm = new PortfolioManager(api);

    vi.mocked(api.sharePropertyPendingListGet).mockResolvedValueOnce({
      pendingList: {
        property: [
          {
            propertyId: 501,
            propertyInfo: { name: "Property A" },
            username: "acct-a",
            accountId: 9001,
            accessLevel: "Read",
            shareAudit: { createdDate: "2026-03-02" },
          },
        ],
        links: { link: [] },
      },
    } as never);

    vi.mocked(api.shareMeterPendingListGet).mockResolvedValueOnce({
      pendingList: {
        meter: [
          {
            meterId: 601,
            propertyId: 501,
            propertyInfo: { name: "Property A" },
            username: "acct-a",
            accountId: 9001,
            accessLevel: "Read Write",
            shareAudit: { createdDate: "2026-03-02" },
          },
        ],
        links: { link: [] },
      },
    } as never);

    await expect(pm.getPendingPropertyShares()).resolves.toEqual([
      {
        type: "property",
        id: 501,
        propertyId: 501,
        propertyName: "Property A",
        sharerUsername: "acct-a",
        sharerAccountId: 9001,
        accessLevel: "Read",
        requestedDate: "2026-03-02",
      },
    ]);

    await expect(pm.getPendingMeterShares()).resolves.toEqual([
      {
        type: "meter",
        id: 601,
        propertyId: 501,
        propertyName: "Property A",
        sharerUsername: "acct-a",
        sharerAccountId: 9001,
        accessLevel: "Read Write",
        requestedDate: "2026-03-02",
      },
    ]);
  });

  it("share accept/reject and unshare actions map to API calls", async () => {
    const api = createExtendedMockApi();
    const pm = new PortfolioManager(api);

    await pm.acceptPropertyShare(10, "accepted");
    await pm.rejectPropertyShare(11, "rejected");
    await pm.acceptMeterShare(12, "accepted");
    await pm.rejectMeterShare(13, "rejected");
    await pm.unshareProperty(14, "cleanup");
    await pm.unshareMeter(15, "cleanup");

    expect(api.sharePropertyPost).toHaveBeenNthCalledWith(1, 10, {
      sharingResponse: { action: "Accept", note: "accepted" },
    });
    expect(api.sharePropertyPost).toHaveBeenNthCalledWith(2, 11, {
      sharingResponse: { action: "Reject", note: "rejected" },
    });
    expect(api.shareMeterPost).toHaveBeenNthCalledWith(1, 12, {
      sharingResponse: { action: "Accept", note: "accepted" },
    });
    expect(api.shareMeterPost).toHaveBeenNthCalledWith(2, 13, {
      sharingResponse: { action: "Reject", note: "rejected" },
    });
    expect(api.unsharePropertyPost).toHaveBeenCalledWith(14, {
      terminateSharingResponse: { note: "cleanup" },
    });
    expect(api.unshareMeterPost).toHaveBeenCalledWith(15, {
      terminateSharingResponse: { note: "cleanup" },
    });
  });

  it("getNotifications maps payload and defaults markAsRead=true", async () => {
    const api = createExtendedMockApi();
    const pm = new PortfolioManager(api);

    vi.mocked(api.notificationListGet)
      .mockResolvedValueOnce({
        notificationList: {
          notification: [
            {
              notificationId: 91,
              notificationTypeCode: "DISCONNECT",
              notificationCreatedDate: "2026-03-03",
              description: "Disconnected",
              accountId: 42,
              propertyId: 77,
              meterId: 88,
              notificationCreatedBy: "primary",
              notificationCreatedByAccountId: 12,
            },
          ],
        },
      } as never)
      .mockResolvedValueOnce({
        notificationList: { notification: [] },
      } as never);

    await expect(pm.getNotifications()).resolves.toEqual([
      {
        id: 91,
        type: "DISCONNECT",
        date: "2026-03-03",
        description: "Disconnected",
        accountId: 42,
        propertyId: 77,
        meterId: 88,
        createdByUsername: "primary",
        createdByAccountId: 12,
      },
    ]);
    expect(api.notificationListGet).toHaveBeenNthCalledWith(1, true);

    await expect(pm.getNotifications({ markAsRead: false })).resolves.toEqual([]);
    expect(api.notificationListGet).toHaveBeenNthCalledWith(2, false);
  });

    it("pending property/meter shares follow next-page links", async () => {
      const api = createExtendedMockApi();
      const pm = new PortfolioManager(api);

      vi.mocked(api.sharePropertyPendingListGet)
        .mockResolvedValueOnce({
          pendingList: {
            property: [
              {
                propertyId: 1001,
                propertyInfo: { name: "Property P1" },
                username: "acct-a",
                accountId: 101,
                accessLevel: "Read",
              },
            ],
            links: {
              link: [
                {
                  "@_linkDescription": "next page",
                  "@_link": "/share/property/pending/list?page=2",
                },
              ],
            },
          },
        } as never)
        .mockResolvedValueOnce({
          pendingList: {
            property: [
              {
                propertyId: 1002,
                propertyInfo: { name: "Property P2" },
                username: "acct-b",
                accountId: 102,
                accessLevel: "Read Write",
              },
            ],
            links: { link: [] },
          },
        } as never);

      vi.mocked(api.shareMeterPendingListGet)
        .mockResolvedValueOnce({
          pendingList: {
            meter: [
              {
                meterId: 2001,
                propertyId: 1001,
                propertyInfo: { name: "Property P1" },
                username: "acct-a",
                accountId: 101,
                accessLevel: "Read",
              },
            ],
            links: {
              link: [
                {
                  "@_linkDescription": "next page",
                  "@_link": "/share/meter/pending/list?page=2",
                },
              ],
            },
          },
        } as never)
        .mockResolvedValueOnce({
          pendingList: {
            meter: [
              {
                meterId: 2002,
                propertyId: 1002,
                propertyInfo: { name: "Property P2" },
                username: "acct-b",
                accountId: 102,
                accessLevel: "Read Write",
              },
            ],
            links: { link: [] },
          },
        } as never);

      const propertyShares = await pm.getPendingPropertyShares();
      expect(api.sharePropertyPendingListGet).toHaveBeenNthCalledWith(1, 1);
      expect(api.sharePropertyPendingListGet).toHaveBeenNthCalledWith(2, 2);
      expect(propertyShares.map((item) => item.id)).toEqual([1001, 1002]);

      const meterShares = await pm.getPendingMeterShares();
      expect(api.shareMeterPendingListGet).toHaveBeenNthCalledWith(1, 1);
      expect(api.shareMeterPendingListGet).toHaveBeenNthCalledWith(2, 2);
      expect(meterShares.map((item) => item.id)).toEqual([2001, 2002]);
    });

    it("getPendingPropertyShares handles missing property list", async () => {
      const api = createExtendedMockApi();
      const pm = new PortfolioManager(api);

      vi.mocked(api.sharePropertyPendingListGet).mockResolvedValueOnce({
        pendingList: {
          links: { link: [] },
        },
      } as never);

      await expect(pm.getPendingPropertyShares()).resolves.toEqual([]);
    });

    it("getPendingMeterShares handles missing meter list", async () => {
      const api = createExtendedMockApi();
      const pm = new PortfolioManager(api);

      vi.mocked(api.shareMeterPendingListGet).mockResolvedValueOnce({
        pendingList: {
          links: { link: [] },
        },
      } as never);

      await expect(pm.getPendingMeterShares()).resolves.toEqual([]);
    });

    it("getCustomerList handles error, empty, populated, and fallback responses", async () => {
      const api = createExtendedMockApi();
      const pm = new PortfolioManager(api);

      vi.mocked(api.customerListGet)
        .mockResolvedValueOnce({
          response: { "@_status": "Error" },
        } as never)
        .mockResolvedValueOnce({
          response: {
            "@_status": "Ok",
            links: "",
          },
        } as never)
        .mockResolvedValueOnce({
          response: {
            "@_status": "Ok",
            links: {
              link: [
                { "@_id": "42", "@_hint": "Org 42" },
                { "@_hint": "" },
              ],
            },
          },
        } as never)
        .mockResolvedValueOnce({
          response: {
            "@_status": "Ok",
            links: {},
          },
        } as never);

      await expect(pm.getCustomerList()).rejects.toThrow("Request Error");
      await expect(pm.getCustomerList()).resolves.toEqual([]);
      await expect(pm.getCustomerList()).resolves.toEqual([
        { id: 42, organizationName: "Org 42" },
        { id: 0, organizationName: "" },
      ]);
      await expect(pm.getCustomerList()).resolves.toEqual([]);
    });

    it("getNotifications handles missing notification arrays and date fallback", async () => {
      const api = createExtendedMockApi();
      const pm = new PortfolioManager(api);

      vi.mocked(api.notificationListGet)
        .mockResolvedValueOnce({
          notificationList: {
            notification: [
              {
                notificationId: 123,
                notificationTypeCode: "UNSHARE",
                description: "Unshared",
              },
            ],
          },
        } as never)
        .mockResolvedValueOnce({
          notificationList: {},
        } as never);

      await expect(pm.getNotifications()).resolves.toEqual([
        {
          id: 123,
          type: "UNSHARE",
          date: "",
          description: "Unshared",
          accountId: undefined,
          propertyId: undefined,
          meterId: undefined,
          createdByUsername: undefined,
          createdByAccountId: undefined,
        },
      ]);

      await expect(pm.getNotifications({ markAsRead: false })).resolves.toEqual(
        []
      );
    });
});
