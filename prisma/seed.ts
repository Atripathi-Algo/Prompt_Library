import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const adminEmail = process.env.ADMIN_EMAIL ?? "admin@algoanalytics.com";
  const passwordHash = await bcrypt.hash("ChangeMe123!", 12);

  const admin = await prisma.user.upsert({
    where: { email: adminEmail },
    update: { role: "ADMIN" },
    create: {
      email: adminEmail,
      name: "Admin",
      role: "ADMIN",
      passwordHash,
    },
  });

  const category = await prisma.category.upsert({
    where: { name: "General" },
    update: {},
    create: { name: "General" },
  });

  await prisma.prompt.upsert({
    where: { id: "seed-welcome-prompt" },
    update: {},
    create: {
      id: "seed-welcome-prompt",
      title: "Welcome prompt",
      currentBody:
        "Summarize the following text for a {{audience}} audience in {{tone}} tone:\n\n{{text}}",
      variables: ["audience", "tone", "text"],
      authorId: admin.id,
      categoryId: category.id,
    },
  });

  console.log(`Seeded admin: ${adminEmail} / password: ChangeMe123! (change this immediately)`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
