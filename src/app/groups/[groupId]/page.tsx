import { notFound } from "next/navigation";
import { Plus } from "lucide-react";
import { getCurrentUser } from "@/lib/current-user";
import { db } from "@/lib/db";
import { PageContainer } from "@/components/layout/PageContainer";
import { HeroCard } from "@/components/ui/HeroCard";
import { MoneyAmount } from "@/components/ui/MoneyAmount";
import { PrimaryButton } from "@/components/ui/PrimaryButton";
import { SecondaryButton } from "@/components/ui/SecondaryButton";
import { computeMemberBalances, simplifyDebts } from "@/lib/balances";
import { GroupTabs } from "./GroupTabs";

export default async function GroupDetailPage({ params }: { params: Promise<{ groupId: string }> }) {
  const { groupId } = await params;
  const user = await getCurrentUser();
  const group = await db.group.findFirst({
    where: { id: groupId, userId: user.id },
    include: {
      members: true,
      expenses: { include: { splits: true, paidByMember: true }, orderBy: { createdAt: "desc" } },
      settlements: { include: { fromMember: true, toMember: true }, orderBy: { createdAt: "desc" } },
    },
  });

  if (!group) notFound();

  const you = group.members.find((m) => m.isCurrentUser);
  const memberName = (id: string) => group.members.find((m) => m.id === id)?.name ?? "Unknown";

  const balances = computeMemberBalances(
    group.members.map((m) => m.id),
    group.expenses,
    group.settlements
  );
  const yourBalance = you ? balances[you.id] ?? 0 : 0;
  const totalSpent = group.expenses.reduce((sum, e) => sum + e.totalAmount, 0);
  const yourShare = you
    ? group.expenses.reduce(
        (sum, e) => sum + (e.splits.find((s) => s.memberId === you.id)?.shareAmount ?? 0),
        0
      )
    : 0;

  const debts = simplifyDebts(balances).map((d) => ({
    fromName: memberName(d.fromMemberId),
    toName: memberName(d.toMemberId),
    amount: d.amount,
    involvesYou: !!you && (d.fromMemberId === you.id || d.toMemberId === you.id),
  }));

  return (
    <PageContainer title={group.name} backHref="/groups">
      <HeroCard className="mb-4">
        <p className="text-[13px] text-white/70 mb-1">Total spent</p>
        <MoneyAmount amount={totalSpent} size="hero" className="text-white" />
        <div className="flex justify-between mt-3 text-[13px] text-white/70">
          <span>
            Your share <MoneyAmount amount={yourShare} size="sm" className="text-white" />
          </span>
          <span>
            {yourBalance >= 0 ? "You'll receive" : "You owe"}{" "}
            <MoneyAmount amount={Math.abs(yourBalance)} size="sm" className="text-cosfy-lime" />
          </span>
        </div>
      </HeroCard>

      <div className="flex gap-2 mb-5">
        <PrimaryButton href={`/groups/${group.id}/add-expense`} className="flex-1">
          <Plus size={16} /> Add expense
        </PrimaryButton>
        <SecondaryButton href={`/groups/${group.id}/settle`} className="flex-1">
          Settle up
        </SecondaryButton>
      </div>

      <GroupTabs
        expenses={group.expenses.map((e) => ({
          id: e.id,
          description: e.description,
          totalAmount: e.totalAmount,
          paidByName: e.paidByMember.name,
          date: e.createdAt,
        }))}
        debts={debts}
        settlements={group.settlements.map((s) => ({
          fromName: s.fromMember.name,
          toName: s.toMember.name,
          amount: s.amount,
          date: s.createdAt,
          note: s.note,
        }))}
      />
    </PageContainer>
  );
}
