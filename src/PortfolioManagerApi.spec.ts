import { expect } from "chai";
import {
  mockIProperty,
  mockMeter
} from "./Mocks.js";
import { PortfolioManagerApi } from "./PortfolioManagerApi.js";
import {
  ILink,
  IMeter,
  isIEmptyResponse,
  isIPopulatedResponse,
  isIPropertyAnnualMetric
} from "./types/xml/index.js";

const BASE_URL = "https://portfoliomanager.energystar.gov/wstest/";

const USERNAME = process.env.PM_USERNAME;
const PASSWORD = process.env.PM_PASSWORD;

if (!USERNAME || !PASSWORD) {
  throw new Error(
    "Please set PM_USERNAME and PM_PASSWORD environment variables"
  );
}

const api = new PortfolioManagerApi(BASE_URL, USERNAME, PASSWORD);

describe("PortfolioManagerApi", () => {
  it("can be constucted", () => {
    expect(api).to.be.an.instanceof(PortfolioManagerApi);
  });

  // since the PM Test UI became available and we aren't starting from a test account
  // we can no longer setup this test case without potentially conflicting with other
  // test runners that may be running at the same time. skip for now until we come up
  // with a strategy to handle this.
  it.skip("can query an account without properties", async () => {
    const { account } = await api.accountAccountGet();
    const listPropertyResponse = await api.propertyPropertyListGet(
      account.id || 0
    );
    expect(listPropertyResponse.response["@_status"]).to.equal("Ok");
    expect(listPropertyResponse.response.links).to.be.an("string");
    expect(isIEmptyResponse(listPropertyResponse.response)).to.equal(true);
  }).timeout(60000);

  it("can create a test property", async () => {
    const property = mockIProperty();
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
    expect(getPropertyResponse.property.name).to.equal("Test Property");
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
    expect(propFromList["@_hint"]).to.equal("Test Property");
    expect(propFromList["@_httpMethod"]).to.equal("GET");

    expect(propFromList["@_link"]).to.match(/^\/property\/\d+$/);
    expect(propFromList["@_linkDescription"]).to.equal(
      "This is the GET url for this Property."
    );
  }).timeout(60000);

  it.skip("can create a property design metric", async () => {});

  it("can create a meter", async () => {
    const { account } = await api.accountAccountGet();
    const getPropertyListResponse = await api.propertyPropertyListGet(
      account.id || 0
    );
    const listResponse = getPropertyListResponse.response;
    const propertyLink = listResponse.links.link as ILink[];

    let propertyIdStr = propertyLink[0]["@_id"] || null;
    if (!propertyIdStr) {
      throw new Error("Expected IResponseMultiple or IResponse");
    }

    const propertyId = parseInt(propertyIdStr);

    const meter = mockMeter();
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
  }).timeout(60000);

  it.skip("can create a meter consumption record", async () => {});
  it.skip("can create a meter delivery record", async () => {});

  it("can create manage custom meter identifiers", async () => {
    const { account } = await api.accountAccountGet();
    const getPropertyListResponse = await api.propertyPropertyListGet(
      account.id || 0
    );
    const listResponse = getPropertyListResponse.response;
    const propertyLink = listResponse.links.link as ILink[];

    let propertyIdStr = propertyLink[0]["@_id"] || null;
    if (!propertyIdStr) {
      throw new Error("Expected IResponseMultiple or IResponse");
    }

    const propertyId = parseInt(propertyIdStr);

    const meter: IMeter = {
      name: "Test Meter",
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
    const putId = parseInt(gotIdentifier["@_id"] || "");
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
  }).timeout(60000);

  it("can query meter identifier types", async () => {
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
  }).timeout(60000);

  it.skip("can query property design metrics", async () => {
    const { account } = await api.accountAccountGet();
    const getPropertyListResponse = await api.propertyPropertyListGet(
      account.id || 0
    );
    if (!isIPopulatedResponse(getPropertyListResponse.response)) {
      throw new Error("Expected isIPopoulatedResponse");
    }
    // console.log({ getPropertyListResponse });
    const propertyId = parseInt(
      getPropertyListResponse.response.links.link[0]["@_id"] || "0"
    );

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
  });
});
