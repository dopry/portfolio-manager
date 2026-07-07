/** Dumps provider-side pending/connected state. Debug utility. */
import { PortfolioManager } from "../../src/PortfolioManager.js";
import { PortfolioManagerApi } from "../../src/PortfolioManagerApi.js";

if (!process.env.PM_USERNAME || !process.env.PM_PASSWORD) {
  throw new Error("Set PM_USERNAME and PM_PASSWORD (provider account)");
}

const pm = new PortfolioManager(
  new PortfolioManagerApi(
    process.env.PM_ENDPOINT ||
      "https://portfoliomanager.energystar.gov/wstest/",
    process.env.PM_USERNAME,
    process.env.PM_PASSWORD,
  ),
);

console.log(
  "pending property shares:",
  JSON.stringify(await pm.getPendingPropertyShares()),
);
console.log(
  "pending meter shares:",
  JSON.stringify(await pm.getPendingMeterShares()),
);
console.log(
  "pending connections:",
  JSON.stringify(await pm.getPendingConnections()),
);
console.log("customers:", JSON.stringify(await pm.getCustomerList()));
