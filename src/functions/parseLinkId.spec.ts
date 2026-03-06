import { describe, expect, it } from "vitest";
import { parseLinkId } from "./parseLinkId.js";

describe("parseLinkId", () => {
  it("uses @_id when present", () => {
    const id = parseLinkId({
      "@_httpMethod": "get",
      "@_id": "123",
      "@_link": "/property/999",
      "@_linkDescription": "desc",
    });

    expect(id).to.equal(123);
  });

  it("falls back to parsing from @_link", () => {
    const id = parseLinkId({
      "@_httpMethod": "get",
      "@_link": "/property/456",
      "@_linkDescription": "desc",
    });

    expect(id).to.equal(456);
  });

  it("returns undefined when id is not numeric", () => {
    const id = parseLinkId({
      "@_httpMethod": "get",
      "@_id": "abc",
      "@_link": "/property/456",
      "@_linkDescription": "desc",
    });

    expect(id).to.equal(undefined);
  });

  it("returns undefined for empty @_id and non-numeric link tail", () => {
    const id = parseLinkId({
      "@_httpMethod": "get",
      "@_id": "",
      "@_link": "/property/",
      "@_linkDescription": "desc",
    });

    expect(id).to.equal(undefined);
  });
});
