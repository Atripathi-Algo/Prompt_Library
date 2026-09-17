import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Nav } from "@/components/nav";
import { PromptDetailContent } from "@/components/prompt-detail-content";

export default async function PromptDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await auth();

  const prompt = await prisma.prompt.findUnique({
    where: { id },
    include: {
      category: true,
      author: true,
      versions: {
        where: { status: "APPROVED" },
        orderBy: { createdAt: "desc" },
        take: 5,
      },
    },
  });

  if (!prompt || !prompt.isPublished || !session?.user) notFound();

  const isFavorited = await prisma.favorite.findUnique({
    where: { userId_promptId: { userId: session.user.id, promptId: prompt.id } },
  });

  return (
    <div className="min-h-screen bg-background">
      <Nav />
      <main className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
        <Link
          href="/library"
          className="mb-6 inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft size={15} />
          Back to library
        </Link>

        <PromptDetailContent
          prompt={{
            id: prompt.id,
            title: prompt.title,
            currentBody: prompt.currentBody,
            variables: prompt.variables,
            complexity: prompt.complexity,
            useCount: prompt.useCount,
            category: prompt.category ? { name: prompt.category.name } : null,
            author: { name: prompt.author.name, email: prompt.author.email },
            isFavorited: !!isFavorited,
            versions: prompt.versions.map((v) => ({
              id: v.id,
              note: v.note,
              createdAt: v.createdAt.toISOString(),
            })),
          }}
        />
      </main>
    </div>
  );
}
