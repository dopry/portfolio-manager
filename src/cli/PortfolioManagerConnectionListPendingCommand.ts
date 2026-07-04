import { PortfolioManagerBaseCommand } from "./PortfolioManagerBaseCommand.js";

export class PortfolioManagerConnectionListPendingCommand extends PortfolioManagerBaseCommand {
  constructor() {
    super("list-pending");
    this.description("List all pending connection requests from other users");
    this.addPortfolioManagerOptions();
  }

  protected async _action(): Promise<void> {
    const pm = this.getPortfolioManagerClient();
    const opts = this.opts();
    console.error("Fetching pending connection requests...");
    const connections = await pm.getPendingConnections();

    if (connections.length === 0) {
      console.error("No pending connection requests found.");
      return;
    }

    const indent = parseInt(opts.indent, 10) || 0;
    console.log(JSON.stringify(connections, null, indent));
  }
}
