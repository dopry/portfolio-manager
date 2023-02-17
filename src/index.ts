#!/usr/bin/env node

export * from "./types";
export * from "./PortfolioManagerApi";
export * from "./PortfolioManager";

import { PortfolioManagerCommand } from "./cli/PortfolioManagerCommand";

async function main() {
  const cli = new PortfolioManagerCommand();
  cli.parse(process.argv);
}

if (require.main === module) {
  main();
}
