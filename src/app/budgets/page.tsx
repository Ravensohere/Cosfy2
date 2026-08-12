import { Plus, Wallet } from "lucide-react";
import { getCurrentUser } from "@/lib/current-user";
import { db } from "@/lib/db";
import { PageContainer } from "@/components/layout/PageContainer";
import { EmptyState } from "@/components/ui/EmptyState";
import { HeroCard } from "@/components/ui/HeroCard";
import { MoneyAmount } from "@/components/ui/MoneyAmount";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { BudgetCard } from "@/components/finance/BudgetCard";
import { PrimaryButton } from "@/components/ui/PrimaryButton";
import { PastBudgetsToggle } from "@/components/finance/PastBudgetsToggle";
import { formatShortDate, formatDate } from "@/lib/format";

export default async function BudgetsPage() {
  const user = await getCurrentUser();
  const allBudgets = await db.budget.findMany({ where: { userId: user.id }, orderBy: { createdAt: "asc" } });

  const now = new Date();
  const budgets = allBudgets.filter((b) => !b.endDate || b.endDate >= now);
  const pastBudgets = allBudgets.filter((b) => b.endDate && b.endDate < now);

  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 1);
  const weekStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

  async function spentFor(budget: (typeof budgets)[number]) {
    if (budget.type === "Weekly") {
      const rows = await db.transaction.findMany({
        where: { userId: user.id, amount: { lt: 0 }, date: { gte: weekStart, lte: now } },
      });
      return rows.reduce((sum, t) => sum + Math.abs(t.amount), 0);
    }
    const rows = await db.transaction.findMany({
      where: {
        userId: user.id,
        amount: { lt: 0 },
        date: { gte: monthStart, lt: monthEnd },
        ...(budget.type === "Category" ? { category: budget.category ?? undefined } : {}),
      },
    });
    return rows.reduce((sum, t) => sum + Math.abs(t.amount), 0);
  }

  const monthlyBudget = budgets.find((b) => b.type === "Monthly");
  const otherBudgets = budgets.filter((b) => b.id !== monthlyBudget?.id);

  const monthlySpent = monthlyBudget ? await spentFor(monthlyBudget) : 0;
  const otherSpent = await Promise.all(otherBudgets.map((b) => spentFor(b)));

  return (
    <PageContainer
      title="Budgets"
      action={
        <PrimaryButton href="/budgets/create" data-tour="budgets-new" className="h-9 px-4 text-[12px]">
          <Plus size={16} /> New
        </PrimaryButton>
      }
    >
      {budgets.length === 0 ? (
        <EmptyState
          icon={Wallet}
          title="No budgets set"
          description="Add your first budget."
          action={<PrimaryButton href="/budgets/create">Add budget</PrimaryButton>}
        />
      ) : (
        <div className="space-y-3">
          {monthlyBudget && (
            <HeroCard>
              <p className="text-[13px] text-white/70 mb-1">Monthly budget</p>
              <div className="flex items-baseline justify-between mb-3">
                <MoneyAmount amount={monthlySpent} size="hero" className="text-white" />
                <span className="text-[13px] text-white/70">
                  of {new Intl.NumberFormat("en-IN").format(monthlyBudget.amount)}
                </span>
              </div>
              <ProgressBar value={monthlySpent} max={monthlyBudget.amount} trackClassName="bg-white/15" />
            </HeroCard>
          )}
          {otherBudgets.map((b, i) => (
            <BudgetCard
              key={b.id}
              title={b.type === "Category" ? `${b.category}` : "Weekly budget"}
              category={b.category}
              spent={otherSpent[i]}
              limit={b.amount}
              dateRangeLabel={
                b.startDate && b.endDate
                  ? `${formatShortDate(b.startDate)} – ${formatShortDate(b.endDate)}`
                  : undefined
              }
            />
          ))}
        </div>
      )}

      {pastBudgets.length > 0 ? (
        <div className="mt-6">
          <PastBudgetsToggle
            budgets={pastBudgets.map((b) => ({
              id: b.id,
              title: b.type === "Category" ? `${b.category}` : b.type === "Weekly" ? "Weekly budget" : "Monthly budget",
              amount: b.amount,
              dateRangeLabel:
                b.startDate && b.endDate
                  ? `${formatShortDate(b.startDate)} – ${formatDate(b.endDate)}`
                  : "",
            }))}
          />
        </div>
      ) : null}
    </PageContainer>
  );
}
