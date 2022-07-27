import { formatExampleHelpText } from "./formatExampleHelpText";

export function formatExamplesHelpText(examples: string[]): string {
  return formatExampleHelpText(examples.join("\n  "), "Examples");
}
