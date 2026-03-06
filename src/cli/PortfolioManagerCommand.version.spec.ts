import { afterEach, describe, expect, it, vi } from "vitest";

describe("PortfolioManagerCommand version fallback", () => {
  afterEach(() => {
    vi.doUnmock("node:fs");
    vi.resetModules();
  });

  it("reads version from package.json", async () => {
    vi.resetModules();
    vi.doMock("node:fs", () => ({
      readFileSync: vi.fn(() => JSON.stringify({ version: "1.2.3" })),
    }));

    const { PortfolioManagerCommand } = await import("./PortfolioManagerCommand.js");
    const cmd = new PortfolioManagerCommand();

    expect(cmd.version()).to.equal("1.2.3");
  });

  it("falls back to 0.0.0 when package.json lacks version", async () => {
    vi.resetModules();
    vi.doMock("node:fs", () => ({
      readFileSync: vi.fn(() => JSON.stringify({ name: "portfolio-manager" })),
    }));

    const { PortfolioManagerCommand } = await import("./PortfolioManagerCommand.js");
    const cmd = new PortfolioManagerCommand();

    expect(cmd.version()).to.equal("0.0.0");
  });

  it("falls back to 0.0.0 when package.json cannot be read", async () => {
    vi.resetModules();
    vi.doMock("node:fs", () => ({
      readFileSync: vi.fn(() => {
        throw new Error("read failed");
      }),
    }));

    const { PortfolioManagerCommand } = await import("./PortfolioManagerCommand.js");
    const cmd = new PortfolioManagerCommand();

    expect(cmd.version()).to.equal("0.0.0");
  });
});
