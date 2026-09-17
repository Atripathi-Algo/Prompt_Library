import { describe, it, expect } from "vitest";
import { seedPrompts } from "./prompt-data";
import { seedPromptsBatchA } from "./prompt-data-batch-a";
import { seedPromptsBatchB } from "./prompt-data-batch-b";
import { seedPromptsBatchC } from "./prompt-data-batch-c";
import { seedPromptsBatchD } from "./prompt-data-batch-d";

const allPrompts = [
  ...seedPrompts,
  ...seedPromptsBatchA,
  ...seedPromptsBatchB,
  ...seedPromptsBatchC,
  ...seedPromptsBatchD,
];

const VARIABLE_PATTERN = /\{\{([a-zA-Z0-9_]+)\}\}/g;

describe("seed prompt data integrity", () => {
  it("has no duplicate titles across all seed files", () => {
    const titles = allPrompts.map((p) => p.title);
    const duplicates = titles.filter((t, i) => titles.indexOf(t) !== i);
    expect(duplicates).toEqual([]);
  });

  it("every {{variable}} placeholder in the body has a matching entry in variables, and vice versa", () => {
    const mismatches: string[] = [];

    for (const p of allPrompts) {
      const placeholders = new Set(
        Array.from(p.body.matchAll(VARIABLE_PATTERN)).map((m) => m[1])
      );
      const declared = new Set(p.variables);

      for (const v of placeholders) {
        if (!declared.has(v)) mismatches.push(`${p.title}: {{${v}}} used but not declared`);
      }
      for (const v of declared) {
        if (!placeholders.has(v)) mismatches.push(`${p.title}: "${v}" declared but never used`);
      }
    }

    expect(mismatches).toEqual([]);
  });

  it("every prompt has a valid complexity value", () => {
    const invalid = allPrompts.filter(
      (p) => !["Beginner", "Intermediate", "Advanced"].includes(p.complexity)
    );
    expect(invalid).toEqual([]);
  });

  it("every prompt has at least 2 variables", () => {
    const tooFew = allPrompts.filter((p) => p.variables.length < 2).map((p) => p.title);
    expect(tooFew).toEqual([]);
  });
});
