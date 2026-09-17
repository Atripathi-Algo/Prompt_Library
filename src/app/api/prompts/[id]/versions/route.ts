import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const schema = z.object({
  body: z.string().min(1),
  variables: z.array(z.string()).default([]),
  note: z.string().optional(),
});

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await params;
  const parsed = schema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }

  const { body, variables, note } = parsed.data;
  const isAdmin = session.user.role === "ADMIN";

  const existingPrompt = await prisma.prompt.findUnique({
    where: { id },
    select: { complexity: true },
  });
  const complexity = existingPrompt?.complexity ?? "BEGINNER";

  const version = await prisma.promptVersion.create({
    data: {
      promptId: id,
      body,
      variables,
      complexity,
      note,
      authorId: session.user.id,
      status: isAdmin ? "APPROVED" : "PENDING",
      ...(isAdmin ? { reviewerId: session.user.id, reviewedAt: new Date() } : {}),
    },
  });

  if (isAdmin) {
    await prisma.prompt.update({
      where: { id },
      data: { currentBody: body, variables },
    });
  }

  return NextResponse.json({ id: version.id });
}
