import { PortfolioManagerBaseCommand } from "./PortfolioManagerBaseCommand.js";

export class PortfolioManagerMeterAssociationGetCommand extends PortfolioManagerBaseCommand {
  _description = "Get meter associations";

  protected get examples() {
    return [
      "# customizing the output",
      `${this.getFullCommand()} --propertyId <propertyId> --indent 2`,
      "",
      "# using with JQ to map the output to shell scripting friendlier output",
      `portfolio-manager meter association get --propertyId <propertyId> | jq -r '[.[] | .id] | @sh'`,
    ];
  }

  constructor() {
    super("get");
    this.addPortfolioManagerOptions();
    this.requiredOption(
      "--propertyId <propertyId>",
      "property to fetch associated meters for"
    );
  }

  protected async _action(): Promise<void> {
    const cmdOpts = this.opts();
    const meterAssociation =
      await this.getPortfolioManagerClient().getAssociatedMeters(
        cmdOpts.propertyId
      );
    const indent = cmdOpts.indent;
    console.log(JSON.stringify(meterAssociation, null, indent));
  }
}
