import { redirect } from "next/navigation";
import { Receipt, ChevronRight, Calculator, MessageSquareText, CreditCard, Sparkles, type LucideIcon } from "lucide-react";
import { getCurrentUser } from "@/lib/current-user";
import { db } from "@/lib/db";
import { HeroCard } from "@/components/ui/HeroCard";
import { StatCard } from "@/components/ui/StatCard";
import { MoneyAmount } from "@/components/ui/MoneyAmount";
import { EmptyState } from "@/components/ui/EmptyState";
import { TransactionRow } from "@/components/finance/TransactionRow";
import { QuickActionLink, QuickActionAddExpense } from "@/components/home/QuickActionButton";
import Link from "next/link";

export default async function HomePage() {
  const user = await getCurrentUser();
  if (!user.onboardingCompleted) {
    redirect("/onboarding/goal");
  }

  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 1);

  const [monthTransactions, recentTransactions] = await Promise.all([
    db.transaction.findMany({
      where: { userId: user.id, date: { gte: monthStart, lt: monthEnd } },
    }),
    db.transaction.findMany({
      where: { userId: user.id },
      orderBy: { date: "desc" },
      take: 5,
    }),
  ]);

  const income = monthTransactions.filter((t) => t.amount > 0).reduce((sum, t) => sum + t.amount, 0);
  const spent = monthTransactions.filter((t) => t.amount < 0).reduce((sum, t) => sum + Math.abs(t.amount), 0);
  const surplus = income - spent;

  const monthLabel = new Intl.DateTimeFormat("en-IN", { month: "long", year: "numeric" }).format(now);

  return (
    <div className="px-5 pt-6 pb-28 md:px-10 md:pt-10 md:pb-16 md:max-w-2xl md:mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <p className="text-[13px] text-cosfy-muted">Hi there</p>
          <p className="text-[18px] font-extrabold text-cosfy-ink">Welcome to Cosfy</p>
        </div>
      </div>

      <HeroCard>
        <p className="text-[13px] text-white/70 mb-1">This month&apos;s spending · {monthLabel}</p>
        <MoneyAmount amount={spent} size="hero" className="text-white" />
      </HeroCard>

      <div className="grid grid-cols-2 gap-3 mt-4">
        <StatCard label="Income" amount={income} />
        <StatCard label="Monthly surplus" amount={surplus} />
      </div>

      <div className="grid grid-cols-5 gap-2 mt-6">
        <QuickActionLink href="/scan/edit-items" icon="Receipt" label="Split bill" />
        <QuickActionAddExpense icon="Plus" label="Add" />
        <QuickActionLink href="/groups" icon="Users" label="Groups" />
        <QuickActionLink href="/goals" icon="Target" label="Goals" />
        <QuickActionLink href="/chat" icon="MessageCircle" label="Ask AI" />
      </div>

      <div className="rounded-card bg-cosfy-lime-pale border border-cosfy-lime-soft p-4 mt-6">
        <p className="text-[13px] font-semibold text-cosfy-lime-ink">
          {monthTransactions.length === 0
            ? "Add your first expense to get personalised insights."
            : `You've logged ${monthTransactions.length} transaction${monthTransactions.length === 1 ? "" : "s"} this month.`}
        </p>
      </div>

      <div className="mt-6">
        <h2 className="text-[15px] font-extrabold text-cosfy-ink mb-2">Tools</h2>
        <div className="rounded-card bg-cosfy-card border border-cosfy-border divide-y divide-cosfy-border overflow-hidden">
          <ToolLink href="/tax-calculator" icon={Calculator} label="Salary tax calculator" />
          <ToolLink href="/import" icon={MessageSquareText} label="Import expenses" />
          <ToolLink href="/credit-cards" icon={CreditCard} label="Credit card due dates" />
          <ToolLink href="/insights" icon={Sparkles} label="AI spending insights" />
        </div>
      </div>

      <div className="mt-6">
        <div className="flex items-center justify-between mb-1">
          <h2 className="text-[15px] font-extrabold text-cosfy-ink">Recent activity</h2>
          {recentTransactions.length > 0 && (
            <Link href="/transactions" className="text-[12px] font-semibold text-cosfy-lime-deep">
              See all
            </Link>
          )}
        </div>
        {recentTransactions.length === 0 ? (
          <EmptyState icon={Receipt} title="No expenses yet" description="Tap + to add your first." />
        ) : (
          <div className="divide-y divide-cosfy-border">
            {recentTransactions.map((t) => (
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
      </div>
    </div>
  );
}

function ToolLink({ href, icon: Icon, label }: { href: string; icon: LucideIcon; label: string }) {
  return (
    <Link href={href} className="flex items-center gap-3 px-4 h-14">
      <Icon size={18} className="text-cosfy-ink-soft shrink-0" strokeWidth={2} />
      <span className="flex-1 text-[14px] font-semibold text-cosfy-ink">{label}</span>
      <ChevronRight size={16} className="text-cosfy-muted shrink-0" />
    </Link>
  );
}
