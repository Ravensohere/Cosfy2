import { PageContainer } from "@/components/layout/PageContainer";
import { CreateCouponForm } from "./CreateCouponForm";

export default function CreateCouponPage() {
  return (
    <PageContainer title="Add coupon" backHref="/coupons">
      <CreateCouponForm />
    </PageContainer>
  );
}
