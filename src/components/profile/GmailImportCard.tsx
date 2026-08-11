"use client";

import { useState, useTransition } from "react";
import { Mail } from "lucide-react";
import { IconTile } from "@/components/ui/IconTile";
import { PrimaryButton } from "@/components/ui/PrimaryButton";
import { SecondaryButton } from "@/components/ui/SecondaryButton";
import { disconnectGmail, syncGmailNow } from "@/lib/actions/gmail";

export function GmailImportCard({ gmailConnected, gmailEmail }: { gmailConnected: boolean; gmailEmail: string | null }) {
  const [isPending, startTransition] = useTransition();
  const [status, setStatus] = useState<string | null>(null);

  function handleSync() {
    setStatus(null);
    startTransition(async () => {
      const result = await syncGmailNow();
      if (!result.ok) {
        setStatus(result.error);
        return;
      }
      setStatus(
        result.imported === 0
          ? "No new transactions found."
          : `Added ${result.imported} transaction${result.imported === 1 ? "" : "s"} from Gmail.`
      );
    });
  }

  function handleDisconnect() {
    setStatus(null);
    startTransition(async () => {
      await disconnectGmail();
    });
  }

  return (
    <div className="rounded-card bg-cosfy-card border border-cosfy-border p-4">
      <div className="flex items-center gap-3">
        <IconTile icon={Mail} tone="lime" size={44} />
        <div className="flex-1 min-w-0">
          <p className="font-bold text-[14px] text-cosfy-ink">Gmail auto-import</p>
          <p className="text-[12px] text-cosfy-muted truncate">
            {gmailConnected ? `Connected: ${gmailEmail ?? "unknown account"}` : "Scan transaction emails automatically"}
          </p>
        </div>
      </div>

      {status ? <p className="text-[12px] text-cosfy-muted mt-3">{status}</p> : null}

      <div className="flex gap-2 mt-3">
        {gmailConnected ? (
          <>
            <SecondaryButton className="flex-1 h-10 text-[13px]" onClick={handleDisconnect} disabled={isPending}>
              Disconnect
            </SecondaryButton>
            <PrimaryButton className="flex-1 h-10 text-[13px]" onClick={handleSync} disabled={isPending}>
              {isPending ? "Syncing…" : "Sync now"}
            </PrimaryButton>
          </>
        ) : (
          <PrimaryButton href="/api/gmail/connect" fullWidth className="h-10 text-[13px]">
            Connect Gmail
          </PrimaryButton>
        )}
      </div>
    </div>
  );
}
