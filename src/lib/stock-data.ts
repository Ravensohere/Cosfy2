const BASE_URL = "https://www.alphavantage.co/query";

export type SymbolMatch = {
  symbol: string;
  name: string;
  type: string;
  region: string;
  currency: string;
};

export type Quote = {
  symbol: string;
  price: number;
  change: number;
  changePercent: string;
};

export type Overview = {
  symbol: string;
  name: string;
  description: string;
  sector: string;
  industry: string;
  marketCap: string;
  peRatio: string;
  eps: string;
  dividendYield: string;
  week52High: string;
  week52Low: string;
  beta: string;
};

async function fetchAlphaVantage(params: Record<string, string>): Promise<Record<string, unknown> | null> {
  const apiKey = process.env.ALPHAVANTAGE_API_KEY;
  if (!apiKey) return null;

  const search = new URLSearchParams({ ...params, apikey: apiKey });
  try {
    const res = await fetch(`${BASE_URL}?${search.toString()}`, { next: { revalidate: 300 } });
    if (!res.ok) return null;
    const data = await res.json();
    // Alpha Vantage returns 200 with a "Note"/"Information" body when rate-limited, not an error status.
    if (data?.Note || data?.Information) return null;
    return data;
  } catch {
    return null;
  }
}

export async function searchSymbols(query: string): Promise<SymbolMatch[]> {
  if (!query.trim()) return [];
  const data = await fetchAlphaVantage({ function: "SYMBOL_SEARCH", keywords: query });
  const matches = Array.isArray(data?.bestMatches) ? data.bestMatches : [];
  return matches.slice(0, 8).map((m: Record<string, string>) => ({
    symbol: m["1. symbol"] ?? "",
    name: m["2. name"] ?? "",
    type: m["3. type"] ?? "",
    region: m["4. region"] ?? "",
    currency: m["8. currency"] ?? "",
  }));
}

export async function getQuote(symbol: string): Promise<Quote | null> {
  const data = await fetchAlphaVantage({ function: "GLOBAL_QUOTE", symbol });
  const quote = data?.["Global Quote"] as Record<string, string> | undefined;
  if (!quote || !quote["05. price"]) return null;
  return {
    symbol: quote["01. symbol"] ?? symbol,
    price: parseFloat(quote["05. price"]) || 0,
    change: parseFloat(quote["09. change"]) || 0,
    changePercent: (quote["10. change percent"] ?? "0%").replace("%", ""),
  };
}

export async function getOverview(symbol: string): Promise<Overview | null> {
  const data = await fetchAlphaVantage({ function: "OVERVIEW", symbol });
  if (!data?.Symbol) return null;
  return {
    symbol: String(data.Symbol),
    name: String(data.Name ?? symbol),
    description: String(data.Description ?? ""),
    sector: String(data.Sector ?? "—"),
    industry: String(data.Industry ?? "—"),
    marketCap: String(data.MarketCapitalization ?? "—"),
    peRatio: String(data.PERatio ?? "—"),
    eps: String(data.EPS ?? "—"),
    dividendYield: String(data.DividendYield ?? "—"),
    week52High: String(data["52WeekHigh"] ?? "—"),
    week52Low: String(data["52WeekLow"] ?? "—"),
    beta: String(data.Beta ?? "—"),
  };
}
