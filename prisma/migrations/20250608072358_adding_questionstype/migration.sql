-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "QuestionType" ADD VALUE 'SCALE';
ALTER TYPE "QuestionType" ADD VALUE 'TEXT';
ALTER TYPE "QuestionType" ADD VALUE 'BOOLEAN';

-- AlterTable
ALTER TABLE "Membership" ADD COLUMN     "stripePriceId" TEXT;
