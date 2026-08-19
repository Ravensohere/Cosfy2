-- AlterTable
ALTER TABLE "CreditCard" ADD COLUMN     "kind" TEXT NOT NULL DEFAULT 'Credit',
ALTER COLUMN "statementDay" DROP NOT NULL,
ALTER COLUMN "dueDay" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Transaction" ADD COLUMN     "cardId" TEXT;

-- CreateIndex
CREATE INDEX "Transaction_cardId_idx" ON "Transaction"("cardId");

-- AddForeignKey
ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_cardId_fkey" FOREIGN KEY ("cardId") REFERENCES "CreditCard"("id") ON DELETE SET NULL ON UPDATE CASCADE;
