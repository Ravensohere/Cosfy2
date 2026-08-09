import { Coins } from "lucide-react";
import { PageContainer } from "@/components/layout/PageContainer";
import { EmptyState } from "@/components/ui/EmptyState";
import { MoneyAmount } from "@/components/ui/MoneyAmount";
import { getCurrentUser } from "@/lib/current-user";
import { db } from "@/lib/db";
import { GoldList } from "@/components/gold/GoldList";
import { AddGoldButton } from "@/components/gold/AddGoldButton";

export default async function GoldPage() {
  const user = await getCurrentUser();
  const holdings = await db.goldHolding.findMany({ where: { userId: user.id }, orderBy: { purchaseDate: "desc" } });

  const totalInvested = holdings.reduce((sum, h) => sum + h.purchasePrice, 0);
  const totalCurrent = holdings.reduce((sum, h) => sum + h.currentValue, 0);
  const gain = totalCurrent - totalInvested;

  return (
    <PageContainer title="Gold" backHref="/home" action={<AddGoldButton />}>
      {holdings.length === 0 ? (
        <EmptyState
          icon={Coins}
          title="No gold tracked yet"
          description="Add physical gold, digital gold, or SGBs to see your total holdings and gains."
          action={<AddGoldButton variant="primary" />}
        />
      ) : (
        <>
          <div className="rounded-card bg-cosfy-ink text-white p-4 mb-4">
            <p className="text-[12px] text-white/60 font-semibold">Current value</p>
            <MoneyAmount amount={totalCurrent} size="lg" className="text-white" />
            <p className={`text-[13px] font-semibold mt-1 ${gain >= 0 ? "text-cosfy-lime" : "text-cosfy-red"}`}>
              {gain >= 0 ? "+" : ""}
              {gain.toLocaleString("en-IN", { maximumFractionDigits: 0 })} vs invested
            </p>
          </div>
          <GoldList holdings={holdings} />
        </>
      )}
    </PageContainer>
  );
}
