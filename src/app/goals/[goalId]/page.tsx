import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getCurrentUser } from "@/lib/current-user";
import { db } from "@/lib/db";
import { PageContainer } from "@/components/layout/PageContainer";
import { DonutProgress } from "@/components/ui/DonutProgress";
import { MoneyAmount } from "@/components/ui/MoneyAmount";
import { formatINR, formatDate } from "@/lib/format";
import { AddContributionForm } from "./AddContributionForm";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ goalId: string }>;
}): Promise<Metadata> {
  const { goalId } = await params;
  const user = await getCurrentUser();
  const goal = await db.goal.findFirst({ where: { id: goalId, userId: user.id }, select: { name: true } });
  return { title: goal?.name ?? "Goal" };
}

export default async function GoalDetailPage({ params }: { params: Promise<{ goalId: string }> }) {
  const { goalId } = await params;
  const user = await getCurrentUser();
  const goal = await db.goal.findFirst({
    where: { id: goalId, userId: user.id },
    include: { contributions: { orderBy: { createdAt: "desc" } } },
  });

  if (!goal) notFound();

  const saved = goal.contributions.reduce((sum, c) => sum + c.amount, 0);
  const remaining = Math.max(0, goal.targetAmount - saved);

  const now = new Date();
  const monthsLeft = goal.targetDate
    ? Math.max(
        1,
        (goal.targetDate.getFullYear() - now.getFullYear()) * 12 + (goal.targetDate.getMonth() - now.getMonth())
      )
    : null;
  const neededPerMonth = monthsLeft ? remaining / monthsLeft : null;

  return (
    <PageContainer title={goal.name} backHref="/goals">
      <div className="flex flex-col items-center py-4">
        <DonutProgress value={saved} max={goal.targetAmount} size={160}>
          <div className="text-center">
            <p className="text-[11px] text-cosfy-muted">Saved</p>
            <MoneyAmount amount={saved} size="lg" />
          </div>
        </DonutProgress>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="rounded-card bg-cosfy-card border border-cosfy-border p-4">
          <p className="text-[11px] text-cosfy-muted mb-1">Target</p>
          <MoneyAmount amount={goal.targetAmount} size="md" />
        </div>
        <div className="rounded-card bg-cosfy-card border border-cosfy-border p-4">
          <p className="text-[11px] text-cosfy-muted mb-1">Remaining</p>
          <MoneyAmount amount={remaining} size="md" />
        </div>
        {monthsLeft && (
          <div className="rounded-card bg-cosfy-card border border-cosfy-border p-4">
            <p className="text-[11px] text-cosfy-muted mb-1">Months left</p>
            <p className="font-bold text-[16px] text-cosfy-ink">{monthsLeft}</p>
          </div>
        )}
        {neededPerMonth !== null && (
          <div className="rounded-card bg-cosfy-card border border-cosfy-border p-4">
            <p className="text-[11px] text-cosfy-muted mb-1">Needed/month</p>
            <MoneyAmount amount={neededPerMonth} size="md" />
          </div>
        )}
      </div>

      {neededPerMonth !== null && (
        <div className="rounded-card bg-cosfy-card-soft p-4 mb-4">
          <p className="text-[12px] font-semibold text-cosfy-ink-soft mb-1">Saving rule ideas</p>
          <p className="text-[13px] text-cosfy-muted">
            Estimated {formatINR(neededPerMonth)}/month if followed
          </p>
        </div>
      )}

      <div className="mb-6">
        <AddContributionForm goalId={goal.id} />
      </div>

      {goal.contributions.length > 0 && (
        <div>
          <h2 className="text-[14px] font-extrabold text-cosfy-ink mb-2">Contributions</h2>
          <div className="divide-y divide-cosfy-border">
            {goal.contributions.map((c) => (
              <div key={c.id} className="flex items-center justify-between py-2.5">
                <p className="text-[13px] text-cosfy-muted">
                  {formatDate(c.createdAt)}
                </p>
                <MoneyAmount amount={c.amount} size="sm" />
              </div>
            ))}
          </div>
        </div>
      )}
    </PageContainer>
  );
}
