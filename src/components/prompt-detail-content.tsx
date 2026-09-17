import { History, Braces, Wand2 } from "lucide-react";
import { CopyButton } from "@/components/copy-button";
import { FavoriteButton } from "@/components/favorite-button";
import { ProposeEditForm } from "@/components/propose-edit-form";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { HighlightedBody } from "@/components/highlighted-body";
import { ToolBadge } from "@/components/tool-recommendation-badge";
import { complexityLabel, complexityTone, type ComplexityLevel } from "@/lib/complexity";
import { getToolRecommendation } from "@/lib/tool-recommendation";

export type PromptDetail = {
  id: string;
  title: string;
  currentBody: string;
  variables: string[];
  complexity: ComplexityLevel;
  useCount: number;
  category: { name: string } | null;
  author: { name: string | null; email: string | null };
  isFavorited: boolean;
  versions: { id: string; note: string | null; createdAt: string }[];
};

export function PromptDetailContent({ prompt }: { prompt: PromptDetail }) {
  const recommendation = getToolRecommendation(prompt.category?.name, prompt.complexity);

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">
            {prompt.title}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            By {prompt.author.name ?? prompt.author.email} · Used {prompt.useCount}{" "}
            {prompt.useCount === 1 ? "time" : "times"}
          </p>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {prompt.category && <Badge>{prompt.category.name}</Badge>}
          <Badge tone={complexityTone[prompt.complexity]}>
            {complexityLabel[prompt.complexity]}
          </Badge>
        </div>
      </div>

      <Card className="p-5">
        <HighlightedBody
          body={prompt.currentBody}
          className="whitespace-pre-wrap font-mono text-[13.5px] leading-relaxed text-foreground"
        />
      </Card>

      {prompt.variables.length > 0 && (
        <div className="mt-3 flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground">
          <Braces size={13} />
          <span>Highlighted sections are the inputs to fill in:</span>
          {prompt.variables.map((v) => (
            <code
              key={v}
              className="rounded bg-amber-100 px-1.5 py-0.5 font-mono text-amber-800"
            >
              {`{{${v}}}`}
            </code>
          ))}
        </div>
      )}

      <div className="mt-5 flex items-center gap-3">
        <CopyButton text={prompt.currentBody} promptId={prompt.id} />
        <FavoriteButton promptId={prompt.id} initial={prompt.isFavorited} />
      </div>

      <Card className="mt-5 flex flex-col gap-2.5 bg-muted/40 p-4">
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1.5">
          <span className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
            <Wand2 size={14} />
            Best with
          </span>
          <ToolBadge tool={recommendation.tool} model={recommendation.model} />
          <span className="text-xs text-muted-foreground">— {recommendation.reason}</span>
        </div>
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1.5">
          <span className="text-xs text-muted-foreground">Also works well with:</span>
          {recommendation.alternatives.map((alt) => (
            <ToolBadge key={alt.tool} tool={alt.tool} model={alt.model} />
          ))}
        </div>
        <p className="text-xs text-muted-foreground">
          Budget option: {recommendation.budgetAlternative}
        </p>
      </Card>

      <div className="mt-10">
        <h2 className="mb-3 text-sm font-semibold text-foreground">Propose an edit</h2>
        <ProposeEditForm
          promptId={prompt.id}
          currentBody={prompt.currentBody}
          currentVariables={prompt.variables}
        />
      </div>

      {prompt.versions.length > 0 && (
        <div className="mt-10">
          <h2 className="mb-3 flex items-center gap-1.5 text-sm font-semibold text-foreground">
            <History size={15} />
            Version history
          </h2>
          <ul className="space-y-2">
            {prompt.versions.map((v) => (
              <Card key={v.id} className="p-3.5 text-sm text-muted-foreground">
                {new Date(v.createdAt).toLocaleString()} — {v.note || "No note"}
              </Card>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
