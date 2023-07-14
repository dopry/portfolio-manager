import { PortfolioManagerBaseCommand } from "./PortfolioManagerBaseCommand";

export class PortfolioManagerAccountCreateCommand extends PortfolioManagerBaseCommand {
  constructor() {
    super("create");
    this.requiredOption("--email <email>", "email for new account")
    this.requiredOption("--country <country>", "country for new account")
    this.requiredOption("--state <state>", "state for new account")
    this.option("--firstName <firstName>", "firstName for new account")
    this.option("--lastName <lastName>", "lastName for new account")
    this.option("--address1 <address1>", "address1 for new account")
  }

  protected async _action(): Promise<void> {
    const cmdOpts = this.opts();
    const client = this.getPortfolioManagerClient();
    const accountId = await client.createAccount(cmdOpts.username, cmdOpts.password, cmdOpts.email,  cmdOpts.country, cmdOpts.state);
    const indent = cmdOpts.indent ? parseInt(cmdOpts.indent) || 2 : undefined;
    console.log(JSON.stringify(accountId, null, indent));
  }
}
