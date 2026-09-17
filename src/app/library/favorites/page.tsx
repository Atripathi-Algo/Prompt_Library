import Link from "next/link";
import { Star } from "lucide-react";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Nav } from "@/components/nav";
import { Card } from "@/components/ui/card";
import { PromptCardGrid } from "@/components/prompt-card-grid";

export default async function FavoritesPage({
  searchParams,
}: {
  searchParams: Promise<{ prompt?: string }>;
}) {
  const session = await auth();
  if (!session?.user) return null;
  const { prompt: openPromptId } = await searchParams;

  const favorites = await prisma.favorite.findMany({
    where: { userId: session.user.id },
    select: {
      prompt: {
        select: {
          id: true,
          title: true,
          currentBody: true,
          useCount: true,
          complexity: true,
          category: { select: { name: true } },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  const prompts = favorites.map((f) => f.prompt);

  return (
    <div className="min-h-screen bg-background">
      <Nav />
      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        <h1 className="mb-1 text-2xl font-semibold tracking-tight text-foreground">
          My favorites
        </h1>
        <p className="mb-6 text-sm text-muted-foreground">
          Prompts you&apos;ve starred for quick access.
        </p>

        {prompts.length === 0 ? (
          <Card className="flex flex-col items-center gap-3 px-6 py-16 text-center">
            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-muted text-muted-foreground">
              <Star size={20} />
            </span>
            <div>
              <p className="font-medium text-foreground">No favorites yet</p>
              <p className="mt-1 text-sm text-muted-foreground">
                <Link href="/library" className="font-medium text-primary hover:underline">
                  Browse the library
                </Link>{" "}
                and star prompts you use often.
              </p>
            </div>
          </Card>
        ) : (
          <PromptCardGrid prompts={prompts} initialOpenId={openPromptId ?? null} />
        )}
      </main>
    </div>
  );
}
