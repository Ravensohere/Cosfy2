import Link from "next/link";
import type { Transaction } from "@prisma/client";
import { Receipt } from "lucide-react";
import { EmptyState } from "@/components/ui/EmptyState";
import { TransactionRow } from "@/components/finance/TransactionRow";
import type { translate } from "@/lib/i18n/dictionary";
import type { CategoryValue, PaymentModeValue } from "@/lib/constants";

export function RecentActivityList({
  transactions,
  t,
}: {
  transactions: Transaction[];
  t: (key: Parameters<typeof translate>[1]) => string;
}) {
  return (
    <>
      <div className="flex items-center justify-between mb-1">
        <h2 className="text-[15px] font-extrabold text-cosfy-ink">{t("home.recentActivity")}</h2>
        {transactions.length > 0 && (
          <Link href="/transactions" className="text-[12px] font-semibold text-cosfy-lime-deep">
            {t("home.seeAll")}
          </Link>
        )}
      </div>
      {transactions.length === 0 ? (
        <EmptyState icon={Receipt} title={t("home.noExpenses")} description={t("home.tapToAdd")} />
      ) : (
        <div className="space-y-2.5">
          {transactions.map((tx) => (
            <TransactionRow
              key={tx.id}
              id={tx.id}
              description={tx.description}
              category={tx.category as CategoryValue}
              paymentMode={tx.paymentMode as PaymentModeValue}
              amount={tx.amount}
              date={tx.date}
            />
          ))}
        </div>
      )}
    </>
  );
}
