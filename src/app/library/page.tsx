import Link from "next/link";
import { Search, Plus, Sparkles, ChevronLeft, ChevronRight } from "lucide-react";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Nav } from "@/components/nav";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { PromptCardGrid } from "@/components/prompt-card-grid";
import { COMPLEXITY_LEVELS, complexityLabel, type ComplexityLevel } from "@/lib/complexity";

const PAGE_SIZE = 24;

export default async function LibraryPage({
  searchParams,
}: {
  searchParams: Promise<{
    q?: string;
    category?: string;
    complexity?: string;
    prompt?: string;
    page?: string;
  }>;
}) {
  const session = await auth();
  const { q, category, complexity, prompt: openPromptId, page: pageParam } = await searchParams;
  const complexityFilter = COMPLEXITY_LEVELS.includes(complexity as ComplexityLevel)
    ? (complexity as ComplexityLevel)
    : undefined;
  const page = Math.max(1, Number(pageParam) || 1);

  const where = {
    isPublished: true,
    ...(category ? { category: { name: category } } : {}),
    ...(complexityFilter ? { complexity: complexityFilter } : {}),
    ...(q
      ? {
          OR: [
            { title: { contains: q, mode: "insensitive" as const } },
            { currentBody: { contains: q, mode: "insensitive" as const } },
          ],
        }
      : {}),
  };

  const [totalCount, prompts] = await Promise.all([
    prisma.prompt.count({ where }),
    prisma.prompt.findMany({
      where,
      select: {
        id: true,
        title: true,
        currentBody: true,
        useCount: true,
        complexity: true,
        category: { select: { name: true } },
      },
      orderBy: { updatedAt: "desc" },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
  ]);

  if (q && totalCount === 0 && session?.user?.id) {
    await prisma.usageEvent.create({
      data: { type: "SEARCH_NO_RESULT", query: q, userId: session.user.id },
    });
  }

  const categories = await prisma.category.findMany({ orderBy: { name: "asc" } });
  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));

  function pageHref(targetPage: number) {
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    if (category) params.set("category", category);
    if (complexityFilter) params.set("complexity", complexityFilter);
    if (targetPage > 1) params.set("page", String(targetPage));
    const query = params.toString();
    return query ? `/library?${query}` : "/library";
  }

  return (
    <div className="min-h-screen bg-background">
      <Nav />
      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-foreground">
              Prompt Library
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Browse, search, and reuse prompts shared across the team.
            </p>
          </div>
          <Link href="/library/new">
            <Button>
              <Plus size={16} />
              Submit a prompt
            </Button>
          </Link>
        </div>

        <form className="mb-6 flex flex-col gap-3 sm:flex-row" method="get">
          <div className="relative flex-1">
            <Search
              size={17}
              className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground"
            />
            <input
              name="q"
              defaultValue={q}
              placeholder="Search prompts by title or content..."
              className="w-full rounded-lg border border-border bg-white py-2.5 pl-10 pr-3.5 text-[15px] text-foreground placeholder:text-muted-foreground transition-colors focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/15"
            />
          </div>
          <select
            name="category"
            defaultValue={category ?? ""}
            className="rounded-lg border border-border bg-white px-3.5 py-2.5 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/15 sm:w-52"
          >
            <option value="">All categories</option>
            {categories.map((c) => (
              <option key={c.id} value={c.name}>
                {c.name}
              </option>
            ))}
          </select>
          <select
            name="complexity"
            defaultValue={complexityFilter ?? ""}
            className="rounded-lg border border-border bg-white px-3.5 py-2.5 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/15 sm:w-44"
          >
            <option value="">All levels</option>
            {COMPLEXITY_LEVELS.map((level) => (
              <option key={level} value={level}>
                {complexityLabel[level]}
              </option>
            ))}
          </select>
          <Button type="submit" variant="outline">
            Search
          </Button>
        </form>

        {totalCount === 0 ? (
          <Card className="flex flex-col items-center gap-3 px-6 py-16 text-center">
            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-muted text-muted-foreground">
              <Sparkles size={20} />
            </span>
            <div>
              <p className="font-medium text-foreground">No prompts found</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Try a different search, or be the first to submit one.
              </p>
            </div>
            <Link href="/library/new">
              <Button variant="outline" size="sm" className="mt-2">
                <Plus size={15} />
                Submit a prompt
              </Button>
            </Link>
          </Card>
        ) : (
          <>
            <p className="mb-3 text-sm text-muted-foreground">
              {totalCount} {totalCount === 1 ? "prompt" : "prompts"}
              {totalPages > 1 ? ` · page ${page} of ${totalPages}` : ""}
            </p>
            <PromptCardGrid prompts={prompts} initialOpenId={openPromptId ?? null} />

            {totalPages > 1 && (
              <div className="mt-8 flex items-center justify-center gap-3">
                <Link
                  href={pageHref(page - 1)}
                  aria-disabled={page <= 1}
                  className={
                    page <= 1
                      ? "pointer-events-none flex items-center gap-1 rounded-lg border border-border px-3 py-2 text-sm text-muted-foreground opacity-40"
                      : "flex items-center gap-1 rounded-lg border border-border px-3 py-2 text-sm text-foreground transition-colors hover:bg-muted"
                  }
                >
                  <ChevronLeft size={15} />
                  Previous
                </Link>
                <span className="text-sm text-muted-foreground">
                  Page {page} of {totalPages}
                </span>
                <Link
                  href={pageHref(page + 1)}
                  aria-disabled={page >= totalPages}
                  className={
                    page >= totalPages
                      ? "pointer-events-none flex items-center gap-1 rounded-lg border border-border px-3 py-2 text-sm text-muted-foreground opacity-40"
                      : "flex items-center gap-1 rounded-lg border border-border px-3 py-2 text-sm text-foreground transition-colors hover:bg-muted"
                  }
                >
                  Next
                  <ChevronRight size={15} />
                </Link>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}
