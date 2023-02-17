import { METRICS } from "../types";
import { PortfolioManagerBaseCommand } from "./PortfolioManagerBaseCommand";

export class PortfolioManagerPropertyMetricsMonthlyCommand extends PortfolioManagerBaseCommand {
  protected _description = "Get monthly metrics for a property";
  protected get examples() { return [
    "# customizing the output",
    `${this.getFullCommand()} property metrics monthly  --propertyId <propertyId> --fields name year month value --indent 2`,
  ];
  }
  protected fields = ["propertyId", "name", "uom", "year", "month", "value"];
  protected defaultFields = this.fields;

  constructor() {
    super("monthly");
    const MONTHLY_METRICS = METRICS.filter((m) => m[14]).map((m) => [m[0]]);
    this.addFieldsOption(this.fields, this.defaultFields)
    this.requiredOption(
      "--propertyId <propertyId>",
      "property to fetch metrics for"
    );
    this.requiredOption("--year <year>", "year to fetch metrics for");
    this.requiredOption("--month <month>", "month to fetch metrics for");
    this.option(
      "--metrics [metrics...]",
      `metrics to include: ${MONTHLY_METRICS.join(", ")}`
    );
    this.option("--include_null", "include null values");
  }

  protected async _action(): Promise<void> {
    // write help text we don't want in output pipes to stderr
    // console.error("list property metrics monthly", cmdOpts);
    const {
      propertyId,
      year,
      month,
      include_null,
      metrics = undefined,
      fields,
      _indent,
    } = this.opts();
    const pmClient = this.getPortfolioManagerClient();

    const exclude_null = !include_null;
    const items = await pmClient.getPropertyMonthlyMetrics(
      propertyId,
      year,
      month,
      metrics,
      exclude_null
    );

    const mapped = Object.values(items).map((item: Record<string, any>) => {
      return fields.reduce((acc: Record<string, any>, field: string) => {
        acc[field] = item[field];
        return acc;
      }, {});
    });
    const indent = parseInt(_indent);
    console.log(JSON.stringify(mapped, null, indent));
  }
}
