import type { Metadata } from "next";
import { CreditCard as CreditCardIcon } from "lucide-react";
import { PageContainer } from "@/components/layout/PageContainer";
import { EmptyState } from "@/components/ui/EmptyState";
import { getCurrentUser } from "@/lib/current-user";
import { db } from "@/lib/db";
import { CreditCardList } from "@/components/credit-cards/CreditCardList";
import { AddCreditCardButton } from "@/components/credit-cards/AddCreditCardButton";

export const metadata: Metadata = {
  title: "Credit cards",
  description: "Track credit card bills and due dates.",
};

export default async function CreditCardsPage() {
  const user = await getCurrentUser();
  const cards = await db.creditCard.findMany({ where: { userId: user.id }, orderBy: { dueDay: "asc" } });

  return (
    <PageContainer title="Credit cards" backHref="/home" action={<AddCreditCardButton />}>
      {cards.length === 0 ? (
        <EmptyState
          icon={CreditCardIcon}
          title="No cards tracked yet"
          description="Add a card to keep an eye on statement and due dates."
          action={<AddCreditCardButton variant="primary" />}
        />
      ) : (
        <CreditCardList cards={cards} />
      )}
    </PageContainer>
  );
}
