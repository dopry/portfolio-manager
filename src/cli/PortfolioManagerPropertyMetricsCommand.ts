import { PortfolioManagerBaseCommand } from "./PortfolioManagerBaseCommand.js";
import { PortfolioManagerPropertyMetricsAnnualCommand } from "./PortfolioManagerPropertyMetricsAnnualCommand.js";
import { PortfolioManagerPropertyMetricsMonthlyCommand } from "./PortfolioManagerPropertyMetricsMonthlyCommand.js";

export class PortfolioManagerPropertyMetricsCommand extends PortfolioManagerBaseCommand {
    constructor() {
        super("metrics")
        this.addCommand(new PortfolioManagerPropertyMetricsMonthlyCommand())
        this.addCommand(new PortfolioManagerPropertyMetricsAnnualCommand())
    }
}