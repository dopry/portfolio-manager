import { beforeAll, describe, expect, it } from "vitest";
import { parseLinkId } from "../../src/functions/parseLinkId.js";
import { mockMeter } from "../../src/Mocks.js";
import { PortfolioManager } from "../../src/PortfolioManager.js";
import { PortfolioManagerApi } from "../../src/PortfolioManagerApi.js";
import { ensureStandardProperties } from "../../src/test/ensureStandardProperties.js";
import { toEditableProperty } from "../../src/test/toEditableProperty.js";
import {
  IMeter,
  IResponse,
  isIPopulatedResponse,
  isRecord,
} from "../../src/types/xml/index.js";

const LIVE_ENV_API_URL = "https://portfoliomanager.energystar.gov/ws/";
const FIXTURE_PROPERTY_NAME = "Portfolio Manager What's Changed Test Property";
const FIXTURE_PROPERTY_USE_NAME = "Portfolio Manager What's Changed Test Use";
const FIXTURE_METER_NAME = "Portfolio Manager What's Changed Test Meter";
// Weekly workflow cadence plus one day of tolerance for delayed runners.
const LOOKBACK_DAYS = 8;
const USERNAME = process.env.PM_USERNAME || "";
const PASSWORD = process.env.PM_PASSWORD || "";
if (!USERNAME || !PASSWORD) {
  throw new Error(
    "The live-environment What's Changed test requires PM_USERNAME and PM_PASSWORD.",
  );
}

type EditableMeter = Omit<IMeter, "id" | "accessLevel" | "audit">;
type ResponseEnvelope = { response: IResponse };

interface IFixtureEntity {
  id: number;
  newlySeeded: boolean;
  staleBeforeMutation: boolean;
}

interface IFixture {
  accountId: number;
  property: IFixtureEntity;
  propertyUse: IFixtureEntity;
  meter: IFixtureEntity;
}

interface IFeedResult {
  ids?: number[];
  error?: unknown;
}

interface IFixturePropertyUse {
  name: string;
  audit?: {
    createdDate?: string;
    lastUpdatedDate?: string;
  };
}

function toEditableMeter(meter: IMeter): EditableMeter {
  const {
    id: _id,
    accessLevel: _accessLevel,
    audit: _audit,
    ...editable
  } = meter;
  return editable;
}

function nextFixtureName(baseName: string, currentName: string): string {
  return currentName.endsWith(" (A)") ? `${baseName} (B)` : `${baseName} (A)`;
}

function getFixturePropertyUse(
  response: Record<string, unknown>,
): IFixturePropertyUse {
  const dataCenter = response["dataCenter"];
  if (!isRecord(dataCenter) || typeof dataCenter["name"] !== "string") {
    throw new Error(
      `Expected a dataCenter property-use response: ${JSON.stringify(response)}`,
    );
  }

  const audit = dataCenter["audit"];
  return {
    name: dataCenter["name"],
    audit: isRecord(audit)
      ? {
          createdDate:
            typeof audit["createdDate"] === "string"
              ? audit["createdDate"]
              : undefined,
          lastUpdatedDate:
            typeof audit["lastUpdatedDate"] === "string"
              ? audit["lastUpdatedDate"]
              : undefined,
        }
      : undefined,
  };
}

async function getPropertyUse(
  api: PortfolioManagerApi,
  propertyUseId: number,
): Promise<IFixturePropertyUse> {
  return getFixturePropertyUse(
    await api.get<Record<string, unknown>>(`propertyUse/${propertyUseId}`),
  );
}

function isRecentlyCreated(createdDate?: string): boolean {
  const createdAt = Date.parse(createdDate || "");
  return (
    Number.isFinite(createdAt) && Date.now() - createdAt < 24 * 60 * 60 * 1000
  );
}

function wasUpdatedBeforeLookback(
  lookbackDate: string,
  audit?: { createdDate?: string; lastUpdatedDate?: string },
): boolean {
  const lastMutationAt = Date.parse(
    audit?.lastUpdatedDate || audit?.createdDate || "",
  );
  if (!Number.isFinite(lastMutationAt)) {
    throw new Error(
      `Expected fixture audit to include a valid mutation date: ${JSON.stringify(audit)}`,
    );
  }
  return lastMutationAt < Date.parse(`${lookbackDate}T00:00:00.000Z`);
}

async function captureFeed(
  getIds: () => Promise<number[]>,
): Promise<IFeedResult> {
  try {
    return { ids: await getIds() };
  } catch (error) {
    return { error };
  }
}

function assertFixtureInFeed(
  result: IFeedResult,
  entity: IFixtureEntity,
  entityName: string,
  skip: (note?: string) => never,
): void {
  if (result.error !== undefined) throw result.error;
  if (result.ids === undefined) {
    throw new Error(`Expected ${entityName} What's Changed IDs`);
  }

  if (
    !result.ids.includes(entity.id) &&
    (entity.newlySeeded || entity.staleBeforeMutation)
  ) {
    skip(
      `${entityName} fixture was seeded/refreshed after the lookback window; checking its mutation next run`,
    );
  }
  expect(result.ids).toContain(entity.id);
}

async function listEntityLinks(api: PortfolioManagerApi, path: string) {
  const { response } = await api.get<ResponseEnvelope>(path);
  return isIPopulatedResponse(response) ? response.links.link : [];
}

async function ensurePropertyUse(
  api: PortfolioManagerApi,
  propertyId: number,
): Promise<{ id: number; created: boolean }> {
  const links = await listEntityLinks(
    api,
    `property/${propertyId}/propertyUse/list`,
  );
  const existing = links.find((link) =>
    link["@_hint"]?.startsWith(FIXTURE_PROPERTY_USE_NAME),
  );
  const existingId = existing ? parseLinkId(existing) : undefined;
  if (existingId !== undefined) return { id: existingId, created: false };

  const { response } = await api.post<unknown, ResponseEnvelope>(
    `property/${propertyId}/propertyUse`,
    {
      dataCenter: {
        name: `${FIXTURE_PROPERTY_USE_NAME} (A)`,
        useDetails: {
          totalGrossFloorArea: {
            value: 8000,
            "@_units": "Square Feet",
            "@_currentAsOf": new Date().toISOString().slice(0, 10),
            "@_temporary": "false",
          },
        },
      },
    },
  );
  if (!isIPopulatedResponse(response) || response.id === undefined) {
    throw new Error(
      `Expected property-use creation to return an id: ${JSON.stringify(response)}`,
    );
  }
  return { id: response.id, created: true };
}

async function ensureMeter(
  api: PortfolioManagerApi,
  propertyId: number,
): Promise<{ id: number; created: boolean }> {
  const { response } = await api.meterMeterListGet(propertyId);
  const links = isIPopulatedResponse(response) ? response.links.link : [];
  const existing = links.find((link) =>
    link["@_hint"]?.startsWith(FIXTURE_METER_NAME),
  );
  const existingId = existing ? parseLinkId(existing) : undefined;
  if (existingId !== undefined) return { id: existingId, created: false };

  const created = await api.meterMeterPost(
    propertyId,
    mockMeter(`${FIXTURE_METER_NAME} (A)`),
  );
  if (
    !isIPopulatedResponse(created.response) ||
    created.response.id === undefined
  ) {
    throw new Error(
      `Expected meter creation to return an id: ${JSON.stringify(created.response)}`,
    );
  }
  return { id: created.response.id, created: true };
}

async function updateFixtureForNextRun(
  api: PortfolioManagerApi,
  fixture: IFixture,
): Promise<void> {
  const property = (await api.propertyPropertyGet(fixture.property.id))
    .property;
  const occupancyPercentage = property.occupancyPercentage === 80 ? 85 : 80;
  const notes = `Last live-environment What's Changed mutation: ${new Date().toISOString()}`;
  const updatedProperty = await api.propertyPropertyPut(fixture.property.id, {
    ...toEditableProperty(property),
    occupancyPercentage,
    notes,
  });
  expect(isIPopulatedResponse(updatedProperty.response)).toBe(true);
  const persistedProperty = (await api.propertyPropertyGet(fixture.property.id))
    .property;
  expect(persistedProperty.occupancyPercentage).toBe(occupancyPercentage);
  expect(persistedProperty.notes).toBe(notes);

  const propertyUse = await getPropertyUse(api, fixture.propertyUse.id);
  const propertyUseName = nextFixtureName(
    FIXTURE_PROPERTY_USE_NAME,
    propertyUse.name,
  );
  // ESPM's Edit Property Use endpoint accepts <propertyUse><name> only.
  const updatedPropertyUse = await api.put<unknown, ResponseEnvelope>(
    `propertyUse/${fixture.propertyUse.id}`,
    { propertyUse: { name: propertyUseName } },
  );
  expect(isIPopulatedResponse(updatedPropertyUse.response)).toBe(true);
  expect((await getPropertyUse(api, fixture.propertyUse.id)).name).toBe(
    propertyUseName,
  );

  const meter = (await api.meterMeterGet(fixture.meter.id)).meter;
  const meterName = nextFixtureName(FIXTURE_METER_NAME, meter.name);
  const updatedMeter = await api.put<unknown, ResponseEnvelope>(
    `meter/${fixture.meter.id}`,
    {
      meter: {
        ...toEditableMeter(meter),
        name: meterName,
      },
    },
  );
  expect(isIPopulatedResponse(updatedMeter.response)).toBe(true);
  expect((await api.meterMeterGet(fixture.meter.id)).meter.name).toBe(
    meterName,
  );
}

describe("What's Changed (live environment)", () => {
  const api = new PortfolioManagerApi(LIVE_ENV_API_URL, USERNAME, PASSWORD);
  const pm = new PortfolioManager(api);
  let fixture: IFixture;
  let propertyFeed: IFeedResult;
  let propertyUseFeed: IFeedResult;
  let meterFeed: IFeedResult;

  beforeAll(async () => {
    const since = new Date(Date.now() - LOOKBACK_DAYS * 24 * 60 * 60 * 1000)
      .toISOString()
      .slice(0, 10);
    const accountId = await pm.getAccountId();
    const propertyLinks = await listEntityLinks(
      api,
      `account/${accountId}/property/list`,
    );
    const propertyExisted = propertyLinks.some(
      (link) => link["@_hint"] === FIXTURE_PROPERTY_NAME,
    );
    const [propertyId] = await ensureStandardProperties(api, accountId, [
      FIXTURE_PROPERTY_NAME,
    ]);
    const property = (await api.propertyPropertyGet(propertyId)).property;
    if (property.constructionStatus !== "Test") {
      throw new Error(
        `Live-environment What's Changed fixture ${propertyId} must have constructionStatus=Test`,
      );
    }

    const ensuredPropertyUse = await ensurePropertyUse(api, propertyId);
    const propertyUse = await getPropertyUse(api, ensuredPropertyUse.id);
    const ensuredMeter = await ensureMeter(api, propertyId);
    const meter = (await api.meterMeterGet(ensuredMeter.id)).meter;

    fixture = {
      accountId,
      property: {
        id: propertyId,
        newlySeeded:
          !propertyExisted || isRecentlyCreated(property.audit?.createdDate),
        staleBeforeMutation: wasUpdatedBeforeLookback(since, property.audit),
      },
      propertyUse: {
        id: ensuredPropertyUse.id,
        newlySeeded:
          ensuredPropertyUse.created ||
          isRecentlyCreated(propertyUse.audit?.createdDate),
        staleBeforeMutation: wasUpdatedBeforeLookback(since, propertyUse.audit),
      },
      meter: {
        id: ensuredMeter.id,
        newlySeeded:
          ensuredMeter.created || isRecentlyCreated(meter.audit?.createdDate),
        staleBeforeMutation: wasUpdatedBeforeLookback(since, meter.audit),
      },
    };

    // Capture every feed independently, then refresh all fixtures before any
    // assertions. Even a transient feed failure therefore reseeds the next run,
    // and the suite never assumes same-run feed visibility.
    propertyFeed = await captureFeed(() =>
      pm.getChangedPropertyIds(since, accountId),
    );
    propertyUseFeed = await captureFeed(() =>
      pm.getChangedPropertyUseIds(since, accountId),
    );
    meterFeed = await captureFeed(() =>
      pm.getChangedMeterIds(since, accountId),
    );
    await updateFixtureForNextRun(api, fixture);
  });

  it("returns the persistent Test property", ({ skip }) => {
    assertFixtureInFeed(propertyFeed, fixture.property, "property", skip);
  });

  it("returns the persistent property use", ({ skip }) => {
    assertFixtureInFeed(
      propertyUseFeed,
      fixture.propertyUse,
      "property use",
      skip,
    );
  });

  it("returns the persistent meter", ({ skip }) => {
    assertFixtureInFeed(meterFeed, fixture.meter, "meter", skip);
  });
});
