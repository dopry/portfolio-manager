import { PortfolioManagerBaseCommand } from "./PortfolioManagerBaseCommand.js";

export class PortfolioManagerConnectionAcceptCommand extends PortfolioManagerBaseCommand {
  constructor() {
    super("accept");
    this.description("Accept a pending connection request");
    this.addPortfolioManagerOptions();
    this.requiredOption(
      "--accountId <id>",
      "The account ID of the pending connection to accept"
    );
    this.option(
      "--note <text>",
      "An optional note to send with the acceptance"
    );
  }

  protected async _action(): Promise<void> {
    const pm = this.getPortfolioManagerClient();
    const opts = this.opts();
    console.error(
      `Accepting connection request from account ID: ${opts.accountId}...`
    );
    await pm.acceptConnection(opts.accountId, opts.note);
    console.log(
      `Successfully accepted connection from account ID: ${opts.accountId}.`
    );
  }
}
