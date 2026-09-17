"use client";

import { useCallback, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { HighlightedBody } from "@/components/highlighted-body";
import { PromptModal } from "@/components/prompt-modal";
import { ToolBadge } from "@/components/tool-recommendation-badge";
import { complexityLabel, complexityTone, type ComplexityLevel } from "@/lib/complexity";
import { getToolRecommendation } from "@/lib/tool-recommendation";

export type PromptCard = {
  id: string;
  title: string;
  currentBody: string;
  useCount: number;
  complexity: ComplexityLevel;
  category: { name: string } | null;
};

export function PromptCardGrid({
  prompts,
  initialOpenId,
}: {
  prompts: PromptCard[];
  initialOpenId: string | null;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [openId, setOpenId] = useState<string | null>(initialOpenId);

  const openPrompt = useCallback(
    (id: string) => {
      setOpenId(id);
      const params = new URLSearchParams(searchParams.toString());
      params.set("prompt", id);
      router.push(`?${params.toString()}`, { scroll: false });
    },
    [router, searchParams]
  );

  const closePrompt = useCallback(() => {
    setOpenId(null);
    const params = new URLSearchParams(searchParams.toString());
    params.delete("prompt");
    const query = params.toString();
    router.push(query ? `?${query}` : "?", { scroll: false });
  }, [router, searchParams]);

  return (
    <>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {prompts.map((p) => (
          <PromptCardItem key={p.id} prompt={p} onOpen={openPrompt} />
        ))}
      </div>

      <PromptModal promptId={openId} onClose={closePrompt} />
    </>
  );
}

function PromptCardItem({
  prompt: p,
  onOpen,
}: {
  prompt: PromptCard;
  onOpen: (id: string) => void;
}) {
  const recommendation = getToolRecommendation(p.category?.name, p.complexity);

  return (
    <button onClick={() => onOpen(p.id)} className="group text-left">
      <Card className="flex h-full flex-col p-5 transition-all duration-150 group-hover:-translate-y-0.5 group-hover:border-primary/30 group-hover:shadow-md">
        <h2 className="font-semibold text-foreground">{p.title}</h2>
        <div className="mb-3 mt-2 flex flex-wrap gap-1.5">
          {p.category && <Badge>{p.category.name}</Badge>}
          <Badge tone={complexityTone[p.complexity]}>{complexityLabel[p.complexity]}</Badge>
        </div>
        <HighlightedBody
          body={p.currentBody}
          className="line-clamp-3 flex-1 whitespace-pre-wrap text-sm leading-relaxed text-muted-foreground"
        />
        <div className="mt-4 flex items-center justify-between gap-2">
          <p className="text-xs font-medium text-muted-foreground">
            Used {p.useCount} {p.useCount === 1 ? "time" : "times"}
          </p>
          <ToolBadge tool={recommendation.tool} model={recommendation.model} />
        </div>
      </Card>
    </button>
  );
}
