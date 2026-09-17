import type { ComplexityLevel } from "@/lib/complexity";

export type AiTool = "Claude" | "ChatGPT" | "Gemini";

type CategoryProfile = {
  tool: AiTool;
  reason: string;
};

// Which product tends to be the strongest fit for each category, based on each
// model family's well-known relative strengths (code, structured technical
// writing, long-context research, creative/business writing).
const CATEGORY_PROFILES: Record<string, CategoryProfile> = {
  "Data Scientist": { tool: "Claude", reason: "strong code + statistical reasoning" },
  Managers: { tool: "ChatGPT", reason: "strong business & interpersonal writing" },
  Marketing: { tool: "ChatGPT", reason: "strong creative copywriting" },
  "UI/UX Developers": { tool: "Claude", reason: "careful structured critique and design docs" },
  "Full Stack Developers": { tool: "Claude", reason: "widely regarded as strongest at code" },
  "Mobile App Development": { tool: "Claude", reason: "strong code generation and review" },
  "Github Commands": { tool: "Claude", reason: "strong at git workflows and code review" },
  Azure: { tool: "Claude", reason: "precise, structured technical explanations" },
  AWS: { tool: "Claude", reason: "precise, structured technical explanations" },
  Docker: { tool: "Claude", reason: "strong at reading and rewriting config/code" },
  "QA Testing": { tool: "ChatGPT", reason: "efficient at structured test-case generation" },
  "Research Prompt": { tool: "Gemini", reason: "very large context window for synthesis" },
  Finance: { tool: "ChatGPT", reason: "strong numeric/business reasoning" },
  "Presentation Skills": { tool: "ChatGPT", reason: "strong storytelling and structuring" },
  "Content Generation": { tool: "Gemini", reason: "long-context, fast long-form drafting" },
};

const DEFAULT_PROFILE: CategoryProfile = { tool: "Claude", reason: "reliable general-purpose choice" };

// Model tiers per tool. Complexity picks the tier — never jumping to a
// flagship/"premium" model unless the task is genuinely advanced, and even
// then staying one notch below the most expensive tier available.
const MODEL_TIERS: Record<AiTool, Record<ComplexityLevel, string>> = {
  Claude: {
    BEGINNER: "Haiku",
    INTERMEDIATE: "Sonnet",
    ADVANCED: "Sonnet",
  },
  ChatGPT: {
    BEGINNER: "GPT-4o mini",
    INTERMEDIATE: "GPT-4o",
    ADVANCED: "GPT-4o",
  },
  Gemini: {
    BEGINNER: "2.0 Flash",
    INTERMEDIATE: "1.5 Pro",
    ADVANCED: "1.5 Pro",
  },
};

const ALL_TOOLS: AiTool[] = ["Claude", "ChatGPT", "Gemini"];

export type ToolPick = { tool: AiTool; model: string };

export type ToolRecommendation = {
  tool: AiTool;
  model: string;
  reason: string;
  alternatives: ToolPick[];
  budgetAlternative: string;
};

export function getToolRecommendation(
  category: string | null | undefined,
  complexity: ComplexityLevel
): ToolRecommendation {
  const profile = (category && CATEGORY_PROFILES[category]) || DEFAULT_PROFILE;
  const model = MODEL_TIERS[profile.tool][complexity];

  const alternatives = ALL_TOOLS.filter((t) => t !== profile.tool).map((tool) => ({
    tool,
    model: MODEL_TIERS[tool][complexity],
  }));

  return {
    tool: profile.tool,
    model,
    reason: profile.reason,
    alternatives,
    budgetAlternative:
      complexity === "BEGINNER"
        ? "Groq — Llama 3.3 70B (free tier, fastest)"
        : "Groq — Llama 3.3 70B (free tier) for a quicker, cheaper first pass",
  };
}
