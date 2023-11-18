import { formatExampleHelpText } from "./formatExampleHelpText.js";

export function formatExamplesHelpText(examples: string[]): string {
  return formatExampleHelpText(examples.join("\n  "), "Examples");
}
