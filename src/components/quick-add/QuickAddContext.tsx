"use client";

import { createContext, useContext, useState, type ReactNode } from "react";
import { QuickAddSheet } from "@/components/quick-add/QuickAddSheet";

const QuickAddCtx = createContext<{ openQuickAdd: () => void } | null>(null);

export function QuickAddProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);

  return (
    <QuickAddCtx.Provider value={{ openQuickAdd: () => setOpen(true) }}>
      {children}
      <QuickAddSheet open={open} onClose={() => setOpen(false)} />
    </QuickAddCtx.Provider>
  );
}

export function useQuickAdd() {
  const ctx = useContext(QuickAddCtx);
  if (!ctx) throw new Error("useQuickAdd must be used within QuickAddProvider");
  return ctx;
}
