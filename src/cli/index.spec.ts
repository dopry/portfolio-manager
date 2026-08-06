import { describe, expect, it } from "vitest";
import * as cliExports from "./index.js";

describe("cli index exports", () => {
  it("re-exports the supported CLI API", () => {
    expect(Object.keys(cliExports).sort()).toEqual([
      "PortfolioManagerAccountCommand",
      "PortfolioManagerAccountGetCommand",
      "PortfolioManagerBaseCommand",
      "PortfolioManagerCommand",
      "PortfolioManagerConnectionAcceptCommand",
      "PortfolioManagerConnectionCommand",
      "PortfolioManagerConnectionDisconnectCommand",
      "PortfolioManagerConnectionListCommand",
      "PortfolioManagerConnectionListPendingCommand",
      "PortfolioManagerConnectionRejectCommand",
      "PortfolioManagerMeterAssociationCommand",
      "PortfolioManagerMeterAssociationGetCommand",
      "PortfolioManagerMeterAssociationListCommand",
      "PortfolioManagerMeterCommand",
      "PortfolioManagerMeterConsumptionCommand",
      "PortfolioManagerMeterConsumptionGetCommand",
      "PortfolioManagerMeterIdentifiersCommand",
      "PortfolioManagerMeterListCommand",
      "PortfolioManagerMeterListEntitiesCommand",
      "PortfolioManagerMeterListLinksCommand",
      "PortfolioManagerNotificationsCommand",
      "PortfolioManagerPropertyCommand",
      "PortfolioManagerPropertyExportCommand",
      "PortfolioManagerPropertyImportCommand",
      "PortfolioManagerPropertyListCommand",
      "PortfolioManagerPropertyListEntitiesCommand",
      "PortfolioManagerPropertyListLinksCommand",
      "PortfolioManagerPropertyMetricsAnnualCommand",
      "PortfolioManagerPropertyMetricsCommand",
      "PortfolioManagerPropertyMetricsMonthlyCommand",
      "PortfolioManagerShareCommand",
      "PortfolioManagerWhatChangedCommand",
      "parseIntArg",
    ]);
  });
});
