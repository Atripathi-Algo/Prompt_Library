-- CreateEnum
CREATE TYPE "Complexity" AS ENUM ('BEGINNER', 'INTERMEDIATE', 'ADVANCED');

-- AlterTable
ALTER TABLE "Prompt" ADD COLUMN     "complexity" "Complexity" NOT NULL DEFAULT 'BEGINNER';

-- AlterTable
ALTER TABLE "PromptVersion" ADD COLUMN     "complexity" "Complexity" NOT NULL DEFAULT 'BEGINNER';
