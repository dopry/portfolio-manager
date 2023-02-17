import { PortfolioManagerBaseCommand } from "./PortfolioManagerBaseCommand";
import { PortfolioManagerPropertyListEntitiesCommand } from "./PortfolioManagerPropertyListEntitiesCommand";
import { PortfolioManagerPropertyListLinksCommand } from "./PortfolioManagerPropertyListLinksCommand";

export class PortfolioManagerPropertyListCommand extends PortfolioManagerBaseCommand {
    constructor() {
        super("list")
        this.addCommand(new PortfolioManagerPropertyListEntitiesCommand())
        this.addCommand(new PortfolioManagerPropertyListLinksCommand())
    }
}