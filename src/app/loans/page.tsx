import { Landmark } from "lucide-react";
import { PageContainer } from "@/components/layout/PageContainer";
import { EmptyState } from "@/components/ui/EmptyState";
import { getCurrentUser } from "@/lib/current-user";
import { db } from "@/lib/db";
import { LoanList } from "@/components/loans/LoanList";
import { AddLoanButton } from "@/components/loans/AddLoanButton";
import { PrepaymentCalculatorCard } from "@/components/loans/PrepaymentCalculatorCard";

export default async function LoansPage() {
  const user = await getCurrentUser();
  const loans = await db.loan.findMany({ where: { userId: user.id }, orderBy: { dueDay: "asc" } });

  return (
    <PageContainer title="Loans & EMIs" backHref="/home" action={<AddLoanButton />}>
      {loans.length === 0 ? (
        <EmptyState
          icon={Landmark}
          title="No loans tracked yet"
          description="Add a loan to keep EMI due dates and outstanding principal in view."
          action={<AddLoanButton variant="primary" />}
        />
      ) : (
        <>
          <LoanList loans={loans} />
          <div className="mt-6">
            <PrepaymentCalculatorCard loans={loans} />
          </div>
        </>
      )}
    </PageContainer>
  );
}
