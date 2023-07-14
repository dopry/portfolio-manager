import { PortfolioManagerAccountCreateCommand } from "./PortfolioManagerAccountCreateCommand";
import { PortfolioManagerBaseCommand } from "./PortfolioManagerBaseCommand";


export class PortfolioManagerAccountCommand extends PortfolioManagerBaseCommand {
  constructor() {
    super("account");
    this.addCommand(new PortfolioManagerAccountCreateCommand());
  }
}
