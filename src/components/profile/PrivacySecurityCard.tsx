import { ShieldCheck } from "lucide-react";
import { IconTile } from "@/components/ui/IconTile";

const POINTS = [
  "All traffic to Cosfy is encrypted in transit (HTTPS/TLS), including every request to your bank SMS parser, Gmail import, and AI Coach.",
  "Sensitive credentials, like your Gmail refresh token, are encrypted at rest (AES-256) before they ever touch the database. Even a database leak wouldn't expose them in plain text.",
  "Your financial data lives in a private, access-controlled database. It's never sold, and never shared with advertisers or third parties.",
  "AI Coach questions are sent to Google's Gemini API only to generate that answer, not to build a profile of you elsewhere.",
  "You can disconnect Gmail import or delete your account and all its data from Profile at any time.",
];

export function PrivacySecurityCard() {
  return (
    <div className="rounded-card bg-cosfy-card border border-cosfy-border p-4">
      <div className="flex items-center gap-3 mb-3">
        <IconTile icon={ShieldCheck} tone="lime" size={44} />
        <div className="flex-1">
          <p className="font-bold text-[14px] text-cosfy-ink">Privacy & security</p>
          <p className="text-[12px] text-cosfy-muted">How Cosfy handles your data</p>
        </div>
      </div>
      <ul className="space-y-2">
        {POINTS.map((point, i) => (
          <li key={i} className="text-[12px] text-cosfy-ink-soft leading-relaxed flex gap-2">
            <span className="text-cosfy-lime-deep shrink-0">•</span>
            {point}
          </li>
        ))}
      </ul>
    </div>
  );
}
