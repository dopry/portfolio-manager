import { afterAll, beforeAll, describe, expect, it } from "vitest";
import {
  EspmWebUi,
  isIntermittentWstestBulkSharingFailure,
} from "./EspmWebUi.js";
import {
  createClient,
  disconnectIfConnected,
  ensureCleanProviderState,
  ensurePeerFixtures,
  ensureWhatChangedFixture,
  getE2eConfig,
  waitFor,
  waitForNoAccess,
  E2E_PROPERTY_NAME,
  IE2eClient,
} from "./support.js";

/**
 * End-to-end lifecycle for connections and sharing. The peer account
 * (PM_USERNAME2) initiates requests through the pmtest web UI via Playwright;
 * the provider account (PM_USERNAME) exercises the SDK against wstest.
 *
 * Steps intentionally share state and run sequentially — each depends on the
 * one before it. See plans/connection-sharing-e2e-tests.md.
 */

const config = getE2eConfig();

describe("Connection & Sharing (WSTest E2E)", () => {
  let provider: IE2eClient;
  let peer: IE2eClient;
  let ui: EspmWebUi;
  let peerAccountId: number;
  let fixture: { propertyId: number; meterId: number };
  let failed = false;

  beforeAll(async () => {
    try {
      provider = createClient(config, config.provider);
      peer = createClient(config, config.peer);
      // Seed the permanent provider-managed customer before the UI lifecycle.
      // It remains usable even when Portfolio Manager's sharing UI is degraded.
      await ensureWhatChangedFixture(provider);

      peerAccountId = await peer.pm.getAccountId();
      fixture = await ensurePeerFixtures(peer);

      await ensureCleanProviderState(provider.pm, config.peer.username);
      await disconnectIfConnected(provider.pm, peerAccountId);

      ui = new EspmWebUi({
        baseUrl: config.webUiUrl,
        headless: config.headless,
        traceDir: config.traceDir,
      });
      await ui.launch();
      await ui.login(config.peer.username, config.peer.password);
    } catch (error) {
      // Ensure afterAll writes the trace for setup failures too.
      failed = true;
      throw error;
    }
  });

  afterAll(async () => {
    // Keep the trace only for failed runs; passing runs stay tidy.
    await ui?.close(failed ? `connection-sharing-${Date.now()}` : undefined);

    // Best-effort return the UI-driven peer lifecycle to baseline. The
    // provider-managed What's Changed fixture is intentionally independent.
    try {
      await ensureCleanProviderState(provider.pm, config.peer.username);
      await disconnectIfConnected(provider.pm, peerAccountId);
    } catch {
      // Shared test environment: never mask a test failure with cleanup noise.
    }
  });

  function step(name: string, fn: () => Promise<void>): void {
    it(name, async () => {
      try {
        await fn();
      } catch (error) {
        failed = true;
        try {
          console.error(`step '${name}' failed with UI at ${ui.page.url()}`);
        } catch {
          // Browser already closed; the original error is what matters.
        }
        throw error;
      }
    });
  }

  step(
    "peer sends a connection request; provider sees and accepts it",
    async () => {
      await ui.sendConnectionRequest(config.provider.username);

      const pending = await waitFor(
        async () => {
          const connections = await provider.pm.getPendingConnections();
          return connections.find((c) => c.username === config.peer.username);
        },
        { label: "pending connection from peer" },
      );
      expect(pending.accountId).toBe(peerAccountId);

      await provider.pm.acceptConnection(pending.accountId, "e2e accept");

      const stillPending = await provider.pm.getPendingConnections();
      expect(
        stillPending.find((c) => c.username === config.peer.username),
      ).toBeUndefined();
    },
  );

  step("peer shares the fixture property for data exchange", async () => {
    try {
      await ui.setupBulkDataExchangeShare({
        providerUsername: config.provider.username,
        propertyNames: [E2E_PROPERTY_NAME],
        accessLevel: "Full Access",
      });
    } catch (error) {
      if (!isIntermittentWstestBulkSharingFailure(error)) throw error;
      console.warn(
        "Intermittent WSTest limitation: bulk authorizeExchange returned HTTP 500 with {}; falling back to personalized sharing",
      );
      await ui.setupPersonalizedDataExchangeShare({
        providerUsername: config.provider.username,
        propertyNames: [E2E_PROPERTY_NAME],
        accessLevel: "Full Access",
      });
    }

    const pendingProperty = await waitFor(
      async () => {
        const shares = await provider.pm.getPendingPropertyShares();
        return shares.find((s) => s.sharerUsername === config.peer.username);
      },
      { label: "pending property share from peer" },
    );
    expect(pendingProperty.propertyId).toBe(fixture.propertyId);
    expect(pendingProperty.propertyName).toBe(E2E_PROPERTY_NAME);

    await provider.pm.acceptPropertyShare(
      pendingProperty.propertyId,
      "e2e accept",
    );

    // Accepted share grants real read access to the peer's property.
    const property = await provider.pm.getProperty(fixture.propertyId);
    expect(property.name).toBe(E2E_PROPERTY_NAME);
  });

  step(
    "meter share must be accepted separately, then grants meter access",
    async () => {
      // Property-share acceptance must NOT have auto-accepted the meter share.
      const pendingMeter = await waitFor(
        async () => {
          const shares = await provider.pm.getPendingMeterShares();
          return shares.find((s) => s.sharerUsername === config.peer.username);
        },
        { label: "pending meter share from peer" },
      );
      expect(pendingMeter.id).toBe(fixture.meterId);
      expect(pendingMeter.propertyId).toBe(fixture.propertyId);

      await provider.pm.acceptMeterShare(pendingMeter.id, "e2e accept");

      const meter = await provider.pm.getMeter(fixture.meterId);
      expect(meter.id).toBe(fixture.meterId);
    },
  );

  step("unshare removes access; a re-share can be rejected", async () => {
    await provider.pm.unshareMeter(fixture.meterId, "e2e unshare");
    await provider.pm.unshareProperty(fixture.propertyId, "e2e unshare");

    await waitForNoAccess(() => provider.pm.getProperty(fixture.propertyId), {
      label: "property access to be revoked",
    });

    // Seed a second share and exercise the reject path.
    await ui.setupPersonalizedDataExchangeShare({
      providerUsername: config.provider.username,
      propertyNames: [E2E_PROPERTY_NAME],
      accessLevel: "Read Only Access",
    });
    const pending = await waitFor(
      async () => {
        const shares = await provider.pm.getPendingPropertyShares();
        return shares.find((s) => s.sharerUsername === config.peer.username);
      },
      { label: "second pending property share from peer" },
    );
    await provider.pm.rejectPropertyShare(pending.propertyId, "e2e reject");
    for (const share of await provider.pm.getPendingMeterShares()) {
      if (share.sharerUsername === config.peer.username) {
        await provider.pm.rejectMeterShare(share.id, "e2e reject");
      }
    }

    await waitFor(
      async () => {
        const [propertyShares, meterShares] = await Promise.all([
          provider.pm.getPendingPropertyShares(),
          provider.pm.getPendingMeterShares(),
        ]);
        const peerStillPending = [...propertyShares, ...meterShares].some(
          (share) => share.sharerUsername === config.peer.username,
        );
        return peerStillPending ? undefined : true;
      },
      { label: "rejected shares to leave pending lists" },
    );

    await waitForNoAccess(() => provider.pm.getProperty(fixture.propertyId), {
      label: "property access to be revoked",
    });
  });

  step("disconnect returns the accounts to baseline", async () => {
    const connectedBefore = await provider.pm.getCustomerList();
    expect(connectedBefore.map((c) => c.id)).toContain(peerAccountId);

    await provider.pm.disconnect(peerAccountId, {
      keepShares: false,
      note: "e2e disconnect",
    });

    const connectedAfter = await provider.pm.getCustomerList();
    expect(connectedAfter.map((c) => c.id)).not.toContain(peerAccountId);

    const pendingConnections = await provider.pm.getPendingConnections();
    expect(
      pendingConnections.find((c) => c.username === config.peer.username),
    ).toBeUndefined();
  });
});
