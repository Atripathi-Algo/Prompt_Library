import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { idParamSchema } from "@/lib/params";
import { sendEmail } from "@/lib/email";
import { logger } from "@/lib/logger";

const schema = z.object({
  action: z.enum(["approve", "reject"]),
  rejectReason: z.string().optional(),
});

export async function POST(
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
    return NextResponse.json({ error: "Invalid submission id" }, { status: 400 });
  }
  const id = parsedId.data;

  const parsed = schema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }

  const version = await prisma.promptVersion.findUnique({
    where: { id },
    include: { prompt: { select: { title: true } }, author: { select: { email: true, name: true } } },
  });
  if (!version) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const { action, rejectReason } = parsed.data;

  if (action === "approve") {
    await prisma.$transaction([
      prisma.promptVersion.update({
        where: { id },
        data: { status: "APPROVED", reviewerId: session.user.id, reviewedAt: new Date() },
      }),
      prisma.prompt.update({
        where: { id: version.promptId },
        data: {
          currentBody: version.body,
          variables: version.variables,
          complexity: version.complexity,
          isPublished: true,
        },
      }),
      prisma.adminAuditLog.create({
        data: {
          action: "SUBMISSION_APPROVED",
          actorId: session.user.id,
          targetType: "PromptVersion",
          targetId: id,
          detail: version.prompt.title,
        },
      }),
    ]);
  } else {
    await prisma.$transaction([
      prisma.promptVersion.update({
        where: { id },
        data: {
          status: "REJECTED",
          reviewerId: session.user.id,
          reviewedAt: new Date(),
          rejectReason,
        },
      }),
      prisma.adminAuditLog.create({
        data: {
          action: "SUBMISSION_REJECTED",
          actorId: session.user.id,
          targetType: "PromptVersion",
          targetId: id,
          detail: rejectReason ? `${version.prompt.title}: ${rejectReason}` : version.prompt.title,
        },
      }),
    ]);
  }

  if (version.author.email) {
    sendEmail({
      to: version.author.email,
      subject:
        action === "approve"
          ? `Your prompt "${version.prompt.title}" was approved`
          : `Your prompt "${version.prompt.title}" needs changes`,
      text:
        action === "approve"
          ? `Good news — "${version.prompt.title}" was approved and is now live in the Prompt Library.`
          : `Your submission "${version.prompt.title}" wasn't approved.${
              rejectReason ? ` Reason: ${rejectReason}` : ""
            } Feel free to revise and resubmit.`,
    }).catch((err) => logger.error({ err }, "submissions: notification email failed"));
  }

  return NextResponse.json({ ok: true });
}
