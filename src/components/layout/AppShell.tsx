import type { ReactNode } from "react";
import { QuickAddProvider } from "@/components/quick-add/QuickAddContext";
import { BottomNav } from "@/components/layout/BottomNav";
import { AppSplash } from "@/components/layout/AppSplash";
import { FloatingChatButton } from "@/components/layout/FloatingChatButton";
import { LanguageProvider } from "@/lib/i18n/LanguageProvider";
import { SUPPORTED_LANGUAGES, type Language } from "@/lib/i18n/dictionary";
import { getCurrentUser } from "@/lib/current-user";

export async function AppShell({ children }: { children: ReactNode }) {
  const user = await getCurrentUser();
  const initialLanguage: Language = SUPPORTED_LANGUAGES.includes(user.language as Language)
    ? (user.language as Language)
    : "en";

  return (
    <LanguageProvider initialLanguage={initialLanguage}>
      <QuickAddProvider>
        <div className="min-h-dvh bg-cosfy-bg">
          <AppSplash />
          {children}
          <FloatingChatButton />
          <BottomNav />
        </div>
      </QuickAddProvider>
    </LanguageProvider>
  );
}
