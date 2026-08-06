import { readFile } from "node:fs/promises";
import {
  parseIntArg,
  PortfolioManagerBaseCommand,
} from "./PortfolioManagerBaseCommand.js";

async function readStandardInput(): Promise<string> {
  const chunks: Buffer[] = [];
  for await (const chunk of process.stdin) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  }
  return Buffer.concat(chunks).toString("utf8");
}

export class PortfolioManagerPropertyImportCommand extends PortfolioManagerBaseCommand {
  protected get examples() {
    return [
      `${this.getFullCommand()} property.json --dry-run`,
      `${this.getFullCommand()} property.json --account-id 456`,
      `cat property.json | ${this.getFullCommand()} -`,
    ];
  }

  constructor() {
    super("import");
    this.description("Import properties from a portable JSON bundle");
    this.argument("<file>", "Input file, or - for stdin");
    this.option(
      "--account-id <id>",
      "Target Portfolio Manager account id",
      parseIntArg,
    );
    this.option(
      "--dry-run",
      "Validate and summarize without creating data",
      false,
    );
    this.option(
      "--keep-partial",
      "Keep properties created before a failure",
      false,
    );
    this.option("--name-prefix <prefix>", "Prefix imported property names");
    this.option("--name-suffix <suffix>", "Suffix imported property names");
    this.addPortfolioManagerOptions();
  }

  protected async _action(): Promise<void> {
    const file = this.args[0];
    const options = this.opts<{
      accountId?: number;
      dryRun: boolean;
      keepPartial: boolean;
      namePrefix?: string;
      nameSuffix?: string;
    }>();
    const raw =
      file === "-" ? await readStandardInput() : await readFile(file, "utf8");
    let bundle: unknown;
    try {
      bundle = JSON.parse(raw) as unknown;
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      throw new TypeError(`Invalid JSON in ${file}: ${message}`, {
        cause: error,
      });
    }

    const result = await this.getPortfolioManagerClient().importProperties(
      bundle,
      {
        accountId: options.accountId,
        dryRun: options.dryRun,
        keepPartial: options.keepPartial,
        namePrefix: options.namePrefix,
        nameSuffix: options.nameSuffix,
      },
    );
    console.log(JSON.stringify(result, null, this.getResolvedIndent()));
    if (result.status === "failed") {
      process.exitCode = 1;
    }
  }
}
