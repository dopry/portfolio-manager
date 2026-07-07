import { XSD_ARRAY_JPATHS } from "./generated/isArrayJPaths.js";

/**
 * Schema-true jpaths deliberately NOT applied yet: the facade still models
 * these as single values, so flipping them to arrays is deferred until the
 * consuming code is reworked. Each entry names the follow-up that owns it.
 */
const EXCLUDED_JPATHS = new Set([
  // The metrics facade treats monthlyMetric.value as a scalar (or an
  // xsi:nil marker object); the schema allows multiple values. Rework
  // belongs to the metrics API consolidation (review item E.5).
  "propertyMetrics.metric.monthlyMetric.value",
]);

/**
 * The jpaths fast-xml-parser must always parse as arrays, generated from
 * the vendored XSDs (union across all vendored schema versions) minus the
 * documented exclusions above.
 */
export const ARRAY_JPATHS: ReadonlySet<string> = new Set(
  [...XSD_ARRAY_JPATHS].filter((path) => !EXCLUDED_JPATHS.has(path)),
);
