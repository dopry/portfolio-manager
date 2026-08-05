import { PortfolioManagerBaseCommand } from "./PortfolioManagerBaseCommand.js";

export class PortfolioManagerAccountGetCommand extends PortfolioManagerBaseCommand {
  protected get examples(): string[] {
    return [`${this.getFullCommand()}`, `${this.getFullCommand()} --indent 2`];
  }

  constructor() {
    super("get");
    this.description(
      "Get the authenticated account ID and identifying details",
    );
    this.addPortfolioManagerOptions();
  }

  protected async _action(): Promise<void> {
    const account = await this.getPortfolioManagerClient().getAccount();
    const { indent } = this.optsWithGlobals();
    console.log(
      JSON.stringify(
        {
          id: account.id,
          username: account.username,
          organizationName: account.organization["@_name"],
        },
        null,
        indent,
      ),
    );
  }
}
