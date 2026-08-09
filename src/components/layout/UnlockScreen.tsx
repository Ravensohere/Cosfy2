"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Lock, Delete } from "lucide-react";
import { unlockApp } from "@/lib/actions/app-lock";

const KEYS = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "", "0", "backspace"];

export function UnlockScreen() {
  const [pin, setPin] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  function press(key: string) {
    if (isPending) return;
    setError(null);
    if (key === "backspace") {
      setPin((p) => p.slice(0, -1));
      return;
    }
    if (key === "") return;
    if (pin.length >= 6) return;
    const next = pin + key;
    setPin(next);
    if (next.length >= 4) {
      startTransition(async () => {
        const result = await unlockApp(next);
        if (!result.ok) {
          setError(result.error ?? "Incorrect PIN");
          setPin("");
          return;
        }
        router.refresh();
      });
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-cosfy-ink px-6">
      <Lock size={28} className="text-cosfy-lime mb-4" />
      <p className="text-white font-bold text-[16px] mb-1">Enter your PIN</p>
      <p className="text-white/50 text-[12px] mb-6 h-4">{error ?? ""}</p>

      <div className="flex gap-3 mb-8">
        {Array.from({ length: 6 }).map((_, i) => (
          <span
            key={i}
            className={`w-3 h-3 rounded-full ${i < pin.length ? "bg-cosfy-lime" : "bg-white/20"}`}
          />
        ))}
      </div>

      <div className="grid grid-cols-3 gap-4 w-full max-w-[280px]">
        {KEYS.map((key, i) =>
          key === "" ? (
            <span key={i} />
          ) : (
            <button
              key={i}
              type="button"
              disabled={isPending}
              onClick={() => press(key)}
              className="h-16 rounded-full bg-white/10 text-white text-[20px] font-semibold flex items-center justify-center active:bg-white/20"
            >
              {key === "backspace" ? <Delete size={20} /> : key}
            </button>
          )
        )}
      </div>
    </div>
  );
}
