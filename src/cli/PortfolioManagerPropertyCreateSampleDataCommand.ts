import { PortfolioManagerBaseCommand } from "./PortfolioManagerBaseCommand";
import { parseIntOption } from "./parseIntOption";

export class PortfolioManagerPropertyCreateSampleDataCommand extends PortfolioManagerBaseCommand {
  protected _description = "Create Sample Properties for testing";
  protected get examples() {
    return [
      `${this.getFullCommand()} property create-samples  --countryCode US --createCount 10`,
    ];
  }
  protected fields = [];
  protected defaultFields = this.fields;

  constructor() {
    super("create-samples");
    this.addFieldsOption(this.fields, this.defaultFields);
    this.option(
      "--countryCode <countryCode>",
      `country code to create samples for: US, CA`,
      "US"
    );
    this.option(
      "--createCount <count>",
      "number of sample properties to creat, default 10",
      parseIntOption,
      10
    );
    this.option<number>(
      "--indent <spaces>",
      "Indented output",
      parseIntOption,
      0
    );
  }

  protected async _action(): Promise<void> {
    // write help text we don't want in output pipes to stderr
    // console.error("list property metrics monthly", cmdOpts);
    const {
      countryCode,
      createCount,
    } = this.opts();
    const pmClient = this.getPortfolioManagerClient();
    await pmClient.createSampleProperties(
      countryCode,
      createCount,
    );
  }
}
