import { describe, expect, it } from "vitest";
import { toXmlDateString, toXmlDateTimeString } from "./util.js";

describe("xml util", () => {
  it("formats xml date string", () => {
    const date = new Date(2024, 0, 9);
    expect(toXmlDateString(date)).to.equal("2024-01-09");
  });

  it("formats xml datetime string with timezone offset", () => {
    const date = new Date(2024, 10, 12, 13, 4, 5);
    const got = toXmlDateTimeString(date);

    expect(got).to.match(/^2024-11-12T13:04:05[+-]\d{2}:\d{2}$/);
  });

  it("handles double-digit date parts", () => {
    const date = new Date(2024, 10, 12, 13, 14, 15);
    const got = toXmlDateTimeString(date);

    expect(got).to.match(/^2024-11-12T13:14:15[+-]\d{2}:\d{2}$/);
  });

  it("uses + sign when timezone offset is negative", () => {
    const date = new Date(2024, 10, 12, 13, 14, 15);
    date.getTimezoneOffset = () => -120;

    const got = toXmlDateTimeString(date);
    expect(got).to.match(/\+02:00$/);
  });

  it("uses - sign when timezone offset is positive", () => {
    const date = new Date(2024, 10, 12, 13, 14, 15);
    date.getTimezoneOffset = () => 120;

    const got = toXmlDateTimeString(date);
    expect(got).to.match(/-02:00$/);
  });
});
