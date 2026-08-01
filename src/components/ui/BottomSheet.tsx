"use client";

import type { ReactNode } from "react";

export function BottomSheet({
  open,
  onClose,
  title,
  children,
}: {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      <button
        aria-label="Close"
        className="absolute inset-0 bg-black/40"
        onClick={onClose}
      />
      <div className="relative w-full max-w-md bg-cosfy-bg rounded-t-sheet shadow-soft px-5 pt-3 pb-6 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-center mb-3">
          <div className="h-1.5 w-10 rounded-full bg-cosfy-border-strong" />
        </div>
        {title ? <h2 className="text-[19px] font-extrabold mb-4">{title}</h2> : null}
        {children}
      </div>
    </div>
  );
}
