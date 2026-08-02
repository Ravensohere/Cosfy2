import type { ReactNode } from "react";
import { QuickAddProvider } from "@/components/quick-add/QuickAddContext";
import { BottomNav } from "@/components/layout/BottomNav";
import { AppSplash } from "@/components/layout/AppSplash";

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <QuickAddProvider>
      <div className="min-h-dvh bg-cosfy-bg">
        <AppSplash />
        {children}
        <BottomNav />
      </div>
    </QuickAddProvider>
  );
}
