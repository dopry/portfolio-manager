import { PortfolioManager } from "../../src/PortfolioManager.js";
import { PortfolioManagerApi } from "../../src/PortfolioManagerApi.js";
import { ensureStandardMeterFixture } from "../../src/test/ensureStandardMeterFixture.js";
import { ensureStandardProperties } from "../../src/test/ensureStandardProperties.js";
import { DEFAULT_WEB_UI_URL } from "./EspmWebUi.js";

export const DEFAULT_API_URL = "https://portfoliomanager.energystar.gov/wstest/";

export const E2E_PROPERTY_NAME = "E2E Share Fixture Property";
export const E2E_METER_NAME = "E2E Share Fixture Meter";

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
  if (!provider.username || !provider.password || !peer.username || !peer.password) {
    throw new Error(
      "The e2e suite needs PM_USERNAME/PM_PASSWORD (provider) and " +
        "PM_USERNAME2/PM_PASSWORD2 (persistent peer) environment variables."
    );
  }
  return {
    apiUrl: process.env.PM_ENDPOINT || DEFAULT_API_URL,
    webUiUrl: process.env.PM_WEB_ENDPOINT || DEFAULT_WEB_UI_URL,
    provider,
    peer,
    headless: process.env.E2E_HEADLESS !== "false",
    traceDir: process.env.E2E_TRACE_DIR || "test-results/e2e",
  };
}

export interface IE2eClient {
  api: PortfolioManagerApi;
  pm: PortfolioManager;
}

export function createClient(
  config: IE2eConfig,
  credentials: { username: string; password: string }
): IE2eClient {
  const api = new PortfolioManagerApi(
    config.apiUrl,
    credentials.username,
    credentials.password
  );
  return { api, pm: new PortfolioManager(api) };
}

/**
 * Polls until `probe` returns a defined value. UI-seeded requests can take a
 * moment to appear in the web services pending lists.
 */
export async function waitFor<T>(
  probe: () => Promise<T | undefined>,
  options: { timeoutMs?: number; intervalMs?: number; label?: string } = {}
): Promise<T> {
  const timeoutMs = options.timeoutMs ?? 60000;
  const intervalMs = options.intervalMs ?? 5000;
  const deadline = Date.now() + timeoutMs;
  for (;;) {
    const result = await probe();
    if (result !== undefined) return result;
    if (Date.now() >= deadline) {
      throw new Error(
        `Timed out after ${timeoutMs}ms waiting for ${options.label || "condition"}`
      );
    }
    await new Promise((resolve) => setTimeout(resolve, intervalMs));
  }
}

/**
 * Ensures the peer account owns the fixture property with one meter, and
 * returns their ids. Runs against the web services API with peer credentials.
 */
export async function ensurePeerFixtures(
  peer: IE2eClient
): Promise<{ propertyId: number; meterId: number }> {
  const accountId = await peer.pm.getAccountId();
  const [propertyId] = await ensureStandardProperties(peer.api, accountId, [
    E2E_PROPERTY_NAME,
  ]);
  const meter = await ensureStandardMeterFixture(
    peer.api,
    propertyId,
    E2E_METER_NAME
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
  peerUsername: string
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
 * Best-effort disconnect from the peer account, removing any accepted shares.
 * Errors (e.g. "not connected") are swallowed: baseline is the goal.
 */
export async function disconnectIfConnected(
  provider: PortfolioManager,
  peerAccountId: number
): Promise<void> {
  try {
    await provider.disconnect(peerAccountId, {
      keepShares: false,
      note: "e2e cleanup",
    });
  } catch {
    // Not connected — already at baseline.
  }
}
