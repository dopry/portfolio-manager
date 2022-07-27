import { Command, Option } from "commander";
import { PortfolioManager } from "./PortfolioManager";
import { PortfolioManagerApi } from "./PortfolioManagerApi";
import { formatExamplesHelpText } from "./functions/formatExamplesHelpText";

function get_client(cli: Command): PortfolioManager {
  const opts = cli.opts();
  const { endpoint, username, password } = opts;
  const apiClient = new PortfolioManagerApi(
    endpoint,
    username,
    password
  );
  const client = new PortfolioManager(apiClient);
  return client;
}

export function get_cli(): Command {
  const portfolioManagerCli = new Command();
  const name = `portfolio-manager`;

  // #region base cli setup
  portfolioManagerCli
    .name(name)
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
  // #endregion base cli setup

  // #region property commands
  const propertyCommand = portfolioManagerCli.command("property");
  const propertyListCommand = propertyCommand.command("list");

  const propertyListLinkExamples = [
    "# customizing the output",
    `${name} property list links --indent 2  --fields @_id @_hint`,
    "",
    "# using with JQ to map the output to shell scripting friendlier output",
    `${name} property list links  | jq -r  '[.[] | ."@_id"] | @sh'`,
  ];

  const propertyListLinkFields = [
    "@_id",
    "@_hint",
    "@_linkDescription",
    "@_link",
    "@_httpMethod",
  ];
  propertyListCommand
    .command("links")
    .description("List properties")
    .addHelpText("after", formatExamplesHelpText(propertyListLinkExamples))
    .option("--indent <spaces>", "Indented output")
    .option(
      "--fields [fields...]",
      `Fields to include. available fields: ${propertyListLinkFields.join(
        ","
      )}`,
      ["@_id", "@_name"]
    )
    .action(async (cmdOpts) => {
      // write help text we don't want in output pipes to stderr
      console.error("list property links", cmdOpts);

      const propertyLinks = await get_client(
        portfolioManagerCli
      ).getPropertyLinks();
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
    });

  const propertyListEntityExamples = [
    "# customizing the output",
    `${name} property list entities --indent 2  --fields id name yearBuilt`,
    "",
    "# using with JQ to map the output to shell scripting friendlier output",
    `${name} property list entities | jq -r '[.[] | .id] | @sh'`,
  ];
  const propertyListEntityFields = [
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
  propertyListCommand
    .command("entities")
    .description("List Properties")
    .addHelpText("after", formatExamplesHelpText(propertyListEntityExamples))
    .option("--indent <spaces>", "Indented output")
    .option(
      "--fields [fields...]",
      `Fields to include. available fields: ${propertyListEntityFields.join(
        ","
      )}`,
      ["id", "name"]
    )
    .action(async (cmdOpts) => {
      // write help text we don't want in output pipes to stderr
      console.error("list property entities", cmdOpts);

      const properties = await get_client(portfolioManagerCli).getProperties();
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
    });
  // #endregion property commands

  // #region meter commands

  // https://portfoliomanager.energystar.gov/pm/property/2640726#summary
  const meterCommand = portfolioManagerCli.command("meter");

  // #region meter list commands
  const meterListCommand = meterCommand.command("list");

  const meterListLinkExamples = [
    "# customizing the output",
    `${name} meter list links --propertyId <propertyId> --indent 2  --fields @_id @_hint`,
    "",
    "# using with JQ to map the output to shell scripting friendlier output",
    `${name} meter list links --propertyId <propertyId> | jq -r  '[.[] | ."@_id"] | @sh'`,
  ];

  const meterListLinkFields = [
    "@_id",
    "@_hint",
    "@_linkDescription",
    "@_link",
    "@_httpMethod",
  ];
  const meterListLinkFieldOptionsStr = meterListLinkFields.join(",");
  meterListCommand
    .command("links")
    .description(
      "List all meters the belong to a property, they are not necessarily included in the properties metrics"
    )
    .addHelpText("after", formatExamplesHelpText(meterListLinkExamples))
    .requiredOption(
      "--propertyId <propertyIds...>",
      "space seperated list of Property ids to fetch meters for"
    )
    .option("--myAccessOnly", "only fetch meters that I have access to")
    .option("--indent <spaces>", "Indented output")
    .option(
      "--fields [fields...]",
      `Fields to include. available fields: ${meterListLinkFieldOptionsStr}`,
      ["@_id", "@_hint"]
    )
    .action(async (cmdOpts) => {
      console.error("list meters", cmdOpts);
      cmdOpts.fields.forEach((field: string) => {
        meterListLinkFields.includes(field) ||
          console.error(
            `${field} is not a valid field, options: ${meterListLinkFieldOptionsStr}`
          );
      });
      const meters = await get_client(portfolioManagerCli).getMeterLinks(
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
    });

  const meterListEntityExamples = [
    "# customizing the output",
    `${name} meter list entities --propertyId <propertyId> --indent 2  --fields id name metered`,
    "",
    "# using with JQ to map the output to shell scripting friendlier output",
    `${name} meter list entities --propertyId <propertyId> | jq -r '[.[] | .id] | @sh'`,
  ];
  const meterListEntityFields = [
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
  const meterListEntityFieldOptionsStr = meterListEntityFields.join(",");
  meterListCommand
    .command("entities")
    .description("List Meters")
    .addHelpText("after", formatExamplesHelpText(meterListEntityExamples))
    .requiredOption(
      "--propertyId <propertyIds...>",
      "space seperated list of Property ids to fetch meters for"
    )
    .option("--indent <spaces>", "Indented output")
    .option(
      "--fields [fields...]",
      `Fields to include. available fields: ${meterListEntityFieldOptionsStr}`,
      ["id", "name"]
    )
    .action(async (cmdOpts) => {
      // write help text we don't want in output pipes to stderr
      console.error("list meter entities", cmdOpts);
      cmdOpts.fields.forEach((field: string) => {
        meterListEntityFields.includes(field) ||
          console.error(
            `${field} is not a valid field, options: ${meterListEntityFieldOptionsStr}`
          );
      });
      const meters = await get_client(portfolioManagerCli).getMeters(
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
    });
  // #endregion meter list commands

  // #region meter association commands
  const meterAssociationCommand = meterCommand
    .command("association")
    .description(
      "List all meters the belong to a property, and are included in metrics"
    );

  const meterAssociationGetExamples = [
    "# customizing the output",
    `${name} meter asscociation get --propertyId <propertyId> --indent 2`,
    "",
    "# using with JQ to map the output to shell scripting friendlier output",
    `${name} meter asscociation get --propertyId <propertyId> | jq -r '[.[] | .id] | @sh'`,
  ];
  meterAssociationCommand
    .command("get")
    .description("Get meter association")
    .addHelpText("after", formatExamplesHelpText(meterAssociationGetExamples))
    .requiredOption(
      "--propertyId <propertyId>",
      "property to fetch associated meters for"
    )
    .option("--indent <spaces>", "Indented output")
    .action(async (cmdOpts) => {
      console.error("get meter association", cmdOpts);
      const meterAssociation = await get_client(
        portfolioManagerCli
      ).getAssociatedMeters(cmdOpts.propertyId);
      const indent = cmdOpts.indent ? parseInt(cmdOpts.indent) || 2 : undefined;
      console.log(JSON.stringify(meterAssociation, null, indent));
    });
  // #endregion meter association commands

  // #region meter consumption commands
  const meterConsumptionCommand = meterCommand.command("consumption");
  const meterConsumptionGetExamples = [
    "# customizing the output",
    `${name} meter consumption get --meterId <meterId> --indent 2`,
    "",
    "# using with JQ to map the output to shell scripting friendlier output",
    `${name} meter consumption get --meterId <meterId> | jq -r '[.[] | .id] | @sh'`,
  ];
  const meterMeteredConsumptionFields = [
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
  const meterDeliveryConsumptionFields = [
    "id",
    "deliveryDate",
    "quantity",
    "audit",
  ];
  // combine both sets of potential fields since returned meter data can be of either type.
  // this may create some scenarios where an empty record is returned if there are no valid fields.
  const meterConsumptionFieldsOptions = [
    ...meterMeteredConsumptionFields,
    ...meterDeliveryConsumptionFields,
  ];
  const meterDevliveryConsumptionFieldOptionsStr =
    meterDeliveryConsumptionFields.join(", ");
  const meterMeteredConsumptionFieldOptionsStr =
    meterMeteredConsumptionFields.join(", ");
  const meterConsumptionFieldsOptionsStr =
    meterConsumptionFieldsOptions.join(", ");
  meterConsumptionCommand
    .command("get")
    .description("Get meter consumption")
    .addHelpText("after", formatExamplesHelpText(meterConsumptionGetExamples))
    .requiredOption("--meterId <meterId>", "meter to fetch consumption for")
    .option(
      "--fields [fields...]",
      `Fields to include, be sure to include fields for both meter types or you may get empty records.   DELIVERY METER FIELDS: ${meterMeteredConsumptionFieldOptionsStr}; CONSUMPTION METER FIELDS: ${meterDevliveryConsumptionFieldOptionsStr}`,
      // select the core values of both type fields, leaving out the audit field.
      [
        "id",
        "@_estimatedValue",
        "startDate",
        "endDate",
        "usage",
        "cost",
        "deliveryDate",
        "quantity",
      ]
    )
    .option("--indent <spaces>", "Indented output")
    .action(async (cmdOpts) => {
      console.error("get meter consumption", cmdOpts);
      cmdOpts.fields.forEach((field: string) => {
        meterConsumptionFieldsOptions.includes(field) ||
          console.error(
            `${field} is not a valid field, options: ${meterConsumptionFieldsOptionsStr}`
          );
      });
      const client = get_client(portfolioManagerCli);
      const meterConsumption = await client.getMeterConsumption(
        cmdOpts.meterId
      );
      const mapped = meterConsumption.map(
        (consumption: Record<string, any>) => {
          return cmdOpts.fields.reduce(
            (acc: Record<string, any>, field: string) => {
              acc[field] = consumption[field];
              return acc;
            },
            {}
          );
        }
      );
      const indent = cmdOpts.indent ? parseInt(cmdOpts.indent) || 2 : undefined;
      console.log(JSON.stringify(mapped, null, indent));
    });
  // #endregion meter consumption commands

  // #endregion meter commands

  return portfolioManagerCli;
}
