import type { Metadata } from "next";
import { getCurrentUser } from "@/lib/current-user";
import { getAverageMonthlySurplus } from "@/lib/actions/goals";
import { PageContainer } from "@/components/layout/PageContainer";
import { CreateGoalForm } from "./CreateGoalForm";

export const metadata: Metadata = {
  title: "New goal",
  description: "Start a new savings goal.",
};

export default async function CreateGoalPage() {
  const user = await getCurrentUser();
  const avgMonthlySurplus = await getAverageMonthlySurplus(user.id);

  return (
    <PageContainer title="Create goal" backHref="/goals">
      <CreateGoalForm avgMonthlySurplus={avgMonthlySurplus} />
    </PageContainer>
  );
}
