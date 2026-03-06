import { PortfolioManagerBaseCommand } from "./PortfolioManagerBaseCommand.js";

export class PortfolioManagerMeterIdentifiersCommand extends PortfolioManagerBaseCommand {
  _description = "Fetch additional identifiers for a meter.";
  fields = ["@_id", "value", "description", "additionalIdentifierType.@_description"];
  get examples() {
    return [
      "# customizing the output",
      `${this.getFullCommand()} --meterId <meterId> --indent 2  --fields @_id additionalIdentifierType.@_description`,
      "",
      "# using with JQ to map the output to shell scripting friendlier output",
      `${this.getFullCommand()} --meterId <meterId> | jq -r  '[.[] | ."@_id"] | @sh'`,
    ];
  }
  constructor() {
    super("identifiers");
    this.requiredOption(
      "--meterId <meterId>",
      "meter id to fetch additional identifiers for"
    )
      .option("--myAccessOnly", "only fetch meters that I have access to")
      .addPortfolioManagerOptions()
      .addFieldsOption(this.fields, ["@_id", "value", "description"]);
  }

  protected async _action(): Promise<void> {
    const cmdOpts = this.opts();
    this.validateSelectedFields(cmdOpts.fields, this.fields);

    const additionalIdentifiers = await this.getPortfolioManagerClient().getMeterAdditionalIdentifiers(cmdOpts.meterId);
    const mapped = additionalIdentifiers.map((meter) =>
      this.pickFields(meter, cmdOpts.fields)
    );

    const indent = cmdOpts.indent;
    console.log(JSON.stringify(mapped, null, indent));
  }
}
