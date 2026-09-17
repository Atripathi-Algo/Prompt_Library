import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const createSchema = z.object({
  title: z.string().min(1).max(200),
  body: z.string().min(1),
  variables: z.array(z.string()).default([]),
  categoryName: z.string().optional(),
  complexity: z.enum(["BEGINNER", "INTERMEDIATE", "ADVANCED"]).default("BEGINNER"),
});

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const parsed = createSchema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }

  const { title, body, variables, categoryName, complexity } = parsed.data;

  const category = categoryName
    ? await prisma.category.upsert({
        where: { name: categoryName },
        update: {},
        create: { name: categoryName },
      })
    : null;

  // Non-admin submissions are created unpublished, pending an approved version.
  const isAdmin = session.user.role === "ADMIN";

  const prompt = await prisma.prompt.create({
    data: {
      title,
      currentBody: isAdmin ? body : "",
      variables: isAdmin ? variables : [],
      complexity,
      isPublished: isAdmin,
      authorId: session.user.id,
      categoryId: category?.id,
      versions: {
        create: {
          body,
          variables,
          complexity,
          status: isAdmin ? "APPROVED" : "PENDING",
          authorId: session.user.id,
          ...(isAdmin
            ? { reviewerId: session.user.id, reviewedAt: new Date() }
            : {}),
        },
      },
    },
  });

  return NextResponse.json({ id: prompt.id });
}
