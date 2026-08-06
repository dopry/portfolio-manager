import { writeFile } from "node:fs/promises";
import { InvalidArgumentError } from "commander";
import { serializePropertyBundle } from "../PropertyBundle.js";
import {
  parseIntArg,
  PortfolioManagerBaseCommand,
} from "./PortfolioManagerBaseCommand.js";

export class PortfolioManagerPropertyExportCommand extends PortfolioManagerBaseCommand {
  protected get examples() {
    return [
      `${this.getFullCommand()} --output property.json 123`,
      `${this.getFullCommand()} --all --output portfolio.json`,
      `${this.getFullCommand()} 123 | jq .`,
    ];
  }

  constructor() {
    super("export");
    this.description("Export properties to a portable JSON bundle");
    this.argument("[propertyIds...]", "Property ids to export");
    this.option("--all", "Export all accessible properties", false);
    this.option("-o, --output <file>", "Output file, or - for stdout", "-");
    this.option("--force", "Overwrite an existing output file", false);
    this.options.find((option) => option.long === "--indent")?.default(2);
    this.addPortfolioManagerOptions();
  }

  protected async _action(): Promise<void> {
    const options = this.opts<{
      all: boolean;
      output: string;
      force: boolean;
    }>();
    const propertyIds = this.args.map((value) => parseIntArg(value));
    const hasExplicitPropertyIds = propertyIds.length > 0;
    if (options.all === hasExplicitPropertyIds) {
      throw new InvalidArgumentError(
        "Provide either one or more property ids or --all",
      );
    }

    const client = this.getPortfolioManagerClient();
    const ids = options.all
      ? (await client.getProperties()).map((property) => property.id)
      : propertyIds;
    if (ids.length === 0) {
      throw new InvalidArgumentError(
        "No accessible properties found to export",
      );
    }
    const bundle = await client.exportProperties(ids);
    const json = serializePropertyBundle(bundle, this.getResolvedIndent());

    if (options.output === "-") {
      console.log(json);
    } else {
      await writeFile(options.output, `${json}\n`, {
        encoding: "utf8",
        flag: options.force ? "w" : "wx",
      });
    }
  }
}
