-- AlterTable
ALTER TABLE "User" ADD COLUMN     "termsAcceptedAt" TIMESTAMP(3),
ADD COLUMN     "toolsOrder" TEXT[] DEFAULT ARRAY[]::TEXT[];
