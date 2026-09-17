import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
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

  try {
    await prisma.$transaction([
      prisma.prompt.update({ where: { id: parsedId.data }, data: { useCount: { increment: 1 } } }),
      prisma.usageEvent.create({
        data: { type: "COPY", promptId: parsedId.data, userId: session.user.id },
      }),
    ]);
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2025") {
      return NextResponse.json({ error: "Prompt not found" }, { status: 404 });
    }
    logger.error({ err, promptId: parsedId.data }, "prompts/copy: failed to record copy");
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
