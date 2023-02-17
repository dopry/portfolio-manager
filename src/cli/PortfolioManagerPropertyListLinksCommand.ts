import { PortfolioManagerBaseCommand } from "./PortfolioManagerBaseCommand";

export class PortfolioManagerPropertyListLinksCommand extends PortfolioManagerBaseCommand {
  get examples() {
    return [
      "# customizing the output",
      `${this.getFullCommand()} property list links --indent 2  --fields @_id @_hint`,
      "",
      "# using with JQ to map the output to shell scripting friendlier output",
      `${this.getFullCommand()} property list links  | jq -r  '[.[] | ."@_id"] | @sh'`,
    ];
  }

  fields = ["@_id", "@_hint", "@_linkDescription", "@_link", "@_httpMethod"];

  defaultFields = ["@_id", "@_hint"];
  constructor() {
    super("links");
    this.description("List Properties")
    this.addFieldsOption(this.fields, this.defaultFields)

  }

  protected async _action(): Promise<void> {
    const cmdOpts = this.opts();
    // write help text we don't want in output pipes to stderr
    console.error("list property links", cmdOpts);
    const propertyLinks =
      await this.getPortfolioManagerClient().getPropertyLinks();
    const mapped = Object.values(propertyLinks).map(
      (property: Record<string, any>) => {
        return cmdOpts.fields.reduce(
          (acc: Record<string, any>, field: string) => {
            acc[field] = property[field];
            return acc;
          },
          {}
        );
      }
    );
    const indent = cmdOpts.indent ? parseInt(cmdOpts.indent) || 2 : undefined;
    console.log(JSON.stringify(mapped, null, indent));
  }
}
