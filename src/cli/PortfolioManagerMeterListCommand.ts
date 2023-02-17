import { PortfolioManagerBaseCommand } from "./PortfolioManagerBaseCommand";
import { PortfolioManagerMeterListEntitiesCommand } from "./PortfolioManagerMeterListEntitiesCommand";
import { PortfolioManagerMeterListLinksCommand } from "./PortfolioManagerMeterListLinksCommand";

export class PortfolioManagerMeterListCommand extends PortfolioManagerBaseCommand {
  constructor() {
    super("list");
    this.addCommand(new PortfolioManagerMeterListEntitiesCommand());
    this.addCommand(new PortfolioManagerMeterListLinksCommand());
  }
}
