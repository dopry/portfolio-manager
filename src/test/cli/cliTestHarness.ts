import { vi } from "vitest";
import type { PortfolioManager } from "../../PortfolioManager.js";
import { PortfolioManagerBaseCommand } from "../../cli/PortfolioManagerBaseCommand.js";
import { PortfolioManagerCommand } from "../../cli/PortfolioManagerCommand.js";

function applyExitOverrideRecursively(command: PortfolioManagerBaseCommand): void {
  command.exitOverride();
  for (const subCommand of command.commands) {
    applyExitOverrideRecursively(subCommand as PortfolioManagerBaseCommand);
  }
}

export type FakeClient = {
  getProperties: ReturnType<typeof vi.fn>;
  getAssociatedMeters: ReturnType<typeof vi.fn>;
  getMetersPropertiesAssociation: ReturnType<typeof vi.fn>;
  getMeterLinks: ReturnType<typeof vi.fn>;
  getMeterConsumption: ReturnType<typeof vi.fn>;
  getPropertyMonthlyMetrics: ReturnType<typeof vi.fn>;
  getPropertyMetrics: ReturnType<typeof vi.fn>;
  getMeterAdditionalIdentifiers: ReturnType<typeof vi.fn>;
  getMeters: ReturnType<typeof vi.fn>;
  getPropertyLinks: ReturnType<typeof vi.fn>;
};

export function createFakeClient(): FakeClient {
  return {
    getProperties: vi.fn(),
    getAssociatedMeters: vi.fn(),
    getMetersPropertiesAssociation: vi.fn(),
    getMeterLinks: vi.fn(),
    getMeterConsumption: vi.fn(),
    getPropertyMonthlyMetrics: vi.fn(),
    getPropertyMetrics: vi.fn(),
    getMeterAdditionalIdentifiers: vi.fn(),
    getMeters: vi.fn(),
    getPropertyLinks: vi.fn(),
  };
}

export type CliHarness = {
  fakeClient: FakeClient;
  parseCli: (args: string[]) => Promise<void>;
  parseCliHelp: (args: string[], appendHelpFlag?: boolean) => Promise<void>;
  restore: () => void;
};

export function setupCliHarness(): CliHarness {
  const previousEnv = {
    PM_ENDPOINT: process.env.PM_ENDPOINT,
    PM_USERNAME: process.env.PM_USERNAME,
    PM_PASSWORD: process.env.PM_PASSWORD,
  };
  const previousExitCode = process.exitCode;

  process.env.PM_ENDPOINT = "https://portfoliomanager.energystar.gov/wstest/";
  process.env.PM_USERNAME = "test-user";
  process.env.PM_PASSWORD = "test-password";
  process.exitCode = undefined;

  const fakeClient = createFakeClient();

  vi.spyOn(console, "log").mockImplementation(() => undefined);
  vi.spyOn(console, "error").mockImplementation(() => undefined);
  vi.spyOn(
    PortfolioManagerBaseCommand.prototype,
    "getPortfolioManagerClient"
  ).mockReturnValue(fakeClient as unknown as PortfolioManager);

  async function parseCli(args: string[]): Promise<void> {
    const cli = new PortfolioManagerCommand();
    await cli.parseAsync(args, { from: "user" });
  }

  async function parseCliHelp(
    args: string[],
    appendHelpFlag = true
  ): Promise<void> {
    const cli = new PortfolioManagerCommand();
    cli.configureOutput({
      writeOut: () => undefined,
      writeErr: () => undefined,
    });
    applyExitOverrideRecursively(cli);
    const argv = appendHelpFlag ? [...args, "--help"] : args;
    try {
      await cli.parseAsync(argv, { from: "user" });
    }
    catch (error) {
      if (
        typeof error === "object" &&
        error !== null &&
        "code" in error &&
        ["commander.helpDisplayed", "commander.help", "commander.outputHelp"]
          .includes((error as { code?: string }).code || "")
      ) {
        return;
      }
      throw error;
    }
  }

  return {
    fakeClient,
    parseCli,
    parseCliHelp,
    restore: () => {
      process.env.PM_ENDPOINT = previousEnv.PM_ENDPOINT;
      process.env.PM_USERNAME = previousEnv.PM_USERNAME;
      process.env.PM_PASSWORD = previousEnv.PM_PASSWORD;
      process.exitCode = previousExitCode;
      vi.restoreAllMocks();
    },
  };
}
