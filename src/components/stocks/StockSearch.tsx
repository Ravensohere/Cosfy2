"use client";

import { useEffect, useState, useTransition } from "react";
import Link from "next/link";
import { Search, TrendingUp } from "lucide-react";
import { Input } from "@/components/ui/Input";
import { IconTile } from "@/components/ui/IconTile";
import { searchStockSymbols } from "@/lib/actions/stocks";
import type { SymbolMatch } from "@/lib/stock-data";

export function StockSearch() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SymbolMatch[]>([]);
  const [searched, setSearched] = useState(false);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    const trimmed = query.trim();
    if (!trimmed) {
      setResults([]);
      setSearched(false);
      return;
    }
    const timer = setTimeout(() => {
      startTransition(async () => {
        const matches = await searchStockSymbols(trimmed);
        setResults(matches);
        setSearched(true);
      });
    }, 400);
    return () => clearTimeout(timer);
  }, [query]);

  return (
    <div>
      <div className="relative mb-4">
        <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-cosfy-muted pointer-events-none" />
        <Input
          placeholder="Search company or ticker, e.g. Reliance, AAPL"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {isPending ? <p className="text-[13px] text-cosfy-muted px-1">Searching…</p> : null}

      {!isPending && searched && results.length === 0 ? (
        <p className="text-[13px] text-cosfy-muted px-1">No matches. Try a full company name or ticker.</p>
      ) : null}

      <div className="space-y-2">
        {results.map((r) => (
          <Link
            key={r.symbol}
            href={`/stocks/${encodeURIComponent(r.symbol)}`}
            className="flex items-center gap-3 rounded-card bg-cosfy-card border border-cosfy-border p-3.5"
          >
            <IconTile icon={TrendingUp} tone="dark" size={40} />
            <div className="flex-1 min-w-0">
              <p className="font-bold text-[14px] text-cosfy-ink truncate">{r.name}</p>
              <p className="text-[12px] text-cosfy-muted">
                {r.symbol} · {r.region}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
