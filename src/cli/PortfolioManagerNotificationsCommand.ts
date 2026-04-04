import { PortfolioManagerBaseCommand } from "./PortfolioManagerBaseCommand.js";

export class PortfolioManagerNotificationsCommand extends PortfolioManagerBaseCommand {
  constructor() {
    super("notifications");
    this.description(
      "Fetch system notifications (e.g., unshares, disconnects)"
    );
    this.addCommand(new PortfolioManagerNotificationsListCommand());
  }
}

class PortfolioManagerNotificationsListCommand extends PortfolioManagerBaseCommand {
  constructor() {
    super("list");
    this.description("List all current notifications");
    this.addPortfolioManagerOptions();
    this.option(
      "--no-clear",
      "Do not mark notifications as read after fetching. They will appear in subsequent calls."
    );
  }

  protected async _action(): Promise<void> {
    const pm = this.getPortfolioManagerClient();
    const opts = this.opts();
    console.error("Fetching notifications...");
    const notifications = await pm.getNotifications({ markAsRead: opts.clear });

    if (notifications.length === 0) {
      console.error("No new notifications found.");
      return;
    }

    const indent = parseInt(opts.indent, 10) || 0;
    console.log(JSON.stringify(notifications, null, indent));
  }
}
