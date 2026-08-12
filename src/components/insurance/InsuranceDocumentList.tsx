"use client";

import { useTransition } from "react";
import type { InsuranceDocument } from "@prisma/client";
import { FileText, Trash2 } from "lucide-react";
import { IconTile } from "@/components/ui/IconTile";
import { MoneyAmount } from "@/components/ui/MoneyAmount";
import { SecondaryButton } from "@/components/ui/SecondaryButton";
import { deleteInsuranceDocument } from "@/lib/actions/insurance";

export function InsuranceDocumentList({ documents }: { documents: InsuranceDocument[] }) {
  if (documents.length === 0) return null;

  return (
    <div className="space-y-3">
      <p className="text-[13px] font-bold text-cosfy-muted">Uploaded documents</p>
      {documents.map((doc) => (
        <DocumentRow key={doc.id} doc={doc} />
      ))}
    </div>
  );
}

function DocumentRow({ doc }: { doc: InsuranceDocument }) {
  const [isPending, startTransition] = useTransition();
  const summary = (doc.summary ?? {}) as { roomRentLimit?: string | null; note?: string };
  const caption = [doc.provider, summary.note || summary.roomRentLimit].filter(Boolean).join(" · ") || doc.fileName;

  function remove() {
    startTransition(async () => {
      await deleteInsuranceDocument(doc.id);
    });
  }

  return (
    <div className="rounded-card bg-cosfy-card border border-cosfy-border p-4">
      <div className="flex items-center gap-3">
        <IconTile icon={FileText} tone="dark" size={44} />
        <div className="flex-1 min-w-0">
          <p className="font-bold text-[14px] text-cosfy-ink truncate">
            {doc.policyName || doc.subType || doc.type}
            <span className="text-cosfy-muted font-normal"> · {doc.type}</span>
          </p>
          <p className="text-[12px] text-cosfy-muted truncate">{caption}</p>
        </div>
        {doc.sumInsured ? <MoneyAmount amount={doc.sumInsured} size="md" /> : null}
        <SecondaryButton className="h-9 w-9 px-0 shrink-0" onClick={remove} disabled={isPending} aria-label="Delete document">
          <Trash2 size={14} />
        </SecondaryButton>
      </div>
    </div>
  );
}
