import type { ReactNode } from "react";
import { QuickAddProvider } from "@/components/quick-add/QuickAddContext";
import { MobileBottomNav } from "@/components/layout/MobileBottomNav";
import { DesktopSidebar } from "@/components/layout/DesktopSidebar";

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <QuickAddProvider>
      <div className="min-h-dvh bg-cosfy-bg md:flex">
        <DesktopSidebar />
        <div className="flex-1 min-w-0">
          {children}
          <MobileBottomNav />
        </div>
      </div>
    </QuickAddProvider>
  );
}
