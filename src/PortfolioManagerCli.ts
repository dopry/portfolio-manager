import { Command, Option } from "commander";
import { PortfolioManager } from "./PortfolioManager";
import { PortfolioManagerApi } from "./PortfolioManagerApi";
import { formatExamplesHelpText } from "./functions/formatExamplesHelpText";

export class PortfolioManagerCli {
  name = "portfolio-manager";

  cli = new Command()
    .name(this.name)
    .description("Portfolio Manager CLI tool")
    .version("TODO, read from pacakge.json")
    .addOption(
      new Option(
        "-e, --endpoint <endpoint>",
        "Portfolio Manager Endpoint, prod: https://portfoliomanager.energystar.gov/ws/, test: https://portfoliomanager.energystar.gov/wstest/"
      )
        .default("https://portfoliomanager.energystar.gov/ws/")
        .env("PM_ENDPOINT")
    )
    .addOption(
      new Option("-u, --username <username>", "Portfolio Manager username")
        .env("PM_USERNAME")
        .makeOptionMandatory()
    )
    .addOption(
      new Option(
        "-p, --password <password>",
        "Portfolio Manager password, strongly recommend using the env var over the cli option so password isn't expose to `ps`"
      )
        .env("PM_PASSWORD")
        .makeOptionMandatory()
    );

  // #region property
  propertyCommand: Command = this.cli.command("property");
  // #endregion property

  // #region property list
  propertyListCommand = this.propertyCommand.command("list");
  // #endregion property list

  // #region property list links
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
  propertyListLinksCommand = this.propertyListCommand
    .command("links")
    .description("List properties")
    .addHelpText("after", formatExamplesHelpText(this.propertyListLinkExamples))
    .option("--indent <spaces>", "Indented output")
    .option(
      "--fields [fields...]",
      `Fields to include. available fields: ${this.propertyListLinkFields.join(
        ","
      )}`,
      this.propertyListLinksFieldsDefault
    )
    .action((cmdOpts) => this.propertyListLinksCommandAction(cmdOpts));

  async propertyListLinksCommandAction(cmdOpts: any): Promise<void> {
    // write help text we don't want in output pipes to stderr
    console.error("list property links", cmdOpts);
    const propertyLinks = await this.getClient().getPropertyLinks();
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
  // #endregion

  // #region property list entities
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
  propertyListEntitiesCommand = this.propertyListCommand
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

  async propertyListEntitiesCommandAction(cmdOpts: any) {
    // write help text we don't want in output pipes to stderr
    console.error("list property entities", cmdOpts);

    const properties = await this.getClient().getProperties();
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
  // #endregion property list entities

  // #region meter
  meterCommand = this.cli.command("meter");
  // #endregion meter

  // #region meter association
  meterAssociationCommand = this.meterCommand
    .command("association")
    .description(
      "List all meters the belong to a property, and are included in metrics"
    );
  // #endregion meter association

  // #region meter association get
  meterAssociationGetExamples = [
    "# customizing the output",
    `${this.name} meter asscociation get --propertyId <propertyId> --indent 2`,
    "",
    "# using with JQ to map the output to shell scripting friendlier output",
    `${this.name} meter asscociation get --propertyId <propertyId> | jq -r '[.[] | .id] | @sh'`,
  ];
  meterAssociationCommandGet = this.meterAssociationCommand
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
    .action((cmdOpts) => this.meterAssociationCommandGetAction(cmdOpts));

  async meterAssociationCommandGetAction(cmdOpts: any) {
    console.error("get meter association", cmdOpts);
    const meterAssociation = await this.getClient().getAssociatedMeters(
      cmdOpts.propertyId
    );
    const indent = cmdOpts.indent ? parseInt(cmdOpts.indent) || 2 : undefined;
    console.log(JSON.stringify(meterAssociation, null, indent));
  }
  // #endregion meter association get

  // #region meter consumption
  meterConsumptionCommand = this.meterCommand.command("consumption");
  // #endregion meter consumption

  // #region meter consumption get
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

  meterConsumptionGetCommand = this.meterConsumptionCommand
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
    .action((cmdOpts) => this.meterConsumptionCommandGetAction(cmdOpts));

  async meterConsumptionCommandGetAction(cmdOpts: any) {
    console.error("get meter consumption", cmdOpts);
    cmdOpts.fields.forEach((field: string) => {
      this.meterConsumptionGetFieldsOptions.includes(field) ||
        console.error(
          `${field} is not a valid field, options: ${this.meterConsumptionGetFieldsOptionsStr}`
        );
    });
    const client = this.getClient();
    const meterConsumption = await client.getMeterConsumption(cmdOpts.meterId);
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
  // #endregion meter consumption get

  // #region meter list
  meterListCommand = this.meterCommand.command("list");
  // #endregion meter list

  // #region meter list links
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
  meterListLinksCommand = this.meterListCommand
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

  async meterListLinksCommandAction(cmdOpts: any) {
    console.error("list meters", cmdOpts);
    cmdOpts.fields.forEach((field: string) => {
      this.meterListLinksFields.includes(field) ||
        console.error(
          `${field} is not a valid field, options: ${this.meterListLinksFieldOptionsStr}`
        );
    });
    const meters = await this.getClient().getMeterLinks(
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
  // #endregion meter list links

  // #region meter list entities
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
  meterListEntitiesCommand = this.meterListCommand
    .command("entities")
    .description("List Meters")
    .addHelpText("after", formatExamplesHelpText(this.meterListEntityExamples))
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

  async meterListEntitiesCommandAction(cmdOpts: any) {
    // write help text we don't want in output pipes to stderr
    console.error("list meter entities", cmdOpts);
    cmdOpts.fields.forEach((field: string) => {
      this.meterListEntityFields.includes(field) ||
        console.error(
          `${field} is not a valid field, options: ${this.meterListEntityFieldOptionsStr}`
        );
    });
    const meters = await this.getClient().getMeters(cmdOpts.propertyId);
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
  // #endregion meter list entities


  constructor() {}

  getClient(): PortfolioManager {
    const opts = this.cli.opts();
    const { endpoint, username, password } = opts;
    const apiClient = new PortfolioManagerApi(endpoint, username, password);
    const client = new PortfolioManager(apiClient);
    return client;
  }

  parse(argv: string[] = process.argv): void {
    this.cli.parse(argv);
  }
}
