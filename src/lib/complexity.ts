export const COMPLEXITY_LEVELS = ["BEGINNER", "INTERMEDIATE", "ADVANCED"] as const;
export type ComplexityLevel = (typeof COMPLEXITY_LEVELS)[number];

export const complexityLabel: Record<ComplexityLevel, string> = {
  BEGINNER: "Beginner",
  INTERMEDIATE: "Intermediate",
  ADVANCED: "Advanced",
};

export const complexityTone: Record<ComplexityLevel, "default" | "accent" | "muted" | "warn"> = {
  BEGINNER: "accent",
  INTERMEDIATE: "default",
  ADVANCED: "warn",
};
