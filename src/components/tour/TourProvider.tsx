"use client";

import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import { usePathname } from "next/navigation";
import { TOUR_STEPS, type TourStep } from "@/components/tour/steps";
import { completeTour } from "@/lib/actions/tour";

type TourContextValue = {
  active: boolean;
  stepIndex: number;
  steps: TourStep[];
  next: () => void;
  prev: () => void;
  skip: () => void;
  skipMissing: () => void;
};

const TourContext = createContext<TourContextValue | null>(null);

export function useTour() {
  const ctx = useContext(TourContext);
  if (!ctx) throw new Error("useTour must be used within TourProvider");
  return ctx;
}

export function TourProvider({ shouldStart, children }: { shouldStart: boolean; children: ReactNode }) {
  const pathname = usePathname();
  const [active, setActive] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);
  const hasRunRef = useRef(false);
  const directionRef = useRef<"forward" | "backward">("forward");

  useEffect(() => {
    if (hasRunRef.current || !shouldStart) return;
    if (pathname !== "/home") return;
    hasRunRef.current = true;
    const t = setTimeout(() => {
      setStepIndex(0);
      setActive(true);
    }, 500);
    return () => clearTimeout(t);
  }, [pathname, shouldStart]);

  function end() {
    setActive(false);
    completeTour().catch(() => {});
  }

  function next() {
    directionRef.current = "forward";
    setStepIndex((i) => {
      if (i + 1 >= TOUR_STEPS.length) {
        end();
        return i;
      }
      return i + 1;
    });
  }

  function prev() {
    directionRef.current = "backward";
    setStepIndex((i) => Math.max(0, i - 1));
  }

  function skip() {
    end();
  }

  function skipMissing() {
    if (directionRef.current === "backward") {
      setStepIndex((i) => Math.max(0, i - 1));
    } else {
      next();
    }
  }

  return (
    <TourContext.Provider value={{ active, stepIndex, steps: TOUR_STEPS, next, prev, skip, skipMissing }}>
      {children}
    </TourContext.Provider>
  );
}
