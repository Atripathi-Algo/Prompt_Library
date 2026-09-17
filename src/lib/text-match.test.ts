import { describe, it, expect } from "vitest";
import { tokenize, scoreMatch } from "./text-match";

describe("tokenize", () => {
  it("lowercases, strips punctuation and braces, and drops short/stop words", () => {
    expect(tokenize("Review my Dockerfile for the security issues!")).toEqual([
      "review",
      "dockerfile",
      "security",
      "issues",
    ]);
  });

  it("strips {{variable}} braces but keeps the variable name as a token", () => {
    expect(tokenize("Summarize {{text}} for {{audience}}")).toContain("text");
  });
});

describe("scoreMatch", () => {
  it("scores a title match higher than a body-only match", () => {
    const query = new Set(["dockerfile"]);
    const titleHit = scoreMatch(query, "Dockerfile Review", "some other content");
    const bodyHit = scoreMatch(query, "Unrelated Title", "review this dockerfile please");
    expect(titleHit).toBeGreaterThan(bodyHit);
  });

  it("returns 0 when nothing overlaps", () => {
    const query = new Set(["kubernetes"]);
    expect(scoreMatch(query, "Marketing Copy", "write ad copy for a campaign")).toBe(0);
  });

  it("does not double-count repeated words", () => {
    const query = new Set(["review"]);
    const repeated = scoreMatch(query, "Review Review Review", "");
    const once = scoreMatch(query, "Review", "");
    expect(repeated).toBe(once);
  });
});
