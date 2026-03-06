import { PortfolioManagerBaseCommand } from "./PortfolioManagerBaseCommand.js";

export class PortfolioManagerMeterListEntitiesCommand extends PortfolioManagerBaseCommand {
  _description = "List Meters";
  fields = [
    "id",
    "type",
    "name",
    "metered",
    "unitOfMeasure",
    "firstBillDate",
    "inUse",
    "inactiveDate",
    "otherDescription",
    "accessLevel",
    "aggregateMeter",
    "audit",
  ];
  protected get examples() {
    return [
      "# customizing the output",
      `${this.getFullCommand()} meter list entities --propertyId <propertyId> --indent 2  --fields id name metered`,
      "",
      "# using with JQ to map the output to shell scripting friendlier output",
      `${this.getFullCommand()} meter list entities --propertyId <propertyId> | jq -r '[.[] | .id] | @sh'`,
    ];
  }
  constructor() {
    super("entities");
    this.addFieldsOption(this.fields, ["id", "name"]);
    this.requiredOption(
      "--propertyId <propertyIds...>",
      "space separated list of property ids to fetch meters for"
    );
  }
  protected async _action(): Promise<void> {
    const cmdOpts = this.opts();
    this.validateSelectedFields(cmdOpts.fields, this.fields);
    const meters = await this.getPortfolioManagerClient().getMeters(
      cmdOpts.propertyId
    );
    const mapped = meters.map((meter) =>
      this.pickFields(meter, cmdOpts.fields)
    );
    const indent = cmdOpts.indent;
    console.log(JSON.stringify(mapped, null, indent));
  }
}
