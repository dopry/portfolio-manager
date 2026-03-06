import { readFileSync } from "node:fs";
import { PortfolioManagerBaseCommand } from "./PortfolioManagerBaseCommand.js";
import { PortfolioManagerMeterCommand } from "./PortfolioManagerMeterCommand.js";
import { PortfolioManagerPropertyCommand } from "./PortfolioManagerPropertyCommand.js";

function getPackageVersion(): string {
  // TODO: embed at build time instead of reading from file at runtime
  try {
    const packageJsonPath = new URL("../../package.json", import.meta.url);
    const packageJsonRaw = readFileSync(packageJsonPath, "utf8");
    const packageJson = JSON.parse(packageJsonRaw) as { version?: string };
    return packageJson.version || "0.0.0";
  } catch {
    return "0.0.0";
  }
}

export class PortfolioManagerCommand extends PortfolioManagerBaseCommand {
  constructor() {
    super("portfolio-manager");
    this.description("Portfolio Manager CLI");
    this.version(getPackageVersion());

    this.addCommand(new PortfolioManagerMeterCommand());
    this.addCommand(new PortfolioManagerPropertyCommand());
  }
}
