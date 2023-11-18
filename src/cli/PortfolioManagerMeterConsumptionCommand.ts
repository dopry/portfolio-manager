import { PortfolioManagerBaseCommand } from "./PortfolioManagerBaseCommand.js";
import { PortfolioManagerMeterConsumptionGetCommand } from "./PortfolioManagerMeterConsumptionGetCommand.js";

export class PortfolioManagerMeterConsumptionCommand extends PortfolioManagerBaseCommand {
  constructor() {
    super("consumption");
    this.addCommand(new PortfolioManagerMeterConsumptionGetCommand());
  }
}
