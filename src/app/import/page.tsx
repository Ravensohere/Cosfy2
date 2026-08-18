import { Suspense } from "react";
import type { Metadata } from "next";
import { PageContainer } from "@/components/layout/PageContainer";
import { ImportHub } from "@/components/import/ImportHub";

export const metadata: Metadata = {
  title: "Import expenses",
  description: "Pull expenses in from a bank SMS, screenshot, voice note, or bank statement.",
};

export default function ImportPage() {
  return (
    <PageContainer title="Import expenses" backHref="/home">
      <p className="text-[13px] text-cosfy-muted mb-4">
        Paste a bank SMS, upload a payment screenshot, drop a voice note, or import a full statement, and we&apos;ll pull
        out the details for you to confirm.
      </p>
      <Suspense>
        <ImportHub />
      </Suspense>
    </PageContainer>
  );
}
