"use client";

import { useMemo, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Textarea } from "@/components/ui/Input";
import { TransactionReviewCard } from "@/components/import/TransactionReviewCard";
import { parseSms } from "@/lib/sms-parser";

export function TextImportTab() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [text, setText] = useState(searchParams.get("text") ?? "");
  const [success, setSuccess] = useState(false);

  const parsed = useMemo(() => parseSms(text), [text]);

  function handleAdded() {
    setSuccess(true);
    setText("");
    router.replace("/import");
    setTimeout(() => setSuccess(false), 2500);
  }

  return (
    <div className="space-y-4">
      <div>
        <p className="text-[12px] font-semibold text-cosfy-ink-soft mb-2">Paste the bank SMS</p>
        <Textarea
          placeholder="e.g. Rs.499.00 debited from A/c XX1234 to AMAZON on 02-08-26. UPI Ref 123456789"
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
      </div>

      {text && !parsed ? (
        <p className="text-[13px] text-cosfy-red">Couldn&apos;t find an amount in that text, try pasting the full SMS.</p>
      ) : null}

      {parsed ? (
        <TransactionReviewCard
          key={text}
          amount={parsed.amount}
          isCredit={parsed.isCredit}
          initialDescription={parsed.merchant}
          initialCategory={parsed.category}
          initialPaymentMode={parsed.paymentMode}
          onAdded={handleAdded}
        />
      ) : null}

      {success ? <p className="text-[13px] font-semibold text-cosfy-lime-ink">Added to Cosfy.</p> : null}
    </div>
  );
}
