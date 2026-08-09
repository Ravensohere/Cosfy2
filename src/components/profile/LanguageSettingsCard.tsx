"use client";

import { useTransition } from "react";
import { Languages } from "lucide-react";
import { IconTile } from "@/components/ui/IconTile";
import { PillChip } from "@/components/ui/PillChip";
import { useT } from "@/lib/i18n/LanguageProvider";
import { updateLanguagePref } from "@/lib/actions/profile";

export function LanguageSettingsCard() {
  const { language, setLanguage } = useT();
  const [, startTransition] = useTransition();

  function choose(lang: "en" | "hi") {
    setLanguage(lang);
    startTransition(async () => {
      await updateLanguagePref(lang);
    });
  }

  return (
    <div className="flex items-center gap-3 rounded-card bg-cosfy-card border border-cosfy-border p-4">
      <IconTile icon={Languages} tone="lime" size={44} />
      <div className="flex-1">
        <p className="font-bold text-[14px] text-cosfy-ink">Language</p>
        <p className="text-[12px] text-cosfy-muted">Nav and home screen only, for now</p>
      </div>
      <div className="flex gap-2 shrink-0">
        <PillChip variant={language === "en" ? "active" : "inactive"} onClick={() => choose("en")}>
          EN
        </PillChip>
        <PillChip variant={language === "hi" ? "active" : "inactive"} onClick={() => choose("hi")}>
          हि
        </PillChip>
      </div>
    </div>
  );
}
