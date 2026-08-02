const NEWS_KEYWORDS = [
  "news", "today", "latest", "current", "market", "stock", "sensex", "nifty",
  "price", "rate", "inflation", "rbi", "budget", "ipo", "crypto", "bitcoin",
];

export function wantsLiveNews(text: string): boolean {
  const lower = text.toLowerCase();
  return NEWS_KEYWORDS.some((k) => lower.includes(k));
}

export type NewsHeadline = {
  title: string;
  summary: string;
  source: string;
  url: string;
  sentiment: string;
};

export async function fetchFinanceNews(topic: string): Promise<NewsHeadline[]> {
  const apiKey = process.env.ALPHAVANTAGE_API_KEY;
  if (!apiKey) return [];

  const params = new URLSearchParams({
    function: "NEWS_SENTIMENT",
    apikey: apiKey,
    limit: "6",
  });

  const keywordMatch = topic.match(/\b[A-Z]{2,5}\b/);
  if (keywordMatch) params.set("tickers", keywordMatch[0]);

  try {
    const res = await fetch(`https://www.alphavantage.co/query?${params.toString()}`, {
      next: { revalidate: 300 },
    });
    if (!res.ok) return [];
    const data = await res.json();
    const feed = Array.isArray(data?.feed) ? data.feed : [];
    return feed.slice(0, 6).map((item: Record<string, string>) => ({
      title: item.title ?? "",
      summary: item.summary ?? "",
      source: item.source ?? "unknown",
      url: item.url ?? "",
      sentiment: item.overall_sentiment_label ?? "Neutral",
    }));
  } catch {
    return [];
  }
}
