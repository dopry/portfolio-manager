import { PortfolioManagerBaseCommand } from "./PortfolioManagerBaseCommand";
import { PortfolioManagerPropertyMetricsMonthlyCommand } from "./PortfolioManagerPropertyMetricsMonthlyCommand";

export class PortfolioManagerPropertyMetricsCommand extends PortfolioManagerBaseCommand {
    constructor() {
        super("metrics")
        this.addCommand(new PortfolioManagerPropertyMetricsMonthlyCommand())
    }
}