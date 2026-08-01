import { Receipt } from "lucide-react";
import { getCurrentUser } from "@/lib/current-user";
import { db } from "@/lib/db";
import { PageContainer } from "@/components/layout/PageContainer";
import { EmptyState } from "@/components/ui/EmptyState";
import { TransactionRow } from "@/components/finance/TransactionRow";

export default async function TransactionsPage() {
  const user = await getCurrentUser();
  const transactions = await db.transaction.findMany({
    where: { userId: user.id },
    orderBy: { date: "desc" },
  });

  return (
    <PageContainer title="Transactions" backHref="/home">
      {transactions.length === 0 ? (
        <EmptyState icon={Receipt} title="No transactions yet" description="Tap + on Home to add your first expense." />
      ) : (
        <div className="divide-y divide-cosfy-border">
          {transactions.map((t) => (
            <TransactionRow
              key={t.id}
              description={t.description}
              category={t.category}
              paymentMode={t.paymentMode}
              amount={t.amount}
              date={t.date}
            />
          ))}
        </div>
      )}
    </PageContainer>
  );
}
