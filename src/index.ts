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

export function shouldRunMain(
  importMetaUrl: string,
  argv1: string | undefined,
  toFilePath: (path: string) => string = url.fileURLToPath
): boolean {
  if (!importMetaUrl.startsWith("file:")) {
    return false;
  }
  const modulePath = toFilePath(importMetaUrl);
  return argv1 === modulePath;
}

if (shouldRunMain(import.meta.url, process.argv[1])) {
  main();
}
