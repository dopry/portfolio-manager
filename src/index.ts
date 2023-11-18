#!/usr/bin/env node
import * as url from "node:url";

export * from "./PortfolioManager.js";
export * from "./PortfolioManagerApi.js";
export * from "./cli/index.js";
export * from "./types/index.js";

import { PortfolioManagerCommand } from "./cli/PortfolioManagerCommand.js";

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
