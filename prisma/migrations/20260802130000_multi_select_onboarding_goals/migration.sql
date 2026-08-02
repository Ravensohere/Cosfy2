-- AlterTable
ALTER TABLE "User" ADD COLUMN "onboardingGoals" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[];

-- Backfill existing single-goal data into the new array column
UPDATE "User" SET "onboardingGoals" = ARRAY["onboardingGoal"] WHERE "onboardingGoal" IS NOT NULL;

-- AlterTable
ALTER TABLE "User" DROP COLUMN "onboardingGoal";
