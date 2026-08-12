import { ShieldCheck } from "lucide-react";
import { PageContainer } from "@/components/layout/PageContainer";
import { EmptyState } from "@/components/ui/EmptyState";
import { getCurrentUser } from "@/lib/current-user";
import { db } from "@/lib/db";
import { InsuranceList } from "@/components/insurance/InsuranceList";
import { InsuranceDocumentList } from "@/components/insurance/InsuranceDocumentList";
import { AddPolicyButton } from "@/components/insurance/AddPolicyButton";

export default async function InsurancePage() {
  const user = await getCurrentUser();
  const [policies, documents] = await Promise.all([
    db.insurancePolicy.findMany({ where: { userId: user.id }, orderBy: { nextRenewalDate: "asc" } }),
    db.insuranceDocument.findMany({ where: { userId: user.id }, orderBy: { createdAt: "desc" } }),
  ]);

  return (
    <PageContainer title="Insurance" backHref="/home" action={<AddPolicyButton />}>
      {policies.length === 0 && documents.length === 0 ? (
        <EmptyState
          icon={ShieldCheck}
          title="No policies tracked yet"
          description="Add a policy to get renewal reminders before premiums lapse, or upload a policy document in Ask Kosh to have it read and classified."
          action={<AddPolicyButton variant="primary" />}
        />
      ) : (
        <div className="space-y-6">
          {policies.length > 0 ? <InsuranceList policies={policies} /> : null}
          <InsuranceDocumentList documents={documents} />
        </div>
      )}
    </PageContainer>
  );
}
