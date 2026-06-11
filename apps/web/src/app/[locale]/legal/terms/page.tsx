import type { Metadata } from "next";
import { isLocale, type Locale } from "@aegis/i18n-config";
import { buildMetadata } from "@/lib/seo";
import { PageHeader, Prose } from "@/components/PageHeader";

const lp = (lc: Locale) => (lc === "en" ? "/legal/terms" : `/${lc}/legal/terms`);

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale: raw } = await params;
  const locale = (isLocale(raw) ? raw : "en") as Locale;
  return buildMetadata({
    locale,
    title: "Terms of Service",
    description: "The terms under which Aegis Lens may be used.",
    pathFor: lp,
    noindex: true, // draft — flip when counsel-reviewed
  });
}

export default function TermsPage() {
  return (
    <>
      <PageHeader
        eyebrow="Legal"
        title="Terms of Service"
        description="DRAFT — counsel review pending. Last updated: 2025-05-23."
      />
      <div className="mx-auto max-w-3xl px-4 pb-0 pt-6">
        <div className="rounded border border-border-subtle bg-bg-elevated px-5 py-4">
          <p className="font-mono text-[10px] uppercase tracking-wider text-accent">Plain-language summary</p>
          <p className="mt-2 text-sm text-text-secondary">
            By using Aegis Lens, you agree to use it lawfully and responsibly. You cannot use it to
            identify private individuals, enable real-time targeting, or harm others. Your account is
            your responsibility. We may suspend access if you violate these rules. The service is
            provided without warranty — we do our best, but cannot guarantee uptime or accuracy.
            See the full sections below for the binding legal text.
          </p>
        </div>
      </div>
      <Prose>
        <h2>1. Acceptance</h2>
        <p>By using Aegis Lens you agree to these Terms.</p>
        <h2>2. Service description</h2>
        <p>Aegis Lens aggregates publicly available information and makes it queryable.</p>
        <h2>3. Acceptable use</h2>
        <p>
          You agree not to use the service to dox private individuals, run real-time targeting, or
          violate applicable law. See our Acceptable Use Policy.
        </p>
        <h2>4. Accounts</h2>
        <p>You are responsible for your account credentials.</p>
        <h2>5. Privacy</h2>
        <p>See our Privacy Policy for data handling details.</p>
        <h2>6. Termination</h2>
        <p>We may suspend access for AUP violations.</p>
        <h2>7. Disclaimer</h2>
        <p>The service is provided "as is" without warranty of any kind.</p>
      </Prose>
      <div className="mx-auto max-w-3xl px-4 pb-10">
        <details className="group mt-6 rounded border border-border-subtle bg-bg-surface">
          <summary className="cursor-pointer px-5 py-3 font-mono text-[10px] uppercase tracking-wider text-text-muted group-open:text-accent">
            Version history ▸
          </summary>
          <ol className="divide-y divide-border-subtle border-t border-border-subtle">
            {[
              { version: "1.2", date: "2026-05-23", note: "Added AI-generated content clauses and clarified automated-collection restrictions." },
              { version: "1.1", date: "2026-01-15", note: "Updated liability cap language. Added section 7 disclaimer per counsel review." },
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
