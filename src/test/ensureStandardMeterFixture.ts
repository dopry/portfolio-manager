import { mockMeter } from "../Mocks.js";
import { parseLinkId } from "../functions/parseLinkId.js";
import { PortfolioManagerApi } from "../PortfolioManagerApi.js";
import { IMeter, isIPopulatedResponse } from "../types/index.js";

export const STANDARD_METER_NAME = "Integration Fixture Meter A";

export async function ensureStandardMeterFixture(
  api: PortfolioManagerApi,
  propertyId: number,
  meterName: string = STANDARD_METER_NAME
): Promise<IMeter> {
  const listResponse = await api.meterMeterListGet(propertyId);
  const links = isIPopulatedResponse(listResponse.response)
    ? listResponse.response.links.link
    : [];

  const existing = links.find((link) => link["@_hint"] === meterName);
  if (existing) {
    const existingId = parseLinkId(existing);
    if (existingId !== undefined) {
      const existingMeterResponse = await api.meterMeterGet(existingId);
      return {
        ...existingMeterResponse.meter,
        id: existingId,
      };
    }
  }

  const createResponse = await api.meterMeterPost(propertyId, mockMeter(meterName));
  const meterId = createResponse.response.id;
  if (!meterId) {
    throw new Error("Expected created fixture meter to include id");
  }

  const meterResponse = await api.meterMeterGet(meterId);
  return {
    ...meterResponse.meter,
    id: meterId,
  };
}
