import { Plus, Target } from "lucide-react";
import { getCurrentUser } from "@/lib/current-user";
import { db } from "@/lib/db";
import { PageContainer } from "@/components/layout/PageContainer";
import { EmptyState } from "@/components/ui/EmptyState";
import { HeroCard } from "@/components/ui/HeroCard";
import { MoneyAmount } from "@/components/ui/MoneyAmount";
import { GoalCard } from "@/components/finance/GoalCard";
import { PrimaryButton } from "@/components/ui/PrimaryButton";

export default async function GoalsPage() {
  const user = await getCurrentUser();
  const goals = await db.goal.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "asc" },
    include: { contributions: true },
  });

  const totalTarget = goals.reduce((sum, g) => sum + g.targetAmount, 0);

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
        <PrimaryButton href="/goals/create" className="h-9 px-4 text-[12px]">
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
    </PageContainer>
  );
}
