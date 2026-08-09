import { PageContainer } from "@/components/layout/PageContainer";
import { MoneyAmount } from "@/components/ui/MoneyAmount";
import { getCurrentUser } from "@/lib/current-user";
import { getNetWorthBreakdown } from "@/lib/actions/net-worth";
import { NetWorthInputsForm } from "@/components/net-worth/NetWorthInputsForm";

function Row({ label, amount, negative = false }: { label: string; amount: number; negative?: boolean }) {
  if (amount === 0) return null;
  return (
    <div className="flex items-center justify-between py-2">
      <span className="text-[13px] text-cosfy-muted">{label}</span>
      <span className={`text-[14px] font-semibold ${negative ? "text-cosfy-red" : "text-cosfy-ink"}`}>
        {negative ? "−" : ""}
        <MoneyAmount amount={amount} size="sm" />
      </span>
    </div>
  );
}

export default async function NetWorthPage() {
  const user = await getCurrentUser();
  const breakdown = await getNetWorthBreakdown(user.id);

  return (
    <PageContainer title="Net worth" backHref="/home">
      <div className="rounded-card bg-cosfy-ink text-white p-5 mb-4">
        <p className="text-[12px] text-white/60 font-semibold">Estimated net worth</p>
        <MoneyAmount amount={breakdown.netWorth} size="hero" className="text-white" />
        <p className="text-[11px] text-white/50 mt-1">
          Estimate from manually entered balances plus what Cosfy tracks — not a live bank feed.
        </p>
      </div>

      <div className="rounded-card bg-cosfy-card border border-cosfy-border p-4 mb-4">
        <h2 className="text-[13px] font-bold text-cosfy-ink mb-1">Assets</h2>
        <Row label="Bank balance" amount={breakdown.bankBalance} />
        <Row label="Other investments" amount={breakdown.otherInvestments} />
        <Row label="EPF / PF balance" amount={breakdown.epfBalance} />
        <Row label="Gold holdings" amount={breakdown.goldValue} />
        <Row label="Goal savings" amount={breakdown.goalSavings} />
        {breakdown.totalAssets === 0 ? (
          <p className="text-[13px] text-cosfy-muted py-2">No assets entered yet — add balances below.</p>
        ) : null}
      </div>

      <div className="rounded-card bg-cosfy-card border border-cosfy-border p-4 mb-4">
        <h2 className="text-[13px] font-bold text-cosfy-ink mb-1">Liabilities</h2>
        <Row label="Credit card dues" amount={breakdown.creditCardDues} negative />
        <Row label="Loan outstanding" amount={breakdown.loanOutstanding} negative />
        {breakdown.totalLiabilities === 0 ? <p className="text-[13px] text-cosfy-muted py-2">Nothing owed 🎉</p> : null}
      </div>

      <NetWorthInputsForm
        bankBalance={user.bankBalance}
        otherInvestments={user.otherInvestments}
        epfBalance={user.epfBalance}
      />
    </PageContainer>
  );
}
