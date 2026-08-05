#!/usr/bin/env node
import { PortfolioManagerCommand } from "./cli/PortfolioManagerCommand.js";
import { PortfolioManagerApiError } from "./PortfolioManagerApi.js";

export function formatCliError(error: unknown): string {
  if (error instanceof PortfolioManagerApiError) {
    const lines = [
      `Portfolio Manager API request failed: HTTP ${error.status}${error.statusText ? ` ${error.statusText}` : ""}`,
    ];
    if (error.url) {
      lines.push(`URL: ${error.url}`);
    }
    if (error.responseText?.trim()) {
      lines.push(`Response: ${error.responseText.trim()}`);
    }
    return lines.join("\n");
  }
  return error instanceof Error ? error.message : String(error);
}

// Dedicated CLI entry point. The library entry (index.ts) no longer runs the
// CLI, so this module can execute unconditionally.
// parseAsync (unlike parse) awaits async command actions, so a rejected
// action surfaces here instead of dying as an unhandled rejection.
try {
  await new PortfolioManagerCommand().parseAsync(process.argv);
} catch (error) {
  console.error(formatCliError(error));
  process.exitCode = 1;
}
