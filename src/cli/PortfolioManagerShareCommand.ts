import { PortfolioManagerBaseCommand } from "./PortfolioManagerBaseCommand.js";
import { Option } from "commander";

export class PortfolioManagerShareCommand extends PortfolioManagerBaseCommand {
  constructor() {
    super("share");
    this.description("Manage pending property and meter shares");

    this.addCommand(new PortfolioManagerShareListPendingCommand());
    this.addCommand(new PortfolioManagerShareAcceptCommand());
    this.addCommand(new PortfolioManagerShareRejectCommand());
    this.addCommand(new PortfolioManagerShareRemoveCommand());
  }
}

class PortfolioManagerShareListPendingCommand extends PortfolioManagerBaseCommand {
  constructor() {
    super("list-pending");
    this.description("List pending property or meter share requests");
    this.addPortfolioManagerOptions();
  }
  protected async _action(): Promise<void> {
    const pm = this.getPortfolioManagerClient();
    const indent = parseInt(this.opts().indent, 10) || 0;

    console.error("Fetching pending property shares...");
    const propertyShares = await pm.getPendingPropertyShares();
    console.error("Fetching pending meter shares...");
    const meterShares = await pm.getPendingMeterShares();

    const allShares = [...propertyShares, ...meterShares];
    if (allShares.length === 0) {
      console.error("No pending share requests found.");
      return;
    }
    console.log(JSON.stringify(allShares, null, indent));
  }
}

class PortfolioManagerShareAcceptCommand extends PortfolioManagerBaseCommand {
  constructor() {
    super("accept");
    this.description("Accept a pending property or meter share");
    this.addOption(
      new Option("--type <type>", "The type of share to accept")
        .choices(["property", "meter"])
        .makeOptionMandatory()
    );
    this.requiredOption(
      "--id <id>",
      "The ID of the property or meter share to accept"
    );
    this.option(
      "--note <text>",
      "An optional note to send with the acceptance"
    );
  }
  protected async _action(): Promise<void> {
    const pm = this.getPortfolioManagerClient();
    const { type, id, note } = this.opts();
    console.error(`Accepting ${type} share for ID: ${id}...`);
    if (type === "property") {
      await pm.acceptPropertyShare(id, note);
    } else {
      await pm.acceptMeterShare(id, note);
    }
    console.log(`Successfully accepted ${type} share for ID: ${id}.`);
  }
}

class PortfolioManagerShareRejectCommand extends PortfolioManagerBaseCommand {
  constructor() {
    super("reject");
    this.description("Reject a pending property or meter share");
    this.addOption(
      new Option("--type <type>", "The type of share to reject")
        .choices(["property", "meter"])
        .makeOptionMandatory()
    );
    this.requiredOption(
      "--id <id>",
      "The ID of the property or meter share to reject"
    );
    this.option("--note <text>", "An optional note to send with the rejection");
  }
  protected async _action(): Promise<void> {
    const pm = this.getPortfolioManagerClient();
    const { type, id, note } = this.opts();
    console.error(`Rejecting ${type} share for ID: ${id}...`);
    if (type === "property") {
      await pm.rejectPropertyShare(id, note);
    } else {
      await pm.rejectMeterShare(id, note);
    }
    console.log(`Successfully rejected ${type} share for ID: ${id}.`);
  }
}

class PortfolioManagerShareRemoveCommand extends PortfolioManagerBaseCommand {
  constructor() {
    super("remove");
    this.description("Remove (unshare) an existing property or meter share");
    this.addOption(
      new Option("--type <type>", "The type of share to remove")
        .choices(["property", "meter"])
        .makeOptionMandatory()
    );
    this.requiredOption(
      "--id <id>",
      "The ID of the property or meter to unshare"
    );
    this.option("--note <text>", "An optional note explaining the reason");
  }
  protected async _action(): Promise<void> {
    const pm = this.getPortfolioManagerClient();
    const { type, id, note } = this.opts();
    console.error(`Removing ${type} share for ID: ${id}...`);
    if (type === "property") {
      await pm.unshareProperty(id, note);
    } else {
      await pm.unshareMeter(id, note);
    }
    console.log(`Successfully removed ${type} share for ID: ${id}.`);
  }
}
