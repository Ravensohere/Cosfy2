import { getCurrentUser } from "@/lib/current-user";
import { WelcomeScreen } from "@/components/onboarding/WelcomeScreen";

export default async function OnboardingWelcomePage() {
  const user = await getCurrentUser();
  return <WelcomeScreen preferredName={user.preferredName} />;
}
