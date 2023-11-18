import { PortfolioManagerBaseCommand } from "./PortfolioManagerBaseCommand.js";
import { PortfolioManagerPropertyListCommand } from "./PortfolioManagerPropertyListCommand.js";
import { PortfolioManagerPropertyMetricsCommand } from "./PortfolioManagerPropertyMetricsCommand.js";

export class PortfolioManagerPropertyCommand extends PortfolioManagerBaseCommand {
    constructor() {
        super("property")
        this.addCommand(new PortfolioManagerPropertyListCommand())
        this.addCommand(new PortfolioManagerPropertyMetricsCommand())
    }
}