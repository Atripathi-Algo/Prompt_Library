import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { tokenize, scoreMatch } from "@/lib/text-match";

const schema = z.object({
  draft: z.string().min(1).max(4000),
});

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const parsed = schema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }

  const queryTokens = new Set(tokenize(parsed.data.draft));
  if (queryTokens.size === 0) {
    return NextResponse.json({ results: [] });
  }

  const prompts = await prisma.prompt.findMany({
    where: { isPublished: true },
    select: {
      id: true,
      title: true,
      currentBody: true,
      useCount: true,
      complexity: true,
      category: { select: { name: true } },
    },
  });

  const scored = prompts
    .map((p) => ({ prompt: p, score: scoreMatch(queryTokens, p.title, p.currentBody) }))
    .filter((s) => s.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 6)
    .map((s) => s.prompt);

  return NextResponse.json({ results: scored });
}
