import { expect } from "chai";
import { beforeAll, describe, it } from "vitest";
import {
  mockIProperty,
  mockMeter
} from "./Mocks.js";
import { PortfolioManager } from "./PortfolioManager.js";
import { PortfolioManagerApi } from "./PortfolioManagerApi.js";
import { METRICS } from "./types/index.js";
import {
  ILink,
  IMeter,
  isIEmptyResponse,
  isIPropertyMonthlyMetric,
  isIPopulatedResponse,
  isIPropertyAnnualMetric
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
if (!USERNAME || !PASSWORD) {
  throw new Error(
    "Please set PM_USERNAME and PM_PASSWORD environment variables"
  );
}
const RUN_ID = `${Date.now()}-${Math.round(Math.random() * 1000000)}`;

function withRunId(base: string): string {
  return `${base} ${RUN_ID}`;
}

const api = new PortfolioManagerApi(BASE_URL, USERNAME, PASSWORD);
const pm = new PortfolioManager(api);
let standardPropertyIds: number[] = [];
let metricsFixture: IStandardMetricsFixture;

async function ensureTestFixtures(): Promise<void> {
  const { account } = await api.accountAccountGet();
  standardPropertyIds = await ensureStandardProperties(
    api,
    account.id || 0,
    STANDARD_PROPERTY_NAMES
  );
  metricsFixture = await ensureStandardMetricsFixture(api, standardPropertyIds[0]);
}

describe("PortfolioManagerApi", () => {
  beforeAll(async () => {
    await ensureTestFixtures();
  }, 60000);

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

  it("meterPropertyAssociationSinglePost + getAssociatedMeters", async () => {
    const propertyId = standardPropertyIds[0];

    const meter = mockMeter(withRunId("Association Meter"));
    const postMeterResponse = await api.meterMeterPost(propertyId, meter);
    const meterId = postMeterResponse.response.id;
    if (!meterId) {
      throw new Error("Expected created meter to include id");
    }

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
});
