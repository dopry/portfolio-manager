#!/usr/bin/env node

export * from "./types";
export * from "./PortfolioManagerApi";
export * from "./PortfolioManager";
export * from "./PortfolioManagerCli";

import { PortfolioManagerCli } from "./PortfolioManagerCli";

async function main() {
  const cli = new PortfolioManagerCli();
  cli.parse(process.argv);
}

if (require.main === module) {
  main();
}
