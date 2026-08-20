import type { Metadata } from "next";
import { Receipt } from "lucide-react";
import { getCurrentUser } from "@/lib/current-user";
import { db } from "@/lib/db";
import { PageContainer } from "@/components/layout/PageContainer";
import { EmptyState } from "@/components/ui/EmptyState";
import { TransactionRow } from "@/components/finance/TransactionRow";
import { ReceiptGroupCard } from "@/components/finance/ReceiptGroupCard";
import { MonthWindowPicker } from "@/components/ui/MonthWindowPicker";
import { groupTransactionsByReceipt } from "@/lib/receipt-grouping";
import type { CategoryValue, PaymentModeValue } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Transactions",
  description: "All your income and expenses in one place.",
};

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

  const receiptIds = Array.from(new Set(transactions.map((t) => t.receiptId).filter((id): id is string => !!id)));
  const receipts =
    receiptIds.length > 0
      ? await db.receipt.findMany({ where: { id: { in: receiptIds }, userId: user.id }, select: { id: true, merchant: true, total: true } })
      : [];
  const receiptsById = new Map(receipts.map((r) => [r.id, { merchant: r.merchant, total: r.total }]));
  const items = groupTransactionsByReceipt(transactions, receiptsById);

  return (
    <PageContainer title="Transactions" backHref="/home">
      {months.length > 0 && (
        <div className="mb-4" data-tour="transactions-filter">
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
          {items.map((item) =>
            item.type === "receipt" ? (
              <ReceiptGroupCard
                key={item.receiptId}
                merchant={item.merchant}
                date={item.date}
                transactions={item.transactions.map((t) => ({
                  id: t.id,
                  description: t.description,
                  category: t.category as CategoryValue,
                  paymentMode: t.paymentMode as PaymentModeValue,
                  amount: t.amount,
                  date: t.date,
                  cardId: t.cardId,
                }))}
              />
            ) : (
              <TransactionRow
                key={item.transaction.id}
                id={item.transaction.id}
                description={item.transaction.description}
                category={item.transaction.category as CategoryValue}
                paymentMode={item.transaction.paymentMode as PaymentModeValue}
                amount={item.transaction.amount}
                date={item.transaction.date}
                cardId={item.transaction.cardId}
              />
            )
          )}
        </div>
      )}
    </PageContainer>
  );
}
