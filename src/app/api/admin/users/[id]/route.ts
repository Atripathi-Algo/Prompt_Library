import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { idParamSchema } from "@/lib/params";

const schema = z.object({
  role: z.enum(["ADMIN", "USER"]).optional(),
  isActive: z.boolean().optional(),
});

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id: rawId } = await params;
  const parsedId = idParamSchema.safeParse(rawId);
  if (!parsedId.success) {
    return NextResponse.json({ error: "Invalid user id" }, { status: 400 });
  }
  const id = parsedId.data;

  if (id === session.user.id) {
    return NextResponse.json({ error: "Cannot modify your own account here." }, { status: 400 });
  }

  const parsed = schema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }

  await prisma.user.update({ where: { id }, data: parsed.data });

  const auditEntries = [];
  if (parsed.data.role !== undefined) {
    auditEntries.push({
      action: "ROLE_CHANGED" as const,
      actorId: session.user.id,
      targetType: "User",
      targetId: id,
      detail: `role -> ${parsed.data.role}`,
    });
  }
  if (parsed.data.isActive !== undefined) {
    auditEntries.push({
      action: parsed.data.isActive ? ("USER_ACTIVATED" as const) : ("USER_DEACTIVATED" as const),
      actorId: session.user.id,
      targetType: "User",
      targetId: id,
      detail: null,
    });
  }
  if (auditEntries.length > 0) {
    await prisma.adminAuditLog.createMany({ data: auditEntries });
  }

  return NextResponse.json({ ok: true });
}
