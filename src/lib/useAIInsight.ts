"use client";

import { useEffect, useState, type DependencyList } from "react";

/**
 * Fetches an AI-generated take from /api/insights. `deps` controls when the
 * request re-fires — callers pass the exact primitives their request body
 * depends on (not the body object itself, which may be a fresh reference
 * every render) to avoid redundant refetches or stale closures.
 */
export function useAIInsight(body: unknown, deps: DependencyList, fallbackErrorMessage: string) {
  const [text, setText] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/insights", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    })
      .then((res) => res.json().then((data) => ({ ok: res.ok, data })))
      .then(({ ok, data }) => {
        if (cancelled) return;
        if (!ok) {
          setError(data.error ?? fallbackErrorMessage);
          return;
        }
        setText(data.insights);
      })
      .catch(() => {
        if (!cancelled) setError("Couldn't reach the server.");
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  return { text, error, isLoading };
}
