"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Gift, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { SecondaryButton } from "@/components/ui/SecondaryButton";
import { Input } from "@/components/ui/Input";
import { updateCreditCardDue, updateCreditCardRewards, deleteCreditCard } from "@/lib/actions/credit-cards";

export function CardDetailActions({
  cardId,
  currentDue,
  rewardPointsBalance,
  cashbackYtd,
}: {
  cardId: string;
  currentDue: number;
  rewardPointsBalance: number | null;
  cashbackYtd: number | null;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [editingRewards, setEditingRewards] = useState(false);
  const [points, setPoints] = useState(String(rewardPointsBalance ?? ""));
  const [cashback, setCashback] = useState(String(cashbackYtd ?? ""));
  const [confirmingDelete, setConfirmingDelete] = useState(false);

  function markPaid() {
    startTransition(async () => {
      const result = await updateCreditCardDue(cardId, 0);
      if (!result.ok) {
        toast.error("Couldn't update");
        return;
      }
      toast.success("Marked as paid");
    });
  }

  function saveRewards() {
    startTransition(async () => {
      const result = await updateCreditCardRewards(cardId, parseInt(points, 10) || 0, parseFloat(cashback) || 0);
      if (!result.ok) {
        toast.error("Couldn't save");
        return;
      }
      toast.success("Rewards updated");
      setEditingRewards(false);
    });
  }

  function remove() {
    startTransition(async () => {
      const result = await deleteCreditCard(cardId);
      if (!result.ok) {
        toast.error("Couldn't delete card");
        return;
      }
      toast.success("Card removed");
      router.push("/credit-cards");
    });
  }

  return (
    <div className="space-y-3">
      {editingRewards ? (
        <div className="rounded-card bg-cosfy-card border border-cosfy-border p-4">
          <p className="font-bold text-[13px] text-cosfy-ink mb-3">Update rewards</p>
          <div className="grid grid-cols-2 gap-2">
            <Input type="number" className="h-9" placeholder="Points" value={points} onChange={(e) => setPoints(e.target.value)} />
            <Input
              type="number"
              className="h-9"
              placeholder="Cashback YTD"
              value={cashback}
              onChange={(e) => setCashback(e.target.value)}
            />
          </div>
          <div className="flex gap-2 mt-3">
            <SecondaryButton className="flex-1 h-9 text-[12px]" onClick={() => setEditingRewards(false)} disabled={isPending}>
              Cancel
            </SecondaryButton>
            <SecondaryButton className="flex-1 h-9 text-[12px]" onClick={saveRewards} disabled={isPending}>
              Save
            </SecondaryButton>
          </div>
        </div>
      ) : null}

      <div className="flex gap-2">
        {currentDue > 0 ? (
          <SecondaryButton className="flex-1 h-10 text-[13px]" onClick={markPaid} disabled={isPending}>
            Mark as paid
          </SecondaryButton>
        ) : null}
        {!editingRewards ? (
          <SecondaryButton className="h-10 text-[13px] px-4" onClick={() => setEditingRewards(true)} disabled={isPending}>
            <Gift size={14} /> Rewards
          </SecondaryButton>
        ) : null}
      </div>

      {confirmingDelete ? (
        <div className="rounded-card bg-cosfy-red-soft border border-cosfy-red/20 p-4">
          <p className="text-[12px] text-cosfy-ink-soft mb-3">Remove this card? Linked transactions stay, just unlinked.</p>
          <div className="flex gap-2">
            <SecondaryButton className="flex-1 h-9 text-[12px]" onClick={() => setConfirmingDelete(false)} disabled={isPending}>
              Cancel
            </SecondaryButton>
            <SecondaryButton
              className="flex-1 h-9 text-[12px] border-cosfy-red text-cosfy-red"
              onClick={remove}
              disabled={isPending}
            >
              {isPending ? "Removing…" : "Yes, remove"}
            </SecondaryButton>
          </div>
        </div>
      ) : (
        <SecondaryButton fullWidth className="h-10 text-[13px]" onClick={() => setConfirmingDelete(true)} disabled={isPending}>
          <Trash2 size={14} /> Remove card
        </SecondaryButton>
      )}
    </div>
  );
}
