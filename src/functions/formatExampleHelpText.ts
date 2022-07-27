
export function formatExampleHelpText(example: string, heading = "Example"): string {
  return `\n${heading}:\n\n  ${example}`;
}
