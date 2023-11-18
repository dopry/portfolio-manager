import { PortfolioManagerBaseCommand } from "./PortfolioManagerBaseCommand.js";
import { PortfolioManagerMeterCommand } from "./PortfolioManagerMeterCommand.js";
import { PortfolioManagerPropertyCommand } from "./PortfolioManagerPropertyCommand.js";

export class PortfolioManagerCommand extends PortfolioManagerBaseCommand {
  constructor() {
    super("portfolio-manager");
    this.description("Portfolio Manager CLI");
    this.version("TODO: read from package.json");

    this.addCommand(new PortfolioManagerMeterCommand());
    this.addCommand(new PortfolioManagerPropertyCommand());
  }
}
