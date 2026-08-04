"use client";

import { useState, useTransition } from "react";
import { KeyRound } from "lucide-react";
import { IconTile } from "@/components/ui/IconTile";
import { Input } from "@/components/ui/Input";
import { PrimaryButton } from "@/components/ui/PrimaryButton";
import { SecondaryButton } from "@/components/ui/SecondaryButton";
import { saveOpenAIKey, clearOpenAIKey } from "@/lib/actions/profile";

export function ApiKeySettings({ keyPreview }: { keyPreview: string | null }) {
  const [value, setValue] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleSave() {
    setError(null);
    startTransition(async () => {
      const result = await saveOpenAIKey(value);
      if (!result.ok) {
        setError(result.error ?? "Couldn't save key");
        return;
      }
      setValue("");
    });
  }

  function handleClear() {
    startTransition(async () => {
      await clearOpenAIKey();
    });
  }

  return (
    <div className="rounded-card bg-cosfy-card border border-cosfy-border p-4">
      <div className="flex items-center gap-3 mb-3">
        <IconTile icon={KeyRound} tone="lime" size={44} />
        <div className="flex-1">
          <p className="font-bold text-[14px] text-cosfy-ink">OpenAI API key</p>
          <p className="text-[12px] text-cosfy-muted">
            Optional — Ask AI runs on Gemini Flash by default. Add your own OpenAI key to switch to GPT. Stored on your account only.
          </p>
        </div>
      </div>

      {keyPreview ? (
        <div className="flex items-center justify-between rounded-input bg-cosfy-card-soft px-3 h-11 mb-3">
          <span className="text-[13px] font-mono text-cosfy-ink-soft">{keyPreview}</span>
          <SecondaryButton className="h-8 px-3 text-[12px]" onClick={handleClear} disabled={isPending}>
            {isPending ? "Removing…" : "Remove"}
          </SecondaryButton>
        </div>
      ) : (
        <div className="space-y-2">
          <Input
            type="password"
            placeholder="sk-..."
            value={value}
            onChange={(e) => setValue(e.target.value)}
            autoComplete="off"
          />
          {error ? <p className="text-[12px] text-cosfy-red">{error}</p> : null}
          <PrimaryButton fullWidth className="h-11 text-[13px]" onClick={handleSave} disabled={isPending || !value.trim()}>
            {isPending ? "Saving…" : "Save key"}
          </PrimaryButton>
        </div>
      )}
    </div>
  );
}
