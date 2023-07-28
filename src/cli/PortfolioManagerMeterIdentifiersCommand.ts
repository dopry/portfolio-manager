import { PortfolioManagerBaseCommand } from "./PortfolioManagerBaseCommand";

export class PortfolioManagerMeterIdentifiersCommand extends PortfolioManagerBaseCommand {
  _description = "Fetch additional identifiers for a meter.";
  fields = ["@_id", "value", "description", "additionalIdentifierType.@_description"];
  get examples() {
    return [
      "# customizing the output",
      `${this.name} meter identifiers --meterId <meterId> --indent 2  --fields @_id @_hint`,
      "",
      "# using with JQ to map the output to shell scripting friendlier output",
      `${this.name} meter identifiers --meterId <meterId> | jq -r  '[.[] | ."@_id"] | @sh'`,
    ];
  }
  constructor() {
    super("identifiers");
    this.requiredOption(
      "--meterId <meterId>",
      "space seperated list of meter ids to fetch additional identifiers for"
    )
      .option("--myAccessOnly", "only fetch meters that I have access to")
      .addFieldsOption(this.fields, ["@_id", "value", "description"]);
  }

  protected async _action(): Promise<void> {
    const cmdOpts = this.opts();
    console.error("meter identifiers", cmdOpts);
    cmdOpts.fields.forEach((field: string) => {
      this.fields.includes(field) ||
        console.error(
          `${field} is not a valid field, options: ${this.fields.join(", ")}`
        );
    });

    const additionalIdentifiers = await this.getPortfolioManagerClient().getMeterAdditionalIdentifiers(cmdOpts.meterId);
    const mapped = additionalIdentifiers.map((meter: Record<string, any>) => {
      return cmdOpts.fields.reduce(
        (acc: Record<string, any>, field: string) => {
          acc[field] = meter[field];
          return acc;
        },
        {}
      );
    });

    const indent = cmdOpts.indent ? parseInt(cmdOpts.indent) || 2 : undefined;
    console.log(JSON.stringify(mapped, null, indent));
  }
}
