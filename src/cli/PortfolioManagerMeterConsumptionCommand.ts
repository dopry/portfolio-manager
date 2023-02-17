import { PortfolioManagerBaseCommand } from "./PortfolioManagerBaseCommand";
import { PortfolioManagerMeterConsumptionGetCommand } from "./PortfolioManagerMeterConsumptionGetCommand";

export class PortfolioManagerMeterConsumptionCommand extends PortfolioManagerBaseCommand {
  constructor() {
    super("consumption");
    this.addCommand(new PortfolioManagerMeterConsumptionGetCommand())
  }
}