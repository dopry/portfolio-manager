import { describe, expect, it } from "vitest";
import { isIEmptyResponse, isIPopulatedResponse, isIResponse } from "./IResponse.js";

describe("IResponse type guards", () => {
  it("identifies empty response shape", () => {
    const value = {
      links: "",
      "@_status": "Ok",
    };

    expect(isIEmptyResponse(value)).to.equal(true);
    expect(isIResponse(value)).to.equal(true);
  });

  it("identifies populated response shape", () => {
    const value = {
      links: {
        link: [],
      },
      "@_status": "Ok",
    };

    expect(isIPopulatedResponse(value)).to.equal(true);
    expect(isIResponse(value)).to.equal(true);
  });

  it("rejects invalid response shapes", () => {
    const value = {
      links: {
        wrong: [],
      },
      "@_status": "Ok",
    };

    expect(isIPopulatedResponse(value)).to.equal(false);
    expect(isIEmptyResponse(value)).to.equal(false);
    expect(isIResponse(value)).to.equal(false);
  });

  it("rejects non-object input", () => {
    expect(isIPopulatedResponse("nope")).to.equal(false);
    expect(isIResponse("nope")).to.equal(false);
  });

  it("rejects object without links property", () => {
    const value = {
      "@_status": "Ok",
    };

    expect(isIPopulatedResponse(value)).to.equal(false);
    expect(isIResponse(value)).to.equal(false);
  });
});
