import { PortfolioManagerBaseCommand } from "./PortfolioManagerBaseCommand";

export class PortfolioManagerMeterAssociationListCommand extends PortfolioManagerBaseCommand {
  _description = "List meters that are included in metrics for a property";

  protected get examples() {
    return [
      "# customizing the output",
      `${this.name} meter asscociation list --propertyIds <propertyId...> --indent 2`,
      "",
      "# using with JQ to map the output to shell scripting friendlier output",
      `${this.name} meter asscociation list --propertyIds <propertyId...> | jq -r '[.[] | .id] | @sh'`,
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
    console.error("meter association list", cmdOpts);
    const meterAssociation =
      await this.getPortfolioManagerClient().getMetersPropertiesAssociation(
        cmdOpts.propertyIds || []
      );
    const indent = cmdOpts.indent ? parseInt(cmdOpts.indent) || 2 : undefined;
    console.log(JSON.stringify(meterAssociation, null, indent));
  }
}
