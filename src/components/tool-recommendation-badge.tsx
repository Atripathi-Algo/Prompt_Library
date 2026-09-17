import { Bot } from "lucide-react";
import { clsx } from "clsx";
import type { AiTool } from "@/lib/tool-recommendation";

const TOOL_STYLES: Record<AiTool, string> = {
  Claude: "bg-orange-100 text-orange-800",
  ChatGPT: "bg-emerald-100 text-emerald-800",
  Gemini: "bg-indigo-100 text-indigo-800",
};

export function ToolBadge({ tool, model }: { tool: AiTool; model: string }) {
  return (
    <span
      className={clsx(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium",
        TOOL_STYLES[tool]
      )}
    >
      <Bot size={12} />
      {tool} · {model}
    </span>
  );
}
