import { afterEach, describe, expect, it, vi } from "vitest";

describe("cli entrypoint", () => {
  const originalArgv = [...process.argv];

  afterEach(() => {
    process.argv = [...originalArgv];
    vi.doUnmock("./cli/PortfolioManagerCommand.js");
    vi.resetModules();
  });

  it("runs PortfolioManagerCommand.parseAsync on import", async () => {
    const parseAsyncSpy = vi.fn().mockResolvedValue(undefined);

    vi.resetModules();
    vi.doMock("./cli/PortfolioManagerCommand.js", () => ({
      PortfolioManagerCommand: class {
        parseAsync = parseAsyncSpy;
      },
    }));

    process.argv = ["node", "portfolio-manager", "meter", "list", "entities"];

    await import("./cli.js");

    expect(parseAsyncSpy).toHaveBeenCalledWith(process.argv);
  });

  it("prints the message and sets exitCode 1 when a command action rejects", async () => {
    const originalExitCode = process.exitCode;
    const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    vi.resetModules();
    vi.doMock("./cli/PortfolioManagerCommand.js", () => ({
      PortfolioManagerCommand: class {
        parseAsync = vi.fn().mockRejectedValue(new Error("action failed"));
      },
    }));

    process.argv = ["node", "portfolio-manager"];

    try {
      await import("./cli.js");
      await vi.waitFor(() => {
        expect(errorSpy).toHaveBeenCalledWith("action failed");
      });
      expect(process.exitCode).to.equal(1);
    } finally {
      process.exitCode = originalExitCode;
      errorSpy.mockRestore();
    }
  });

  it("prints HTTP details for Portfolio Manager API failures", async () => {
    const originalExitCode = process.exitCode;
    const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    vi.resetModules();
    const { PortfolioManagerApiError } =
      await import("./PortfolioManagerApi.js");
    vi.doMock("./cli/PortfolioManagerCommand.js", () => ({
      PortfolioManagerCommand: class {
        parseAsync = vi
          .fn()
          .mockRejectedValue(
            new PortfolioManagerApiError(
              401,
              "Unauthorized",
              "<error>Invalid credentials</error>",
              "https://example.test/customer/list",
            ),
          );
      },
    }));

    process.argv = ["node", "portfolio-manager", "connection", "list"];

    try {
      await import("./cli.js");
      await vi.waitFor(() => {
        expect(errorSpy).toHaveBeenCalledWith(
          [
            "Portfolio Manager API request failed: HTTP 401 Unauthorized",
            "URL: https://example.test/customer/list",
            "Response: <error>Invalid credentials</error>",
          ].join("\n"),
        );
      });
      expect(process.exitCode).to.equal(1);
    } finally {
      process.exitCode = originalExitCode;
      errorSpy.mockRestore();
    }
  });

  it("prints a 403 even when optional API error details are absent", async () => {
    const originalExitCode = process.exitCode;
    const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    vi.resetModules();
    const { PortfolioManagerApiError } =
      await import("./PortfolioManagerApi.js");
    vi.doMock("./cli/PortfolioManagerCommand.js", () => ({
      PortfolioManagerCommand: class {
        parseAsync = vi
          .fn()
          .mockRejectedValue(new PortfolioManagerApiError(403, ""));
      },
    }));

    process.argv = ["node", "portfolio-manager", "what-changed", "property"];

    try {
      await import("./cli.js");
      await vi.waitFor(() => {
        expect(errorSpy).toHaveBeenCalledWith(
          "Portfolio Manager API request failed: HTTP 403",
        );
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
    vi.doMock("./cli/PortfolioManagerCommand.js", () => ({
      PortfolioManagerCommand: class {
        parseAsync = vi.fn().mockRejectedValue("plain string failure");
      },
    }));

    process.argv = ["node", "portfolio-manager"];

    try {
      await import("./cli.js");
      await vi.waitFor(() => {
        expect(errorSpy).toHaveBeenCalledWith("plain string failure");
      });
      expect(process.exitCode).to.equal(1);
    } finally {
      process.exitCode = originalExitCode;
      errorSpy.mockRestore();
    }
  });
});
