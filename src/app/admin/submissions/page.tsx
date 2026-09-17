import { Inbox } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { Nav } from "@/components/nav";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ReviewButtons } from "@/components/review-buttons";
import { complexityLabel, complexityTone } from "@/lib/complexity";

export default async function SubmissionsPage() {
  const pending = await prisma.promptVersion.findMany({
    where: { status: "PENDING" },
    include: { prompt: true, author: true },
    orderBy: { createdAt: "asc" },
  });

  return (
    <div className="min-h-screen bg-background">
      <Nav />
      <main className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
        <h1 className="mb-1 text-2xl font-semibold tracking-tight text-foreground">
          Pending submissions
        </h1>
        <p className="mb-6 text-sm text-muted-foreground">
          Review new prompts and proposed edits before they go live.
        </p>

        {pending.length === 0 ? (
          <Card className="flex flex-col items-center gap-3 px-6 py-16 text-center">
            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-muted text-muted-foreground">
              <Inbox size={20} />
            </span>
            <p className="font-medium text-foreground">Nothing pending review</p>
          </Card>
        ) : (
          <div className="space-y-4">
            {pending.map((v) => (
              <Card key={v.id} className="p-5">
                <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <h2 className="font-semibold text-foreground">{v.prompt.title}</h2>
                    <Badge tone={complexityTone[v.complexity]}>
                      {complexityLabel[v.complexity]}
                    </Badge>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {v.author.name ?? v.author.email} · {v.createdAt.toLocaleString()}
                  </span>
                </div>
                <pre className="whitespace-pre-wrap rounded-lg bg-muted p-3.5 font-mono text-[13.5px] leading-relaxed text-foreground">
                  {v.body}
                </pre>
                {v.note && (
                  <p className="mt-2 text-xs text-muted-foreground">Note: {v.note}</p>
                )}
                <ReviewButtons versionId={v.id} />
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
