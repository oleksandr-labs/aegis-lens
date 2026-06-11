import type { Metadata } from "next";
import { isLocale, type Locale } from "@aegis/i18n-config";
import { buildMetadata } from "@/lib/seo";
import { PageHeader, Prose } from "@/components/PageHeader";

const lp = (lc: Locale) => (lc === "en" ? "/legal/privacy" : `/${lc}/legal/privacy`);

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale: raw } = await params;
  const locale = (isLocale(raw) ? raw : "en") as Locale;
  return buildMetadata({
    locale,
    title: "Privacy Policy",
    description: "How Aegis Lens collects, uses, and protects your data.",
    pathFor: lp,
    noindex: true,
  });
}

export default function PrivacyPage() {
  return (
    <>
      <PageHeader
        eyebrow="Legal"
        title="Privacy Policy"
        description="DRAFT — counsel review pending. Last updated: 2025-05-23."
      />
      <div className="mx-auto max-w-3xl px-4 pb-0 pt-6">
        <div className="rounded border border-border-subtle bg-bg-elevated px-5 py-4">
          <p className="font-mono text-[10px] uppercase tracking-wider text-accent">Plain-language summary</p>
          <p className="mt-2 text-sm text-text-secondary">
            We collect the minimum data needed to run the service: your email for account access,
            usage data to improve the product, and billing data to process payments. We do not sell
            your personal data. If you are in the EU or UK, you have rights to access, correct, or
            delete your data — submit a request via your account settings or email us. We retain
            account data until you delete your account, plus a 30-day grace period.
          </p>
        </div>
      </div>
      <Prose>
        <h2>What we collect</h2>
        <p>Account data (email), usage data, billing data. No content of source events constitutes user PII.</p>
        <h2>Lawful basis (GDPR)</h2>
        <p>Contract performance, legitimate interest, and consent where applicable.</p>
        <h2>Retention</h2>
        <p>Account data until deletion + 30d grace. See data-governance for full retention matrix.</p>
        <h2>Your rights (GDPR / UK / CCPA)</h2>
        <p>Access, rectification, erasure, portability, restriction, objection. Submit via settings or contact.</p>
        <h2>International transfers</h2>
        <p>Where data leaves the EU, we use SCCs and conduct TIAs.</p>
        <h2>Cookies</h2>
        <p>See our Cookie Policy.</p>
        <h2>Contact</h2>
        <p>privacy@aegis-lens.example (placeholder).</p>
      </Prose>
      <div className="mx-auto max-w-3xl px-4 pb-10">
        <details className="group mt-6 rounded border border-border-subtle bg-bg-surface">
          <summary className="cursor-pointer px-5 py-3 font-mono text-[10px] uppercase tracking-wider text-text-muted group-open:text-accent">
            Version history ▸
          </summary>
          <ol className="divide-y divide-border-subtle border-t border-border-subtle">
            {[
              { version: "1.3", date: "2026-05-23", note: "Clarified retention periods for inactive accounts. Added UK adequacy reference post-2025 decision." },
              { version: "1.2", date: "2026-02-10", note: "Added Subprocessors list reference. Updated international-transfer section for new SCCs." },
              { version: "1.1", date: "2025-10-01", note: "CCPA section added. Billing-data clarification." },
              { version: "1.0", date: "2025-05-23", note: "Initial public draft released." },
            ].map((v) => (
              <li key={v.version} className="flex gap-6 px-5 py-3 text-sm">
                <span className="w-10 shrink-0 font-mono text-[11px] text-accent">v{v.version}</span>
                <span className="w-24 shrink-0 font-mono text-[10px] text-text-muted">{v.date}</span>
                <span className="text-text-secondary">{v.note}</span>
              </li>
            ))}
          </ol>
        </details>
      </div>
    </>
  );
}
