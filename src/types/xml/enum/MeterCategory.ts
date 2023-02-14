export const METER_CATEGORIES = ["ENERGY", "WATER", "WASTE"] as const;
export type MeterCategory = typeof METER_CATEGORIES[number];
