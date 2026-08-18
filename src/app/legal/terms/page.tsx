import type { Metadata } from "next";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";

export const metadata: Metadata = {
  title: "Terms & Conditions",
  description: "Cosfy's terms of service and conditions of use.",
};

const LAST_UPDATED = "13 August 2026";

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mb-6">
      <h2 className="text-[15px] font-bold text-cosfy-ink mb-2">{title}</h2>
      <div className="text-[13px] text-cosfy-ink-soft leading-relaxed space-y-2">{children}</div>
    </section>
  );
}

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
      <p className="text-[12px] text-cosfy-muted mb-6">Last updated: {LAST_UPDATED}</p>

      <div className="rounded-card bg-cosfy-amber/10 border border-cosfy-amber/30 p-4 mb-6">
        <p className="text-[12px] text-cosfy-ink-soft leading-relaxed">
          Cosfy is a personal budgeting and expense-tracking tool. It is <strong>not</strong> a bank, a payment
          service, a broker, or a licensed financial, tax, or legal advisor. Nothing in the app, including
          responses from Kosh (our AI money coach), is financial, investment, tax, or legal advice. Always
          verify important numbers against your actual bank/UPI statements and consult a licensed professional
          before making financial decisions.
        </p>
      </div>

      <Section title="1. Acceptance of these terms">
        <p>
          By creating an account or using Cosfy (&quot;the App&quot;, &quot;we&quot;, &quot;us&quot;), you agree to these Terms &
          Conditions and our data-handling practices described below. If you do not agree, do not use the App.
          If you are using Cosfy on behalf of a minor, you confirm you have the legal authority to do so; the
          App is intended for users aged 18 and above.
        </p>
      </Section>

      <Section title="2. What Cosfy does">
        <p>
          Cosfy helps you log expenses, split bills, track savings goals and net worth, and get AI-assisted
          insights (&quot;Kosh&quot;) based on data you provide or connect. Cosfy does not initiate, hold, or move money
          on your behalf, and does not have write access to any bank account. All amounts, categories, and
          summaries shown are for informational purposes only and may contain errors, including errors from
          automated parsing of pasted SMS text or Gmail data, or from AI-generated responses.
        </p>
      </Section>

      <Section title="3. Permissions and data we access">
        <p>Cosfy only requests the access below, and only what each feature needs to function:</p>
        <ul className="space-y-2 pl-1">
          <li>
            <strong className="text-cosfy-ink">Gmail import (optional, OAuth):</strong> if you connect Gmail, we
            request read-only access to search for and read transaction-related emails so we can auto-import
            expenses. We do not read unrelated email, send email as you, or access your contacts. Your refresh
            token is encrypted at rest (AES-256). You can revoke this from a Google account settings and
            disconnect it from Cosfy at any time in Profile.
          </li>
          <li>
            <strong className="text-cosfy-ink">SMS import (manual, no device permission):</strong> Cosfy does not
            request or use your device&apos;s SMS-read permission. You choose to paste bank SMS text into the App
            yourself; we parse only the text you paste to extract transaction details.
          </li>
          <li>
            <strong className="text-cosfy-ink">Photos (bills/coupons, no camera permission):</strong> uploading a
            bill or coupon photo uses your device&apos;s standard file picker. Cosfy does not request live camera
            access and does not access your photo library beyond the single file you choose to upload.
          </li>
          <li>
            <strong className="text-cosfy-ink">Notifications:</strong> this is an in-app preference (Profile
            &gt; Notifications) for budget alerts/reminders. It does not request OS-level push notification
            permission unless a future version adds that, in which case this document and the in-app prompt
            will be updated first.
          </li>
          <li>
            <strong className="text-cosfy-ink">Kosh (AI money coach):</strong> questions you ask Kosh, together
            with relevant account data needed to answer them, are sent to Google&apos;s Gemini API to generate a
            response. This is used only to answer that question, not to build advertising profiles.
          </li>
          <li>
            <strong className="text-cosfy-ink">We do not request:</strong> location/GPS access, your device
            contacts, or any bank/UPI login credentials. Cosfy never asks for your net banking password, UPI
            PIN, card CVV, or OTP, and will never legitimately request these — treat any such request as fraud.
          </li>
        </ul>
        <p>
          All traffic to Cosfy is encrypted in transit (HTTPS/TLS). Sensitive credentials such as your Gmail
          refresh token are encrypted at rest before storage. Your data is not sold, and is not shared with
          advertisers or third parties, except the service providers strictly needed to run the App (e.g.
          hosting, database, Google Gmail/Gemini APIs), each bound by their own data-processing terms. You can
          delete your account and all associated data at any time from Profile &gt; Delete account.
        </p>
      </Section>

      <Section title="4. Your responsibilities">
        <ul className="space-y-2 pl-1">
          <li>Keep your login credentials and device secure; you are responsible for activity under your account.</li>
          <li>Only submit information you have the right to share (e.g. your own SMS/bill data).</li>
          <li>Use the App lawfully and not to store or transmit fraudulent, infringing, or unlawful content.</li>
          <li>Independently verify any figure, category, or suggestion before relying on it financially.</li>
        </ul>
      </Section>

      <Section title="5. AI-generated content">
        <p>
          Kosh uses a third-party large language model and may produce incomplete, outdated, or incorrect
          responses. Kosh&apos;s output is provided &quot;as is&quot; for general informational purposes only, does not
          constitute financial, investment, tax, or legal advice, and should not be the sole basis for any
          financial decision.
        </p>
      </Section>

      <Section title="6. No warranty">
        <p>
          The App is provided &quot;as is&quot; and &quot;as available&quot;, without warranties of any kind, whether express or
          implied, including accuracy, reliability, uninterrupted availability, or fitness for a particular
          purpose. Automated import (Gmail/SMS parsing) may misread or miss transactions; you remain responsible
          for verifying your actual financial records against your bank/UPI statements.
        </p>
      </Section>

      <Section title="7. Limitation of liability">
        <p>
          To the maximum extent permitted by law, Cosfy and Ravenso shall not be liable for any indirect,
          incidental, special, or consequential damages, or for any loss of data, profits, or financial loss,
          arising from your use of, or inability to use, the App, including reliance on any figure, category,
          import, or AI-generated response. Our total liability for any claim relating to the App shall not
          exceed the amount, if any, you paid us in the 12 months preceding the claim.
        </p>
      </Section>

      <Section title="8. Account suspension and termination">
        <p>
          We may suspend or terminate access if these Terms are violated, if required by law, or to protect the
          App or other users. You may stop using the App and delete your account at any time from Profile.
        </p>
      </Section>

      <Section title="9. Changes to the App or these Terms">
        <p>
          We may update the App or these Terms from time to time. Material changes will be reflected by updating
          the &quot;Last updated&quot; date above, and where reasonably possible, an in-app notice. Continued use after
          changes take effect constitutes acceptance.
        </p>
      </Section>

      <Section title="10. Governing law">
        <p>
          These Terms are governed by the laws of India, without regard to conflict-of-law principles, and any
          dispute shall be subject to the exclusive jurisdiction of the courts of [city/state — Ravenso to
          confirm].
        </p>
      </Section>

      <Section title="11. Contact">
        <p>
          Questions about these Terms, or requests to access/export/delete your data, can be sent to
          [support email — Ravenso to confirm], or via Profile &gt; Delete account for immediate erasure.
        </p>
      </Section>

      <div className="rounded-card bg-cosfy-card border border-cosfy-border p-4 mt-2">
        <p className="text-[11px] text-cosfy-muted leading-relaxed">
          This document is a starting template generated for Cosfy and is not a substitute for advice from a
          licensed attorney. The bracketed placeholders above should be completed, and the full document
          reviewed by qualified legal counsel familiar with Indian consumer, IT, and data-protection law (e.g.
          the DPDP Act, 2023), before this is relied upon as a binding, production Terms & Conditions.
        </p>
      </div>

      <p className="text-center text-[11px] text-cosfy-muted mt-8">
        © {new Date().getFullYear()} Cosfy by Ravenso
      </p>
    </div>
  );
}
