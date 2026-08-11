import { Plus, Tag } from "lucide-react";
import { getCurrentUser } from "@/lib/current-user";
import { db } from "@/lib/db";
import { PageContainer } from "@/components/layout/PageContainer";
import { EmptyState } from "@/components/ui/EmptyState";
import { PrimaryButton } from "@/components/ui/PrimaryButton";
import { CouponCard } from "@/components/coupons/CouponCard";

export default async function CouponsPage() {
  const user = await getCurrentUser();
  const coupons = await db.coupon.findMany({
    where: { userId: user.id },
    orderBy: [{ isRedeemed: "asc" }, { expiresAt: "asc" }],
  });

  return (
    <PageContainer
      title="Coupons"
      action={
        <PrimaryButton href="/coupons/create" className="h-9 px-4 text-[12px]">
          <Plus size={16} /> New
        </PrimaryButton>
      }
    >
      {coupons.length === 0 ? (
        <EmptyState
          icon={Tag}
          title="No coupons saved"
          description="Scan or add a coupon so you never miss claiming it."
          action={<PrimaryButton href="/coupons/create">Add coupon</PrimaryButton>}
        />
      ) : (
        <div className="space-y-3">
          {coupons.map((c) => (
            <CouponCard
              key={c.id}
              id={c.id}
              title={c.title}
              merchant={c.merchant}
              code={c.code}
              description={c.description}
              expiresAt={c.expiresAt}
              isRedeemed={c.isRedeemed}
            />
          ))}
        </div>
      )}
    </PageContainer>
  );
}
