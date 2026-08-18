import type { Metadata } from "next";
import { Newspaper, ExternalLink } from "lucide-react";
import { PageContainer } from "@/components/layout/PageContainer";
import { EmptyState } from "@/components/ui/EmptyState";
import { fetchFinanceHeadlines } from "@/lib/news-feed";

function timeAgo(pubDate: string | null): string | null {
  if (!pubDate) return null;
  const time = Date.parse(pubDate);
  if (Number.isNaN(time)) return null;

  const minutes = Math.floor((Date.now() - time) / 60000);
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export const metadata: Metadata = {
  title: "Finance news",
  description: "Latest personal finance news and headlines.",
};

export default async function NewsPage() {
  const headlines = await fetchFinanceHeadlines();

  return (
    <PageContainer title="Finance news" backHref="/home">
      {headlines.length === 0 ? (
        <EmptyState
          icon={Newspaper}
          title="No headlines right now"
          description="Couldn't reach the news feeds. Try again in a bit."
        />
      ) : (
        <div className="space-y-2.5">
          {headlines.map((h, i) => (
            <a
              key={i}
              href={h.link}
              target="_blank"
              rel="noopener noreferrer"
              className="block rounded-card bg-cosfy-card border border-cosfy-border p-3.5"
            >
              <div className="flex items-start justify-between gap-2">
                <p className="text-[14px] font-semibold text-cosfy-ink leading-snug">{h.title}</p>
                <ExternalLink size={14} className="text-cosfy-muted shrink-0 mt-0.5" />
              </div>
              <div className="flex items-center gap-1.5 mt-1.5 text-[11px] text-cosfy-muted">
                <span className="font-semibold text-cosfy-ink-soft">{h.source}</span>
                {timeAgo(h.pubDate) ? (
                  <>
                    <span>·</span>
                    <span>{timeAgo(h.pubDate)}</span>
                  </>
                ) : null}
              </div>
            </a>
          ))}
        </div>
      )}
    </PageContainer>
  );
}
