#!/usr/bin/env tsx
import { PortfolioManager } from "../src/PortfolioManager.ts";
import { PortfolioManagerApi } from "../src/PortfolioManagerApi.ts";
import { parseLinkId } from "../src/functions/parseLinkId.ts";

const DEFAULT_TEST_ENDPOINT =
  "https://portfoliomanager.energystar.gov/wstest/";

type WipeArgs = {
  yes: boolean;
  allowNonTestEndpoint: boolean;
  endpoint: string;
};

function parseArgs(argv: string[]): WipeArgs {
  const yes = argv.includes("--yes");
  const allowNonTestEndpoint = argv.includes("--allow-non-test-endpoint");

  const endpointArg = argv.find((arg) => arg.startsWith("--endpoint="));
  const endpoint = endpointArg
    ? endpointArg.slice("--endpoint=".length)
    : process.env.PM_ENDPOINT || DEFAULT_TEST_ENDPOINT;

  return {
    yes,
    allowNonTestEndpoint,
    endpoint,
  };
}

function usage(): string {
  return [
    "Usage:",
    "  tsx ./scripts/wipeTestEnvironment.ts --yes [--endpoint=<url>] [--allow-non-test-endpoint]",
    "",
    "Required env vars:",
    "  PM_USERNAME",
    "  PM_PASSWORD",
    "",
    "Safety:",
    "  - Refuses to run unless endpoint includes '/wstest/'",
    "  - Override only with --allow-non-test-endpoint",
    "  - Requires --yes to execute destructive deletes",
  ].join("\n");
}

function isNotFoundError(error: unknown): boolean {
  const message = error instanceof Error ? error.message : String(error);
  return message.includes("not found") || message.includes("404");
}

async function main() {
  const args = parseArgs(process.argv.slice(2));

  if (!args.yes) {
    console.error("Refusing to run without --yes.");
    console.error(usage());
    process.exitCode = 2;
    return;
  }

  const username = process.env.PM_USERNAME;
  const password = process.env.PM_PASSWORD;

  if (!username || !password) {
    console.error("Missing PM_USERNAME or PM_PASSWORD.");
    process.exitCode = 2;
    return;
  }

  if (!args.allowNonTestEndpoint && !args.endpoint.includes("/wstest/")) {
    console.error(
      `Refusing to wipe non-test endpoint: ${args.endpoint}\nUse --allow-non-test-endpoint only if you are absolutely sure.`
    );
    process.exitCode = 2;
    return;
  }

  const api = new PortfolioManagerApi(args.endpoint, username, password);
  const pm = new PortfolioManager(api);

  const account = await pm.getAccount(false);
  const accountId = account.id;
  if (!accountId) {
    throw new Error("Account id is missing; aborting wipe.");
  }

  console.log(`Target endpoint: ${args.endpoint}`);
  console.log(`Target accountId: ${accountId}`);

  const propertyLinks = await pm.getPropertyLinks(accountId);
  const propertyIds: number[] = [];
  for (const link of propertyLinks) {
    const id = parseLinkId(link);
    if (id !== undefined) {
      propertyIds.push(id);
    }
  }

  const uniquePropertyIds = Array.from(new Set(propertyIds));
  const totalProperties = uniquePropertyIds.length;
  console.log(`Found ${totalProperties} properties to delete.`);

  let deletedProperties = 0;
  const propertyDeleteErrors: Array<{ propertyId: number; error: string }> = [];
  for (const [index, propertyId] of uniquePropertyIds.reverse().entries()) {
    const current = index + 1;
    console.log(`[${current}/${totalProperties}] deleting property ${propertyId}...`);
    try {
      await pm.deleteProperty(propertyId);
      deletedProperties++;
      console.log(
        `[${current}/${totalProperties}] deleted property ${propertyId} (deleted=${deletedProperties})`
      );
    } catch (error) {
      if (isNotFoundError(error)) {
        deletedProperties++;
        console.log(
          `[${current}/${totalProperties}] property ${propertyId} already deleted/not found (deleted=${deletedProperties})`
        );
      } else {
        const message = error instanceof Error ? error.message : String(error);
        propertyDeleteErrors.push({
          propertyId,
          error: message,
        });
        console.error(
          `[${current}/${totalProperties}] failed property ${propertyId}: ${message}`
        );
      }
    }
  }

  const summary = {
    endpoint: args.endpoint,
    accountId,
    discoveredProperties: uniquePropertyIds.length,
    deletedProperties,
    propertyDeleteErrors,
  };

  console.log(JSON.stringify(summary, null, 2));

  if (propertyDeleteErrors.length > 0) {
    process.exitCode = 1;
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
