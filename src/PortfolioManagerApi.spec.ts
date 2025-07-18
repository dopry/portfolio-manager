import { XMLParser } from "fast-xml-parser";
import fetch, { Response } from "node-fetch";
import {
  afterAll,
  afterEach,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from "vitest";

vi.mock("node-fetch", async (importOriginal) => {
  const actual = await importOriginal<typeof import("node-fetch")>();
  return {
    ...actual,
    default: vi.fn(actual.default),
  };
});
import {
  mockIProperty,
  mockMeter
} from "./Mocks.js";
import { PortfolioManager } from "./PortfolioManager.js";
import {
  isPortfolioManagerApiError,
  PortfolioManagerApi,
  PortfolioManagerApiError,
} from "./PortfolioManagerApi.js";
import { METRICS } from "./types/index.js";
import {
  ILink,
  IMeter,
  isIEmptyResponse,
  isIPropertyMonthlyMetric,
  isIPopulatedResponse,
  isIPropertyAnnualMetric,
  ITerminateSharingResponsePayload,
  ISharingResponsePayload
} from "./types/xml/index.js";
import {
  ensureStandardProperties,
  STANDARD_PROPERTY_NAMES,
} from "./test/ensureStandardProperties.js";
import {
  ensureStandardMetricsFixture,
  IStandardMetricsFixture,
} from "./test/ensureStandardMetricsFixture.js";

const BASE_URL = "https://portfoliomanager.energystar.gov/wstest/";

const USERNAME = process.env.PM_USERNAME;
const PASSWORD = process.env.PM_PASSWORD;
const HAS_PM_CREDENTIALS = Boolean(USERNAME && PASSWORD);
const USERNAME2 = process.env.PM_USERNAME2;
const PASSWORD2 = process.env.PM_PASSWORD2;
const HAS_PM_SECONDARY_CREDENTIALS = Boolean(USERNAME2 && PASSWORD2);
const RUN_ID = `${Date.now()}-${Math.round(Math.random() * 1000000)}`;

function withRunId(base: string): string {
  return `${base} ${RUN_ID}`;
}

const api = new PortfolioManagerApi(BASE_URL, USERNAME || "", PASSWORD || "");
const pm = new PortfolioManager(api);
const api2 = new PortfolioManagerApi(BASE_URL, USERNAME2 || "", PASSWORD2 || "");
const pm2 = new PortfolioManager(api2);
let standardPropertyIds: number[] = [];
let metricsFixture: IStandardMetricsFixture;

type PendingFromPrimary = {
  accountId: number;
  propertyId: number;
  meterId: number;
};

async function findPendingFromPrimaryOrUndefined(): Promise<
  PendingFromPrimary | undefined
> {
  const pendingAccounts = await api2.connectAccountPendingListGet();
  const pendingProperties = await api2.sharePropertyPendingListGet();
  const pendingMeters = await api2.shareMeterPendingListGet();

  const accountItems = pendingAccounts.pendingList.account || [];
  const propertyItems = pendingProperties.pendingList.property || [];
  const meterItems = pendingMeters.pendingList.meter || [];

  const account = accountItems.find((item) => item.username === USERNAME);
  const property = propertyItems.find((item) => item.username === USERNAME);
  const meter = meterItems.find((item) => item.username === USERNAME);

  if (!account || !property || !meter) {
    return undefined;
  }

  return {
    accountId: account.accountId,
    propertyId: property.propertyId,
    meterId: meter.meterId,
  };
}

let hasPendingConnectionSharingFixtures = false;
let pendingConnectionSharingSkipReason =
  "No pending connection/share requests found from PM_USERNAME to PM_USERNAME2.";

if (HAS_PM_CREDENTIALS && HAS_PM_SECONDARY_CREDENTIALS) {
  try {
    const pending = await findPendingFromPrimaryOrUndefined();
    hasPendingConnectionSharingFixtures = Boolean(pending);
    if (!pending) {
      pendingConnectionSharingSkipReason =
        "No pending connection/share requests found from PM_USERNAME to PM_USERNAME2. Connection & Sharing integration tests are skipped.";
    }
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unknown preflight failure";
    pendingConnectionSharingSkipReason =
      `Pending preflight failed: ${message}. Connection & Sharing integration tests are skipped.`;
  }
}

async function ensureTestFixtures(): Promise<void> {
  const { account } = await api.accountAccountGet();
  standardPropertyIds = await ensureStandardProperties(
    api,
    account.id || 0,
    STANDARD_PROPERTY_NAMES
  );
  metricsFixture = await ensureStandardMetricsFixture(api, standardPropertyIds[0]);
}

const describeIntegration = HAS_PM_CREDENTIALS ? describe : describe.skip;

describeIntegration("PortfolioManagerApi (integration)", () => {
  const createdPropertyIds: number[] = [];
  const createdFixturePropertyMeterIds: number[] = [];

  function untrackId(ids: number[], id?: number): void {
    if (!id) return;
    const idx = ids.lastIndexOf(id);
    if (idx >= 0) {
      ids.splice(idx, 1);
    }
  }

  beforeAll(async () => {
    await ensureTestFixtures();
  }, 60000);

  afterAll(async () => {
    // Meters created on fixture properties must be explicitly deleted.
    const uniqueFixtureMeters = Array.from(
      new Set(createdFixturePropertyMeterIds)
    ).reverse();
    for (const meterId of uniqueFixtureMeters) {
      try {
        await api.meterMeterDelete(meterId);
      } catch {
        // Best effort cleanup for shared test environment.
      }
    }

    // Delete properties created during tests.
    const uniqueProperties = Array.from(new Set(createdPropertyIds)).reverse();
    for (const propertyId of uniqueProperties) {
      try {
        await api.propertyPropertyDelete(propertyId);
      } catch {
        // Best effort cleanup for shared test environment.
      }
    }
  }, 120000);

  it("constructs PortfolioManagerApi", () => {
    expect(api).to.be.an.instanceof(PortfolioManagerApi);
  });

  // since the PM Test UI became available and we aren't starting from an empty test 
  // account we can no longer setup this test case without potentially conflicting with
  // other test runners that may be running at the same time. skip for now until we come
  // up with a strategy to handle this.
  it.skip("accountAccountGet + propertyPropertyListGet handles empty account", async () => {
    const { account } = await api.accountAccountGet();
    const listPropertyResponse = await api.propertyPropertyListGet(
      account.id || 0
    );
    expect(listPropertyResponse.response["@_status"]).to.equal("Ok");
    expect(listPropertyResponse.response.links).to.be.an("string");
    expect(isIEmptyResponse(listPropertyResponse.response)).to.equal(true);
  }, 60000);

  it("propertyPropertyPost + propertyPropertyGet + propertyPropertyListGet", async () => {
    const property = {
      ...mockIProperty(),
      name: withRunId("Test Property"),
    };
    const { account } = await api.accountAccountGet();
    const postPropertyResponse = await api.propertyPropertyPost(
      property,
      account.id || 0
    );
    // console.log({ postPropertyResponse });
    if (!isIPopulatedResponse(postPropertyResponse.response)) {
      throw new Error("Expected isIPopoulatedResponse");
    }
    expect(postPropertyResponse.response["@_status"]).to.equal("Ok");
    const id = postPropertyResponse.response.id;
    expect(id).to.be.a("number");
    if (!id) {
      throw new Error("Posted property missing id");
    }
    createdPropertyIds.push(id);
    expect(postPropertyResponse.response.id).to.be.a("number");
    expect(postPropertyResponse.response.links).to.be.an("object");
    const link = postPropertyResponse.response.links.link as ILink[];
    expect(link).to.be.an("array");

    expect(link[0]["@_linkDescription"]).to.equal(
      "This is the GET url for this Property."
    );
    expect(link[0]["@_link"]).to.match(/^\/property\/\d+$/);
    expect(link[0]["@_httpMethod"]).to.equal("GET");

    const getPropertyResponse = await api.propertyPropertyGet(
      postPropertyResponse.response.id
    );
    // console.log({ getPropertyResponse });
    expect(getPropertyResponse.property).to.be.an("object");
    expect(getPropertyResponse.property.accessLevel).to.equal("Read Write");
    expect(getPropertyResponse.property.address).to.be.an("object");
    expect(getPropertyResponse.property.address["@_address1"]).to.equal(
      "123 Main St"
    );
    expect(getPropertyResponse.property.address["@_city"]).to.equal("Test");
    expect(getPropertyResponse.property.address["@_postalCode"]).to.equal(
      "1234567"
    );
    expect(getPropertyResponse.property.address["@_country"]).to.equal("US");
    expect(getPropertyResponse.property.address["@_state"]).to.equal("NY");
    expect(getPropertyResponse.property.audit?.createdBy).to.equal(USERNAME);
    expect(getPropertyResponse.property.audit?.createdByAccountId).to.equal(
      account.id
    );
    expect(getPropertyResponse.property.audit?.createdDate).to.match(
      /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}-0\d:00$/
    );
    expect(getPropertyResponse.property.audit?.lastUpdatedBy).to.equal(
      USERNAME
    );
    expect(getPropertyResponse.property.audit?.lastUpdatedByAccountId).to.equal(
      account.id
    );
    expect(getPropertyResponse.property.audit?.lastUpdatedDate).to.match(
      /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}-0\d:00$/
    );
    expect(getPropertyResponse.property.constructionStatus).to.equal("Test");
    expect(getPropertyResponse.property.grossFloorArea).to.be.an("object");
    expect(getPropertyResponse.property.grossFloorArea["@_default"]).to.equal(
      "N/A"
    );
    expect(getPropertyResponse.property.grossFloorArea["@_temporary"]).to.equal(
      "false"
    );
    expect(getPropertyResponse.property.grossFloorArea["@_units"]).to.equal(
      "Square Feet"
    );
    expect(getPropertyResponse.property.grossFloorArea.value).to.equal(8000);
    expect(getPropertyResponse.property.isFederalProperty).to.equal(false);
    expect(getPropertyResponse.property.name).to.equal(property.name);
    expect(getPropertyResponse.property.numberOfBuildings).to.equal(1);
    expect(getPropertyResponse.property.occupancyPercentage).to.equal(80);
    expect(getPropertyResponse.property.primaryFunction).to.equal(
      "Data Center"
    );
    expect(getPropertyResponse.property.yearBuilt).to.equal(2022);

    const getPropertyListResponse = await api.propertyPropertyListGet(
      account.id || 0
    );
    // console.log({ getPropertyListResponse });
    expect(getPropertyListResponse["?xml"]).to.deep.equal({
      "@_encoding": "UTF-8",
      "@_standalone": "yes",
      "@_version": "1.0",
    });
    const listResponse = getPropertyListResponse.response;
    // console.log({ listResponse });

    expect(listResponse["@_status"]).to.equal("Ok");
    expect(listResponse.links).to.be.an("object");
    expect(listResponse.links.link).to.be.an("array");
    if (!isIPopulatedResponse(listResponse)) {
      throw new Error("Expected isIPopoulatedResponse");
    }

    const propFromList = listResponse.links.link.find(
      (link) => link["@_id"] == postPropertyResponse.response.id?.toString()
    );
    if (!propFromList) {
      throw new Error("Created property not found in list response");
    }
    expect(
      propFromList,
      "created property not found in list response"
    ).to.be.an("object");
    expect(propFromList["@_hint"]).to.equal(property.name);
    expect(propFromList["@_httpMethod"]).to.equal("GET");

    expect(propFromList["@_link"]).to.match(/^\/property\/\d+$/);
    expect(propFromList["@_linkDescription"]).to.equal(
      "This is the GET url for this Property."
    );
  }, 60000);

  it("meterMeterPost + meterMeterListGet", async () => {
    const propertyId = standardPropertyIds[0];

    const meter = mockMeter(withRunId("Test Meter"));
    const postMeterResponse = await api.meterMeterPost(propertyId, meter);
    expect(postMeterResponse.response["@_status"]).to.equal("Ok");
    if (!isIPopulatedResponse(postMeterResponse.response)) {
      throw new Error("Expected isIPopoulatedResponse");
    }
    createdFixturePropertyMeterIds.push(postMeterResponse.response.id);
    expect(postMeterResponse.response.id).to.be.a("number");
    expect(postMeterResponse.response.links).to.be.an("object");
    expect(postMeterResponse.response.links.link).to.be.an("array");
    // expect(postMeterResponse.response).to.equal({});

    const getPropertyMeterListResponse = await api.meterMeterListGet(
      propertyId
    );
    const meterLink = getPropertyMeterListResponse.response.links
      .link as ILink[];

    const meterFromList = meterLink.find(
      (link) => link["@_id"] == postMeterResponse.response.id?.toString()
    );
    if (!meterFromList) {
      throw new Error("Created meter not found in list response");
    }
    expect(meterFromList["@_id"]).to.equal(
      postMeterResponse.response.id.toString()
    );
  }, 60000);

  it("meterMeterDelete + propertyPropertyDelete", async () => {
    const property = {
      ...mockIProperty(),
      name: withRunId("Delete Wrapper Property"),
    };
    const { account } = await api.accountAccountGet();
    const postPropertyResponse = await api.propertyPropertyPost(
      property,
      account.id || 0
    );
    if (!isIPopulatedResponse(postPropertyResponse.response)) {
      throw new Error("Expected isIPopoulatedResponse");
    }
    const propertyId = postPropertyResponse.response.id;
    if (!propertyId) {
      throw new Error("Posted property missing id");
    }
    createdPropertyIds.push(propertyId);

    const postMeterResponse = await api.meterMeterPost(
      propertyId,
      mockMeter(withRunId("Delete Wrapper Meter"))
    );
    if (!isIPopulatedResponse(postMeterResponse.response)) {
      throw new Error("Expected isIPopoulatedResponse");
    }
    const meterId = postMeterResponse.response.id;
    if (!meterId) {
      throw new Error("Posted meter missing id");
    }

    const meterDeleteResponse = await api.meterMeterDelete(meterId);
    expect(meterDeleteResponse.response["@_status"]).to.equal("Ok");
    untrackId(createdFixturePropertyMeterIds, meterId);
    await expect(api.meterMeterGet(meterId)).rejects.toMatchObject({
      status: 404,
    });

    const propertyDeleteResponse = await api.propertyPropertyDelete(propertyId);
    expect(propertyDeleteResponse.response["@_status"]).to.equal("Ok");
    untrackId(createdPropertyIds, propertyId);
    await expect(api.propertyPropertyGet(propertyId)).rejects.toMatchObject({
      status: 404,
    });
  }, 90000);

  it("meterPropertyAssociationSinglePost + getAssociatedMeters", async () => {
    const propertyId = standardPropertyIds[0];

    const meter = mockMeter(withRunId("Association Meter"));
    const postMeterResponse = await api.meterMeterPost(propertyId, meter);
    const meterId = postMeterResponse.response.id;
    if (!meterId) {
      throw new Error("Expected created meter to include id");
    }
    createdFixturePropertyMeterIds.push(meterId);

    const associationPostResponse = await api.meterPropertyAssociationSinglePost(
      propertyId,
      meterId
    );
    expect(associationPostResponse.response["@_status"]).to.equal("Ok");

    const association = await pm.getAssociatedMeters(propertyId);
    const isAssociated =
      (association.energyMeterAssociation?.meters || []).includes(meterId) ||
      (association.waterMeterAssociation?.meters || []).includes(meterId) ||
      (association.wasteMeterAssociation?.meters || []).includes(meterId);

    expect(isAssociated).to.equal(true);
  }, 60000);

  it("meterConsumptionDataPost + meterConsumptionDataGet (consumption)", async () => {
    const propertyId = standardPropertyIds[0];
    const meter = mockMeter(withRunId("Consumption Meter"));
    const postMeterResponse = await api.meterMeterPost(propertyId, meter);
    const meterId = postMeterResponse.response.id;
    if (!meterId) {
      throw new Error("Expected created meter to include id");
    }
    createdFixturePropertyMeterIds.push(meterId);

    const consumptionPayload = {
      meterData: {
        meterConsumption: [
          {
            startDate: "2024-01-01",
            endDate: "2024-01-31",
            usage: 123.45,
            cost: 67.89,
          },
        ],
      },
    };

    await api.meterConsumptionDataPost(meterId, consumptionPayload);

    const getConsumptionResponse = await api.meterConsumptionDataGet(meterId);
    expect(getConsumptionResponse.meterData.meterConsumption).to.be.an("array");
    const consumptions = getConsumptionResponse.meterData.meterConsumption || [];
    const fetchedMatch = consumptions.find((entry) => entry.usage === 123.45);
    expect(fetchedMatch).to.be.an("object");
  }, 60000);

  it("meterConsumptionDataPost + meterConsumptionDataGet (delivery)", async () => {
    const propertyId = standardPropertyIds[0];
    const meter = {
      ...mockMeter(withRunId("Delivery Meter")),
      metered: false,
      unitOfMeasure: "Gallons (US)" as const,
      type: "Fuel Oil No 2" as const,
    };
    const postMeterResponse = await api.meterMeterPost(propertyId, meter);
    const meterId = postMeterResponse.response.id;
    if (!meterId) {
      throw new Error("Expected created meter to include id");
    }
    createdFixturePropertyMeterIds.push(meterId);

    const deliveryPayload = {
      meterData: {
        meterDelivery: [
          {
            deliveryDate: "2024-02-01",
            quantity: 88.5,
            cost: 40.25,
          },
        ],
      },
    };

    await api.meterConsumptionDataPost(meterId, deliveryPayload);

    const getDeliveryResponse = await api.meterConsumptionDataGet(meterId);
    expect(getDeliveryResponse.meterData.meterDelivery).to.be.an("array");
    const deliveries = getDeliveryResponse.meterData.meterDelivery || [];
    const fetchedMatch = deliveries.find((entry) => entry.quantity === 88.5);
    expect(fetchedMatch).to.be.an("object");
  }, 60000);

  it("meterIdentifierPost + meterIdentifierGet + meterIdentifierPut", async () => {
    const propertyId = standardPropertyIds[0];

    const meter: IMeter = {
      name: withRunId("Test Meter"),
      unitOfMeasure: "kWh (thousand Watt-hours)",
      type: "Electric",
      firstBillDate: new Date(2019, 0, 1),
      inUse: true,
    };
    const postMeterResponse = await api.meterMeterPost(propertyId, meter);
    const meterId = postMeterResponse.response.id;
    if (!meterId) {
      throw new Error("Expected meterId");
    }
    createdFixturePropertyMeterIds.push(meterId);

    const additionalIdentifier = {
      additionalIdentifierType: {
        "@_id": "1",
        "@_standardApproved": "false",
        "@_name": "Custom ID 1",
        "@_description": "Custom ID 1",
      },
      description: "RossEnergy",
      value:
        "?spacetype={spacetype}&fuelsource={fuelsource}&baseload={baseload}&heating={heating}&cooling={cooling}",
    };
    const postMeterIdentifierResponse = await api.meterIdentifierPost(
      meterId,
      additionalIdentifier
    );
    expect(postMeterIdentifierResponse.response["@_status"]).to.equal("Ok");
    if (!isIPopulatedResponse(postMeterIdentifierResponse.response)) {
      throw new Error("Expected isIPopoulatedResponse");
    }
    expect(postMeterIdentifierResponse.response.id).to.be.a("number");
    expect(postMeterIdentifierResponse.response.links).to.be.an("object");
    expect(postMeterIdentifierResponse.response.links.link).to.be.an("array");
    // expect(postMeterResponse.response).to.equal({});

    const getPropertyMeterIdentifierListResponse =
      await api.meterIdentifierListGet(meterId);
    const meterIdentifierLink =
      getPropertyMeterIdentifierListResponse.additionalIdentifiers
        .additionalIdentifier;
    // console.log({ meterIdentifierLink })
    expect(meterIdentifierLink[0]["@_id"]).to.equal(
      postMeterIdentifierResponse.response.id.toString()
    );

    const meterIdentifierGetResponse = await api.meterIdentifierGet(
      propertyId,
      postMeterIdentifierResponse.response.id
    );
    const gotIdentifier = meterIdentifierGetResponse.additionalIdentifier;
    expect(gotIdentifier).to.be.an("object");
    expect(gotIdentifier.additionalIdentifierType).to.be.an("object");
    expect(gotIdentifier.additionalIdentifierType["@_id"]).to.equal("1");
    expect(
      gotIdentifier.additionalIdentifierType["@_standardApproved"]
    ).to.equal("false");
    expect(gotIdentifier.additionalIdentifierType["@_name"]).to.equal(
      "Custom ID 1"
    );
    expect(gotIdentifier.additionalIdentifierType["@_description"]).to.equal(
      "Custom ID 1"
    );
    expect(gotIdentifier.description).to.equal("RossEnergy");

    gotIdentifier.value = "New Value";
    const putId = parseInt(gotIdentifier["@_id"] || "", 10);
    if (!putId) {
      throw new Error("Expected putId");
    }
    const putMeterIdentifierResponse = await api.meterIdentifierPut(
      meterId,
      putId,
      gotIdentifier
    );

    const get2Response = await api.meterIdentifierGet(meterId, putId);
    const got2Identifier = get2Response.additionalIdentifier;
    // console.log({ got2Identifier })
    expect(got2Identifier).to.be.an("object");
    expect(got2Identifier.value).to.eq("New Value");
  }, 60000);

  it("meterIdentifierTypesListGet", async () => {
    const meterIdentifierTypesResponse =
      await api.meterIdentifierTypesListGet();

    const additionalIdentifierTypes =
      meterIdentifierTypesResponse.additionalIdentifierTypes
        .additionalIdentifierType;
    // console.log({ additionalIdentifierTypes })
    expect(additionalIdentifierTypes).to.be.an("array");
    const meterIdentifierType = additionalIdentifierTypes[0];
    expect(meterIdentifierType["@_id"]).to.be.a("string");
    expect(meterIdentifierType["@_standardApproved"]).to.be.a("string");
    expect(meterIdentifierType["@_name"]).to.be.a("string");
    expect(meterIdentifierType["@_description"]).to.be.a("string");
  }, 60000);

  it("propertyDesignMetricsGet", async () => {
    const propertyId = standardPropertyIds[0];

    const designMetricsResponse = await api.propertyDesignMetricsGet(
      propertyId
    );

    expect(designMetricsResponse.propertyMetrics).to.be.an("object");
    expect(designMetricsResponse.propertyMetrics["@_propertyId"]).to.equal(
      propertyId.toString()
    );
    expect(designMetricsResponse.propertyMetrics.metric).to.be.an("array");
    const metric = designMetricsResponse.propertyMetrics.metric[0];
    if (!isIPropertyAnnualMetric(metric)) {
      throw new Error("Expected isIPropertyNonMonthlyMetric");
    }
    expect(metric["@_name"]).to.be.a("string");
    expect(metric["@_dataType"]).to.be.a("string");
  }, 60000);

  it("propertyMetricsGet", async () => {
    const { propertyId } = metricsFixture;

    const requestedMetrics = ["siteTotal", "sourceTotal", "score"];
    const metricsResponse = await api.propertyMetricsGet(
      propertyId,
      2024,
      1,
      requestedMetrics
    );

    expect(metricsResponse.propertyMetrics).to.be.an("object");
    expect(metricsResponse.propertyMetrics["@_propertyId"]).to.equal(
      propertyId.toString()
    );
    expect(metricsResponse.propertyMetrics.metric).to.be.an("array");

    const returnedRequested = metricsResponse.propertyMetrics.metric.filter(
      (metric) => requestedMetrics.includes(metric["@_name"])
    );
    expect(returnedRequested.length).to.be.greaterThan(0);

    const annualMetric = returnedRequested.find(isIPropertyAnnualMetric);
    if (!annualMetric) {
      throw new Error("Expected at least one annual property metric");
    }
    expect(annualMetric["@_name"]).to.be.a("string");
    expect(annualMetric["@_dataType"]).to.be.a("string");
  }, 60000);

  it("propertyMetricsMonthlyGet", async () => {
    const { propertyId } = metricsFixture;
    const requestedMetrics = ["siteElectricityUseMonthly"];
    const monthlyMetricsResponse = await api.propertyMetricsMonthlyGet(
      propertyId,
      2024,
      1,
      requestedMetrics
    );

    expect(monthlyMetricsResponse.propertyMetrics).to.be.an("object");
    expect(monthlyMetricsResponse.propertyMetrics["@_propertyId"]).to.equal(
      propertyId.toString()
    );
    expect(monthlyMetricsResponse.propertyMetrics.metric).to.be.an("array");

    const requestedSeries = monthlyMetricsResponse.propertyMetrics.metric.find(
      (metric) => requestedMetrics.includes(metric["@_name"])
    );
    expect(requestedSeries).to.be.an("object");
    if (!requestedSeries) {
      throw new Error("Expected requested monthly metric series");
    }
    expect(isIPropertyMonthlyMetric(requestedSeries)).to.equal(true);
    if (!isIPropertyMonthlyMetric(requestedSeries)) {
      throw new Error("Expected monthly metric series");
    }
    expect(requestedSeries.monthlyMetric.length).to.be.greaterThan(0);
    const period = requestedSeries.monthlyMetric[0];
    expect(period["@_month"]).to.match(/^\d{1,2}$/);
    expect(period["@_year"]).to.match(/^\d{4}$/);
  }, 60000);



  const describeConnectionSharing =
    HAS_PM_SECONDARY_CREDENTIALS && hasPendingConnectionSharingFixtures
      ? describe
      : describe.skip;

  describeConnectionSharing("Connection & Sharing", () => {
    let acceptedConnectionId: number | undefined;
    let acceptedPropertyId: number | undefined;
    let acceptedMeterId: number | undefined;

    async function clearTransientNotifications(): Promise<void> {
      await api.notificationListGet(true);
      await api2.notificationListGet(true);
    }

    async function cleanupAcceptedState(): Promise<void> {
      const terminatePayload: ITerminateSharingResponsePayload = {
        terminateSharingResponse: { note: `Test cleanup ${RUN_ID}` },
      };

      if (acceptedMeterId) {
        try {
          await api2.unshareMeterPost(acceptedMeterId, terminatePayload);
        } catch {
          // Best effort cleanup for shared test environment.
        }
      }

      if (acceptedPropertyId) {
        try {
          await api2.unsharePropertyPost(acceptedPropertyId, terminatePayload);
        } catch {
          // Best effort cleanup for shared test environment.
        }
      }

      if (acceptedConnectionId) {
        try {
          await api2.disconnectAccountPost(acceptedConnectionId, terminatePayload);
        } catch {
          // Best effort cleanup for shared test environment.
        }
      }

      acceptedConnectionId = undefined;
      acceptedPropertyId = undefined;
      acceptedMeterId = undefined;
    }

    beforeAll(async () => {
      // Validate both accounts and start with drained notifications.
      await pm.getAccount();
      await pm2.getAccount();
      await clearTransientNotifications();

      if (!hasPendingConnectionSharingFixtures) {
        console.warn(pendingConnectionSharingSkipReason);
      }
    }, 60000);

    afterEach(async () => {
      await cleanupAcceptedState();
      await clearTransientNotifications();
    }, 120000);

    it("account2 accepts pending connection and shares from account1 and cleans up", async () => {
      const pending = await findPendingFromPrimaryOrUndefined();
      if (!pending) {
        throw new Error(
          "Pending requests were expected by preflight but were not found at runtime. Re-seed pending requests and retry."
        );
      }
      const acceptPayload: ISharingResponsePayload = {
        sharingResponse: {
          action: "Accept",
          note: `Accepted in test run ${RUN_ID}`,
        },
      };

      const accountResponse = await api2.connectAccountPost(
        pending.accountId,
        acceptPayload
      );
      expect(accountResponse.response["@_status"]).to.equal("Ok");

      const propertyResponse = await api2.sharePropertyPost(
        pending.propertyId,
        acceptPayload
      );
      expect(propertyResponse.response["@_status"]).to.equal("Ok");

      const meterResponse = await api2.shareMeterPost(
        pending.meterId,
        acceptPayload
      );
      expect(meterResponse.response["@_status"]).to.equal("Ok");

      acceptedConnectionId = pending.accountId;
      acceptedPropertyId = pending.propertyId;
      acceptedMeterId = pending.meterId;

      const pendingAccountsAfter = await api2.connectAccountPendingListGet();
      const pendingPropertiesAfter = await api2.sharePropertyPendingListGet();
      const pendingMetersAfter = await api2.shareMeterPendingListGet();

      expect(
        pendingAccountsAfter.pendingList.account.some(
          (item) => item.accountId === pending.accountId
        )
      ).to.equal(false);
      expect(
        pendingPropertiesAfter.pendingList.property.some(
          (item) => item.propertyId === pending.propertyId
        )
      ).to.equal(false);
      expect(
        pendingMetersAfter.pendingList.meter.some(
          (item) => item.meterId === pending.meterId
        )
      ).to.equal(false);

      const notifs = await api2.notificationListGet(false);
      expect(notifs.notificationList).to.be.an("object");
      expect(notifs.notificationList.notification).to.be.an("array");
    }, 120000);
  });

});

describe("PortfolioManagerApi (unit coverage paths)", () => {
  const unitApi = new PortfolioManagerApi(
    "https://example.test/",
    "test-user",
    "test-pass"
  );

  beforeEach(() => {
    vi.mocked(fetch).mockReset();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("PortfolioManagerApiError.fromResponse copies response details", async () => {
    const response = new Response("<error>fail</error>", {
      status: 404,
      statusText: "Not Found",
    });
    Object.defineProperty(response, "url", {
      value: "https://example.test/missing",
      configurable: true,
    });

    const error = await PortfolioManagerApiError.fromResponse(response);

    expect(error).to.be.an.instanceOf(PortfolioManagerApiError);
    expect(error.status).to.equal(404);
    expect(error.statusText).to.equal("Not Found");
    expect(error.responseText).to.equal("<error>fail</error>");
    expect(error.url).to.equal("https://example.test/missing");
  });

  it("isPortfolioManagerApiError narrows typed errors", () => {
    const typed = new PortfolioManagerApiError(500, "Boom", "body", "/url");
    const regular = new Error("Boom");

    expect(isPortfolioManagerApiError(typed)).to.equal(true);
    expect(isPortfolioManagerApiError(regular)).to.equal(false);
    expect(isPortfolioManagerApiError({})).to.equal(false);
  });

  it("fetch throws PortfolioManagerApiError on 5xx responses", async () => {
    vi.mocked(fetch).mockResolvedValue(
      new Response("<response status='Error' />", {
        status: 500,
        statusText: "Internal Server Error",
      })
    );

    await expect(unitApi.fetch("property/1")).rejects.toBeInstanceOf(
      PortfolioManagerApiError
    );
  });

  it("fetch throws on empty response bodies", async () => {
    vi.mocked(fetch).mockResolvedValue(
      new Response("   \n  ", {
        status: 200,
        statusText: "OK",
      })
    );

    await expect(unitApi.fetch("property/2")).rejects.toMatchObject({
      status: 200,
      statusText: "OK",
      responseText: "Empty response body",
    });
  });

  it("fetch wraps XML parser errors", async () => {
    vi.mocked(fetch).mockResolvedValue(
      new Response("<response><broken></response>", {
        status: 200,
        statusText: "OK",
      })
    );
    vi.spyOn(XMLParser.prototype, "parse").mockImplementation(() => {
      throw new Error("forced parser error");
    });

    await expect(unitApi.fetch("property/3")).rejects.toMatchObject({
      status: 200,
      statusText: "OK",
      responseText: expect.stringContaining("XML parse failure: forced parser error"),
    });
  });

  it("fetch handles non-Error parser throws", async () => {
    vi.mocked(fetch).mockResolvedValue(
      new Response("<response />", {
        status: 200,
        statusText: "OK",
      })
    );
    vi.spyOn(XMLParser.prototype, "parse").mockImplementation(() => {
      throw "boom";
    });

    await expect(unitApi.fetch("property/4")).rejects.toMatchObject({
      status: 200,
      statusText: "OK",
      responseText: expect.stringContaining("Unknown XML parse failure"),
    });
  });

  it("fetch omits auth header for POST account and includes it otherwise", async () => {
    const fetchMock = vi.mocked(fetch).mockImplementation(async () => {
      return new Response("<response><status>Ok</status></response>", {
        status: 200,
        statusText: "OK",
      });
    });

    await unitApi.fetch("account", { method: "POST" });
    const postAccountInit = fetchMock.mock.calls[0][1] as
      | Record<string, unknown>
      | undefined;
    const postAccountHeaders = postAccountInit?.headers as
      | Record<string, string>
      | undefined;
    expect(postAccountHeaders?.Authorization).to.equal(undefined);

    await unitApi.fetch("account", { method: "GET" });
    const getAccountInit = fetchMock.mock.calls[1][1] as
      | Record<string, unknown>
      | undefined;
    const getAccountHeaders = getAccountInit?.headers as
      | Record<string, string>
      | undefined;
    expect(getAccountHeaders?.Authorization).to.be.a("string");

    await unitApi.fetch("property/1", {
      method: "GET",
      headers: { "X-Test": "yes" },
    });
    const getPropertyInit = fetchMock.mock.calls[2][1] as
      | Record<string, unknown>
      | undefined;
    const getPropertyHeaders = getPropertyInit?.headers as
      | Record<string, string>
      | undefined;
    expect(getPropertyHeaders?.Authorization).to.be.a("string");
    expect(getPropertyHeaders?.["X-Test"]).to.equal("yes");
    expect(getPropertyHeaders?.["Content-Type"]).to.equal("application/xml");
  });

  it("post, put, and get delegate to fetch with expected init", async () => {
    const fetchSpy = vi.spyOn(unitApi, "fetch").mockResolvedValue({} as never);

    await unitApi.post("meter/1", {
      meter: {
        name: "Meter A",
        firstBillDate: "2024-01-01",
      },
    } as never);
    await unitApi.put("meter/1", {
      meter: {
        name: "Meter B",
        firstBillDate: { invalid: true },
      },
    } as never);
    await unitApi.get("meter/1");
    await unitApi.get("meter/2", { method: "GET", headers: { "X-Trace": "1" } });

    expect(fetchSpy).toHaveBeenNthCalledWith(
      1,
      "meter/1",
      expect.objectContaining({
        method: "POST",
        body: expect.stringMatching(/<firstBillDate>\d{4}-\d{2}-\d{2}<\/firstBillDate>/),
      })
    );
    expect(fetchSpy).toHaveBeenNthCalledWith(
      2,
      "meter/1",
      expect.objectContaining({
        method: "PUT",
        body: expect.stringContaining("<firstBillDate><invalid>true</invalid></firstBillDate>"),
      })
    );
    expect(fetchSpy).toHaveBeenNthCalledWith(3, "meter/1", {});
    expect(fetchSpy).toHaveBeenNthCalledWith(
      4,
      "meter/2",
      expect.objectContaining({
        method: "GET",
        headers: { "X-Trace": "1" },
      })
    );
  });

  it("xmlBuilderOptions.tagValueProcessor handles string/date/number/non-date values", () => {
    const processor = unitApi.xmlBuilderOptions.tagValueProcessor;
    if (!processor) {
      throw new Error("Expected xmlBuilderOptions.tagValueProcessor");
    }

    const fromString = processor("firstBillDate", "2024-01-01") as string;
    const fromDate = processor("firstBillDate", new Date("2024-01-01")) as string;
    const fromNumber = processor("firstBillDate", Date.UTC(2024, 0, 1)) as string;
    const passthrough = processor("firstBillDate", { invalid: true } as never) as unknown;
    const defaultTag = processor("name", "Meter Name") as string;

    expect(fromString).to.match(/^\d{4}-\d{2}-\d{2}$/);
    expect(fromDate).to.match(/^\d{4}-\d{2}-\d{2}$/);
    expect(fromNumber).to.match(/^\d{4}-\d{2}-\d{2}$/);
    expect(passthrough).to.deep.equal({ invalid: true });
    expect(defaultTag).to.equal("Meter Name");
  });

  it("meterConsumptionDataPut delegates to put with expected path", async () => {
    const putSpy = vi.spyOn(unitApi, "put").mockResolvedValue({} as never);

    await unitApi.meterConsumptionDataPut(42, {
      usage: 123,
      startDate: "2024-01-01",
      endDate: "2024-01-31",
    } as never);

    expect(putSpy).toHaveBeenCalledWith("consumptionData/42", expect.anything());
  });

  it("meterConsumptionDataGet builds query string for optional params", async () => {
    const getSpy = vi.spyOn(unitApi, "get").mockResolvedValue({} as never);

    await unitApi.meterConsumptionDataGet(10);
    await unitApi.meterConsumptionDataGet(10, 2);
    await unitApi.meterConsumptionDataGet(10, undefined, "2024-01-01", "2024-12-31");
    await unitApi.meterConsumptionDataGet(10, 1, "2024-01-01", "2024-12-31");

    expect(getSpy).toHaveBeenNthCalledWith(1, "/meter/10/consumptionData?");
    expect(getSpy).toHaveBeenNthCalledWith(2, "/meter/10/consumptionData?page=2");
    expect(getSpy).toHaveBeenNthCalledWith(
      3,
      "/meter/10/consumptionData?startDate=2024-01-01&endDate=2024-12-31"
    );
    expect(getSpy).toHaveBeenNthCalledWith(
      4,
      "/meter/10/consumptionData?page=1&startDate=2024-01-01&endDate=2024-12-31"
    );
  });

  it("propertyCreateSamplePropertiesPOST uses defaults and explicit args", async () => {
    const postSpy = vi.spyOn(unitApi, "post").mockResolvedValue({} as never);

    await unitApi.propertyCreateSamplePropertiesPOST();
    await unitApi.propertyCreateSamplePropertiesPOST("CA", 5);

    expect(postSpy).toHaveBeenNthCalledWith(
      1,
      "property/createSampleProperties?countryCode=US&createCount=10",
      undefined
    );
    expect(postSpy).toHaveBeenNthCalledWith(
      2,
      "property/createSampleProperties?countryCode=CA&createCount=5",
      undefined
    );
  });

  it("endpoint wrapper methods delegate to get/post/put with expected paths", async () => {
    const getSpy = vi.spyOn(unitApi, "get").mockResolvedValue({} as never);
    const postSpy = vi.spyOn(unitApi, "post").mockResolvedValue({} as never);
    const putSpy = vi.spyOn(unitApi, "put").mockResolvedValue({} as never);

    await unitApi.accountAccountGet();
    await unitApi.meterMeterGet(1);
    await unitApi.propertyPropertyGet(2);
    await unitApi.propertyPropertyPost({ name: "P" } as never, 3);
    await unitApi.propertyPropertyListGet(3);
    await unitApi.meterConsumptionDataPost(4, { meterData: {} } as never);
    await unitApi.meterIdentifierGet(5, 6);
    await unitApi.meterIdentifierPost(5, { value: "abc" } as never);
    await unitApi.meterIdentifierPut(5, 6, { value: "def" } as never);
    await unitApi.meterIdentifierListGet(5);
    await unitApi.meterIdentifierTypesListGet();
    await unitApi.meterMeterPost(7, { name: "M" } as never);
    await unitApi.meterPropertyAssociationGet(8);
    await unitApi.meterPropertyAssociationSinglePost(8, 9);
    await unitApi.meterMeterListGet(10);
    await unitApi.meterMeterListGet(10, true);
    await unitApi.propertyDesignMetricsGet(11);
    await unitApi.propertyDesignMetricsGet(11, "METRIC");
    await unitApi.propertyMetricsGet(11, 2024, 1, ["score"]);
    await unitApi.propertyMetricsGet(11, 2024, 1, ["score"], "METRIC");
    await unitApi.propertyMetricsMonthlyGet(11, 2024, 1, ["score"]);
    await unitApi.propertyMetricsMonthlyGet(11, 2024, 1, ["score"], "METRIC");
    await unitApi.customerListGet();

    expect(getSpy).toHaveBeenCalledWith("account");
    expect(getSpy).toHaveBeenCalledWith("meter/1");
    expect(getSpy).toHaveBeenCalledWith("property/2");
    expect(getSpy).toHaveBeenCalledWith("account/3/property/list");
    expect(getSpy).toHaveBeenCalledWith("meter/5/identifier/6");
    expect(getSpy).toHaveBeenCalledWith("meter/5/identifier/list");
    expect(getSpy).toHaveBeenCalledWith("meter/identifier/list");
    expect(getSpy).toHaveBeenCalledWith("/association/property/8/meter");
    expect(getSpy).toHaveBeenCalledWith("property/10/meter/list?myAccessOnly=false");
    expect(getSpy).toHaveBeenCalledWith("property/10/meter/list?myAccessOnly=true");
    expect(getSpy).toHaveBeenCalledWith(
      "/property/11/design/metrics?measurementSystem=EPA"
    );
    expect(getSpy).toHaveBeenCalledWith(
      "/property/11/design/metrics?measurementSystem=METRIC"
    );
    expect(getSpy).toHaveBeenCalledWith("customer/list");

    expect(postSpy).toHaveBeenCalledWith("account/3/property", {
      property: { name: "P" },
    });
    expect(postSpy).toHaveBeenCalledWith("meter/4/consumptionData", {
      meterData: {},
    });
    expect(postSpy).toHaveBeenCalledWith("meter/5/identifier", {
      additionalIdentifier: { value: "abc" },
    });
    expect(postSpy).toHaveBeenCalledWith("property/7/meter/", {
      meter: { name: "M" },
    });
    expect(postSpy).toHaveBeenCalledWith(
      "/association/property/8/meter/9",
      undefined
    );

    expect(putSpy).toHaveBeenCalledWith("meter/5/identifier/6", {
      additionalIdentifier: { value: "def" },
    });
  });
});


