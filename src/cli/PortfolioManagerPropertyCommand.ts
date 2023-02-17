import { PortfolioManagerBaseCommand } from "./PortfolioManagerBaseCommand";
import { PortfolioManagerPropertyListCommand } from "./PortfolioManagerPropertyListCommand";
import { PortfolioManagerPropertyMetricsCommand } from "./PortfolioManagerPropertyMetricsCommand";

export class PortfolioManagerPropertyCommand extends PortfolioManagerBaseCommand {
    constructor() {
        super("property")
        this.addCommand(new PortfolioManagerPropertyListCommand())
        this.addCommand(new PortfolioManagerPropertyMetricsCommand())
    }
}