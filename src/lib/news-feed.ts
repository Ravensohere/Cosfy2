export type NewsFeedItem = {
  title: string;
  link: string;
  source: string;
  pubDate: string | null;
};

const FEEDS: { url: string; source: string }[] = [
  { url: "https://economictimes.indiatimes.com/markets/rssfeeds/1977021501.cms", source: "Economic Times" },
  { url: "https://www.moneycontrol.com/rss/business.xml", source: "Moneycontrol" },
  { url: "https://www.livemint.com/rss/money", source: "LiveMint" },
];

function extractTag(block: string, tag: string): string | null {
  const match = block.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`, "i"));
  if (!match) return null;
  return match[1]
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/, "$1")
    .replace(/<[^>]+>/g, "")
    .replace(/&amp;/g, "&")
    .replace(/&#39;/g, "'")
    .replace(/&quot;/g, '"')
    .trim();
}

function parseRSS(xml: string, source: string): NewsFeedItem[] {
  const items: NewsFeedItem[] = [];
  const itemBlocks = xml.match(/<item>([\s\S]*?)<\/item>/g) ?? [];

  for (const block of itemBlocks) {
    const title = extractTag(block, "title");
    const link = extractTag(block, "link");
    if (!title || !link) continue;
    items.push({ title, link, source, pubDate: extractTag(block, "pubDate") });
  }

  return items;
}

const FEED_TIMEOUT_MS = 4000;

async function fetchOneFeed(feed: { url: string; source: string }): Promise<NewsFeedItem[]> {
  try {
    const res = await fetch(feed.url, {
      headers: { "User-Agent": "Mozilla/5.0 (compatible; CosfyNewsBot/1.0)" },
      next: { revalidate: 1200 },
      signal: AbortSignal.timeout(FEED_TIMEOUT_MS),
    });
    if (!res.ok) return [];
    const xml = await res.text();
    return parseRSS(xml, feed.source);
  } catch {
    return [];
  }
}

export async function fetchFinanceHeadlines(limit = 20): Promise<NewsFeedItem[]> {
  const results = await Promise.all(FEEDS.map(fetchOneFeed));
  const merged = results.flat();

  merged.sort((a, b) => {
    const timeA = a.pubDate ? Date.parse(a.pubDate) : 0;
    const timeB = b.pubDate ? Date.parse(b.pubDate) : 0;
    return timeB - timeA;
  });

  return merged.slice(0, limit);
}
