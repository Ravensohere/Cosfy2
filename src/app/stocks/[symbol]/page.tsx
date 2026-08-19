import type { Metadata } from "next";
import { TrendingUp, TrendingDown, ExternalLink } from "lucide-react";
import { PageContainer } from "@/components/layout/PageContainer";
import { EmptyState } from "@/components/ui/EmptyState";
import { getOverview, getQuote } from "@/lib/stock-data";
import { fetchFinanceNews } from "@/lib/finance-news";
import { callGemini } from "@/lib/gemini";
import { cn } from "@/lib/cn";

function StatRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-cosfy-border last:border-0">
      <span className="text-[12px] text-cosfy-muted">{label}</span>
      <span className="text-[13px] font-semibold text-cosfy-ink">{value}</span>
    </div>
  );
}

/** "4524633752000" -> "4.52T", "—" stays as-is. */
function formatLargeNumber(raw: string): string {
  const n = parseFloat(raw);
  if (!Number.isFinite(n)) return raw;
  const units: [number, string][] = [
    [1e12, "T"],
    [1e9, "B"],
    [1e6, "M"],
  ];
  for (const [threshold, suffix] of units) {
    if (n >= threshold) return `${(n / threshold).toFixed(2)}${suffix}`;
  }
  return n.toLocaleString("en-US");
}

/** Alpha Vantage returns dividend yield as a decimal fraction (0.0034 = 0.34%). */
function formatPercent(raw: string): string {
  const n = parseFloat(raw);
  if (!Number.isFinite(n)) return raw;
  return `${(n * 100).toFixed(2)}%`;
}

const SUMMARY_SYSTEM_PROMPT = `You are a neutral financial research summarizer inside Cosfy, an Indian personal finance app. You are NOT a SEBI-registered investment adviser, research analyst, or broker. You must NEVER tell the user to buy, sell, hold, or invest, and must never state or imply a personal recommendation.

Given company fundamentals and recent headlines, write a short, neutral, informational summary in plain text (no markdown, no headers) covering, in this order:
1. One sentence on what the company does.
2. Two or three factual observations the data suggests (e.g. valuation level, profitability, recent news tone) framed as "the data shows" not as opinion.
3. Two or three factual risk factors or things to watch, framed the same way.
4. A closing sentence recommending the reader consult a SEBI-registered investment adviser before making any decision.

Never use the words "buy", "sell", "invest", "recommend", or "should". Stay under 150 words.`;

async function generateSummary(overview: NonNullable<Awaited<ReturnType<typeof getOverview>>>, headlines: { title: string; sentiment: string }[]) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;

  const facts = [
    `Name: ${overview.name}`,
    `Sector: ${overview.sector}, Industry: ${overview.industry}`,
    `Market cap: ${overview.marketCap}`,
    `P/E ratio: ${overview.peRatio}`,
    `EPS: ${overview.eps}`,
    `Dividend yield: ${overview.dividendYield}`,
    `52-week range: ${overview.week52Low} to ${overview.week52High}`,
    `Beta: ${overview.beta}`,
    headlines.length > 0
      ? `Recent headlines: ${headlines.map((h) => `"${h.title}" (${h.sentiment})`).join("; ")}`
      : "No recent headlines available.",
  ].join("\n");

  try {
    return await callGemini({
      apiKey,
      systemPrompt: SUMMARY_SYSTEM_PROMPT,
      messages: [{ role: "user", content: facts }],
    });
  } catch {
    return null;
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ symbol: string }>;
}): Promise<Metadata> {
  const { symbol } = await params;
  return { title: decodeURIComponent(symbol) };
}

export default async function StockDetailPage({ params }: { params: Promise<{ symbol: string }> }) {
  const { symbol: rawSymbol } = await params;
  const symbol = decodeURIComponent(rawSymbol);

  const [overview, quote, news] = await Promise.all([
    getOverview(symbol),
    getQuote(symbol),
    fetchFinanceNews(symbol),
  ]);

  if (!overview && !quote) {
    return (
      <PageContainer title={symbol} backHref="/stocks">
        <EmptyState
          icon={TrendingUp}
          title="No data for this symbol"
          description="Cosfy's market data provider has limited coverage for some tickers, especially certain NSE/BSE-listed stocks. Try the exact ticker symbol, or search again."
        />
      </PageContainer>
    );
  }

  const summary = overview ? await generateSummary(overview, news) : null;
  const isUp = (quote?.change ?? 0) >= 0;

  return (
    <PageContainer title={overview?.name ?? symbol} backHref="/stocks">
      <div className="rounded-card bg-cosfy-amber/10 border border-cosfy-amber/30 p-3.5 mb-4">
        <p className="text-[12px] text-cosfy-ink-soft leading-relaxed">
          Informational only, not investment advice. Cosfy is not a SEBI-registered adviser, this is not a
          recommendation to buy, sell, or hold. Consult a registered investment adviser before investing.
        </p>
      </div>

      {quote ? (
        <div className="rounded-card bg-cosfy-card border border-cosfy-border p-4 mb-4">
          <p className="text-[11px] font-medium text-cosfy-muted mb-1">{quote.symbol}</p>
          <div className="flex items-baseline gap-2">
            <span className="text-[28px] font-extrabold text-cosfy-ink">{quote.price.toFixed(2)}</span>
            <span
              className={cn(
                "flex items-center gap-1 text-[13px] font-semibold",
                isUp ? "text-cosfy-green" : "text-cosfy-red"
              )}
            >
              {isUp ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
              {quote.change.toFixed(2)} ({quote.changePercent}%)
            </span>
          </div>
        </div>
      ) : null}

      {summary ? (
        <div className="rounded-card bg-cosfy-card border border-cosfy-border p-4 mb-4">
          <h2 className="text-[13px] font-bold text-cosfy-ink mb-2">What the data shows</h2>
          <p className="text-[13px] text-cosfy-ink-soft leading-relaxed whitespace-pre-line">{summary}</p>
        </div>
      ) : null}

      {overview ? (
        <div className="rounded-card bg-cosfy-card border border-cosfy-border p-4 mb-4">
          <h2 className="text-[13px] font-bold text-cosfy-ink mb-2">Fundamentals</h2>
          {overview.description ? (
            <p className="text-[12px] text-cosfy-muted leading-relaxed mb-3">{overview.description}</p>
          ) : null}
          <StatRow label="Sector" value={overview.sector} />
          <StatRow label="Industry" value={overview.industry} />
          <StatRow label="Market cap" value={formatLargeNumber(overview.marketCap)} />
          <StatRow label="P/E ratio" value={overview.peRatio} />
          <StatRow label="EPS" value={overview.eps} />
          <StatRow label="Dividend yield" value={formatPercent(overview.dividendYield)} />
          <StatRow label="52-week range" value={`${overview.week52Low} – ${overview.week52High}`} />
          <StatRow label="Beta" value={overview.beta} />
        </div>
      ) : null}

      {news.length > 0 ? (
        <div className="rounded-card bg-cosfy-card border border-cosfy-border p-4">
          <h2 className="text-[13px] font-bold text-cosfy-ink mb-3">Recent news</h2>
          <div className="space-y-3">
            {news.map((item) => (
              <a
                key={item.url}
                href={item.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-start justify-between gap-2 group"
              >
                <div className="min-w-0">
                  <p className="text-[13px] font-semibold text-cosfy-ink leading-snug">{item.title}</p>
                  <p className="text-[11px] text-cosfy-muted mt-0.5">
                    {item.source} · {item.sentiment}
                  </p>
                </div>
                <ExternalLink size={14} className="text-cosfy-muted shrink-0 mt-0.5" />
              </a>
            ))}
          </div>
        </div>
      ) : null}
    </PageContainer>
  );
}
