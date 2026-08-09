"use client";

import { useState, useTransition } from "react";
import type { GoldHolding } from "@prisma/client";
import { Coins, Trash2, Pencil } from "lucide-react";
import { IconTile } from "@/components/ui/IconTile";
import { MoneyAmount } from "@/components/ui/MoneyAmount";
import { SecondaryButton } from "@/components/ui/SecondaryButton";
import { Input } from "@/components/ui/Input";
import { updateGoldCurrentValue, deleteGoldHolding } from "@/lib/actions/gold";

export function GoldList({ holdings }: { holdings: GoldHolding[] }) {
  return (
    <div className="space-y-3">
      {holdings.map((holding) => (
        <GoldRow key={holding.id} holding={holding} />
      ))}
    </div>
  );
}

function GoldRow({ holding }: { holding: GoldHolding }) {
  const [isPending, startTransition] = useTransition();
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(String(holding.currentValue));
  const gain = holding.currentValue - holding.purchasePrice;

  function saveValue() {
    startTransition(async () => {
      await updateGoldCurrentValue(holding.id, parseFloat(value) || 0);
      setEditing(false);
    });
  }

  function remove() {
    startTransition(async () => {
      await deleteGoldHolding(holding.id);
    });
  }

  return (
    <div className="rounded-card bg-cosfy-card border border-cosfy-border p-4">
      <div className="flex items-center gap-3">
        <IconTile icon={Coins} tone="dark" size={44} />
        <div className="flex-1 min-w-0">
          <p className="font-bold text-[14px] text-cosfy-ink truncate">
            {holding.grams}g {holding.type}
          </p>
          <p className={`text-[12px] font-semibold ${gain >= 0 ? "text-cosfy-green" : "text-cosfy-red"}`}>
            {gain >= 0 ? "+" : ""}
            {gain.toLocaleString("en-IN", { maximumFractionDigits: 0 })} since purchase
          </p>
        </div>
        <MoneyAmount amount={holding.currentValue} size="md" />
      </div>
      {editing ? (
        <div className="flex gap-2 mt-3">
          <Input
            type="number"
            className="flex-1 h-9"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder="Current value"
          />
          <SecondaryButton className="h-9 text-[12px] px-3" onClick={saveValue} disabled={isPending}>
            Save
          </SecondaryButton>
        </div>
      ) : (
        <div className="flex gap-2 mt-3">
          <SecondaryButton className="flex-1 h-9 text-[12px]" onClick={() => setEditing(true)} disabled={isPending}>
            <Pencil size={14} /> Update value
          </SecondaryButton>
          <SecondaryButton className="h-9 text-[12px] px-3" onClick={remove} disabled={isPending}>
            <Trash2 size={14} />
          </SecondaryButton>
        </div>
      )}
    </div>
  );
}
