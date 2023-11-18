import { PortfolioManagerBaseCommand } from "./PortfolioManagerBaseCommand.js";
import { PortfolioManagerMeterListEntitiesCommand } from "./PortfolioManagerMeterListEntitiesCommand.js";
import { PortfolioManagerMeterListLinksCommand } from "./PortfolioManagerMeterListLinksCommand.js";

export class PortfolioManagerMeterListCommand extends PortfolioManagerBaseCommand {
  constructor() {
    super("list");
    this.addCommand(new PortfolioManagerMeterListEntitiesCommand());
    this.addCommand(new PortfolioManagerMeterListLinksCommand());
  }
}
