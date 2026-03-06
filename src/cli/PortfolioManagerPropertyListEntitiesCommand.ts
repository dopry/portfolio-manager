import { PortfolioManagerBaseCommand } from "./PortfolioManagerBaseCommand.js";

export class PortfolioManagerPropertyListEntitiesCommand extends PortfolioManagerBaseCommand {
  get examples() {
    return [
      "# customizing the output",
      `${this.name} property list entities --indent 2  --fields id name yearBuilt`,
      "",
      "# using with JQ to map the output to shell scripting friendlier output",
      `${this.name} property list entities | jq -r '[.[] | .id] | @sh'`,
    ];
  }
  fields = [
    "id",
    "name",
    "primaryFunction",
    "grossFloorArea",
    "yearBuilt",
    "address",
    "numberOfBuidings",
    "occupancyPercentage",
    "notes",
  ];

  defaultFields = ["id", "name"];
  _description = "List Properties"
  constructor() {
    super("entities");
    this.addFieldsOption(this.fields, this.defaultFields)

  }

  protected async _action(): Promise<void> {
    const cmdOpts = this.opts();
    // write help text we don't want in output pipes to stderr
    console.error("list property entities", cmdOpts);

    const properties = await this.getPortfolioManagerClient().getProperties();
    const mapped = properties.map((property) =>
      this.pickFields(property, cmdOpts.fields)
    );
    const indent = cmdOpts.indent;
    console.log(JSON.stringify(mapped, null, indent));
  }
}
