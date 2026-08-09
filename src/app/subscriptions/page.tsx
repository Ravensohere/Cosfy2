import { Repeat } from "lucide-react";
import { PageContainer } from "@/components/layout/PageContainer";
import { EmptyState } from "@/components/ui/EmptyState";
import { getCurrentUser } from "@/lib/current-user";
import { db } from "@/lib/db";
import { detectRecurringTransactions } from "@/lib/recurring-detector";
import { SubscriptionList } from "@/components/subscriptions/SubscriptionList";
import { AddSubscriptionButton } from "@/components/subscriptions/AddSubscriptionButton";
import { DetectedSuggestions } from "@/components/subscriptions/DetectedSuggestions";

export default async function SubscriptionsPage() {
  const user = await getCurrentUser();

  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

  const [subscriptions, recentTransactions] = await Promise.all([
    db.subscription.findMany({ where: { userId: user.id }, orderBy: { nextRenewalDate: "asc" } }),
    db.transaction.findMany({
      where: { userId: user.id, date: { gte: sixMonthsAgo } },
      select: { description: true, category: true, amount: true, date: true },
    }),
  ]);

  const suggestions = detectRecurringTransactions(
    recentTransactions,
    subscriptions.map((s) => s.name)
  );

  return (
    <PageContainer title="Subscriptions" backHref="/home" action={<AddSubscriptionButton />}>
      {subscriptions.length === 0 && suggestions.length === 0 ? (
        <EmptyState
          icon={Repeat}
          title="No subscriptions tracked yet"
          description="Add recurring payments to see renewal reminders — or wait for Cosfy to spot them in your transactions."
          action={<AddSubscriptionButton variant="primary" />}
        />
      ) : (
        <>
          {subscriptions.length > 0 ? <SubscriptionList subscriptions={subscriptions} /> : null}
          {suggestions.length > 0 ? (
            <div className="mt-6">
              <DetectedSuggestions suggestions={suggestions} />
            </div>
          ) : null}
        </>
      )}
    </PageContainer>
  );
}
