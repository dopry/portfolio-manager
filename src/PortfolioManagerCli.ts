import { Command, Option } from "commander";
import { PortfolioManager } from "./PortfolioManager";
import { PortfolioManagerApi } from "./PortfolioManagerApi";
import { formatExamplesHelpText } from "./functions/formatExamplesHelpText";
import { METRICS } from "./types";

export class PortfolioManagerCli {
  name = "portfolio-manager";

  // #region cli
  protected _cli?: Command;
  public get cli() {
    if (!this._cli) this._cli = this.cliConfigure();
    return this._cli;
  }
  cliConfigure(): Command {
    return new Command()
      .name(this.name)
      .description("Portfolio Manager CLI tool")
      .version("TODO, read from pacakge.json")
      .addOption(
        new Option(
          "--pm-endpoint <endpoint>",
          "Portfolio Manager Endpoint, prod: https://portfoliomanager.energystar.gov/ws/, test: https://portfoliomanager.energystar.gov/wstest/"
        )
          .default("https://portfoliomanager.energystar.gov/ws/")
          .env("PM_ENDPOINT")
      )
      .addOption(
        new Option("--pm-username <username>", "Portfolio Manager username")
          .env("PM_USERNAME")
          .makeOptionMandatory()
      )
      .addOption(
        new Option(
          "--pm-password <password>",
          "Portfolio Manager password, strongly recommend using the env var over the cli option so password isn't expose to `ps`"
        )
          .env("PM_PASSWORD")
          .makeOptionMandatory()
      );
  }
  // #endregion cli

  // #region meter
  protected _meterCommand?: Command;
  public get meterCommand() {
    if (!this._meterCommand) this._meterCommand = this.meterCommandConfigure();
    return this._meterCommand;
  }
  meterCommandConfigure(): Command {
    return this.cli.command("meter");
  }
  // #endregion meter

  // #region meter association
  protected _meterAssociationCommand?: Command;
  public get meterAssociationCommand() {
    if (!this._meterAssociationCommand)
      this._meterAssociationCommand = this.meterAssociationCommandConfigure();
    return this._meterAssociationCommand;
  }
  meterAssociationCommandConfigure() {
    return this.meterCommand
      .command("association")
      .description(
        "List all meters the belong to a property, and are included in metrics"
      );
  }
  // #endregion meter association

  // #region meter association get
  protected _meterAssociationGetCommand?: Command;
  public get meterAssociationGetCommand() {
    if (!this._meterAssociationGetCommand)
      this._meterAssociationGetCommand =
        this.meterAssociationGetCommandConfigure();
    return this._meterAssociationGetCommand;
  }

  meterAssociationGetExamples = [
    "# customizing the output",
    `${this.name} meter asscociation get --propertyId <propertyId> --indent 2`,
    "",
    "# using with JQ to map the output to shell scripting friendlier output",
    `${this.name} meter asscociation get --propertyId <propertyId> | jq -r '[.[] | .id] | @sh'`,
  ];
  async meterAssociationGetCommandAction(cmdOpts: any) {
    console.error("get meter association", cmdOpts);
    const meterAssociation =
      await this.getPortfolioManagerClient().getAssociatedMeters(
        cmdOpts.propertyId
      );
    const indent = cmdOpts.indent ? parseInt(cmdOpts.indent) || 2 : undefined;
    console.log(JSON.stringify(meterAssociation, null, indent));
  }
  meterAssociationGetCommandConfigure() {
    return this.meterAssociationCommand
      .command("get")
      .description("Get meter association")
      .addHelpText(
        "after",
        formatExamplesHelpText(this.meterAssociationGetExamples)
      )
      .requiredOption(
        "--propertyId <propertyId>",
        "property to fetch associated meters for"
      )
      .option("--indent <spaces>", "Indented output")
      .action((cmdOpts) => this.meterAssociationGetCommandAction(cmdOpts));
  }
  // #endregion meter association get

  // #region meter association list
  protected _meterAssociationListCommand?: Command;
  public get meterAssociationListCommand() {
    if (!this._meterAssociationListCommand)
      this._meterAssociationListCommand =
        this.meterAssociationListCommandConfigure();
    return this._meterAssociationGetCommand;
  }

  meterAssociationListExamples = [
    "# customizing the output",
    `${this.name} meter asscociation list --propertyIds <propertyId...> --indent 2`,
    "",
    "# using with JQ to map the output to shell scripting friendlier output",
    `${this.name} meter asscociation list --propertyIds <propertyId...> | jq -r '[.[] | .id] | @sh'`,
  ];
  async meterAssociationListCommandAction(cmdOpts: any) {
    console.error("meter association list", cmdOpts);
    const meterAssociation =
      await this.getPortfolioManagerClient().getMetersPropertiesAssociation(
        cmdOpts.propertyIds || []
      );
    const indent = cmdOpts.indent ? parseInt(cmdOpts.indent) || 2 : undefined;
    console.log(JSON.stringify(meterAssociation, null, indent));
  }
  meterAssociationListCommandConfigure() {
    return this.meterAssociationCommand
      .command("list")
      .description("list meter associations for multiple properties")
      .addHelpText(
        "after",
        formatExamplesHelpText(this.meterAssociationGetExamples)
      )
      .requiredOption(
        "--propertyIds <propertyId...>",
        "properties to fetch associated meters for"
      )
      .option("--indent <spaces>", "Indented output")
      .action((cmdOpts) => this.meterAssociationListCommandAction(cmdOpts));
  }
  // #endregion meter association get

  // #region meter consumption
  protected _meterConsumptionCommand?: Command;
  get meterConsumptionCommand() {
    if (!this._meterConsumptionCommand)
      this._meterConsumptionCommand = this.meterConsumptionCommandConfigure();
    return this._meterConsumptionCommand;
  }
  meterConsumptionCommandConfigure() {
    return this.meterCommand.command("consumption");
  }
  // #endregion meter consumption

  // #region meter consumption get
  protected _meterConsumptionGetCommand?: Command;
  public get meterConsumptionGetCommand() {
    if (!this._meterConsumptionGetCommand)
      this._meterConsumptionGetCommand =
        this.meterConsumptionGetCommandConfigure();
    return this._meterConsumptionGetCommand;
  }

  meterConsumptionGetExamples = [
    "# customizing the output",
    `${this.name} meter consumption get --meterId <meterId> --indent 2`,
    "",
    "# using with JQ to map the output to shell scripting friendlier output",
    `${this.name} meter consumption get --meterId <meterId> | jq -r '[.[] | .id] | @sh'`,
  ];
  meterConsumptionGetMeteredFields = [
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
  meterConsumptionGetDeliveryFields = [
    "id",
    "deliveryDate",
    "quantity",
    "audit",
  ];
  // combine both sets of potential fields since returned meter data can be of either type.
  // this may create some scenarios where an empty record is returned if there are no valid fields.
  meterConsumptionGetFieldsOptions = [
    ...this.meterConsumptionGetMeteredFields,
    ...this.meterConsumptionGetDeliveryFields,
  ];
  // select the core values of both type fields, leaving out the audit field.
  meterConsumptionGetFieldsDefault = [
    "id",
    "@_estimatedValue",
    "startDate",
    "endDate",
    "usage",
    "cost",
    "deliveryDate",
    "quantity",
  ];
  meterConsumptionGetDeliveryFieldOptionsStr =
    this.meterConsumptionGetDeliveryFields.join(", ");
  meterConsumptionGetMeteredFieldOptionsStr =
    this.meterConsumptionGetMeteredFields.join(", ");
  meterConsumptionGetFieldsOptionsStr =
    this.meterConsumptionGetFieldsOptions.join(", ");

  async meterConsumptionGetCommandAction(cmdOpts: any) {
    console.error("get meter consumption", cmdOpts);
    cmdOpts.fields.forEach((field: string) => {
      this.meterConsumptionGetFieldsOptions.includes(field) ||
        console.error(
          `${field} is not a valid field, options: ${this.meterConsumptionGetFieldsOptionsStr}`
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

  meterConsumptionGetCommandConfigure() {
    return this.meterConsumptionCommand
      .command("get")
      .description("Get meter consumption")
      .addHelpText(
        "after",
        formatExamplesHelpText(this.meterConsumptionGetExamples)
      )
      .requiredOption("--meterId <meterId>", "meter to fetch consumption for")
      .option(
        "--fields [fields...]",
        `Fields to include, be sure to include fields for both meter types or you may get empty records.   DELIVERY METER FIELDS: ${this.meterConsumptionGetDeliveryFieldOptionsStr}; CONSUMPTION METER FIELDS: ${this.meterConsumptionGetMeteredFieldOptionsStr}`,
        this.meterConsumptionGetFieldsDefault
      )
      .option("--indent <spaces>", "Indented output")
      .option("--start [date]", "Start Date for consumption records")
      .option("--end [date]", "End Date for consumption records")
      .action((cmdOpts) => this.meterConsumptionGetCommandAction(cmdOpts));
  }
  // #endregion meter consumption get

  // #region meter list
  protected _meterListCommand?: Command;
  public get meterListCommand(): Command {
    if (!this._meterListCommand)
      this._meterListCommand = this.meterListCommandConfigure();
    return this._meterListCommand;
  }
  meterListCommandConfigure() {
    return this.meterCommand.command("list");
  }
  // #endregion meter list

  // #region meter list entities
  protected _meterListEntitiesCommand?: Command;
  get meterListEntitiesCommand(): Command {
    if (!this._meterListEntitiesCommand)
      this._meterListEntitiesCommand = this.meterListEntitiesCommandConfigure();
    return this._meterListEntitiesCommand;
  }
  meterListEntityExamples = [
    "# customizing the output",
    `${this.name} meter list entities --propertyId <propertyId> --indent 2  --fields id name metered`,
    "",
    "# using with JQ to map the output to shell scripting friendlier output",
    `${this.name} meter list entities --propertyId <propertyId> | jq -r '[.[] | .id] | @sh'`,
  ];
  meterListEntityFields = [
    "id",
    "type",
    "name",
    "metered",
    "unitOfMeasure",
    "firstBillDate",
    "inUse",
    "inactiveDate",
    "otherDescription",
    "accessLevel",
    "aggregateMeter",
    "audit",
  ];
  meterListEntityFieldOptionsStr = this.meterListEntityFields.join(",");
  async meterListEntitiesCommandAction(cmdOpts: any) {
    // write help text we don't want in output pipes to stderr
    console.error("list meter entities", cmdOpts);
    cmdOpts.fields.forEach((field: string) => {
      this.meterListEntityFields.includes(field) ||
        console.error(
          `${field} is not a valid field, options: ${this.meterListEntityFieldOptionsStr}`
        );
    });
    const meters = await this.getPortfolioManagerClient().getMeters(
      cmdOpts.propertyId
    );
    const mapped = meters.map((meter: Record<string, any>) => {
      return cmdOpts.fields.reduce(
        (acc: Record<string, any>, field: string) => {
          acc[field] = meter[field];
          return acc;
        },
        {}
      );
    });
    const indent = cmdOpts.indent ? parseInt(cmdOpts.indent) || 2 : undefined;
    console.log(JSON.stringify(mapped, null, indent));
  }

  meterListEntitiesCommandConfigure() {
    return this.meterListCommand
      .command("entities")
      .description("List Meters")
      .addHelpText(
        "after",
        formatExamplesHelpText(this.meterListEntityExamples)
      )
      .requiredOption(
        "--propertyId <propertyIds...>",
        "space seperated list of Property ids to fetch meters for"
      )
      .option("--indent <spaces>", "Indented output")
      .option(
        "--fields [fields...]",
        `Fields to include. available fields: ${this.meterListEntityFieldOptionsStr}`,
        ["id", "name"]
      )
      .action((cmdOpts) => this.meterListEntitiesCommandAction(cmdOpts));
  }

  // #endregion meter list entities

  // #region meter list links
  protected _meterListLinksCommand?: Command;
  get meterListLinksCommand(): Command {
    if (!this._meterListLinksCommand)
      this._meterListLinksCommand = this.meterListLinksCommandConfigure();
    return this._meterListLinksCommand;
  }
  meterListLinksFields: string[] = [
    "@_id",
    "@_hint",
    "@_linkDescription",
    "@_link",
    "@_httpMethod",
  ];
  meterListLinksFieldOptionsStr = this.meterListLinksFields.join(",");
  meterListLinksExamples: string[] = [
    "# customizing the output",
    `${this.name} meter list links --propertyId <propertyId> --indent 2  --fields @_id @_hint`,
    "",
    "# using with JQ to map the output to shell scripting friendlier output",
    `${this.name} meter list links --propertyId <propertyId> | jq -r  '[.[] | ."@_id"] | @sh'`,
  ];
  async meterListLinksCommandAction(cmdOpts: any) {
    console.error("list meters", cmdOpts);
    cmdOpts.fields.forEach((field: string) => {
      this.meterListLinksFields.includes(field) ||
        console.error(
          `${field} is not a valid field, options: ${this.meterListLinksFieldOptionsStr}`
        );
    });
    const meters = await this.getPortfolioManagerClient().getMeterLinks(
      cmdOpts.propertyId,
      cmdOpts.myAccessOnly
    );
    const mapped = meters.map((meter: Record<string, any>) => {
      return cmdOpts.fields.reduce(
        (acc: Record<string, any>, field: string) => {
          acc[field] = meter[field];
          return acc;
        },
        {}
      );
    });

    const indent = cmdOpts.indent ? parseInt(cmdOpts.indent) || 2 : undefined;
    console.log(JSON.stringify(mapped, null, indent));
  }

  meterListLinksCommandConfigure() {
    return this.meterListCommand
      .command("links")
      .description(
        "List all meters the belong to a property, they are not necessarily included in the properties metrics"
      )
      .addHelpText("after", formatExamplesHelpText(this.meterListLinksExamples))
      .requiredOption(
        "--propertyId <propertyIds...>",
        "space seperated list of Property ids to fetch meters for"
      )
      .option("--myAccessOnly", "only fetch meters that I have access to")
      .option("--indent <spaces>", "Indented output")
      .option(
        "--fields [fields...]",
        `Fields to include. available fields: ${this.meterListLinksFieldOptionsStr}`,
        ["@_id", "@_hint"]
      )
      .action((cmdOpts) => this.meterListLinksCommandAction(cmdOpts));
  }

  // #endregion meter list links

  // #region property
  protected _propertyCommand?: Command;
  get propertyCommand(): Command {
    if (!this._propertyCommand)
      this._propertyCommand = this.propertyCommandConfigure();
    return this._propertyCommand;
  }

  propertyCommandConfigure() {
    return this.cli.command("property");
  }
  // #endregion property

  // #region property list
  protected _propertyListCommand?: Command;
  get propertyListCommand(): Command {
    if (!this._propertyListCommand)
      this._propertyListCommand = this.propertyListCommandConfigure();
    return this._propertyListCommand;
  }
  propertyListCommandConfigure() {
    return this.propertyCommand.command("list");
  }
  // #endregion property list

  // #region property list entities
  protected _propertyListEntitiesCommand?: Command;
  get propertyListEntitiesCommand(): Command {
    if (!this._propertyListEntitiesCommand)
      this._propertyListEntitiesCommand =
        this.propertyListEntitiesCommandConfigure();
    return this._propertyListEntitiesCommand;
  }
  propertyListEntityExamples = [
    "# customizing the output",
    `${this.name} property list entities --indent 2  --fields id name yearBuilt`,
    "",
    "# using with JQ to map the output to shell scripting friendlier output",
    `${this.name} property list entities | jq -r '[.[] | .id] | @sh'`,
  ];
  propertyListEntityFields = [
    "id",
    "name",
    "primaryFunction",
    "grossFloorArea",
    "yearBuilt",
    "address",
    "numberOfBuidings",
    "occupancyPercentage",
    "notes",
  ];
  propertyListEntityFieldsDefault = ["id", "name"];
  async propertyListEntitiesCommandAction(cmdOpts: any) {
    // write help text we don't want in output pipes to stderr
    console.error("list property entities", cmdOpts);

    const properties = await this.getPortfolioManagerClient().getProperties();
    const mapped = properties.map((property: Record<string, any>) => {
      return cmdOpts.fields.reduce(
        (acc: Record<string, any>, field: string) => {
          acc[field] = property[field];
          return acc;
        },
        {}
      );
    });
    const indent = cmdOpts.indent ? parseInt(cmdOpts.indent) || 2 : undefined;
    console.log(JSON.stringify(mapped, null, indent));
  }
  propertyListEntitiesCommandConfigure() {
    return this.propertyListCommand
      .command("entities")
      .description("List Properties")
      .addHelpText(
        "after",
        formatExamplesHelpText(this.propertyListEntityExamples)
      )
      .option("--indent <spaces>", "Indented output")
      .option(
        "--fields [fields...]",
        `Fields to include. available fields: ${this.propertyListEntityFields.join(
          ","
        )}`,
        this.propertyListEntityFieldsDefault
      )
      .action((cmdOpts) => this.propertyListEntitiesCommandAction(cmdOpts));
  }
  // #endregion property list entities

  // #region property list links
  protected _propertyListLinksCommand?: Command;
  get propertyListLinksCommand(): Command {
    if (!this._propertyListLinksCommand)
      this._propertyListLinksCommand = this.propertyListLinksCommandConfigure();
    return this._propertyListLinksCommand;
  }
  propertyListLinkExamples = [
    "# customizing the output",
    `${this.name} property list links --indent 2  --fields @_id @_hint`,
    "",
    "# using with JQ to map the output to shell scripting friendlier output",
    `${this.name} property list links  | jq -r  '[.[] | ."@_id"] | @sh'`,
  ];
  propertyListLinkFields = [
    "@_id",
    "@_hint",
    "@_linkDescription",
    "@_link",
    "@_httpMethod",
  ];
  propertyListLinksFieldsDefault = ["@_id", "@_hint"];

  async propertyListLinksCommandAction(cmdOpts: any): Promise<void> {
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

  propertyListLinksCommandConfigure() {
    return this.propertyListCommand
      .command("links")
      .description("List properties")
      .addHelpText(
        "after",
        formatExamplesHelpText(this.propertyListLinkExamples)
      )
      .option("--indent <spaces>", "Indented output")
      .option(
        "--fields [fields...]",
        `Fields to include. available fields: ${this.propertyListLinkFields.join(
          ","
        )}`,
        this.propertyListLinksFieldsDefault
      )
      .action((cmdOpts) => this.propertyListLinksCommandAction(cmdOpts));
  }

  // #endregion

  protected _propertyMetricsCommand?: Command;
  get propertyMetricsCommand(): Command {
    if (!this._propertyMetricsCommand)
      this._propertyMetricsCommand = this.propertyMetricsCommandConfigure();
    return this._propertyMetricsCommand;
  }

  propertyMetricsCommandConfigure() {
    return this.propertyCommand.command("metrics");
  }

  // #region property metrics monthly
  protected _propertyMetricsMonthlyCommand?: Command;
  get propertyMetricsMonthlyCommand(): Command {
    if (!this._propertyMetricsMonthlyCommand)
      this._propertyMetricsMonthlyCommand =
        this.propertyMetricsMonthlyCommandConfigure();
    return this._propertyMetricsMonthlyCommand;
  }
  propertyMetricsMonthlyExamples = [
    "# customizing the output",
    `${this.name} property metrics monthly  --propertyId <propertyId> --fields name year month value --indent 2`,
  ];
  propertyMetricsMonthlyFields = ["propertyId", "name", "uom", "year", "month", "value"];
  propertyMetricsMonthlyFieldsDefault = this.propertyMetricsMonthlyFields

  async propertyMetricsMonthlyCommandAction(cmdOpts: any): Promise<void> {
    // write help text we don't want in output pipes to stderr
    console.error("list property metrics monthly", cmdOpts);
    const {propertyId, include_null, metrics = undefined} = cmdOpts;

    const exclude_null = !include_null;
    const items =
       await this.getPortfolioManagerClient().getPropertyMonthlyMetrics(propertyId, 2021, 12, metrics, exclude_null)

       const mapped = Object.values(items).map(
        (item: Record<string, any>) => {
          return cmdOpts.fields.reduce(
            (acc: Record<string, any>, field: string) => {
              acc[field] = item[field];
              return acc;
            },
            {}
          );
        }
      );
      const indent = cmdOpts.indent ? parseInt(cmdOpts.indent) || 2 : undefined;
      console.log(JSON.stringify(mapped, null, indent));
  }

  propertyMetricsMonthlyCommandConfigure() {
    const MONTHLY_METRICS = METRICS.filter(m => m[14]).map(m => [m[0]])
    return this.propertyMetricsCommand
      .command("monthly")
      .description("Get Monthly Metrics for a Property")
      .addHelpText(
        "after",
        formatExamplesHelpText(this.propertyMetricsMonthlyExamples)
      )
      .requiredOption(
        "--propertyId <propertyId>",
        "property to fetch metrics for"
      )
      .option("--year <year>", "year to fetch metrics for")
      .option("--month <month>", "month to fetch metrics for")
      .option("--metrics [metrics...]", `metrics to include: ${MONTHLY_METRICS.join(', ')}`)
      .option("--include_null", "include null values")
      .option("--indent <spaces>", "Indented output")
      .option(
        "--fields [fields...]",
        `Fields to include. available fields: ${this.propertyMetricsMonthlyFields.join(
          ","
        )}`,
        this.propertyMetricsMonthlyFieldsDefault
      )
      .action((cmdOpts) => this.propertyMetricsMonthlyCommandAction(cmdOpts));
  }

  // #endregion
  constructor() {
    // since commands are constructed lazily in their getters, we need to to refer
    // to each here to register them with the cli. We should only need to register
    // leaf commands. The should register their parents automatically.
    this.meterAssociationGetCommand;
    this.meterAssociationListCommand;
    this.meterConsumptionGetCommand;
    this.meterListEntitiesCommand;
    this.meterListLinksCommand;
    this.propertyListEntitiesCommand;
    this.propertyListLinksCommand;
    this.propertyMetricsCommand;
    this.propertyMetricsMonthlyCommand;
  }

  getPortfolioManagerClient(): PortfolioManager {
    const opts = this.cli.opts();
    const { pmEndpoint, pmUsername, pmPassword } = opts;
    const apiClient = new PortfolioManagerApi(
      pmEndpoint,
      pmUsername,
      pmPassword
    );
    const client = new PortfolioManager(apiClient);
    return client;
  }

  parse(argv: string[] = process.argv): void {
    this.cli.parse(argv);
  }
}
