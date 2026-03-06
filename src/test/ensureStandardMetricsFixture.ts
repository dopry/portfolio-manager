import { mockMeter } from "../Mocks.js";
import { parseLinkId } from "../functions/parseLinkId.js";
import { PortfolioManagerApi } from "../PortfolioManagerApi.js";
import { ILink, isIPopulatedResponse } from "../types/index.js";

const FIXTURE_METER_NAME = "Integration Fixture Metrics Meter";
const FIXTURE_START_DATE = "2024-01-01";
const FIXTURE_END_DATE = "2024-01-31";
const FIXTURE_USAGE = 50;
const FIXTURE_COST = 10;

export interface IStandardMetricsFixture {
  propertyId: number;
  meterId: number;
}

function toDateKey(dateLike: unknown): string | undefined {
  if (dateLike === undefined || dateLike === null) {
    return undefined;
  }
  if (typeof dateLike === "string") {
    return dateLike.slice(0, 10);
  }
  if (dateLike instanceof Date && !Number.isNaN(dateLike.getTime())) {
    return dateLike.toISOString().slice(0, 10);
  }

  const parsed = new Date(String(dateLike));
  if (Number.isNaN(parsed.getTime())) {
    return undefined;
  }
  return parsed.toISOString().slice(0, 10);
}

async function ensureMetricsFixtureMeter(
  api: PortfolioManagerApi,
  propertyId: number
): Promise<number> {
  const listResponse = await api.meterMeterListGet(propertyId);
  const links: ILink[] = isIPopulatedResponse(listResponse.response)
    ? listResponse.response.links.link
    : [];

  const existing = links.find((link) => link["@_hint"] === FIXTURE_METER_NAME);
  if (existing) {
    const existingId = parseLinkId(existing);
    if (existingId !== undefined) {
      return existingId;
    }
  }

  const createResponse = await api.meterMeterPost(
    propertyId,
    mockMeter(FIXTURE_METER_NAME)
  );
  const meterId = createResponse.response.id;
  if (!meterId) {
    throw new Error("Expected created fixture meter to include id");
  }
  return meterId;
}

async function ensureFixtureConsumption(
  api: PortfolioManagerApi,
  meterId: number
): Promise<void> {
  const consumptionResponse = await api.meterConsumptionDataGet(meterId);
  const existing = (consumptionResponse.meterData.meterConsumption || []).find(
    (entry) => {
      const startDate = toDateKey(entry.startDate);
      const endDate = toDateKey(entry.endDate);
      return (
        startDate === FIXTURE_START_DATE &&
        endDate === FIXTURE_END_DATE &&
        entry.usage === FIXTURE_USAGE
      );
    }
  );

  if (existing) {
    return;
  }

  await api.meterConsumptionDataPost(meterId, {
    meterData: {
      meterConsumption: [
        {
          startDate: FIXTURE_START_DATE,
          endDate: FIXTURE_END_DATE,
          usage: FIXTURE_USAGE,
          cost: FIXTURE_COST,
        },
      ],
    },
  });
}

export async function ensureStandardMetricsFixture(
  api: PortfolioManagerApi,
  propertyId: number
): Promise<IStandardMetricsFixture> {
  const meterId = await ensureMetricsFixtureMeter(api, propertyId);
  await ensureFixtureConsumption(api, meterId);
  return { propertyId, meterId };
}
