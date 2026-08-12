-- CreateTable
CREATE TABLE "InsuranceDocument" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "subType" TEXT,
    "provider" TEXT,
    "policyName" TEXT,
    "sumInsured" DOUBLE PRECISION,
    "premiumAmount" DOUBLE PRECISION,
    "frequency" TEXT,
    "rawText" TEXT NOT NULL,
    "summary" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "InsuranceDocument_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "InsuranceDocument_userId_idx" ON "InsuranceDocument"("userId");

-- AddForeignKey
ALTER TABLE "InsuranceDocument" ADD CONSTRAINT "InsuranceDocument_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
