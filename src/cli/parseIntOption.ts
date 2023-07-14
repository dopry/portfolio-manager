import { InvalidArgumentError } from "commander";

export function parseIntOption(value: string, previous: number): number {
  console.log("parseIntOption", value, previous);
  const parsed = parseInt(value, 10);
  if (isNaN(parsed)) {
    throw new InvalidArgumentError("Not a number.");
  }
  return parsed;
}