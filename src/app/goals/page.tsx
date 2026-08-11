import {
  Plus,
  Target,
  Calculator,
  MessageSquareText,
  CreditCard,
  Sparkles,
  Newspaper,
  Landmark,
  ShieldCheck,
  Repeat,
  Coins,
  TrendingUp,
  CalendarDays,
} from "lucide-react";
import { getCurrentUser } from "@/lib/current-user";
import { db } from "@/lib/db";
import { PageContainer } from "@/components/layout/PageContainer";
import { EmptyState } from "@/components/ui/EmptyState";
import { HeroCard } from "@/components/ui/HeroCard";
import { MoneyAmount } from "@/components/ui/MoneyAmount";
import { GoalCard } from "@/components/finance/GoalCard";
import { PrimaryButton } from "@/components/ui/PrimaryButton";
import { ToolLink } from "@/components/ui/ToolLink";
import { SweepRoundUpsCard } from "@/components/profile/SweepRoundUpsCard";
import { getUnclaimedRoundUpTotal } from "@/lib/actions/round-up";

export default async function GoalsPage() {
  const user = await getCurrentUser();
  const goals = await db.goal.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "asc" },
    include: { contributions: true },
  });

  const totalTarget = goals.reduce((sum, g) => sum + g.targetAmount, 0);

  const sweepTargetGoal = goals.find((g) => g.id === user.roundUpGoalId) ?? goals[0];
  const unclaimedRoundUp =
    user.roundUpEnabled && sweepTargetGoal
      ? await getUnclaimedRoundUpTotal(user.id, user.roundUpIncrement)
      : null;

  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const addedThisMonth = goals.reduce(
    (sum, g) => sum + g.contributions.filter((c) => c.createdAt >= monthStart).reduce((s, c) => s + c.amount, 0),
    0
  );

  return (
    <PageContainer
      title="Goals"
      action={
        <PrimaryButton href="/goals/create" data-tour="goals-new" className="h-9 px-4 text-[12px]">
          <Plus size={16} /> New
        </PrimaryButton>
      }
    >
      {goals.length === 0 ? (
        <EmptyState
          icon={Target}
          title="No goals yet"
          description="Start saving for something that matters."
          action={<PrimaryButton href="/goals/create">Set a goal</PrimaryButton>}
        />
      ) : (
        <div className="space-y-3">
          <HeroCard>
            <p className="text-[13px] text-white/70 mb-1">Total savings target</p>
            <MoneyAmount amount={totalTarget} size="hero" className="text-white" />
            <p className="text-[12px] text-white/60 mt-2">
              <MoneyAmount amount={addedThisMonth} size="sm" className="text-cosfy-lime" /> added this month
            </p>
          </HeroCard>
          {goals.map((g) => (
            <GoalCard
              key={g.id}
              id={g.id}
              name={g.name}
              type={g.type}
              saved={g.contributions.reduce((s, c) => s + c.amount, 0)}
              target={g.targetAmount}
            />
          ))}
        </div>
      )}

      {unclaimedRoundUp && sweepTargetGoal ? (
        <div className="mt-4">
          <SweepRoundUpsCard
            goalId={sweepTargetGoal.id}
            goalName={sweepTargetGoal.name}
            unclaimedTotal={unclaimedRoundUp.total}
          />
        </div>
      ) : null}

      <div className="mt-6" data-tour="goals-tools">
        <h2 className="text-[15px] font-extrabold text-cosfy-ink mb-2">Tools</h2>
        <div className="rounded-card bg-cosfy-card border border-cosfy-border divide-y divide-cosfy-border overflow-hidden">
          <ToolLink href="/net-worth" icon={TrendingUp} label="Net worth" />
          <ToolLink href="/calendar" icon={CalendarDays} label="Cash-flow calendar" />
          <ToolLink href="/loans" icon={Landmark} label="Loans & EMIs" />
          <ToolLink href="/insurance" icon={ShieldCheck} label="Insurance" />
          <ToolLink href="/subscriptions" icon={Repeat} label="Subscriptions" />
          <ToolLink href="/gold" icon={Coins} label="Gold" />
          <ToolLink href="/tax-calculator" icon={Calculator} label="Salary tax calculator" />
          <ToolLink href="/import" icon={MessageSquareText} label="Import expenses" />
          <ToolLink href="/credit-cards" icon={CreditCard} label="Credit card due dates" />
          <ToolLink href="/insights" icon={Sparkles} label="AI spending insights" />
          <ToolLink href="/news" icon={Newspaper} label="Finance news" />
        </div>
      </div>
    </PageContainer>
  );
}
