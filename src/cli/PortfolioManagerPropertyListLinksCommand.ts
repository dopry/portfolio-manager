import { PortfolioManagerBaseCommand } from "./PortfolioManagerBaseCommand.js";

export class PortfolioManagerPropertyListLinksCommand extends PortfolioManagerBaseCommand {
  get examples() {
    return [
      "# customizing the output",
      `${this.getFullCommand()} --indent 2  --fields @_id @_hint`,
      "",
      "# using with JQ to map the output to shell scripting friendlier output",
      `${this.getFullCommand()}  | jq -r  '[.[] | ."@_id"] | @sh'`,
    ];
  }

  fields = ["@_id", "@_hint", "@_linkDescription", "@_link", "@_httpMethod"];

  defaultFields = ["@_id", "@_hint"];
  constructor() {
    super("links");
    this.description("List property links")
    this.addFieldsOption(this.fields, this.defaultFields)

  }

  protected async _action(): Promise<void> {
    const cmdOpts = this.opts();
    const propertyLinks =
      await this.getPortfolioManagerClient().getPropertyLinks();
    const mapped = Object.values(propertyLinks).map((property) =>
      this.pickFields(property, cmdOpts.fields)
    );
    const indent = cmdOpts.indent;
    console.log(JSON.stringify(mapped, null, indent));
  }
}
