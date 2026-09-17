import { describe, it, expect } from "vitest";
import { getToolRecommendation } from "./tool-recommendation";

describe("getToolRecommendation", () => {
  it("never recommends a premium/flagship-tier model regardless of complexity", () => {
    const disallowed = ["opus", "gpt-4.1", "gpt-4 turbo", "o1", "ultra"];
    for (const category of ["Data Scientist", "Finance", "Research Prompt", null]) {
      for (const complexity of ["BEGINNER", "INTERMEDIATE", "ADVANCED"] as const) {
        const rec = getToolRecommendation(category, complexity);
        const modelLower = rec.model.toLowerCase();
        for (const bad of disallowed) {
          expect(modelLower).not.toContain(bad);
        }
      }
    }
  });

  it("always offers a Groq budget alternative", () => {
    const rec = getToolRecommendation("Docker", "ADVANCED");
    expect(rec.budgetAlternative).toMatch(/Groq/);
  });

  it("returns exactly the two non-primary tools as alternatives", () => {
    const rec = getToolRecommendation("Data Scientist", "INTERMEDIATE");
    expect(rec.alternatives).toHaveLength(2);
    expect(rec.alternatives.every((a) => a.tool !== rec.tool)).toBe(true);
  });

  it("falls back to a default profile for an unknown category", () => {
    const rec = getToolRecommendation("Some Unmapped Category", "BEGINNER");
    expect(rec.tool).toBeDefined();
    expect(rec.model).toBeTruthy();
  });
});
