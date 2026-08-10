import { PortfolioManager } from "../../src/PortfolioManager.js";
import {
  PortfolioManagerApi,
  PortfolioManagerApiError,
} from "../../src/PortfolioManagerApi.js";
import { ensureStandardMeterFixture } from "../../src/test/ensureStandardMeterFixture.js";
import { ensureStandardProperties } from "../../src/test/ensureStandardProperties.js";
import { toEditableProperty } from "../../src/test/toEditableProperty.js";
import { isIPopulatedResponse } from "../../src/types/xml/index.js";
import type { IAccount } from "../../src/types/xml/index.js";
import { DEFAULT_WEB_UI_URL } from "./EspmWebUi.js";

export const DEFAULT_API_URL =
  "https://portfoliomanager.energystar.gov/wstest/";

export const E2E_PROPERTY_NAME = "E2E Share Fixture Property";
export const E2E_METER_NAME = "E2E Share Fixture Meter";
export const E2E_WHAT_CHANGED_CUSTOMER_NAME =
  "E2E What's Changed Fixture Customer";
export const E2E_WHAT_CHANGED_PROPERTY_NAME =
  "E2E What's Changed Fixture Property";

export interface IE2eConfig {
  apiUrl: string;
  webUiUrl: string;
  /** Web services provider account under test (accepts via the API). */
  provider: { username: string; password: string };
  /** Persistent peer account that initiates connections/shares via the UI. */
  peer: { username: string; password: string };
  headless: boolean;
  traceDir: string;
}

export function getE2eConfig(): IE2eConfig {
  const provider = {
    username: process.env.PM_USERNAME || "",
    password: process.env.PM_PASSWORD || "",
  };
  const peer = {
    username: process.env.PM_USERNAME2 || "",
    password: process.env.PM_PASSWORD2 || "",
  };
  if (
    !provider.username ||
    !provider.password ||
    !peer.username ||
    !peer.password
  ) {
    throw new Error(
      "The WSTest E2E suite needs PM_USERNAME/PM_PASSWORD (provider) and " +
        "PM_USERNAME2/PM_PASSWORD2 (persistent peer) environment variables.",
    );
  }
  return {
    apiUrl: process.env.PM_ENDPOINT || DEFAULT_API_URL,
    webUiUrl: process.env.PM_WEB_ENDPOINT || DEFAULT_WEB_UI_URL,
    provider,
    peer,
    headless: process.env.E2E_HEADLESS !== "false",
    traceDir: process.env.E2E_TRACE_DIR || "test-results/wstest-e2e",
  };
}

export interface IE2eClient {
  api: PortfolioManagerApi;
  pm: PortfolioManager;
}

export function createClient(
  config: IE2eConfig,
  credentials: { username: string; password: string },
): IE2eClient {
  const api = new PortfolioManagerApi(
    config.apiUrl,
    credentials.username,
    credentials.password,
  );
  return { api, pm: new PortfolioManager(api) };
}

async function ensureWhatChangedCustomer(
  provider: IE2eClient,
): Promise<number> {
  const existing = (await provider.pm.getCustomerList()).find(
    (customer) => customer.organizationName === E2E_WHAT_CHANGED_CUSTOMER_NAME,
  );
  if (existing) return existing.id;

  const suffix = `${Date.now()}${Math.round(Math.random() * 1_000_000)}`;
  const account: Omit<IAccount, "id"> = {
    username: `pm_e2e_wc_${suffix}`,
    password: `PmE2e!${suffix}`,
    webserviceUser: false,
    searchable: false,
    includeTestPropertiesInGraphics: false,
    languagePreference: "en_US",
    contact: {
      firstName: "Portfolio Manager",
      lastName: "E2E Fixture",
      email: `portfolio-manager-e2e-${suffix}@example.com`,
      jobTitle: "Automated test fixture",
      phone: "202-555-0100",
      address: {
        "@_address1": "123 Main St",
        "@_city": "Washington",
        "@_state": "DC",
        "@_postalCode": "20001",
        "@_country": "US",
      },
    },
    organization: {
      "@_name": E2E_WHAT_CHANGED_CUSTOMER_NAME,
      primaryBusiness: "Other",
      otherBusinessDescription: "Automated test fixture",
      energyStarPartner: false,
    },
  };

  const created = await provider.api.accountCustomerPost(account);
  if (!isIPopulatedResponse(created.response)) {
    throw new Error(
      `Expected customer creation to return an id: ${JSON.stringify(created)}`,
    );
  }
  return created.response.id;
}

/**
 * Creates a permanent provider-managed customer/property once, then changes
 * that property on every nightly E2E run to seed the date-batched feed.
 */
export async function ensureWhatChangedFixture(
  provider: IE2eClient,
): Promise<{ customerId: number; propertyId: number }> {
  const customerId = await ensureWhatChangedCustomer(provider);
  const [propertyId] = await ensureStandardProperties(
    provider.api,
    customerId,
    [E2E_WHAT_CHANGED_PROPERTY_NAME],
  );
  const property = (await provider.api.propertyPropertyGet(propertyId))
    .property;
  const updated = await provider.api.propertyPropertyPut(propertyId, {
    ...toEditableProperty(property),
    notes: `Last What's Changed E2E mutation: ${new Date().toISOString()}`,
  });
  if (
    !isIPopulatedResponse(updated.response) ||
    updated.response.id !== propertyId
  ) {
    throw new Error(
      `Expected What's Changed fixture update to return property ${propertyId}: ${JSON.stringify(updated)}`,
    );
  }
  return { customerId, propertyId };
}

/**
 * Polls until `probe` returns a defined value. UI-seeded requests can take a
 * moment to appear in the web services pending lists.
 */
export async function waitFor<T>(
  probe: () => Promise<T | undefined>,
  options: { timeoutMs?: number; intervalMs?: number; label?: string } = {},
): Promise<T> {
  const timeoutMs = options.timeoutMs ?? 60000;
  const intervalMs = options.intervalMs ?? 5000;
  const deadline = Date.now() + timeoutMs;
  for (;;) {
    const result = await probe();
    if (result !== undefined) return result;
    if (Date.now() >= deadline) {
      throw new Error(
        `Timed out after ${timeoutMs}ms waiting for ${options.label || "condition"}`,
      );
    }
    await new Promise((resolve) => setTimeout(resolve, intervalMs));
  }
}

function isAccessRevokedError(
  error: unknown,
): error is PortfolioManagerApiError {
  return (
    error instanceof PortfolioManagerApiError &&
    (error.status === 403 || error.status === 404)
  );
}

function isAlreadyDisconnectedError(
  error: unknown,
): error is PortfolioManagerApiError {
  return (
    error instanceof PortfolioManagerApiError &&
    error.status === 400 &&
    error.responseText?.includes('errorNumber="-200"') === true &&
    error.responseText.includes("You are not connected to this account")
  );
}

/**
 * Rejecting a WSTest property share can fulfill its pending meter share before
 * the separate meter rejection reaches the API. This exact response was
 * observed in serialized CI runs on 2026-08-10.
 */
export function isPendingRequestAlreadyFulfilledError(
  error: unknown,
): error is PortfolioManagerApiError {
  return (
    error instanceof PortfolioManagerApiError &&
    error.status === 400 &&
    error.responseText?.includes('errorNumber="-200"') === true &&
    error.responseText.includes(
      "The pending request doesn't exist or has been fulfilled",
    )
  );
}

/**
 * Waits for access revocation to propagate. ESPM answers 403 Access Denied
 * (occasionally 404) once complete, but accepted shares can remain readable
 * briefly after an unshare. Unexpected failures (5xx, network, auth) still
 * fail immediately rather than masquerading as successful revocation.
 */
export async function waitForNoAccess(
  probe: () => Promise<unknown>,
  options: { timeoutMs?: number; intervalMs?: number; label?: string } = {},
): Promise<void> {
  await waitFor(
    async () => {
      try {
        await probe();
        return undefined;
      } catch (error) {
        if (isAccessRevokedError(error)) {
          return true;
        }
        throw error;
      }
    },
    { ...options, label: options.label ?? "access to be revoked" },
  );
}

/**
 * Ensures the peer account owns the fixture property with one meter, and
 * returns their ids. Runs against the web services API with peer credentials.
 */
export async function ensurePeerFixtures(
  peer: IE2eClient,
): Promise<{ propertyId: number; meterId: number }> {
  const accountId = await peer.pm.getAccountId();
  const [propertyId] = await ensureStandardProperties(peer.api, accountId, [
    E2E_PROPERTY_NAME,
  ]);
  const meter = await ensureStandardMeterFixture(
    peer.api,
    propertyId,
    E2E_METER_NAME,
  );
  if (meter.id === undefined) {
    throw new Error("Expected fixture meter to have an id");
  }
  return { propertyId, meterId: meter.id };
}

/**
 * Rejects any pending connection/share requests from the peer, scoped to the
 * peer account so other pending requests in the shared test environment are
 * left alone. An already-accepted connection is dropped separately via
 * disconnectIfConnected (it needs the peer's account id, which pending lists
 * don't provide once accepted).
 */
export async function ensureCleanProviderState(
  provider: PortfolioManager,
  peerUsername: string,
): Promise<void> {
  const note = "e2e ensureCleanProviderState";

  for (const share of await provider.getPendingPropertyShares()) {
    if (share.sharerUsername === peerUsername) {
      await provider.rejectPropertyShare(share.propertyId, note);
    }
  }
  for (const share of await provider.getPendingMeterShares()) {
    if (share.sharerUsername === peerUsername) {
      await provider.rejectMeterShare(share.id, note);
    }
  }

  for (const connection of await provider.getPendingConnections()) {
    if (connection.username === peerUsername) {
      await provider.rejectConnection(connection.accountId, note);
    }
  }
}

/**
 * Disconnects from the peer account, removing any accepted shares. The
 * not-connected case (ESPM answers 400/-200, 403 "Access Denied", or 404) is
 * treated as already-at-baseline; anything else (auth, network, 5xx) is a real
 * failure.
 */
export async function disconnectIfConnected(
  provider: PortfolioManager,
  peerAccountId: number,
): Promise<void> {
  try {
    await provider.disconnect(peerAccountId, {
      keepShares: false,
      note: "e2e cleanup",
    });
  } catch (error) {
    if (isAccessRevokedError(error) || isAlreadyDisconnectedError(error)) {
      return; // Not connected — already at baseline.
    }
    throw error;
  }
}
