import { Suspense } from "react";
import { PageContainer } from "@/components/layout/PageContainer";
import { ImportHub } from "@/components/import/ImportHub";

export default function ImportPage() {
  return (
    <PageContainer title="Import expenses" backHref="/home">
      <p className="text-[13px] text-cosfy-muted mb-4">
        Paste a bank SMS, upload a payment screenshot, drop a voice note, or import a full statement — we&apos;ll pull
        out the details for you to confirm.
      </p>
      <Suspense>
        <ImportHub />
      </Suspense>
    </PageContainer>
  );
}
