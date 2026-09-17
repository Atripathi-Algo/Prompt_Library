import { describe, it, expect } from "vitest";
import { isAllowedEmail } from "./constants";

describe("isAllowedEmail", () => {
  it("accepts an org email", () => {
    expect(isAllowedEmail("atripathi@algoanalytics.com")).toBe(true);
  });

  it("rejects a non-org domain", () => {
    expect(isAllowedEmail("someone@gmail.com")).toBe(false);
  });

  it("rejects a lookalike domain that merely contains the org domain as a substring", () => {
    expect(isAllowedEmail("someone@notalgoanalytics.com")).toBe(false);
    expect(isAllowedEmail("someone@algoanalytics.com.evil.com")).toBe(false);
  });

  it("is case-insensitive on the domain", () => {
    expect(isAllowedEmail("Someone@ALGOANALYTICS.COM")).toBe(true);
  });

  it("rejects null/undefined/empty input", () => {
    expect(isAllowedEmail(null)).toBe(false);
    expect(isAllowedEmail(undefined)).toBe(false);
    expect(isAllowedEmail("")).toBe(false);
  });
});
