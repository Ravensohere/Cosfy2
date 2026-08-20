import type { Metadata } from "next";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { TermsContent } from "@/components/legal/TermsContent";

export const metadata: Metadata = {
  title: "Terms & Conditions",
  description: "Cosfy's terms of service and conditions of use.",
};

export default function TermsPage() {
  return (
    <div className="min-h-dvh flex flex-col px-6 pt-10 pb-10 md:max-w-md md:mx-auto md:pt-16">
      <div className="flex items-center gap-3 mb-6">
        <Link
          href="/profile"
          aria-label="Back"
          className="flex items-center justify-center w-9 h-9 rounded-full bg-cosfy-card border border-cosfy-border"
        >
          <ChevronLeft size={18} />
        </Link>
        <h1 className="text-[20px] font-extrabold text-cosfy-ink">Terms & Conditions</h1>
      </div>
      <TermsContent />
    </div>
  );
}
