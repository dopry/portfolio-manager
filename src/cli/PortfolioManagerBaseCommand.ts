import { Command, Option } from "commander";
import { formatExamplesHelpText } from "../functions/formatExamplesHelpText";
import { PortfolioManager } from "../PortfolioManager";
import { PortfolioManagerApi } from "../PortfolioManagerApi";

export class PortfolioManagerBaseCommand extends Command {
  protected fields: string[] = [];
  protected defaultFields = this.fields;

  protected get examples(): string[] {
    return [];
  }

  constructor(name: string) {
    super(name);
    this.addOption(
      new Option(
        "--pm-endpoint <endpoint>",
        "Portfolio Manager Endpoint, prod: https://portfoliomanager.energystar.gov/ws/, test: https://portfoliomanager.energystar.gov/wstest/"
      )
        .default("https://portfoliomanager.energystar.gov/ws/")
        .env("PM_ENDPOINT")
    );
    this.addOption(
      new Option("--pm-username <username>", "Portfolio Manager username")
        .env("PM_USERNAME")
        .makeOptionMandatory()
    );
    this.addOption(
      new Option(
        "--pm-password <password>",
        "Portfolio Manager password, strongly recommend using the env var over the cli option so password isn't expose to `ps`"
      )
        .env("PM_PASSWORD")
        .makeOptionMandatory()
    );
    this.option("--indent <spaces>", "Indented output", "0");
    // pass examples in a callback so they will not be evaluated
    // until the parent has been added to the command so this.getFullCommand
    // is usable in example text.
    this.addHelpText("after", () => {
      const examples = this.examples;
      if (examples.length > 0) return formatExamplesHelpText(examples)
      return ''
    });
    this.action(() => this._action());
  }

  addFieldsOption(fields: string[], defaultFields = fields) {
    this.fields = fields;
    this.defaultFields = defaultFields;
    this.option(
      "--fields [fields...]",
      `Fields to include. available fields: ${this.fields.join(", ")}`,
      this.defaultFields
    );
  }

  getPortfolioManagerClient(): PortfolioManager {
    const opts = this.opts();
    const { pmEndpoint, pmUsername, pmPassword } = opts;
    const apiClient = new PortfolioManagerApi(
      pmEndpoint,
      pmUsername,
      pmPassword
    );
    const client = new PortfolioManager(apiClient);
    return client;
  }

  protected getFullCommand(): string {
    return this._getCommandAndParents().reverse().map(c => c.name()).join(" ");
  }

  protected _getCommandAndParents(): Command[] {
    const result: Command[] = [];
    for (let command: Command | null = this; command; command = command.parent) {
      result.push(command);
    }
    return result;
  }

  protected async _action(): Promise<void> {}
}
