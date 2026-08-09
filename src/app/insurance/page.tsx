import { ShieldCheck } from "lucide-react";
import { PageContainer } from "@/components/layout/PageContainer";
import { EmptyState } from "@/components/ui/EmptyState";
import { getCurrentUser } from "@/lib/current-user";
import { db } from "@/lib/db";
import { InsuranceList } from "@/components/insurance/InsuranceList";
import { AddPolicyButton } from "@/components/insurance/AddPolicyButton";

export default async function InsurancePage() {
  const user = await getCurrentUser();
  const policies = await db.insurancePolicy.findMany({
    where: { userId: user.id },
    orderBy: { nextRenewalDate: "asc" },
  });

  return (
    <PageContainer title="Insurance" backHref="/home" action={<AddPolicyButton />}>
      {policies.length === 0 ? (
        <EmptyState
          icon={ShieldCheck}
          title="No policies tracked yet"
          description="Add a policy to get renewal reminders before premiums lapse."
          action={<AddPolicyButton variant="primary" />}
        />
      ) : (
        <InsuranceList policies={policies} />
      )}
    </PageContainer>
  );
}
