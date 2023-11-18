import { PortfolioManagerBaseCommand } from "./PortfolioManagerBaseCommand.js";
import { PortfolioManagerPropertyListEntitiesCommand } from "./PortfolioManagerPropertyListEntitiesCommand.js";
import { PortfolioManagerPropertyListLinksCommand } from "./PortfolioManagerPropertyListLinksCommand.js";

export class PortfolioManagerPropertyListCommand extends PortfolioManagerBaseCommand {
    constructor() {
        super("list")
        this.addCommand(new PortfolioManagerPropertyListEntitiesCommand())
        this.addCommand(new PortfolioManagerPropertyListLinksCommand())
    }
}