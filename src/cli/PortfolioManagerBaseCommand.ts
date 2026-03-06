import { Command, InvalidArgumentError, Option } from "commander";
import { formatExamplesHelpText } from "../functions/formatExamplesHelpText.js";
import { PortfolioManager } from "../PortfolioManager.js";
import { PortfolioManagerApi } from "../PortfolioManagerApi.js";
import { isRecord } from "../types/xml/response/IResponse.js";

export function parseIntArg(value: string): number {
  const parsedValue = Number.parseInt(value, 10);
  if (Number.isNaN(parsedValue)) {
    throw new InvalidArgumentError(`Invalid integer: ${value}`);
  }
  return parsedValue;
}


export class PortfolioManagerBaseCommand extends Command {

  protected fields: string[] = [];
  protected defaultFields = this.fields;

  protected get examples(): string[] {
    return [];
  }

  constructor(name: string) {
    super(name);
    this.option(
      "--indent <spaces>",
      "Indented output",
      parseIntArg,
      0
    );
    // pass examples in a callback so they will not be evaluated
    // until the parent has been added to the command so this.getFullCommand
    // is usable in example text.
    this.addHelpText("after", () => {
      const examples = this.examples;
      if (examples.length > 0) return formatExamplesHelpText(examples);
      return "";
    });
    this.action(() => this._action());
  }

  addFieldsOption(fields: string[], defaultFields = fields): this {
    this.fields = fields;
    this.defaultFields = defaultFields;
    this.option(
      "--fields [fields...]",
      `Fields to include. available fields: ${this.fields.join(", ")}`,
      this.defaultFields
    );
    return this;
  }

  addPortfolioManagerOptions(): this {
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
        "Portfolio Manager password, strongly recommend using the env var over the cli option so password isn't exposed to `ps`"
      )
        .env("PM_PASSWORD")
        .makeOptionMandatory()
    );
    return this;
  }

  getPortfolioManagerClient(): PortfolioManager {
    const opts = this.opts();
    const { pmEndpoint, pmUsername, pmPassword } = opts;
    if (typeof pmEndpoint !== "string" || typeof pmUsername !== "string" || typeof pmPassword !== "string") {
      throw new InvalidArgumentError(
        "Portfolio Manager options are not configured. Call addPortfolioManagerOptions() in the command constructor."
      );
    }
    const apiClient = new PortfolioManagerApi(
      pmEndpoint,
      pmUsername,
      pmPassword
    );
    const client = new PortfolioManager(apiClient);
    return client;
  }

  protected pickFields(entity: unknown, fields: string[]): Record<string, unknown> {
    if (!isRecord(entity)) {
      throw new Error("Expected entity to be a record");
    }
    const result: Record<string, unknown> = {};
    for (const field of fields) {
     if (field in entity) {
        result[field] = entity[field];
      }
      else {
        result[field] = undefined;
      }
    }
    return result;
  }

  protected validateSelectedFields(selectedFields: string[], allowedFields: string[]): void {
    const invalidFields = selectedFields.filter(
      (field) => !allowedFields.includes(field)
    );
    if (invalidFields.length > 0) {
      throw new InvalidArgumentError(
        `Invalid field(s): ${invalidFields.join(", ")}. Available fields: ${allowedFields.join(", ")}`
      );
    }
  }

  protected getFullCommand(): string {
    return this._getCommandAndParents()
      .reverse()
      .map((c) => c.name())
      .join(" ");
  }

  protected _getCommandAndParents(): Command[] {
    const result: Command[] = [];
    for (
      let command: Command | null = this;
      command;
      command = command.parent
    ) {
      result.push(command);
    }
    return result;
  }

  protected async _action(): Promise<void> {
    // show help text as default action for all commands
    // ensure 'group' commands provide a user guidance on
    // available sub commands
    this.help();
  }
}
