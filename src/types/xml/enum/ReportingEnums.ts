// see: /xml-schemas/portfoliomanager-schema/enum/reportingEnums.xsd

export const REPORTING_INTERVALS = ["MONTHLY", "QUARTERLY", "YEARLY"] as const;
export type ReportingInterval = typeof REPORTING_INTERVALS[number];

// CUSTOM - Custom report.
// ENERGY_STAR - ENERGY STAR reports that are pre-defined (i.e., Water Performance, Energy Performance, etc.). This type is currently not support yet.
// DATA_RESPONSE - Data response. This type is currently not support yet.
// DATA_REQUEST - Data request. This type is currently not support yet.
export const REPORT_TYPES = [
  "CUSTOM",
  "ENERGY_STAR",
  "DATA_RESPONSE",
  "DATA_REQUEST",
] as const;
export type ReportType = typeof REPORT_TYPES[number];

// INITIALIZED - Indicates that the report was initially created or its configuration (i.e., timeframe, properties, metrics, etc.) has been updated.
// SUBMITTED - Indicates that the report has been submitted for generation and is waiting to be generated.
// IN_PROCESS - Indicates that the report is currently being generated.
// FAILED - Indicates that the report encountered an unknown error during the generation step.
// GENERATED - Indicates that report has completed generation and is available for download.
// READY_FOR_DOWNLOAD - This status is currently not support yet.
export const REPORT_STATUSES = [
  "INTIALIZED",
  "SUBMITTED",
  "IN_PROCESS",
  "FAILED",
  "GENERATED",
  "READY_FOR_DOWNLOAD",
];
export type ReportStatus = typeof REPORT_STATUSES[number];
