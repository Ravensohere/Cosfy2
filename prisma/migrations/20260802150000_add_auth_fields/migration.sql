-- AlterTable
ALTER TABLE "User" ADD COLUMN "firebaseUid" TEXT,
ADD COLUMN "email" TEXT,
ADD COLUMN "phoneNumber" TEXT,
ADD COLUMN "displayName" TEXT,
ADD COLUMN "authProvider" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "User_firebaseUid_key" ON "User"("firebaseUid");
