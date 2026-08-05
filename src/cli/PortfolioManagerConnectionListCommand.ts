import { PortfolioManagerBaseCommand } from "./PortfolioManagerBaseCommand.js";

export class PortfolioManagerConnectionListCommand extends PortfolioManagerBaseCommand {
  protected get examples(): string[] {
    return [`${this.getFullCommand()}`, `${this.getFullCommand()} --indent 2`];
  }

  constructor() {
    super("list");
    this.description("List connected customers and their account IDs");
    this.addPortfolioManagerOptions();
  }

  protected async _action(): Promise<void> {
    const customers = await this.getPortfolioManagerClient().getCustomerList();
    const { indent } = this.optsWithGlobals();
    console.log(JSON.stringify(customers, null, indent));
  }
}
