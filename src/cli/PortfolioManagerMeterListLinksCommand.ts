import { PortfolioManagerBaseCommand } from "./PortfolioManagerBaseCommand.js";

export class PortfolioManagerMeterListLinksCommand extends PortfolioManagerBaseCommand {
  _description =
    "List all meters that belong to a property; they are not necessarily included in the property's metrics";
  fields = ["@_id", "@_hint", "@_linkDescription", "@_link", "@_httpMethod"];
  get examples() {
    return [
      "# customizing the output",
      `${this.getFullCommand()} --propertyId <propertyId> --indent 2  --fields @_id @_hint`,
      "",
      "# using with JQ to map the output to shell scripting friendlier output",
      `${this.getFullCommand()} --propertyId <propertyId> | jq -r  '[.[] | ."@_id"] | @sh'`,
    ];
  }
  constructor() {
    super("links");
    this.requiredOption(
      "--propertyId <propertyId>",
      "property id to fetch meters for"
    )
      .option("--myAccessOnly", "only fetch meters that I have access to")
      .addFieldsOption(this.fields, ["@_id", "@_hint"]);
  }

  protected async _action(): Promise<void> {
    const cmdOpts = this.opts();
    this.validateSelectedFields(cmdOpts.fields, this.fields);
    const meters = await this.getPortfolioManagerClient().getMeterLinks(
      cmdOpts.propertyId,
      cmdOpts.myAccessOnly
    );
    const mapped = meters.map((meter) =>
      this.pickFields(meter, cmdOpts.fields)
    );

    const indent = cmdOpts.indent;
    console.log(JSON.stringify(mapped, null, indent));
  }
}
