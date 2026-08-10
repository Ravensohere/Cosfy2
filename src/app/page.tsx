import { redirect } from "next/navigation";
import { IndianRupee } from "lucide-react";
import { getCurrentUser } from "@/lib/current-user";
import { DarkButton } from "@/components/ui/DarkButton";

export default async function SplashPage() {
  const user = await getCurrentUser();

  if (user.onboardingCompleted) {
    redirect("/coach");
  }

  return (
    <div className="min-h-dvh bg-cosfy-lime flex flex-col items-center justify-between px-8 py-16 text-center">
      <div />
      <div className="flex flex-col items-center gap-6">
        <div className="w-20 h-20 rounded-3xl bg-cosfy-ink flex items-center justify-center">
          <IndianRupee size={36} className="text-cosfy-lime" strokeWidth={2.5} />
        </div>
        <h1 className="text-[36px] font-extrabold text-cosfy-ink lowercase tracking-tight">cosfy</h1>
        <p className="text-[15px] text-cosfy-lime-ink max-w-[280px]">
          Track spending, split bills, and build better money habits, built for India.
        </p>
      </div>
      <div className="w-full max-w-sm">
        <DarkButton href="/onboarding/goal" className="w-full">
          Get started →
        </DarkButton>
      </div>
    </div>
  );
}
