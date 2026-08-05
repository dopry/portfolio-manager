import type { PortfolioManager } from "../PortfolioManager.js";
import {
  parseIntArg,
  PortfolioManagerBaseCommand,
} from "./PortfolioManagerBaseCommand.js";

type WhatChangedOptions = {
  customerId: number;
  date: string;
  indent: number;
};

type WhatChangedFetcher = (
  pm: PortfolioManager,
  date: string,
  customerId: number,
) => Promise<number[]>;

abstract class PortfolioManagerWhatChangedLeafCommand extends PortfolioManagerBaseCommand {
  protected get examples(): string[] {
    return [
      `${this.getFullCommand()} --customerId 100 --date 2026-08-01`,
      `${this.getFullCommand()} --customerId 100 --date 2026-08-01 --indent 2`,
    ];
  }

  constructor(name: string) {
    super(name);
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

  protected getWhatChangedOptions(): WhatChangedOptions {
    return this.optsWithGlobals() as WhatChangedOptions;
  }

  protected printResult(result: Record<string, number[]>): void {
    console.log(
      JSON.stringify(result, null, this.getWhatChangedOptions().indent),
    );
  }
}

class PortfolioManagerWhatChangedResourceCommand extends PortfolioManagerWhatChangedLeafCommand {
  constructor(
    name: string,
    description: string,
    private readonly outputKey: string,
    private readonly fetchIds: WhatChangedFetcher,
  ) {
    super(name);
    this.description(description);
  }

  protected async _action(): Promise<void> {
    const pm = this.getPortfolioManagerClient();
    const { date, customerId } = this.getWhatChangedOptions();
    const ids = await this.fetchIds(pm, date, customerId);
    this.printResult({ [this.outputKey]: ids });
  }
}

class PortfolioManagerWhatChangedAllCommand extends PortfolioManagerWhatChangedLeafCommand {
  constructor() {
    super("all");
    this.description(
      "List changed property, property-use, and meter IDs for a connected customer",
    );
  }

  protected async _action(): Promise<void> {
    const pm = this.getPortfolioManagerClient();
    const { date, customerId } = this.getWhatChangedOptions();
    const propertyIds = await pm.getChangedPropertyIds(date, customerId);
    const propertyUseIds = await pm.getChangedPropertyUseIds(date, customerId);
    const meterIds = await pm.getChangedMeterIds(date, customerId);
    this.printResult({ propertyIds, propertyUseIds, meterIds });
  }
}

export class PortfolioManagerWhatChangedCommand extends PortfolioManagerBaseCommand {
  constructor() {
    super("what-changed");
    this.description("List changed resources for a connected customer");
    this.addCommand(new PortfolioManagerWhatChangedAllCommand());
    this.addCommand(
      new PortfolioManagerWhatChangedResourceCommand(
        "property",
        "List changed property IDs",
        "propertyIds",
        (pm, date, customerId) => pm.getChangedPropertyIds(date, customerId),
      ),
    );
    this.addCommand(
      new PortfolioManagerWhatChangedResourceCommand(
        "property-use",
        "List changed property-use IDs",
        "propertyUseIds",
        (pm, date, customerId) => pm.getChangedPropertyUseIds(date, customerId),
      ),
    );
    this.addCommand(
      new PortfolioManagerWhatChangedResourceCommand(
        "meter",
        "List changed meter IDs",
        "meterIds",
        (pm, date, customerId) => pm.getChangedMeterIds(date, customerId),
      ),
    );
  }
}
