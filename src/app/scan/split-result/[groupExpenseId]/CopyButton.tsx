"use client";

import { useState } from "react";
import { Copy, Check } from "lucide-react";
import { SecondaryButton } from "@/components/ui/SecondaryButton";

export function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <SecondaryButton type="button" fullWidth className="h-11 text-[13px]" onClick={handleCopy}>
      {copied ? <Check size={16} /> : <Copy size={16} />} {copied ? "Copied" : "Copy"}
    </SecondaryButton>
  );
}
