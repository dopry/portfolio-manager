import { afterEach, describe, expect, it, vi } from "vitest";

describe("src index entrypoint", () => {
  const originalArgv = [...process.argv];

  afterEach(() => {
    process.argv = [...originalArgv];
    vi.doUnmock("node:url");
    vi.doUnmock("./cli/PortfolioManagerCommand.js");
    vi.resetModules();
  });

  it("runs PortfolioManagerCommand.parseAsync when module path matches argv[1]", async () => {
    const parseAsyncSpy = vi.fn().mockResolvedValue(undefined);

    vi.resetModules();
    vi.doMock("node:url", () => ({
      fileURLToPath: vi.fn(() => "D:/src/dopry/portfolio-manager/src/index.ts"),
    }));
    vi.doMock("./cli/PortfolioManagerCommand.js", () => ({
      PortfolioManagerCommand: class {
        parseAsync = parseAsyncSpy;
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

    expect(parseAsyncSpy).toHaveBeenCalledWith(process.argv);
  });

  it("does not run parseAsync when module path does not match argv[1]", async () => {
    const parseAsyncSpy = vi.fn().mockResolvedValue(undefined);

    vi.resetModules();
    vi.doMock("node:url", () => ({
      fileURLToPath: vi.fn(() => "D:/src/dopry/portfolio-manager/src/index.ts"),
    }));
    vi.doMock("./cli/PortfolioManagerCommand.js", () => ({
      PortfolioManagerCommand: class {
        parseAsync = parseAsyncSpy;
      },
    }));

    process.argv = ["node", "D:/some/other/path.ts"];

    await import("./index.js");

    expect(parseAsyncSpy).not.toHaveBeenCalled();
  });

  it("prints the message and sets exitCode 1 when a command action rejects", async () => {
    const originalExitCode = process.exitCode;
    const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    vi.resetModules();
    vi.doMock("node:url", () => ({
      fileURLToPath: vi.fn(() => "D:/src/dopry/portfolio-manager/src/index.ts"),
    }));
    vi.doMock("./cli/PortfolioManagerCommand.js", () => ({
      PortfolioManagerCommand: class {
        parseAsync = vi.fn().mockRejectedValue(new Error("action failed"));
      },
    }));

    process.argv = ["node", "D:/src/dopry/portfolio-manager/src/index.ts"];

    try {
      await import("./index.js");
      await vi.waitFor(() => {
        expect(errorSpy).toHaveBeenCalledWith("action failed");
      });
      expect(process.exitCode).to.equal(1);
    } finally {
      process.exitCode = originalExitCode;
      errorSpy.mockRestore();
    }
  });

  it("stringifies non-Error rejections before printing them", async () => {
    const originalExitCode = process.exitCode;
    const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    vi.resetModules();
    vi.doMock("node:url", () => ({
      fileURLToPath: vi.fn(() => "D:/src/dopry/portfolio-manager/src/index.ts"),
    }));
    vi.doMock("./cli/PortfolioManagerCommand.js", () => ({
      PortfolioManagerCommand: class {
        parseAsync = vi.fn().mockRejectedValue("plain string failure");
      },
    }));

    process.argv = ["node", "D:/src/dopry/portfolio-manager/src/index.ts"];

    try {
      await import("./index.js");
      await vi.waitFor(() => {
        expect(errorSpy).toHaveBeenCalledWith("plain string failure");
      });
      expect(process.exitCode).to.equal(1);
    } finally {
      process.exitCode = originalExitCode;
      errorSpy.mockRestore();
    }
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
