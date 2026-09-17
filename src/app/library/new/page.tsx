import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { Nav } from "@/components/nav";
import { NewPromptForm } from "@/components/new-prompt-form";

export default async function NewPromptPage() {
  const categories = await prisma.category.findMany({ orderBy: { name: "asc" } });

  return (
    <div className="min-h-screen bg-background">
      <Nav />
      <main className="mx-auto max-w-2xl px-4 py-8 sm:px-6">
        <Link
          href="/library"
          className="mb-6 inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft size={15} />
          Back to library
        </Link>

        <h1 className="text-2xl font-semibold tracking-tight text-foreground">
          Submit a prompt
        </h1>
        <p className="mt-1 mb-6 text-sm text-muted-foreground">
          New prompts go into a pending queue for admin approval before appearing in the
          library.
        </p>

        <NewPromptForm categories={categories.map((c) => c.name)} />
      </main>
    </div>
  );
}
