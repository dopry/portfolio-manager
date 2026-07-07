import { describe, expect, it } from "vitest";
import { ARRAY_JPATHS } from "./arrayJPaths.js";
import { XSD_ARRAY_JPATHS_BY_VERSION } from "./generated/isArrayJPaths.js";

/**
 * The hand-maintained list that ARRAY_JPATHS replaced. Every entry must stay
 * covered by the generated set — a regression here means the generator (or a
 * vendored schema update) dropped a path the runtime depends on.
 */
const LEGACY_HAND_MAINTAINED_JPATHS = [
  "response.links.link",
  "propertyMetrics.metric",
  "meterData.links.link",
  "meterPropertyAssociationList.waterMeterAssociation.meters.meterId",
  "meterPropertyAssociationList.energyMeterAssociation.meters.meterId",
  "meterPropertyAssociationList.wasteMeterAssociation.meters.meterId",
  "meterData.meterDelivery",
  "meterData.meterConsumption",
  "additionalIdentifiers.additionalIdentifier",
  "pendingList.links.link",
  "pendingList.property",
  "pendingList.account",
  "pendingList.meter",
  "notificationList.notification",
];

describe("ARRAY_JPATHS", () => {
  it("covers every legacy hand-maintained jpath", () => {
    const missing = LEGACY_HAND_MAINTAINED_JPATHS.filter(
      (path) => !ARRAY_JPATHS.has(path),
    );
    expect(missing).toEqual([]);
  });

  it("includes schema-declared paths the hand list had drifted from", () => {
    // monthlyMetric is maxOccurs="unbounded" in propertyMetrics.xsd; its
    // absence from the hand list made single-month responses parse as
    // objects and crash the metrics reducers.
    expect(ARRAY_JPATHS.has("propertyMetrics.metric.monthlyMetric")).toBe(true);
    expect(ARRAY_JPATHS.has("customFieldList.customField")).toBe(true);
    expect(ARRAY_JPATHS.has("response.errors.error")).toBe(true);
    expect(ARRAY_JPATHS.has("response.warnings.warning")).toBe(true);
  });

  it("omits documented exclusions until their facade rework lands", () => {
    // Deferred to the metrics API consolidation (review item E.5).
    expect(ARRAY_JPATHS.has("propertyMetrics.metric.monthlyMetric.value")).toBe(
      false,
    );
  });

  it("exposes at least one vendored schema version", () => {
    expect(Object.keys(XSD_ARRAY_JPATHS_BY_VERSION).length).toBeGreaterThan(0);
    for (const paths of Object.values(XSD_ARRAY_JPATHS_BY_VERSION)) {
      expect(paths.size).toBeGreaterThan(0);
    }
  });
});
