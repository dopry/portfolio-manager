import { PortfolioManagerBaseCommand } from "./PortfolioManagerBaseCommand.js";

export class PortfolioManagerConnectionRejectCommand extends PortfolioManagerBaseCommand {
  constructor() {
    super("reject");
    this.description("Reject a pending connection request");
    this.addPortfolioManagerOptions();
    this.requiredOption(
      "--accountId <id>",
      "The account ID of the pending connection to reject"
    );
    this.option("--note <text>", "An optional note to send with the rejection");
  }

  protected async _action(): Promise<void> {
    const pm = this.getPortfolioManagerClient();
    const opts = this.opts();
    console.error(
      `Rejecting connection request from account ID: ${opts.accountId}...`
    );
    await pm.rejectConnection(opts.accountId, opts.note);
    console.log(
      `Successfully rejected connection from account ID: ${opts.accountId}.`
    );
  }
}
