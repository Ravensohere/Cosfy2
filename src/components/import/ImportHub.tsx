"use client";

import { useState } from "react";
import { PillChip } from "@/components/ui/PillChip";
import { TextImportTab } from "@/components/import/TextImportTab";
import { ScreenshotImportTab } from "@/components/import/ScreenshotImportTab";
import { VoiceImportTab } from "@/components/import/VoiceImportTab";
import { StatementImportTab } from "@/components/import/StatementImportTab";

const TABS = [
  { id: "text", label: "SMS text" },
  { id: "screenshot", label: "Screenshot" },
  { id: "voice", label: "Voice note" },
  { id: "statement", label: "Statement" },
] as const;

type TabId = (typeof TABS)[number]["id"];

export function ImportHub() {
  const [tab, setTab] = useState<TabId>("text");

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap gap-2">
        {TABS.map((t) => (
          <PillChip key={t.id} variant={tab === t.id ? "active" : "inactive"} onClick={() => setTab(t.id)}>
            {t.label}
          </PillChip>
        ))}
      </div>

      {tab === "text" ? <TextImportTab /> : null}
      {tab === "screenshot" ? <ScreenshotImportTab /> : null}
      {tab === "voice" ? <VoiceImportTab /> : null}
      {tab === "statement" ? <StatementImportTab /> : null}
    </div>
  );
}
