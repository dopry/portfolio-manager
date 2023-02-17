import { PortfolioManagerBaseCommand } from "./PortfolioManagerBaseCommand";

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
      "space seperated list of Property ids to fetch meters for"
    );
  }
  protected async _action(): Promise<void> {
    const cmdOpts = this.opts();
    // write help text we don't want in output pipes to stderr
    console.error("list meter entities", cmdOpts);
    cmdOpts.fields.forEach((field: string) => {
      this.fields.includes(field) ||
        console.error(
          `${field} is not a valid field, options: ${this.fields.join(", ")}`
        );
    });
    const meters = await this.getPortfolioManagerClient().getMeters(
      cmdOpts.propertyId
    );
    const mapped = meters.map((meter: Record<string, any>) => {
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
