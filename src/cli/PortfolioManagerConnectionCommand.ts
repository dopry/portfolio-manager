/**
 * @file
 * @module CLI.Connection
 * Commands for managing connections with other Portfolio Manager accounts.
 */

import { PortfolioManagerBaseCommand } from "./PortfolioManagerBaseCommand.js";
import { PortfolioManagerConnectionAcceptCommand } from "./PortfolioManagerConnectionAcceptCommand.js";
import { PortfolioManagerConnectionDisconnectCommand } from "./PortfolioManagerConnectionDisconnectCommand.js";
import { PortfolioManagerConnectionListPendingCommand } from "./PortfolioManagerConnectionListPendingCommand.js";
import { PortfolioManagerConnectionRejectCommand } from "./PortfolioManagerConnectionRejectCommand.js";

export class PortfolioManagerConnectionCommand extends PortfolioManagerBaseCommand {
  constructor() {
    super("connection");
    this.description("Manage connections with customer accounts");

    this.addCommand(new PortfolioManagerConnectionListPendingCommand());
    this.addCommand(new PortfolioManagerConnectionAcceptCommand());
    this.addCommand(new PortfolioManagerConnectionRejectCommand());
    this.addCommand(new PortfolioManagerConnectionDisconnectCommand());
  }
}
