import {
  parseIntArg,
  PortfolioManagerBaseCommand,
} from "./PortfolioManagerBaseCommand.js";

export class PortfolioManagerWhatChangedCommand extends PortfolioManagerBaseCommand {
  protected get examples(): string[] {
    return [
      `${this.getFullCommand()} --customerId 100 --date 2026-08-01`,
      `${this.getFullCommand()} --customerId 100 --date 2026-08-01 --indent 2`,
    ];
  }

  constructor() {
    super("what-changed");
    this.description(
      "List changed property, property-use, and meter IDs for a connected customer",
    );
    this.addPortfolioManagerOptions();
    this.requiredOption(
      "--customerId <id>",
      "Connected customer account ID",
      parseIntArg,
    );
    this.requiredOption(
      "--date <YYYY-MM-DD>",
      "Beginning of the change window",
    );
  }

  protected async _action(): Promise<void> {
    const pm = this.getPortfolioManagerClient();
    const opts = this.optsWithGlobals();
    const propertyIds = await pm.getChangedPropertyIds(
      opts.date,
      opts.customerId,
    );
    const propertyUseIds = await pm.getChangedPropertyUseIds(
      opts.date,
      opts.customerId,
    );
    const meterIds = await pm.getChangedMeterIds(opts.date, opts.customerId);

    console.log(
      JSON.stringify(
        { propertyIds, propertyUseIds, meterIds },
        null,
        opts.indent,
      ),
    );
  }
}
