"use client";

import { useRef, useState, useTransition } from "react";
import { Camera, Trash2, Store } from "lucide-react";
import { Input } from "@/components/ui/Input";
import { PillChip } from "@/components/ui/PillChip";
import { PrimaryButton } from "@/components/ui/PrimaryButton";
import { CATEGORIES, PAYMENT_MODES, type CategoryValue, type PaymentModeValue } from "@/lib/constants";
import { createTransactionsBulk, createReceiptWithTransactions } from "@/lib/actions/transactions";
import { formatINR } from "@/lib/format";

type ScannedTransaction = {
  description: string;
  amount: number;
  isCredit: boolean;
  category: CategoryValue;
  paymentMode: PaymentModeValue;
};

type Row = ScannedTransaction & { id: string; include: boolean };

let idCounter = 0;
function newId() {
  idCounter += 1;
  return `scan-txn-${Date.now()}-${idCounter}`;
}

export function ScanTransactionsPanel({ onDone }: { onDone: () => void }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [rows, setRows] = useState<Row[]>([]);
  const [merchant, setMerchant] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  async function handleFile(file: File) {
    setError(null);
    setRows([]);
    setMerchant(null);
    setPreview(URL.createObjectURL(file));
    setIsScanning(true);

    try {
      const form = new FormData();
      form.append("file", file);
      const res = await fetch("/api/import/transactions-photo", { method: "POST", body: form });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Couldn't read that image.");
        return;
      }
      const scanned: ScannedTransaction[] = data.transactions ?? [];
      setRows(scanned.map((t) => ({ ...t, id: newId(), include: true })));
      setMerchant(typeof data.merchant === "string" ? data.merchant : null);
    } catch {
      setError("Couldn't reach the server. Try again.");
    } finally {
      setIsScanning(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  function updateRow(id: string, patch: Partial<Row>) {
    setRows((prev) => prev.map((r) => (r.id === id ? { ...r, ...patch } : r)));
  }

  function removeRow(id: string) {
    setRows((prev) => prev.filter((r) => r.id !== id));
  }

  const included = rows.filter((r) => r.include);
  // Grouping only makes sense once at least 2 items are still selected —
  // if the user deselected down to one, it's just a normal transaction.
  const groupUnderMerchant = merchant && included.length > 1;

  function handleAdd() {
    setError(null);
    if (included.length === 0) {
      setError("Select at least one transaction");
      return;
    }
    const items = included.map((r) => ({
      amount: r.isCredit ? Math.abs(r.amount) : -Math.abs(r.amount),
      description: r.description,
      category: r.category,
      paymentMode: r.paymentMode,
    }));
    startTransition(async () => {
      const result = groupUnderMerchant
        ? await createReceiptWithTransactions({ merchant, items })
        : await createTransactionsBulk(items);
      if (!result.ok) {
        setError(result.error ?? "Couldn't add transactions");
        return;
      }
      onDone();
    });
  }

  return (
    <div className="space-y-4">
      <label className="flex items-center justify-center gap-2 rounded-card border-2 border-dashed border-cosfy-border h-14 cursor-pointer text-cosfy-ink-soft active:opacity-70 overflow-hidden">
        {preview ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={preview} alt="Scan preview" className="h-full max-w-[72px] object-cover rounded-input" />
        ) : (
          <Camera size={18} />
        )}
        <span className="text-[13px] font-semibold">
          {isScanning ? "Reading…" : preview ? "Scan a different photo" : "Scan a bill or transaction screenshot"}
        </span>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="hidden"
          disabled={isScanning}
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleFile(file);
          }}
        />
      </label>

      {error ? <p className="text-[13px] text-cosfy-red">{error}</p> : null}

      {rows.length > 0 ? (
        <div className="space-y-3">
          {groupUnderMerchant ? (
            <div className="flex items-center gap-2 rounded-card bg-cosfy-lime-pale border border-cosfy-lime-soft px-3 py-2.5">
              <Store size={15} className="text-cosfy-lime-ink shrink-0" />
              <p className="text-[12.5px] text-cosfy-lime-ink flex-1">
                All {included.length} items will be grouped as <strong>one receipt from {merchant}</strong>, total{" "}
                {formatINR(included.reduce((sum, r) => sum + Math.abs(r.amount), 0))}.
              </p>
            </div>
          ) : null}
          <div className="space-y-3 max-h-[45vh] overflow-y-auto pr-0.5">
            {rows.map((row) => (
              <div key={row.id} className="rounded-card bg-cosfy-card-soft p-3 space-y-2">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={row.include}
                    onChange={(e) => updateRow(row.id, { include: e.target.checked })}
                    className="w-4 h-4 accent-cosfy-lime-deep shrink-0"
                  />
                  <Input
                    className="flex-1"
                    value={row.description}
                    onChange={(e) => updateRow(row.id, { description: e.target.value })}
                    placeholder="Description"
                  />
                  <Input
                    type="number"
                    inputMode="decimal"
                    className="w-24"
                    value={row.amount || ""}
                    onChange={(e) => updateRow(row.id, { amount: parseFloat(e.target.value) || 0 })}
                    placeholder="Amount"
                  />
                  <button type="button" aria-label="Remove" onClick={() => removeRow(row.id)} className="text-cosfy-muted p-1 shrink-0">
                    <Trash2 size={16} />
                  </button>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {CATEGORIES.map((c) => (
                    <PillChip key={c} variant={row.category === c ? "active" : "inactive"} onClick={() => updateRow(row.id, { category: c })}>
                      {c}
                    </PillChip>
                  ))}
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {PAYMENT_MODES.map((m) => (
                    <PillChip key={m} variant={row.paymentMode === m ? "strong" : "inactive"} onClick={() => updateRow(row.id, { paymentMode: m })}>
                      {m}
                    </PillChip>
                  ))}
                </div>
              </div>
            ))}
          </div>
          <PrimaryButton fullWidth type="button" disabled={isPending || included.length === 0} onClick={handleAdd}>
            {isPending
              ? "Adding…"
              : groupUnderMerchant
                ? `Add receipt from ${merchant} (${included.length} items)`
                : `Add ${included.length} transaction${included.length === 1 ? "" : "s"}`}
          </PrimaryButton>
        </div>
      ) : null}
    </div>
  );
}
