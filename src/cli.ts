#!/usr/bin/env node
import { PortfolioManagerCommand } from "./cli/PortfolioManagerCommand.js";

// Dedicated CLI entry point. The library entry (index.ts) no longer runs the
// CLI, so this module can execute unconditionally.
// parseAsync (unlike parse) awaits async command actions, so a rejected
// action surfaces here instead of dying as an unhandled rejection.
try {
  await new PortfolioManagerCommand().parseAsync(process.argv);
} catch (error) {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
}
