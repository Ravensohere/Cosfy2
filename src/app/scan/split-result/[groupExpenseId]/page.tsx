import { notFound } from "next/navigation";
import { MessageCircle, User } from "lucide-react";
import { getCurrentUser } from "@/lib/current-user";
import { db } from "@/lib/db";
import { PageContainer } from "@/components/layout/PageContainer";
import { HeroCard } from "@/components/ui/HeroCard";
import { IconTile } from "@/components/ui/IconTile";
import { MoneyAmount } from "@/components/ui/MoneyAmount";
import { PrimaryButton } from "@/components/ui/PrimaryButton";
import { SecondaryButton } from "@/components/ui/SecondaryButton";
import { formatINR } from "@/lib/format";
import { CopyButton } from "./CopyButton";

export default async function SplitResultPage({ params }: { params: Promise<{ groupExpenseId: string }> }) {
  const { groupExpenseId } = await params;
  const user = await getCurrentUser();

  const expense = await db.groupExpense.findFirst({
    where: { id: groupExpenseId, group: { userId: user.id } },
    include: { splits: { include: { member: true } }, group: true, paidByMember: true },
  });

  if (!expense) notFound();

  const summaryText = [
    `${expense.description} — ${formatINR(expense.totalAmount)}`,
    `Paid by ${expense.paidByMember.name}`,
    ...expense.splits.map((s) => `${s.member.name}: ${formatINR(s.shareAmount)}`),
    `Sent via Cosfy`,
  ].join("\n");

  return (
    <PageContainer title="Split complete" backHref={`/groups/${expense.groupId}`}>
      <HeroCard className="mb-4">
        <p className="text-[13px] text-white/70 mb-1">{expense.description}</p>
        <MoneyAmount amount={expense.totalAmount} size="hero" className="text-white" />
        <p className="text-[12px] text-white/60 mt-2">
          {expense.splits.length} people · Paid by {expense.paidByMember.name}
        </p>
      </HeroCard>

      <div className="space-y-2 mb-5">
        {expense.splits.map((s) => (
          <div key={s.id} className="flex items-center gap-3 rounded-card bg-cosfy-card border border-cosfy-border p-3.5">
            <IconTile icon={User} tone="soft" size={40} />
            <span className="flex-1 min-w-0 font-semibold text-[14px] text-cosfy-ink truncate">{s.member.name}</span>
            <MoneyAmount amount={s.shareAmount} size="md" />
          </div>
        ))}
      </div>

      <div className="flex gap-2 mb-4">
        <CopyButton text={summaryText} />
        <a
          href={`https://wa.me/?text=${encodeURIComponent(summaryText)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-1"
        >
          <SecondaryButton type="button" fullWidth className="h-11 text-[13px]">
            <MessageCircle size={16} /> WhatsApp
          </SecondaryButton>
        </a>
      </div>

      <PrimaryButton fullWidth href={`/groups/${expense.groupId}`}>
        Done
      </PrimaryButton>
    </PageContainer>
  );
}
