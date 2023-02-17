// Measurement System as used by https://portfoliomanager.energystar.gov/webservices/home/api/reporting/designMetrics/get
// This seems to be an api only type, I cannot seem to find it in the XML schema.
export const MEASUREMENT_SYSTEMS = ["METRIC", "EPA"] as const;
export type MeasurementSystem = typeof MEASUREMENT_SYSTEMS[number];
