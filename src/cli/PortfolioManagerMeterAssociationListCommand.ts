import { PortfolioManagerBaseCommand } from "./PortfolioManagerBaseCommand.js";

export class PortfolioManagerMeterAssociationListCommand extends PortfolioManagerBaseCommand {
  _description = "List meters that are included in metrics for a property";

  protected get examples() {
    return [
      "# customizing the output",
      `${this.getFullCommand()} --propertyIds <propertyId...> --indent 2`,
      "",
      "# using with JQ to map the output to shell scripting friendlier output",
      `${this.getFullCommand()} --propertyIds <propertyId...> | jq -r '[.[] | .id] | @sh'`,
    ];
  }
  constructor() {
    super("list");
    this.requiredOption(
      "--propertyIds <propertyId...>",
      "properties to fetch associated meters for"
    );
  }

  protected async _action(): Promise<void> {
    const cmdOpts = this.opts();
    const meterAssociation =
      await this.getPortfolioManagerClient().getMetersPropertiesAssociation(
        cmdOpts.propertyIds || []
      );
    const indent = cmdOpts.indent;
    console.log(JSON.stringify(meterAssociation, null, indent));
  }
}
