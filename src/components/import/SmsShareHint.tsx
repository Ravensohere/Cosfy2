"use client";

import { useEffect, useState } from "react";
import { Download, Share2 } from "lucide-react";

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

function isIOS() {
  return /iphone|ipad|ipod/i.test(navigator.userAgent);
}

function isStandalone() {
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    (navigator as Navigator & { standalone?: boolean }).standalone === true
  );
}

// Android/Chrome supports the Web Share Target API: once Cosfy is installed
// as a PWA, "Cosfy" shows up in the native Share sheet from the Messages
// app, landing straight on this tab with the SMS text prefilled. iOS Safari
// has no equivalent API, so sharing can't work there regardless of install —
// say that plainly instead of prompting for an install that won't help.
export function SmsShareHint() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [ios, setIos] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    if (isStandalone()) return;
    if (isIOS()) {
      setIos(true);
      return;
    }
    function onBeforeInstallPrompt(e: Event) {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    }
    function onInstalled() {
      setDeferredPrompt(null);
    }
    window.addEventListener("beforeinstallprompt", onBeforeInstallPrompt);
    window.addEventListener("appinstalled", onInstalled);
    return () => {
      window.removeEventListener("beforeinstallprompt", onBeforeInstallPrompt);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  if (dismissed) return null;

  if (deferredPrompt) {
    return (
      <div className="rounded-card bg-cosfy-lime-pale border border-cosfy-lime-soft p-4 flex items-start gap-3">
        <Share2 size={18} className="text-cosfy-lime-ink shrink-0 mt-0.5" />
        <div className="flex-1 min-w-0">
          <p className="text-[13px] font-semibold text-cosfy-lime-ink">Install Cosfy to share SMS directly</p>
          <p className="text-[12px] text-cosfy-lime-ink/80 mt-0.5">
            Once installed, pick &quot;Cosfy&quot; from your Messages app&apos;s Share menu, no copy-paste needed.
          </p>
          <button
            type="button"
            onClick={async () => {
              await deferredPrompt.prompt();
              await deferredPrompt.userChoice;
              setDeferredPrompt(null);
            }}
            className="inline-flex items-center gap-1.5 mt-2 text-[12px] font-bold text-cosfy-lime-ink underline"
          >
            <Download size={13} /> Install app
          </button>
        </div>
        <button
          type="button"
          aria-label="Dismiss"
          onClick={() => setDismissed(true)}
          className="text-[11px] text-cosfy-lime-ink/60 shrink-0"
        >
          ✕
        </button>
      </div>
    );
  }

  if (ios) {
    return (
      <div className="rounded-card bg-cosfy-card-soft border border-cosfy-border p-3">
        <p className="text-[12px] text-cosfy-muted">
          iOS doesn&apos;t support sharing SMS directly to apps yet, paste the text below instead.
        </p>
      </div>
    );
  }

  return null;
}
