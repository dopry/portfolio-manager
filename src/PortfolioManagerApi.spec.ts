import { expect } from "chai";
import {
  IAccount,
  IAddress,
  ILink,
  IMeter,
  IOrganization,
  isIEmptyResponse,
  isIPopoulatedResponse,
  isIPropertyNonMonthlyMetric,
} from "./types/xml";
import { PortfolioManagerApi } from "./PortfolioManagerApi";
import { IProperty } from "./types";

const BASE_URL = "https://portfoliomanager.energystar.gov/wstest/";
const STAMP = new Date()
  .toISOString()
  // @ts-ignore
  .replaceAll(":", "_")
  .replaceAll(".", "_");
const USERNAME = "test" + STAMP;
const PASSWORD = STAMP;

const client = new PortfolioManagerApi(BASE_URL, USERNAME, PASSWORD);

const address: IAddress = {
  "@_address1": "123 Main St",
  "@_city": "Test",
  "@_postalCode": "1234567",
  "@_country": "US",
  "@_state": "NY",
};

describe("EpaPortfolioManagerClient", () => {
  it("can be constucted", () => {
    expect(client).to.be.an.instanceof(PortfolioManagerApi);
  });

  it("can create a test account", async () => {
    const organization: IOrganization = {
      "@_name": "Test",
      primaryBusiness: "Energy Efficiency Program",
      energyStarPartner: true,
      energyStarPartnerType: "Other",
      otherPartnerDescription: "Test Partner Deacription",
    };
    const account: IAccount = {
      username: USERNAME,
      password: PASSWORD,
      webserviceUser: true,
      searchable: false,
      contact: {
        firstName: "Test",
        lastName: "User",
        email: "" + USERNAME + "@energystar.gov",
        phone: "555-555-5555",
        jobTitle: "Test User",
        address,
      },
      organization,
      includeTestPropertiesInGraphics: false,
      languagePreference: "en_US",
    };
    // try {
    const postAccountResponse = await client.accountAccountPost(account);
    expect(postAccountResponse.response["@_status"]).to.equal("Ok");
    expect(postAccountResponse.response.id).to.be.a("number");
    expect(postAccountResponse.response.links).to.be.an("object");
    const link = postAccountResponse.response.links.link as ILink[];
    expect(link).to.be.an("array");
    expect(link[0]).to.deep.equal({
      "@_linkDescription": "This is the GET url for this Account.",
      "@_link": "/account",
      "@_httpMethod": "GET",
    });
    const getAccountResponse = await client.accountAccountGet();
    expect(getAccountResponse.account).to.be.an("object");
    expect(getAccountResponse.account.id).to.equal(
      postAccountResponse.response.id
    );
    expect(getAccountResponse.account.username).to.equal(USERNAME);
    expect(getAccountResponse.account.password).to.equal("********");
    expect(getAccountResponse.account.webserviceUser).to.equal(true);
    expect(getAccountResponse.account.searchable).to.equal(false);
    expect(getAccountResponse.account.contact).to.be.an("object");
    expect(getAccountResponse.account.contact.firstName).to.equal("Test");
    expect(getAccountResponse.account.contact.lastName).to.equal("User");
    expect(getAccountResponse.account.contact.email).to.equal(
      "" + USERNAME + "@energystar.gov"
    );
    expect(getAccountResponse.account.contact.phone).to.equal("555-555-5555");
    expect(getAccountResponse.account.contact.jobTitle).to.equal("Test User");
    expect(getAccountResponse.account.contact.address).to.be.an("object");
    expect(getAccountResponse.account.contact.address["@_address1"]).to.equal(
      "123 Main St"
    );
    expect(getAccountResponse.account.contact.address["@_city"]).to.equal(
      "Test"
    );
    expect(getAccountResponse.account.contact.address["@_postalCode"]).to.equal(
      "1234567"
    );
    expect(getAccountResponse.account.contact.address["@_country"]).to.equal(
      "US"
    );
    expect(getAccountResponse.account.contact.address["@_state"]).to.equal(
      "NY"
    );
    expect(getAccountResponse.account.organization).to.be.an("object");
    expect(getAccountResponse.account.organization["@_name"]).to.equal("Test");
    expect(getAccountResponse.account.organization.primaryBusiness).to.equal(
      "Energy Efficiency Program"
    );
    expect(getAccountResponse.account.organization.energyStarPartner).to.equal(
      true
    );
    expect(
      getAccountResponse.account.organization.energyStarPartnerType
    ).to.equal("Other");
    expect(
      getAccountResponse.account.organization.otherPartnerDescription
    ).to.equal("Test Partner Deacription");
    // expect(getAccountResponse.account.includeTestPropertiesInGraphics).to.equal(false);
    expect(getAccountResponse.account.languagePreference).to.equal("en_US");
    // } catch (e) {
    //   console.log(e);
    //   throw e
    // }
  });

  it("can query an account without properties", async () => {
    const { account } = await client.accountAccountGet();
    const listPropertyResponse = await client.propertyPropertyListGet(
      account.id || 0
    );
    expect(listPropertyResponse.response["@_status"]).to.equal("Ok");
    expect(listPropertyResponse.response.links).to.be.an("string");
    expect(isIEmptyResponse(listPropertyResponse.response)).to.equal(true);
  });

  it("can create a test property", async () => {
    const property: IProperty = {
      isFederalProperty: false,
      occupancyPercentage: 80,
      name: "Test Property",
      constructionStatus: "Test",
      primaryFunction: "Data Center",
      grossFloorArea: {
        value: 8000,
        "@_units": "Square Feet",
      },
      yearBuilt: 2022,
      address,
    };
    const { account } = await client.accountAccountGet();
    const postPropertyResponse = await client.propertyPropertyPost(
      property,
      account.id || 0
    );
    if (!isIPopoulatedResponse(postPropertyResponse.response)) {
      throw new Error("Expected isIPopoulatedResponse");
    }
    expect(postPropertyResponse.response["@_status"]).to.equal("Ok");
    expect(postPropertyResponse.response.id).to.be.a("number");
    expect(postPropertyResponse.response.links).to.be.an("object");
    const link = postPropertyResponse.response.links.link as ILink[];
    expect(link).to.be.an("array");

    expect(link[0]["@_linkDescription"]).to.equal(
      "This is the GET url for this Property."
    );
    expect(link[0]["@_link"]).to.match(/^\/property\/\d+$/);
    expect(link[0]["@_httpMethod"]).to.equal("GET");

    const getPropertyResponse = await client.propertyPropertyGet(
      postPropertyResponse.response.id
    );
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

    const postPropertyResponse2 = await client.propertyPropertyPost(
      property,
      account.id || 0
    );
    if (!isIPopoulatedResponse(postPropertyResponse2.response)) {
      throw new Error("Expected isIPopoulatedResponse");
    }

    const propertyIds = [
      postPropertyResponse.response.id.toString(),
      postPropertyResponse2.response.id.toString(),
    ];
    const getPropertyListResponse = await client.propertyPropertyListGet(
      account.id || 0
    );
    expect(getPropertyListResponse["?xml"]).to.deep.equal({
      "@_encoding": "UTF-8",
      "@_standalone": "yes",
      "@_version": "1.0",
    });
    const listResponse = getPropertyListResponse.response;
    expect(listResponse["@_status"]).to.equal("Ok");
    expect(listResponse.links).to.be.an("object");
    expect(listResponse.links.link).to.be.an("array");
    if (!isIPopoulatedResponse(listResponse)) {
      throw new Error("Expected isIPopoulatedResponse");
    }
    expect(listResponse.links.link[0]).to.be.an("object");
    expect(listResponse.links.link[0]["@_hint"]).to.equal("Test Property");
    expect(listResponse.links.link[0]["@_httpMethod"]).to.equal("GET");
    expect(propertyIds).to.contain(listResponse.links.link[0]["@_id"]);
    expect(listResponse.links.link[0]["@_link"]).to.match(/^\/property\/\d+$/);
    expect(listResponse.links.link[0]["@_linkDescription"]).to.equal(
      "This is the GET url for this Property."
    );

    const remainingIds = propertyIds.filter(
      (id) => id.toString() !== listResponse.links.link[0]["@_id"]
    );

    expect(listResponse.links.link[1]).to.be.an("object");
    expect(listResponse.links.link[1]["@_hint"]).to.equal("Test Property");
    expect(listResponse.links.link[1]["@_httpMethod"]).to.equal("GET");
    expect(remainingIds).to.contain(listResponse.links.link[1]["@_id"]);
    expect(listResponse.links.link[1]["@_link"]).to.match(/^\/property\/\d+$/);
    expect(listResponse.links.link[1]["@_linkDescription"]).to.equal(
      "This is the GET url for this Property."
    );
  });

  it.skip("can create a property design metric", async () => {});

  it("can create a meter", async () => {
    const { account } = await client.accountAccountGet();
    const getPropertyListResponse = await client.propertyPropertyListGet(
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
    const postMeterResponse = await client.meterMeterPost(propertyId, meter);
    expect(postMeterResponse.response["@_status"]).to.equal("Ok");
    if (!isIPopoulatedResponse(postMeterResponse.response)) {
      throw new Error("Expected isIPopoulatedResponse");
    }
    expect(postMeterResponse.response.id).to.be.a("number");
    expect(postMeterResponse.response.links).to.be.an("object");
    expect(postMeterResponse.response.links.link).to.be.an("array");
    // expect(postMeterResponse.response).to.equal({});

    const getPropertyMeterListResponse = await client.meterMeterListGet(
      propertyId
    );
    const meterLink = getPropertyMeterListResponse.response.links
      .link as ILink[];
    expect(meterLink[0]["@_id"]).to.equal(
      postMeterResponse.response.id.toString()
    );

    const meter2: IMeter = {
      name: "Test Meter 2",
      unitOfMeasure: "kWh (thousand Watt-hours)",
      type: "Electric",
      firstBillDate: new Date(2019, 0, 1),
      inUse: true,
    };
    const postMeterResponse2 = await client.meterMeterPost(propertyId, meter2);
    expect(postMeterResponse2.response["@_status"]).to.equal("Ok");
    if (!isIPopoulatedResponse(postMeterResponse2.response)) {
      throw new Error("Expected isIPopoulatedResponse");
    }

    expect(postMeterResponse2.response.id).to.be.a("number");
    expect(postMeterResponse2.response.links).to.be.an("object");
    expect(postMeterResponse2.response.links.link).to.be.an("array");
    const getPropertyMeterListResponse2 = await client.meterMeterListGet(
      propertyId
    );
    const meterListLink = getPropertyMeterListResponse2.response.links
      .link as ILink[];
    expect(meterListLink[1]["@_id"]).to.equal(
      postMeterResponse2.response.id.toString()
    );
    expect(meterListLink[1]["@_hint"]).to.equal("Test Meter 2");
  });

  it.skip("can create a meter consumption record", async () => {});
  it.skip("can create a meter delivery record", async () => {});

  it("can create manage custom meter identifiers", async () => {
    const { account } = await client.accountAccountGet();
    const getPropertyListResponse = await client.propertyPropertyListGet(
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
    const postMeterResponse = await client.meterMeterPost(propertyId, meter);
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
    const postMeterIdentifierResponse = await client.meterIdentifierPost(
      meterId,
      additionalIdentifier
    );
    expect(postMeterIdentifierResponse.response["@_status"]).to.equal("Ok");
    if (!isIPopoulatedResponse(postMeterIdentifierResponse.response)) {
      throw new Error("Expected isIPopoulatedResponse");
    }
    expect(postMeterIdentifierResponse.response.id).to.be.a("number");
    expect(postMeterIdentifierResponse.response.links).to.be.an("object");
    expect(postMeterIdentifierResponse.response.links.link).to.be.an("array");
    // expect(postMeterResponse.response).to.equal({});

    const getPropertyMeterIdentifierListResponse =
      await client.meterIdentifierListGet(meterId);
    const meterIdentifierLink =
      getPropertyMeterIdentifierListResponse.additionalIdentifiers
        .additionalIdentifier;
    expect(meterIdentifierLink[0]["@_id"]).to.equal(
      postMeterIdentifierResponse.response.id.toString()
    );

    const meterIdentifierGetResponse = await client.meterIdentifierGet(
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
    const putId = parseInt(gotIdentifier["@_id"] || '')
    if (!putId) {
      throw new Error("Expected putId");
    }
    const putMeterIdentifierResponse = await client.meterIdentifierPut(
      meterId, putId, gotIdentifier
    );

    const get2Response = await client.meterIdentifierGet(meterId, putId);
    const got2Identifier = get2Response.additionalIdentifier;
    expect(got2Identifier).to.be.an("object");
    expect(got2Identifier.value).to.eq("New Value");
  }).timeout(10000);

  it("can query property design metrics", async () => {
    const { account } = await client.accountAccountGet();
    const getPropertyListResponse = await client.propertyPropertyListGet(
      account.id || 0
    );
    if (!isIPopoulatedResponse(getPropertyListResponse.response)) {
      throw new Error("Expected isIPopoulatedResponse");
    }
    // console.log({ getPropertyListResponse });
    const propertyId = parseInt(
      getPropertyListResponse.response.links.link[0]["@_id"] || "0"
    );

    const designMetricsResponse = await client.propertyDesignMetricsGet(
      propertyId
    );

    expect(designMetricsResponse.propertyMetrics).to.be.an("object");
    expect(designMetricsResponse.propertyMetrics["@_propertyId"]).to.equal(
      propertyId.toString()
    );
    expect(designMetricsResponse.propertyMetrics.metric).to.be.an("array");
    const metric = designMetricsResponse.propertyMetrics.metric[0];
    if (!isIPropertyNonMonthlyMetric(metric)) {
      throw new Error("Expected isIPropertyNonMonthlyMetric");
    }
    expect(metric["@_name"]).to.be.a("string");
    expect(metric["@_dataType"]).to.be.a("string");
  });
});
