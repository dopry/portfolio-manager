import { PortfolioManagerBaseCommand } from "./PortfolioManagerBaseCommand.js";

export class PortfolioManagerConnectionDisconnectCommand extends PortfolioManagerBaseCommand {
  constructor() {
    super("disconnect");
    this.description("Disconnect from a connected account");
    this.addPortfolioManagerOptions();
    this.requiredOption(
      "--accountId <id>",
      "The account ID to disconnect from"
    );
    this.option(
      "--keep-shares",
      "If specified, existing property and meter shares will not be removed"
    );
    this.option(
      "--note <text>",
      "An optional note explaining the reason for disconnection"
    );
  }

  protected async _action(): Promise<void> {
    const pm = this.getPortfolioManagerClient();
    const opts = this.opts();
    console.error(`Disconnecting from account ID: ${opts.accountId}...`);
    await pm.disconnect(opts.accountId, {
      keepShares: opts.keepShares,
      note: opts.note,
    });
    console.log(
      `Successfully disconnected from account ID: ${opts.accountId}.`
    );
  }
}
