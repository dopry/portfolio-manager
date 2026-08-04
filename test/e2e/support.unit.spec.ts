import { describe, expect, it, vi } from "vitest";
import { PortfolioManagerApiError } from "../../src/PortfolioManagerApi.js";
import { waitForNoAccess } from "./support.js";

describe("waitForNoAccess", () => {
  it("polls until ESPM reports that access is revoked", async () => {
    const probe = vi
      .fn<() => Promise<unknown>>()
      .mockResolvedValueOnce({ id: 123 })
      .mockResolvedValueOnce({ id: 123 })
      .mockRejectedValueOnce(
        new PortfolioManagerApiError(403, "Access Denied"),
      );

    await waitForNoAccess(probe, { timeoutMs: 5000, intervalMs: 0 });

    expect(probe).toHaveBeenCalledTimes(3);
  });

  it("also accepts ESPM's not-found response as revoked access", async () => {
    const probe = vi
      .fn<() => Promise<unknown>>()
      .mockRejectedValue(new PortfolioManagerApiError(404, "Not Found"));

    await waitForNoAccess(probe, { timeoutMs: 5000, intervalMs: 0 });

    expect(probe).toHaveBeenCalledOnce();
  });

  it("propagates unexpected API failures without retrying", async () => {
    const error = new PortfolioManagerApiError(500, "Internal Server Error");
    const probe = vi.fn<() => Promise<unknown>>().mockRejectedValue(error);

    await expect(
      waitForNoAccess(probe, { timeoutMs: 5000, intervalMs: 0 }),
    ).rejects.toBe(error);
    expect(probe).toHaveBeenCalledOnce();
  });

  it("propagates non-API failures without retrying", async () => {
    const error = new TypeError("fetch failed");
    const probe = vi.fn<() => Promise<unknown>>().mockRejectedValue(error);

    await expect(
      waitForNoAccess(probe, { timeoutMs: 5000, intervalMs: 0 }),
    ).rejects.toBe(error);
    expect(probe).toHaveBeenCalledOnce();
  });

  it("reports when access remains available through the deadline", async () => {
    const probe = vi
      .fn<() => Promise<unknown>>()
      .mockResolvedValue({ id: 123 });

    await expect(
      waitForNoAccess(probe, {
        timeoutMs: 0,
        intervalMs: 0,
        label: "property access to be revoked",
      }),
    ).rejects.toThrow(
      "Timed out after 0ms waiting for property access to be revoked",
    );
    expect(probe).toHaveBeenCalledOnce();
  });
});
