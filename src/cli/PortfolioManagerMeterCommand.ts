import { PortfolioManagerBaseCommand } from "./PortfolioManagerBaseCommand";
import { PortfolioManagerMeterAssociationCommand } from "./PortfolioManagerMeterAssociationCommand";
import { PortfolioManagerMeterConsumptionCommand } from "./PortfolioManagerMeterConsumptionCommand";
import { PortfolioManagerMeterListCommand } from "./PortfolioManagerMeterListCommand";

export class PortfolioManagerMeterCommand extends PortfolioManagerBaseCommand {
  constructor() {
    super("meter");
    this.addCommand(new PortfolioManagerMeterAssociationCommand());
    this.addCommand(new PortfolioManagerMeterConsumptionCommand());
    this.addCommand(new PortfolioManagerMeterListCommand());
  }
}
