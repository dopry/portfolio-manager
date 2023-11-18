import { PortfolioManagerBaseCommand } from "./PortfolioManagerBaseCommand.js";
import { PortfolioManagerMeterAssociationCommand } from "./PortfolioManagerMeterAssociationCommand.js";
import { PortfolioManagerMeterConsumptionCommand } from "./PortfolioManagerMeterConsumptionCommand.js";
import { PortfolioManagerMeterIdentifiersCommand } from "./PortfolioManagerMeterIdentifiersCommand.js";
import { PortfolioManagerMeterListCommand } from "./PortfolioManagerMeterListCommand.js";

export class PortfolioManagerMeterCommand extends PortfolioManagerBaseCommand {
  constructor() {
    super("meter");
    this.addCommand(new PortfolioManagerMeterAssociationCommand());
    this.addCommand(new PortfolioManagerMeterConsumptionCommand());
    this.addCommand(new PortfolioManagerMeterListCommand());
    this.addCommand(new PortfolioManagerMeterIdentifiersCommand());
  }
}
