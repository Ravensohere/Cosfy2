import { notFound } from "next/navigation";
import Link from "next/link";
import { Plus, Pencil } from "lucide-react";
import { getCurrentUser } from "@/lib/current-user";
import { db } from "@/lib/db";
import { PageContainer } from "@/components/layout/PageContainer";
import { HeroCard } from "@/components/ui/HeroCard";
import { MoneyAmount } from "@/components/ui/MoneyAmount";
import { PrimaryButton } from "@/components/ui/PrimaryButton";
import { SecondaryButton } from "@/components/ui/SecondaryButton";
import { PillChip } from "@/components/ui/PillChip";
import { ShareGroupUpdateButton } from "@/components/finance/ShareGroupUpdateButton";
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

  const activeMembers = group.members.filter((m) => !m.removedAt);
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
    <PageContainer
      title={group.name}
      backHref="/groups"
      action={
        <Link
          href={`/groups/${group.id}/edit`}
          aria-label="Edit group"
          className="flex items-center justify-center w-9 h-9 rounded-full bg-cosfy-card-soft text-cosfy-ink-soft"
        >
          <Pencil size={16} />
        </Link>
      }
    >
      <div className="flex flex-wrap items-center gap-2 mb-4">
        {activeMembers.map((m) => (
          <PillChip key={m.id} variant={m.isCurrentUser ? "strong" : "inactive"} className="pointer-events-none">
            {m.name}
          </PillChip>
        ))}
      </div>

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

      <ShareGroupUpdateButton
        groupName={group.name}
        totalSpent={totalSpent}
        memberBalances={activeMembers.map((m) => ({ name: m.name, balance: balances[m.id] ?? 0 }))}
        className="block mb-5"
      />

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
