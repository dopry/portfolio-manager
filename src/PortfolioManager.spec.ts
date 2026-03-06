import { expect } from "chai";
import { beforeAll, describe, it } from "vitest";
import {
  mockIProperty,
} from "./Mocks.js";
import { PortfolioManager } from "./PortfolioManager.js";
import { PortfolioManagerApi } from "./PortfolioManagerApi.js";
import { IAccount, IMeter } from "./types/index.js";
import {
  ensureStandardProperties,
  STANDARD_PROPERTY_NAMES,
} from "./test/ensureStandardProperties.js";
import { ensureStandardMeterFixture } from "./test/ensureStandardMeterFixture.js";

const BASE_URL = "https://portfoliomanager.energystar.gov/wstest/";
const USERNAME = process.env.PM_USERNAME || '';
const PASSWORD = process.env.PM_PASSWORD || '';
if (!USERNAME || !PASSWORD) {
  throw new Error(
    "Please set PM_USERNAME and PM_PASSWORD environment variables"
  );
}

describe("PortfolioManager", () => {
  let api: PortfolioManagerApi;
  let pm: PortfolioManager;
  let account: IAccount;
  let testPropertyIds: number[];
  let testMeter: IMeter;

  async function ensureTestFixtures() {
    api = new PortfolioManagerApi(BASE_URL, USERNAME, PASSWORD);
    pm = new PortfolioManager(api);
    account = await pm.getAccount();

    testPropertyIds = await ensureStandardProperties(
      api,
      account.id || 0,
      STANDARD_PROPERTY_NAMES
    );
    testMeter = await ensureStandardMeterFixture(api, testPropertyIds[0]);
  }

  beforeAll(async () => {
    await ensureTestFixtures();
  }, 60000);

  it("can be constucted", () => {
    expect(api).to.be.an.instanceof(PortfolioManagerApi);
    expect(pm).to.be.an.instanceof(PortfolioManager);
  });

  it("can set a meter additionalIdentifier", async () => {
    if (!testMeter.id) throw new Error("testMeter.id is undefined");

    const identifierA = "Integration Fixture Identifier A";
    const identifierB = "Integration Fixture Identifier B";

    const identifiers = await pm.getMeterAdditionalIdentifiers(testMeter.id);
    expect(identifiers).to.be.an("array");
    await pm.upsertMeterAdditionalIdentifier(testMeter.id, identifierA, "Value 1");
    const identifiersNew = await pm.getMeterAdditionalIdentifiers(testMeter.id);
    expect(identifiersNew).to.be.an("array");
    const entryA1 = identifiersNew.find((item) => item.description === identifierA);
    expect(entryA1).to.be.an("object");
    expect(entryA1?.value).to.equal("Value 1");

    await pm.upsertMeterAdditionalIdentifier(testMeter.id, identifierA, "Value 2");
    const identifiersUpdated = await pm.getMeterAdditionalIdentifiers(
      testMeter.id
    );
    expect(identifiersUpdated).to.be.an("array");
    const entryA2 = identifiersUpdated.find(
      (item) => item.description === identifierA
    );
    expect(entryA2).to.be.an("object");
    expect(entryA2?.value).to.equal("Value 2");

    await pm.upsertMeterAdditionalIdentifier(testMeter.id, identifierB, "Value 3");
    const identifiersNew2 = await pm.getMeterAdditionalIdentifiers(
      testMeter.id
    );
    expect(identifiersNew2).to.be.an("array");
    const entryA3 = identifiersNew2.find((item) => item.description === identifierA);
    const entryB = identifiersNew2.find((item) => item.description === identifierB);
    expect(entryA3).to.be.an("object");
    expect(entryA3?.value).to.equal("Value 2");
    expect(entryB).to.be.an("object");
    expect(entryB?.value).to.equal("Value 3");
  }, 60000); // testing api can be slow so we'll be liberal with the timeouts
});
