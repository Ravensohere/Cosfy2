"use client";

import { useRef, useState, useTransition, type PointerEvent as ReactPointerEvent } from "react";
import { Pencil, Trash2, ChevronLeft } from "lucide-react";
import { toast } from "sonner";
import { IconTile } from "@/components/ui/IconTile";
import { EditTransactionSheet } from "@/components/finance/EditTransactionSheet";
import { formatDate, formatINR } from "@/lib/format";
import { CATEGORY_ICON, type CategoryValue, type PaymentModeValue } from "@/lib/constants";
import { resolveIcon } from "@/lib/resolve-icon";
import { deleteTransaction } from "@/lib/actions/transactions";
import { cn } from "@/lib/cn";

const ACTIONS_WIDTH = 128;
const OPEN_THRESHOLD = 64;

export function TransactionRow({
  id,
  description,
  category,
  paymentMode,
  amount,
  date,
}: {
  id: string;
  description: string;
  category: CategoryValue;
  paymentMode: PaymentModeValue;
  amount: number;
  date: Date;
}) {
  const Icon = resolveIcon(CATEGORY_ICON[category] ?? "Receipt");
  const isIncome = amount > 0;

  const [x, setX] = useState(0);
  const [dragging, setDragging] = useState(false);
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const dragState = useRef<{ startX: number; baseX: number } | null>(null);

  function open() {
    setX(-ACTIONS_WIDTH);
  }

  function close() {
    setX(0);
    setConfirmingDelete(false);
  }

  function handlePointerDown(e: ReactPointerEvent<HTMLDivElement>) {
    dragState.current = { startX: e.clientX, baseX: x };
    setDragging(true);
    e.currentTarget.setPointerCapture(e.pointerId);
  }

  function handlePointerMove(e: ReactPointerEvent<HTMLDivElement>) {
    if (!dragState.current) return;
    const delta = e.clientX - dragState.current.startX;
    const next = Math.min(0, Math.max(-ACTIONS_WIDTH, dragState.current.baseX + delta));
    setX(next);
  }

  function handlePointerUp() {
    dragState.current = null;
    setDragging(false);
    setX((current) => (current < -OPEN_THRESHOLD ? -ACTIONS_WIDTH : 0));
  }

  function handleContentClick() {
    if (x !== 0) close();
  }

  function handleDelete() {
    startTransition(async () => {
      const result = await deleteTransaction(id);
      if (!result.ok) {
        toast.error(result.error ?? "Couldn't delete transaction");
        return;
      }
      toast.success("Transaction deleted");
    });
  }

  return (
    <div className="relative rounded-card overflow-hidden group">
      <div className="absolute inset-y-0 right-0 flex" style={{ width: ACTIONS_WIDTH }}>
        {confirmingDelete ? (
          <>
            <button
              type="button"
              disabled={isPending}
              onClick={() => setConfirmingDelete(false)}
              className="w-16 h-full flex items-center justify-center text-[12px] font-bold text-cosfy-ink bg-cosfy-card-soft active:opacity-80"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={isPending}
              onClick={handleDelete}
              className="w-16 h-full flex items-center justify-center text-[12px] font-bold text-white bg-cosfy-red active:opacity-80"
            >
              {isPending ? "…" : "Delete"}
            </button>
          </>
        ) : (
          <>
            <button
              type="button"
              aria-label="Edit transaction"
              onClick={() => {
                setEditOpen(true);
                close();
              }}
              className="w-16 h-full flex items-center justify-center bg-cosfy-ink text-cosfy-lime active:opacity-80"
            >
              <Pencil size={18} />
            </button>
            <button
              type="button"
              aria-label="Delete transaction"
              onClick={() => setConfirmingDelete(true)}
              className="w-16 h-full flex items-center justify-center bg-cosfy-red text-white active:opacity-80"
            >
              <Trash2 size={18} />
            </button>
          </>
        )}
      </div>

      <div
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        onClick={handleContentClick}
        style={{ transform: `translateX(${x}px)`, touchAction: "pan-y" }}
        className={cn(
          "relative z-10 flex items-center gap-3 bg-cosfy-card border border-cosfy-border p-3.5 select-none",
          !dragging && "transition-transform duration-200 ease-out"
        )}
      >
        <IconTile icon={Icon} tone={isIncome ? "lime" : "soft"} size={44} />
        <div className="flex-1 min-w-0">
          <p className="font-bold text-[14px] text-cosfy-ink truncate">{description}</p>
          <div className="flex items-center gap-1.5 mt-1 flex-wrap">
            <span className="text-[11px] font-semibold text-cosfy-ink-soft bg-cosfy-card-soft px-2 py-0.5 rounded-full">
              {paymentMode}
            </span>
            <span className="text-[11px] text-cosfy-muted">{formatDate(date)}</span>
          </div>
        </div>
        <p className={cn("text-[15px] font-extrabold shrink-0", isIncome ? "text-cosfy-green" : "text-cosfy-ink")}>
          {isIncome ? "+" : ""}
          {formatINR(amount)}
        </p>
        <button
          type="button"
          aria-label="Show actions"
          onClick={(e) => {
            e.stopPropagation();
            open();
          }}
          className="hidden sm:flex items-center justify-center w-6 h-6 -mr-1 shrink-0 rounded-full text-cosfy-muted opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <ChevronLeft size={16} />
        </button>
      </div>

      <EditTransactionSheet
        open={editOpen}
        onClose={() => setEditOpen(false)}
        id={id}
        initialDescription={description}
        initialAmount={amount}
        initialCategory={category}
        initialPaymentMode={paymentMode}
      />
    </div>
  );
}
