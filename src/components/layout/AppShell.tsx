import type { ReactNode } from "react";
import { QuickAddProvider } from "@/components/quick-add/QuickAddContext";
import { BottomNav } from "@/components/layout/BottomNav";
import { AppSplash } from "@/components/layout/AppSplash";
import { FloatingChatButton } from "@/components/layout/FloatingChatButton";
import { LanguageProvider } from "@/lib/i18n/LanguageProvider";
import { SUPPORTED_LANGUAGES, type Language } from "@/lib/i18n/dictionary";
import { getCurrentUser } from "@/lib/current-user";
import { TourProvider } from "@/components/tour/TourProvider";
import { TourSpotlight } from "@/components/tour/TourSpotlight";

export async function AppShell({ children }: { children: ReactNode }) {
  const user = await getCurrentUser();
  const initialLanguage: Language = SUPPORTED_LANGUAGES.includes(user.language as Language)
    ? (user.language as Language)
    : "en";
  const shouldStartTour = user.onboardingCompleted && !user.tourCompleted;

  return (
    <LanguageProvider initialLanguage={initialLanguage}>
      <QuickAddProvider>
        <TourProvider shouldStart={shouldStartTour}>
          <div className="min-h-dvh bg-cosfy-bg">
            <AppSplash />
            {children}
            <FloatingChatButton />
            <BottomNav />
          </div>
          <TourSpotlight />
        </TourProvider>
      </QuickAddProvider>
    </LanguageProvider>
  );
}
