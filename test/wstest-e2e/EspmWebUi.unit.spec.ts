import { describe, expect, it } from "vitest";
import {
  EspmWebUiResponseError,
  isIntermittentWstestBulkSharingFailure,
} from "./EspmWebUi.js";

describe("isIntermittentWstestBulkSharingFailure", () => {
  it("recognizes only the observed empty-object HTTP 500", () => {
    expect(
      isIntermittentWstestBulkSharingFailure(
        new EspmWebUiResponseError(
          "/wsBulkSharing/authorizeExchange.json",
          500,
          "{}",
        ),
      ),
    ).toBe(true);
  });

  it.each([
    new EspmWebUiResponseError(
      "/wsBulkSharing/authorizeExchange.json",
      503,
      "{}",
    ),
    new EspmWebUiResponseError(
      "/wsBulkSharing/authorizeExchange.json",
      500,
      '{"error":"different failure"}',
    ),
    new EspmWebUiResponseError("/sharing/submit.json", 500, "{}"),
    new Error("selector drift"),
  ])("rejects unrelated or changed failures", (error) => {
    expect(isIntermittentWstestBulkSharingFailure(error)).toBe(false);
  });
});
