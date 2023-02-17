import { PortfolioManagerBaseCommand } from "./PortfolioManagerBaseCommand";
import { PortfolioManagerMeterCommand } from "./PortfolioManagerMeterCommand";
import { PortfolioManagerPropertyCommand } from "./PortfolioManagerPropertyCommand";

export class PortfolioManagerCommand extends PortfolioManagerBaseCommand {
  constructor() {
    super("portfolio-manager");
    this.description("Portfolio Manager CLI");
    this.version("TODO: read from package.json");

    this.addCommand(new PortfolioManagerMeterCommand());
    this.addCommand(new PortfolioManagerPropertyCommand());
  }
}
