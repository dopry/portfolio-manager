import { mockIProperty } from "../Mocks.js";
import { parseLinkId } from "../functions/parseLinkId.js";
import { PortfolioManager } from "../PortfolioManager.js";
import { PortfolioManagerApi } from "../PortfolioManagerApi.js";
import { ILink } from "../types/index.js";

export const STANDARD_PROPERTY_NAMES = [
  "Integration Fixture Property A",
  "Integration Fixture Property B",
];

async function listPropertyLinks(
  client: PortfolioManager,
  accountId: number
): Promise<ILink[]> {
  try {
    return await client.getPropertyLinks(accountId);
  } catch (error) {
    if (
      error instanceof Error &&
      error.message.startsWith("No properties found:")
    ) {
      return [];
    }
    throw error;
  }
}

export async function ensureStandardProperties(
  api: PortfolioManagerApi,
  accountId: number,
  propertyNames: string[] = STANDARD_PROPERTY_NAMES
): Promise<number[]> {
  const client = new PortfolioManager(api);
  let links = await listPropertyLinks(client, accountId);

  for (const propertyName of propertyNames) {
    const existing = links.find((link) => link["@_hint"] === propertyName);
    if (!existing) {
      await api.propertyPropertyPost(
        {
          ...mockIProperty(),
          name: propertyName,
        },
        accountId
      );
      links = await listPropertyLinks(client, accountId);
    }
  }

  return propertyNames.map((propertyName) => {
    const link = links.find((item) => item["@_hint"] === propertyName);
    if (!link) {
      throw new Error(`Expected standard property '${propertyName}' to exist`);
    }
    const id = parseLinkId(link);
    if (id === undefined) {
      throw new Error(`Expected numeric id for standard property '${propertyName}'`);
    }
    return id;
  });
}
