import type { Metadata } from "next";
import { getCurrentUser } from "@/lib/current-user";
import { WelcomeScreen } from "@/components/onboarding/WelcomeScreen";

export const metadata: Metadata = { title: "Welcome" };

export default async function OnboardingWelcomePage() {
  const user = await getCurrentUser();
  return <WelcomeScreen preferredName={user.preferredName} />;
}
