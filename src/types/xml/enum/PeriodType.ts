export const PERIOD_TYPES = ["CURRENT", "BASELINE"] as const;
export type PeriodType = typeof PERIOD_TYPES[number];
