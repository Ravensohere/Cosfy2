import Link from "next/link";
import { ExternalLink } from "lucide-react";
import type { translate } from "@/lib/i18n/dictionary";
import type { NewsFeedItem } from "@/lib/news-feed";

export function FinanceNewsSection({
  headlines,
  t,
}: {
  headlines: NewsFeedItem[];
  t: (key: Parameters<typeof translate>[1]) => string;
}) {
  return (
    <>
      <div className="flex items-center justify-between mb-1">
        <h2 className="text-[15px] font-extrabold text-cosfy-ink">{t("home.financeNews")}</h2>
        <Link href="/news" className="text-[12px] font-semibold text-cosfy-lime-deep">
          {t("home.seeAll")}
        </Link>
      </div>
      <div className="space-y-2.5">
        {headlines.map((h, i) => (
          <a
            key={i}
            href={h.link}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-start justify-between gap-2 rounded-card bg-cosfy-card border border-cosfy-border p-3.5"
          >
            <div>
              <p className="text-[13px] font-semibold text-cosfy-ink leading-snug">{h.title}</p>
              <p className="text-[11px] text-cosfy-muted mt-1">{h.source}</p>
            </div>
            <ExternalLink size={14} className="text-cosfy-muted shrink-0 mt-0.5" />
          </a>
        ))}
      </div>
    </>
  );
}
