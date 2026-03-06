import { afterEach, describe, expect, it, vi } from "vitest";

describe("src index entrypoint", () => {
  const originalArgv = [...process.argv];

  afterEach(() => {
    process.argv = [...originalArgv];
    vi.doUnmock("node:url");
    vi.doUnmock("./cli/PortfolioManagerCommand.js");
    vi.resetModules();
  });

  it("runs PortfolioManagerCommand.parse when module path matches argv[1]", async () => {
    const parseSpy = vi.fn();

    vi.resetModules();
    vi.doMock("node:url", () => ({
      fileURLToPath: vi.fn(() => "D:/src/dopry/portfolio-manager/src/index.ts"),
    }));
    vi.doMock("./cli/PortfolioManagerCommand.js", () => ({
      PortfolioManagerCommand: class {
        parse = parseSpy;
      },
    }));

    process.argv = [
      "node",
      "D:/src/dopry/portfolio-manager/src/index.ts",
      "meter",
      "list",
      "entities",
    ];

    await import("./index.js");

    expect(parseSpy).toHaveBeenCalledWith(process.argv);
  });

  it("does not run parse when module path does not match argv[1]", async () => {
    const parseSpy = vi.fn();

    vi.resetModules();
    vi.doMock("node:url", () => ({
      fileURLToPath: vi.fn(() => "D:/src/dopry/portfolio-manager/src/index.ts"),
    }));
    vi.doMock("./cli/PortfolioManagerCommand.js", () => ({
      PortfolioManagerCommand: class {
        parse = parseSpy;
      },
    }));

    process.argv = ["node", "D:/some/other/path.ts"];

    await import("./index.js");

    expect(parseSpy).not.toHaveBeenCalled();
  });

  it("returns false for non-file import URLs", async () => {
    vi.resetModules();
    vi.doMock("./cli/PortfolioManagerCommand.js", () => ({
      PortfolioManagerCommand: class {
        parse = vi.fn();
      },
    }));

    const { shouldRunMain } = await import("./index.js");

    const result = shouldRunMain(
      "https://example.invalid/index.js",
      "D:/src/dopry/portfolio-manager/src/index.ts",
      () => "D:/src/dopry/portfolio-manager/src/index.ts"
    );

    expect(result).to.equal(false);
  });

  it("returns true when argv1 matches resolved module path", async () => {
    vi.resetModules();
    vi.doMock("./cli/PortfolioManagerCommand.js", () => ({
      PortfolioManagerCommand: class {
        parse = vi.fn();
      },
    }));

    const { shouldRunMain } = await import("./index.js");

    const result = shouldRunMain(
      "file:///repo/src/index.ts",
      "D:/repo/src/index.ts",
      () => "D:/repo/src/index.ts"
    );

    expect(result).to.equal(true);
  });
});
