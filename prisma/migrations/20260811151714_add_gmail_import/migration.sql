-- AlterTable
ALTER TABLE "User" ADD COLUMN     "gmailConnected" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "gmailEmail" TEXT,
ADD COLUMN     "gmailLastSyncAt" TIMESTAMP(3),
ADD COLUMN     "gmailRefreshTokenEnc" TEXT;

-- CreateTable
CREATE TABLE "GmailImportRecord" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "messageId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "GmailImportRecord_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "GmailImportRecord_userId_messageId_key" ON "GmailImportRecord"("userId", "messageId");

-- AddForeignKey
ALTER TABLE "GmailImportRecord" ADD CONSTRAINT "GmailImportRecord_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
