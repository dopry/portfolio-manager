import { PortfolioManagerBaseCommand } from "./PortfolioManagerBaseCommand.js";

export class PortfolioManagerMeterConsumptionGetCommand extends PortfolioManagerBaseCommand {
  protected meteredFields = [
    "id",
    "@_estimatedValue",
    "@_isGreenPower",
    "startDate",
    "endDate",
    "usage",
    "cost",
    "energyExportedOffSite",
    "greenPower",
    "RECOwnership",
    "demandTracking",
    "audit",
  ];

  protected deliveryFields = ["id", "deliveryDate", "quantity", "audit"];

  protected fields = [...this.meteredFields, ...this.deliveryFields];

  protected defaultFields = [
    "id",
    "@_estimatedValue",
    "startDate",
    "endDate",
    "usage",
    "cost",
    "deliveryDate",
    "quantity",
  ];

  protected get examples() {
    return [
      "# customizing the output",
      `${this.getFullCommand()} --meterId <meterId> --indent 2`,
      "",
      "# using with JQ to map the output to shell scripting friendlier output",
      `${this.getFullCommand()} --meterId <meterId> | jq -r '[.[] | .id] | @sh'`,
    ];
  }

  constructor() {
    super("get");
    this.requiredOption(
      "--meterId <meterId>",
      "meter to fetch consumption for"
    );
    this.option("--start [date]", "Start Date for consumption records");
    this.option("--end [date]", "End Date for consumption records");
    this.addFieldsOption(this.fields, this.defaultFields);
  }

  protected async _action(): Promise<void> {
    const cmdOpts = this.opts();
    console.error("get meter consumption", cmdOpts);
    cmdOpts.fields.forEach((field: string) => {
      this.fields.includes(field) ||
        console.error(
          `${field} is not a valid field, options: ${this.fields.join(", ")}`
        );
    });
    const { start = undefined, end = undefined } = cmdOpts;
    const client = this.getPortfolioManagerClient();
    const meterConsumption = await client.getMeterConsumption(
      cmdOpts.meterId,
      start,
      end
    );
    const mapped = meterConsumption.map((consumption: Record<string, any>) => {
      return cmdOpts.fields.reduce(
        (acc: Record<string, any>, field: string) => {
          acc[field] = consumption[field];
          return acc;
        },
        {}
      );
    });
    const indent = cmdOpts.indent ? parseInt(cmdOpts.indent) || 2 : undefined;
    console.log(JSON.stringify(mapped, null, indent));
  }
}
