import { Receipt } from "lucide-react";
import { getCurrentUser } from "@/lib/current-user";
import { db } from "@/lib/db";
import { PageContainer } from "@/components/layout/PageContainer";
import { EmptyState } from "@/components/ui/EmptyState";
import { TransactionRow } from "@/components/finance/TransactionRow";
import { MonthWindowPicker } from "@/components/ui/MonthWindowPicker";

export default async function TransactionsPage({
  searchParams,
}: {
  searchParams: Promise<{ m?: string }>;
}) {
  const user = await getCurrentUser();
  const { m } = await searchParams;

  const allTransactions = await db.transaction.findMany({
    where: { userId: user.id },
    orderBy: { date: "desc" },
  });

  const months = Array.from(
    new Set(allTransactions.map((t) => `${t.date.getFullYear()}-${String(t.date.getMonth() + 1).padStart(2, "0")}`))
  ).sort((a, b) => (a < b ? 1 : -1));

  const selectedMonth = m && months.includes(m) ? m : null;
  const transactions = selectedMonth
    ? allTransactions.filter(
        (t) => `${t.date.getFullYear()}-${String(t.date.getMonth() + 1).padStart(2, "0")}` === selectedMonth
      )
    : allTransactions;

  return (
    <PageContainer title="Transactions" backHref="/home">
      {months.length > 0 && (
        <div className="mb-4">
          <MonthWindowPicker value={selectedMonth} basePath="/transactions" allowedMonths={months} allowAll />
        </div>
      )}
      {transactions.length === 0 ? (
        <EmptyState
          icon={Receipt}
          title={selectedMonth ? "No transactions this month" : "No transactions yet"}
          description="Tap + on Home to add your first expense."
        />
      ) : (
        <div className="space-y-2.5">
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
