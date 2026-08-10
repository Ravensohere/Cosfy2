"use client";

import { useRef, useState, useTransition } from "react";
import { FileText } from "lucide-react";
import { PrimaryButton } from "@/components/ui/PrimaryButton";
import { MoneyAmount } from "@/components/ui/MoneyAmount";
import { createTransactionsBulk } from "@/lib/actions/transactions";
import type { StatementRow } from "@/lib/statement-parser";

export function StatementImportTab() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [rows, setRows] = useState<StatementRow[]>([]);
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [format, setFormat] = useState<"csv" | "pdf" | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [success, setSuccess] = useState<number | null>(null);
  const [isPending, startTransition] = useTransition();

  async function handleFile(file: File) {
    setError(null);
    setRows([]);
    setSuccess(null);
    setIsUploading(true);

    try {
      const form = new FormData();
      form.append("file", file);
      const res = await fetch("/api/import/statement", { method: "POST", body: form });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Couldn't read that statement.");
        return;
      }
      const parsedRows: StatementRow[] = data.rows ?? [];
      setRows(parsedRows);
      setFormat(data.format);
      setSelected(new Set(parsedRows.map((_, i) => i)));
      if (parsedRows.length === 0) {
        setError("No transactions found in that file.");
      }
    } catch {
      setError("Couldn't reach the server. Try again.");
    } finally {
      setIsUploading(false);
    }
  }

  function toggle(index: number) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(index)) next.delete(index);
      else next.add(index);
      return next;
    });
  }

  function handleImport() {
    setError(null);
    const toImport = rows.filter((_, i) => selected.has(i));
    startTransition(async () => {
      const result = await createTransactionsBulk(
        toImport.map((r) => ({
          amount: r.amount,
          description: r.description,
          category: r.category,
          paymentMode: r.paymentMode,
        }))
      );
      if (!result.ok) {
        setError(result.error ?? "Couldn't import transactions");
        return;
      }
      setSuccess(result.count);
      setRows([]);
      setSelected(new Set());
      if (inputRef.current) inputRef.current.value = "";
    });
  }

  return (
    <div className="space-y-4">
      <label className="flex flex-col items-center justify-center gap-2 rounded-card border-2 border-dashed border-cosfy-border h-32 cursor-pointer text-cosfy-muted">
        <FileText size={28} />
        <span className="text-[13px] font-semibold">Upload a bank statement (CSV or PDF)</span>
        <input
          ref={inputRef}
          type="file"
          accept=".csv,text/csv,.pdf,application/pdf"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleFile(file);
          }}
        />
      </label>

      {isUploading ? <p className="text-[13px] text-cosfy-muted">Reading statement…</p> : null}
      {error ? <p className="text-[13px] text-cosfy-red">{error}</p> : null}
      {success !== null ? (
        <p className="text-[13px] font-semibold text-cosfy-lime-ink">Imported {success} transactions.</p>
      ) : null}

      {rows.length > 0 ? (
        <div className="space-y-3">
          {format === "pdf" ? (
            <p className="text-[12px] text-cosfy-amber">
              PDF parsing is best-effort, double check amounts before importing.
            </p>
          ) : null}
          <div className="rounded-card bg-cosfy-card border border-cosfy-border divide-y divide-cosfy-border max-h-[360px] overflow-y-auto">
            {rows.map((row, i) => (
              <label key={i} className="flex items-center gap-3 px-4 h-14">
                <input
                  type="checkbox"
                  checked={selected.has(i)}
                  onChange={() => toggle(i)}
                  className="w-4 h-4 accent-cosfy-lime-deep shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-semibold text-cosfy-ink truncate">{row.description}</p>
                  <p className="text-[11px] text-cosfy-muted">{row.category}</p>
                </div>
                <MoneyAmount amount={row.amount} size="sm" />
              </label>
            ))}
          </div>
          <PrimaryButton fullWidth type="button" disabled={isPending || selected.size === 0} onClick={handleImport}>
            {isPending ? "Importing…" : `Import ${selected.size} transaction${selected.size === 1 ? "" : "s"}`}
          </PrimaryButton>
        </div>
      ) : null}
    </div>
  );
}
