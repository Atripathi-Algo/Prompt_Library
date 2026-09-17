import { PrismaClient } from "@prisma/client";
import { seedPrompts } from "./prompt-data";
import { seedPromptsBatchA } from "./prompt-data-batch-a";
import { seedPromptsBatchB } from "./prompt-data-batch-b";
import { seedPromptsBatchC } from "./prompt-data-batch-c";
import { seedPromptsBatchD } from "./prompt-data-batch-d";

const allSeedPrompts = [
  ...seedPrompts,
  ...seedPromptsBatchA,
  ...seedPromptsBatchB,
  ...seedPromptsBatchC,
  ...seedPromptsBatchD,
];

const prisma = new PrismaClient();

async function main() {
  const adminEmail = process.env.ADMIN_EMAIL ?? "admin@algoanalytics.com";
  const admin = await prisma.user.findUnique({ where: { email: adminEmail } });
  if (!admin) {
    throw new Error(`Admin user ${adminEmail} not found — run "npm run db:seed" first.`);
  }

  const categoryCache = new Map<string, string>();
  const seenTitles = new Set<string>();
  let created = 0;
  let skipped = 0;
  let duplicates = 0;

  for (const p of allSeedPrompts) {
    if (seenTitles.has(p.title)) {
      duplicates++;
      continue;
    }
    seenTitles.add(p.title);

    let categoryId = categoryCache.get(p.category);
    if (!categoryId) {
      const category = await prisma.category.upsert({
        where: { name: p.category },
        update: {},
        create: { name: p.category },
      });
      categoryId = category.id;
      categoryCache.set(p.category, categoryId);
    }

    const existing = await prisma.prompt.findFirst({ where: { title: p.title } });
    if (existing) {
      skipped++;
      continue;
    }

    await prisma.prompt.create({
      data: {
        title: p.title,
        currentBody: p.body,
        variables: p.variables,
        complexity: p.complexity.toUpperCase() as "BEGINNER" | "INTERMEDIATE" | "ADVANCED",
        isPublished: true,
        authorId: admin.id,
        categoryId,
        versions: {
          create: {
            body: p.body,
            variables: p.variables,
            complexity: p.complexity.toUpperCase() as "BEGINNER" | "INTERMEDIATE" | "ADVANCED",
            status: "APPROVED",
            authorId: admin.id,
            reviewerId: admin.id,
            reviewedAt: new Date(),
          },
        },
      },
    });
    created++;
  }

  console.log(
    `Seeded library prompts: ${created} created, ${skipped} skipped (already existed), ${duplicates} in-batch duplicate titles skipped.`
  );
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
