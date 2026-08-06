import { PortfolioManagerBaseCommand } from "./PortfolioManagerBaseCommand.js";
import { PortfolioManagerPropertyExportCommand } from "./PortfolioManagerPropertyExportCommand.js";
import { PortfolioManagerPropertyImportCommand } from "./PortfolioManagerPropertyImportCommand.js";
import { PortfolioManagerPropertyListCommand } from "./PortfolioManagerPropertyListCommand.js";
import { PortfolioManagerPropertyMetricsCommand } from "./PortfolioManagerPropertyMetricsCommand.js";

export class PortfolioManagerPropertyCommand extends PortfolioManagerBaseCommand {
  constructor() {
    super("property");
    this.addCommand(new PortfolioManagerPropertyExportCommand());
    this.addCommand(new PortfolioManagerPropertyImportCommand());
    this.addCommand(new PortfolioManagerPropertyListCommand());
    this.addCommand(new PortfolioManagerPropertyMetricsCommand());
  }
}
