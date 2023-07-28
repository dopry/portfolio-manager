import { PortfolioManagerBaseCommand } from "./PortfolioManagerBaseCommand";
import { PortfolioManagerMeterAssociationGetCommand } from "./PortfolioManagerMeterAssociationGetCommand";
import { PortfolioManagerMeterAssociationListCommand } from "./PortfolioManagerMeterAssociationListCommand";

export class PortfolioManagerMeterAssociationCommand extends PortfolioManagerBaseCommand {
  _description = "List meters that are included in metrics for a property";
  constructor() {
    super("association");
    this.addCommand(new PortfolioManagerMeterAssociationGetCommand());
    this.addCommand(new PortfolioManagerMeterAssociationListCommand());
  }
}
