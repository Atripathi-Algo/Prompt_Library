/*
  Warnings:

  - You are about to drop the `PromptOnTag` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Tag` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "AuditAction" AS ENUM ('ROLE_CHANGED', 'USER_ACTIVATED', 'USER_DEACTIVATED', 'SUBMISSION_APPROVED', 'SUBMISSION_REJECTED');

-- DropForeignKey
ALTER TABLE "PromptOnTag" DROP CONSTRAINT "PromptOnTag_promptId_fkey";

-- DropForeignKey
ALTER TABLE "PromptOnTag" DROP CONSTRAINT "PromptOnTag_tagId_fkey";

-- DropTable
DROP TABLE "PromptOnTag";

-- DropTable
DROP TABLE "Tag";

-- CreateTable
CREATE TABLE "AdminAuditLog" (
    "id" TEXT NOT NULL,
    "action" "AuditAction" NOT NULL,
    "actorId" TEXT NOT NULL,
    "targetType" TEXT NOT NULL,
    "targetId" TEXT NOT NULL,
    "detail" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AdminAuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "AdminAuditLog_targetType_targetId_idx" ON "AdminAuditLog"("targetType", "targetId");

-- CreateIndex
CREATE INDEX "AdminAuditLog_createdAt_idx" ON "AdminAuditLog"("createdAt");

-- CreateIndex
CREATE INDEX "Favorite_promptId_idx" ON "Favorite"("promptId");

-- CreateIndex
CREATE INDEX "Prompt_categoryId_idx" ON "Prompt"("categoryId");

-- CreateIndex
CREATE INDEX "Prompt_complexity_idx" ON "Prompt"("complexity");

-- CreateIndex
CREATE INDEX "Prompt_authorId_idx" ON "Prompt"("authorId");

-- CreateIndex
CREATE INDEX "Prompt_isPublished_updatedAt_idx" ON "Prompt"("isPublished", "updatedAt");

-- CreateIndex
CREATE INDEX "PromptVersion_promptId_status_idx" ON "PromptVersion"("promptId", "status");

-- CreateIndex
CREATE INDEX "PromptVersion_status_createdAt_idx" ON "PromptVersion"("status", "createdAt");

-- CreateIndex
CREATE INDEX "UsageEvent_promptId_idx" ON "UsageEvent"("promptId");

-- CreateIndex
CREATE INDEX "UsageEvent_userId_idx" ON "UsageEvent"("userId");

-- AddForeignKey
ALTER TABLE "AdminAuditLog" ADD CONSTRAINT "AdminAuditLog_actorId_fkey" FOREIGN KEY ("actorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
