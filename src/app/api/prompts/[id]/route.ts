import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { idParamSchema } from "@/lib/params";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id: rawId } = await params;
  const parsedId = idParamSchema.safeParse(rawId);
  if (!parsedId.success) {
    return NextResponse.json({ error: "Invalid prompt id" }, { status: 400 });
  }
  const id = parsedId.data;

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

  if (!prompt || !prompt.isPublished) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const favorite = await prisma.favorite.findUnique({
    where: { userId_promptId: { userId: session.user.id, promptId: prompt.id } },
  });

  return NextResponse.json({
    id: prompt.id,
    title: prompt.title,
    currentBody: prompt.currentBody,
    variables: prompt.variables,
    complexity: prompt.complexity,
    useCount: prompt.useCount,
    category: prompt.category ? { name: prompt.category.name } : null,
    author: { name: prompt.author.name, email: prompt.author.email },
    isFavorited: !!favorite,
    versions: prompt.versions.map((v) => ({
      id: v.id,
      note: v.note,
      createdAt: v.createdAt.toISOString(),
    })),
  });
}
