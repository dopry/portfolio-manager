import { PortfolioManagerBaseCommand } from "./PortfolioManagerBaseCommand.js";
import { PortfolioManagerAccountGetCommand } from "./PortfolioManagerAccountGetCommand.js";

export class PortfolioManagerAccountCommand extends PortfolioManagerBaseCommand {
  constructor() {
    super("account");
    this.description("Inspect the authenticated Portfolio Manager account");
    this.addCommand(new PortfolioManagerAccountGetCommand());
  }
}
