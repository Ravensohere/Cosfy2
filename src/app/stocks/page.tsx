import type { Metadata } from "next";
import { PageContainer } from "@/components/layout/PageContainer";
import { StockSearch } from "@/components/stocks/StockSearch";

export const metadata: Metadata = {
  title: "Research a stock",
  description: "Look up company fundamentals, price, and news, for informational purposes only.",
};

export default function StocksPage() {
  return (
    <PageContainer title="Research a stock" backHref="/goals">
      <div className="rounded-card bg-cosfy-amber/10 border border-cosfy-amber/30 p-3.5 mb-4">
        <p className="text-[12px] text-cosfy-ink-soft leading-relaxed">
          Informational only, not investment advice. Cosfy is not a SEBI-registered adviser.
        </p>
      </div>
      <StockSearch />
    </PageContainer>
  );
}
