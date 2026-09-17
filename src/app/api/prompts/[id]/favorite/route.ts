import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { idParamSchema } from "@/lib/params";
import { logger } from "@/lib/logger";

export async function POST(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const parsedId = idParamSchema.safeParse(id);
  if (!parsedId.success) {
    return NextResponse.json({ error: "Invalid prompt id" }, { status: 400 });
  }
  const promptId = parsedId.data;
  const userId = session.user.id;

  try {
    const existing = await prisma.favorite.findUnique({
      where: { userId_promptId: { userId, promptId } },
    });

    if (existing) {
      await prisma.favorite.delete({ where: { userId_promptId: { userId, promptId } } });
      return NextResponse.json({ favorited: false });
    }

    await prisma.favorite.create({ data: { userId, promptId } });
    return NextResponse.json({ favorited: true });
  } catch (err) {
    logger.error({ err, promptId, userId }, "prompts/favorite: toggle failed");
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
