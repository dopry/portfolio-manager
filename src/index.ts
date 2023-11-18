#!/usr/bin/env node
import * as url from "node:url";

export * from "./PortfolioManager";
export * from "./PortfolioManagerApi";
export * from "./cli";
export * from "./types";

import { PortfolioManagerCommand } from "./cli/PortfolioManagerCommand";

async function main() {
  const cli = new PortfolioManagerCommand();
  cli.parse(process.argv);
}

if (import.meta.url.startsWith("file:")) {
  const modulePath = url.fileURLToPath(import.meta.url);
  if (process.argv[1] === modulePath) {
    main();
  }
}
