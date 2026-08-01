import Link from "next/link";
import { Plus, Users } from "lucide-react";
import { getCurrentUser } from "@/lib/current-user";
import { db } from "@/lib/db";
import { PageContainer } from "@/components/layout/PageContainer";
import { EmptyState } from "@/components/ui/EmptyState";
import { PillChip } from "@/components/ui/PillChip";
import { PrimaryButton } from "@/components/ui/PrimaryButton";
import { GroupCard } from "@/components/finance/GroupCard";
import { computeMemberBalances } from "@/lib/balances";

type Filter = "all" | "active" | "settled";

export default async function GroupsPage({
  searchParams,
}: {
  searchParams: Promise<{ filter?: string }>;
}) {
  const { filter: rawFilter } = await searchParams;
  const filter: Filter = rawFilter === "active" || rawFilter === "settled" ? rawFilter : "all";

  const user = await getCurrentUser();
  const groups = await db.group.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    include: {
      members: true,
      expenses: { include: { splits: true } },
      settlements: true,
    },
  });

  const groupsWithBalance = groups.map((g) => {
    const you = g.members.find((m) => m.isCurrentUser);
    const balances = computeMemberBalances(
      g.members.map((m) => m.id),
      g.expenses,
      g.settlements
    );
    return { group: g, yourBalance: you ? balances[you.id] ?? 0 : 0 };
  });

  const filtered = groupsWithBalance.filter(({ yourBalance }) => {
    if (filter === "active") return Math.abs(yourBalance) >= 0.5;
    if (filter === "settled") return Math.abs(yourBalance) < 0.5;
    return true;
  });

  return (
    <PageContainer
      title="Groups"
      action={
        <PrimaryButton href="/groups/create" className="h-9 px-4 text-[12px]">
          <Plus size={16} /> New
        </PrimaryButton>
      }
    >
      {groups.length === 0 ? (
        <EmptyState
          icon={Users}
          title="No groups yet"
          description="Create a group or scan a bill to split with people."
          action={<PrimaryButton href="/groups/create">Create group</PrimaryButton>}
        />
      ) : (
        <>
          <div className="flex gap-2 mb-4">
            <Link href="/groups?filter=all">
              <PillChip variant={filter === "all" ? "active" : "inactive"} type="button">
                All
              </PillChip>
            </Link>
            <Link href="/groups?filter=active">
              <PillChip variant={filter === "active" ? "active" : "inactive"} type="button">
                Active
              </PillChip>
            </Link>
            <Link href="/groups?filter=settled">
              <PillChip variant={filter === "settled" ? "active" : "inactive"} type="button">
                Settled
              </PillChip>
            </Link>
          </div>
          <div className="space-y-3">
            {filtered.map(({ group, yourBalance }) => (
              <GroupCard
                key={group.id}
                id={group.id}
                name={group.name}
                type={group.type}
                memberCount={group.members.length}
                yourBalance={yourBalance}
              />
            ))}
          </div>
        </>
      )}
    </PageContainer>
  );
}
