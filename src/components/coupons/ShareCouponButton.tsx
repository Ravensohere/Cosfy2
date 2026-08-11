"use client";

import { useState } from "react";
import { MessageCircle, Copy, Check } from "lucide-react";
import { inviteLine } from "@/lib/invite-link";

export function ShareCouponButton({
  title,
  merchant,
  code,
  expiresAt,
}: {
  title: string;
  merchant: string | null;
  code: string | null;
  expiresAt: Date | null;
}) {
  const [copied, setCopied] = useState(false);

  const lines = [
    `${title}${merchant ? ` at ${merchant}` : ""}`,
    code ? `Code: ${code}` : null,
    expiresAt ? `Valid till ${expiresAt.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}` : null,
  ].filter(Boolean);
  const message = lines.join("\n") + inviteLine();

  async function handleCopy() {
    if (!code) return;
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="flex gap-2">
      <a
        href={`https://wa.me/?text=${encodeURIComponent(message)}`}
        target="_blank"
        rel="noopener noreferrer"
        className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-button bg-cosfy-card border border-cosfy-border-strong text-cosfy-ink font-bold text-[12px] h-10"
      >
        <MessageCircle size={14} /> Share
      </a>
      {code ? (
        <button
          type="button"
          onClick={handleCopy}
          className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-button bg-cosfy-card border border-cosfy-border-strong text-cosfy-ink font-bold text-[12px] h-10"
        >
          {copied ? <Check size={14} /> : <Copy size={14} />} {copied ? "Copied" : "Copy code"}
        </button>
      ) : null}
    </div>
  );
}
