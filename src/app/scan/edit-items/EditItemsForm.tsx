"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Trash2, Plus } from "lucide-react";
import { Input, FieldLabel } from "@/components/ui/Input";
import { DatePickerField } from "@/components/ui/DatePickerField";
import { PrimaryButton } from "@/components/ui/PrimaryButton";
import { SecondaryButton } from "@/components/ui/SecondaryButton";
import { MoneyAmount } from "@/components/ui/MoneyAmount";
import { BillPhotoScan } from "@/components/scan/BillPhotoScan";
import { useBillWizard, type BillItem } from "@/lib/bill-wizard-store";
import { saveBillAsPersonalExpense } from "@/lib/actions/bills";

let idCounter = 0;
function newId() {
  idCounter += 1;
  return `item-${Date.now()}-${idCounter}`;
}

export function EditItemsForm({
  groupId,
  groupMembers,
}: {
  groupId: string | null;
  groupMembers: { id: string; name: string }[] | null;
}) {
  const router = useRouter();
  const setBillInfo = useBillWizard((s) => s.setBillInfo);
  const setParticipants = useBillWizard((s) => s.setParticipants);

  const [merchant, setMerchant] = useState("");
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [items, setItems] = useState<BillItem[]>([{ id: newId(), name: "", quantity: 1, price: 0 }]);
  const [taxAndCharges, setTaxAndCharges] = useState("0");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const subtotal = useMemo(() => items.reduce((sum, i) => sum + i.quantity * i.price, 0), [items]);
  const total = subtotal + (parseFloat(taxAndCharges) || 0);

  function updateItem(id: string, patch: Partial<BillItem>) {
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, ...patch } : i)));
  }

  function addItem() {
    setItems((prev) => [...prev, { id: newId(), name: "", quantity: 1, price: 0 }]);
  }

  function removeItem(id: string) {
    setItems((prev) => (prev.length > 1 ? prev.filter((i) => i.id !== id) : prev));
  }

  function handleScanned(bill: { merchant: string; date: string | null; items: BillItem[]; taxAndCharges: number }) {
    setError(null);
    if (bill.merchant) setMerchant(bill.merchant);
    if (bill.date) setDate(bill.date);
    setItems(bill.items);
    setTaxAndCharges(String(bill.taxAndCharges));
  }

  function validate() {
    if (!merchant.trim()) return "Add a merchant name";
    if (items.some((i) => !i.name.trim())) return "Every item needs a name";
    if (items.some((i) => i.price <= 0)) return "Every item needs a price";
    return null;
  }

  function handleSaveOnly() {
    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }
    setError(null);
    startTransition(async () => {
      const result = await saveBillAsPersonalExpense({ merchant: merchant.trim(), items, taxAndCharges: parseFloat(taxAndCharges) || 0 });
      if (result && !result.ok) setError(result.error);
    });
  }

  function handleSplit() {
    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }
    setError(null);
    setBillInfo({ merchant: merchant.trim(), date, items, taxAndCharges: parseFloat(taxAndCharges) || 0, groupId });

    if (groupMembers) {
      setParticipants(groupMembers.map((m) => ({ id: m.id, name: m.name, memberId: m.id })));
      router.push("/scan/assign-items");
    } else {
      router.push("/scan/participants");
    }
  }

  return (
    <div className="space-y-5">
      <BillPhotoScan onScanned={handleScanned} />

      <div>
        <FieldLabel>Merchant</FieldLabel>
        <Input placeholder="e.g. Beach Shack" value={merchant} onChange={(e) => setMerchant(e.target.value)} />
      </div>
      <div>
        <FieldLabel>Bill date</FieldLabel>
        <DatePickerField value={date} onChange={setDate} />
      </div>

      <div>
        <FieldLabel>Items</FieldLabel>
        <div className="flex items-center gap-2 px-0.5 mb-1">
          <span className="w-6 text-[10px] font-semibold text-cosfy-muted text-center">#</span>
          <span className="flex-1 text-[10px] font-semibold text-cosfy-muted">ITEM</span>
          <span className="w-16 text-[10px] font-semibold text-cosfy-muted text-center">QTY</span>
          <span className="w-24 text-[10px] font-semibold text-cosfy-muted text-center">PRICE</span>
          <span className="w-8" />
        </div>
        <div className="space-y-2">
          {items.map((item, index) => (
            <div key={item.id} className="flex items-center gap-2">
              <span className="w-6 text-[13px] font-semibold text-cosfy-muted text-center shrink-0">{index + 1}</span>
              <Input
                placeholder="Item name"
                className="flex-1"
                value={item.name}
                onChange={(e) => updateItem(item.id, { name: e.target.value })}
              />
              <Input
                type="number"
                inputMode="numeric"
                placeholder="Qty"
                className="w-16"
                value={item.quantity}
                onChange={(e) => updateItem(item.id, { quantity: parseFloat(e.target.value) || 1 })}
              />
              <Input
                type="number"
                inputMode="decimal"
                placeholder="Price"
                className="w-24"
                value={item.price || ""}
                onChange={(e) => updateItem(item.id, { price: parseFloat(e.target.value) || 0 })}
              />
              <button
                type="button"
                aria-label="Remove item"
                onClick={() => removeItem(item.id)}
                className="text-cosfy-muted p-2"
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))}
        </div>
        <button type="button" onClick={addItem} className="flex items-center gap-1.5 text-[13px] font-semibold text-cosfy-lime-deep mt-2">
          <Plus size={14} /> Add item
        </button>
      </div>

      <div>
        <FieldLabel>Tax, charges or discount (use negative for discount)</FieldLabel>
        <Input type="number" inputMode="decimal" value={taxAndCharges} onChange={(e) => setTaxAndCharges(e.target.value)} />
      </div>

      <div className="rounded-card bg-cosfy-card-soft p-4 flex items-center justify-between">
        <span className="font-bold text-[14px] text-cosfy-ink">Total</span>
        <MoneyAmount amount={total} size="lg" />
      </div>

      {error ? <p className="text-[13px] text-cosfy-red">{error}</p> : null}

      <div className="flex gap-2">
        {!groupId && (
          <SecondaryButton className="flex-1" disabled={isPending} onClick={handleSaveOnly}>
            Save only
          </SecondaryButton>
        )}
        <PrimaryButton className="flex-1" disabled={isPending} onClick={handleSplit}>
          Split this bill
        </PrimaryButton>
      </div>
    </div>
  );
}
