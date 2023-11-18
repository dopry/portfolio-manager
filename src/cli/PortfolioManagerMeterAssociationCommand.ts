import { PortfolioManagerBaseCommand } from "./PortfolioManagerBaseCommand.js";
import { PortfolioManagerMeterAssociationGetCommand } from "./PortfolioManagerMeterAssociationGetCommand.js";
import { PortfolioManagerMeterAssociationListCommand } from "./PortfolioManagerMeterAssociationListCommand.js";

export class PortfolioManagerMeterAssociationCommand extends PortfolioManagerBaseCommand {
  _description = "List meters that are included in metrics for a property";
  constructor() {
    super("association");
    this.addCommand(new PortfolioManagerMeterAssociationGetCommand());
    this.addCommand(new PortfolioManagerMeterAssociationListCommand());
  }
}
