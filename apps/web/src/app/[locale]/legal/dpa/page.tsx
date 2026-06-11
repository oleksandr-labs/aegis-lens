import type { Metadata } from "next";
import Link from "next/link";
import { localePath } from "@aegis/url-builder";
import { ACTIVE_LOCALES, isLocale, type Locale } from "@aegis/i18n-config";
import { buildMetadata } from "@/lib/seo";
import { PageHeader } from "@/components/PageHeader";
import { SITE } from "@/lib/site";

export function generateStaticParams() {
  return ACTIVE_LOCALES.map((locale) => ({ locale }));
}

const TITLE = "Data Processing Addendum (DPA)";
const DESCRIPTION =
  "Standard contractual terms governing Aegis Lens's processing of personal data on behalf of business customers, aligned with GDPR Article 28.";
const EFFECTIVE = "2026-01-01";
const VERSION = "1.2";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale: raw } = await params;
  const locale = (isLocale(raw) ? raw : "en") as Locale;
  return buildMetadata({
    locale,
    title: TITLE,
    description: DESCRIPTION,
    pathFor: (lc) => localePath(lc, "/legal/dpa"),
  });
}

export default async function DpaPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: raw } = await params;
  const locale = (isLocale(raw) ? raw : "en") as Locale;

  const pageUrl = `${SITE.url}${localePath(locale, "/legal/dpa")}`;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: TITLE,
    description: DESCRIPTION,
    url: pageUrl,
    inLanguage: locale,
    dateModified: EFFECTIVE,
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <PageHeader eyebrow="Legal" title={TITLE} description={DESCRIPTION} />

      <article className="mx-auto max-w-3xl px-4 py-10 text-text-secondary">
        <div className="mb-8 flex flex-wrap gap-6 rounded border border-border-subtle bg-bg-surface p-4 text-sm">
          <div>
            <div className="font-mono text-[10px] uppercase tracking-widest text-text-muted">Version</div>
            <div className="mt-1 font-semibold text-text-primary">{VERSION}</div>
          </div>
          <div>
            <div className="font-mono text-[10px] uppercase tracking-widest text-text-muted">Effective date</div>
            <div className="mt-1 font-semibold text-text-primary">{EFFECTIVE}</div>
          </div>
          <div>
            <div className="font-mono text-[10px] uppercase tracking-widest text-text-muted">Framework</div>
            <div className="mt-1 font-semibold text-text-primary">GDPR Art. 28 · UK GDPR · Swiss nFADP</div>
          </div>
          <div className="ml-auto flex items-center">
            <a
              href="/legal/dpa-v1.2.pdf"
              download
              className="rounded border border-border-default px-3 py-1.5 font-mono text-xs uppercase tracking-widest text-accent hover:bg-bg-elevated"
            >
              Download PDF
            </a>
          </div>
        </div>

        {/* Plain-language summary */}
        <div className="mb-8 rounded border border-accent/30 bg-accent/5 p-4 text-sm">
          <div className="font-semibold text-text-primary">Plain-language summary</div>
          <p className="mt-2 text-text-secondary">
            This DPA governs how Aegis Lens processes personal data on your behalf when you use
            our services as a business customer. It sets out your rights as a data controller and
            our obligations as a processor — including security requirements, sub-processor
            disclosures, and breach notification timelines. You do not need to negotiate a separate
            DPA; this standard form meets GDPR Article 28 requirements.
          </p>
        </div>

        <Section n={1} title="Definitions">
          <p>
            In this DPA, the terms <strong className="text-text-primary">"Controller"</strong>,{" "}
            <strong className="text-text-primary">"Processor"</strong>,{" "}
            <strong className="text-text-primary">"Data Subject"</strong>,{" "}
            <strong className="text-text-primary">"Personal Data"</strong>, and{" "}
            <strong className="text-text-primary">"Processing"</strong> have the meanings given in
            GDPR Article 4. <strong className="text-text-primary">"Services"</strong> means the
            Aegis Lens platform and API as described in the main Terms of Service.
          </p>
        </Section>

        <Section n={2} title="Subject matter and duration">
          <p>
            Aegis Lens (Processor) processes Personal Data on behalf of the Customer (Controller)
            solely to provide the Services. Processing continues for the duration of the
            subscription and ceases upon termination, subject to the retention periods in
            Section 9.
          </p>
        </Section>

        <Section n={3} title="Nature and purpose of processing">
          <ul className="mt-3 space-y-1 list-disc pl-5">
            <li>Providing API access to verified event data and analytics.</li>
            <li>Sending alert notifications (email, webhook, Telegram) as configured by the Controller.</li>
            <li>Storing account, billing, and usage data necessary to operate the service.</li>
            <li>Processing support requests and bug reports.</li>
          </ul>
        </Section>

        <Section n={4} title="Categories of Personal Data">
          <ul className="mt-3 space-y-1 list-disc pl-5">
            <li>Account holder name and work email address.</li>
            <li>API usage logs (timestamps, endpoints, IP addresses).</li>
            <li>Alert configurations and delivery preferences.</li>
            <li>Billing information (processed by our payment processor — not stored by Aegis Lens).</li>
          </ul>
        </Section>

        <Section n={5} title="Obligations of the Processor">
          <p>Aegis Lens will:</p>
          <ul className="mt-3 space-y-1 list-disc pl-5">
            <li>Process Personal Data only on documented instructions from the Controller.</li>
            <li>Ensure that authorised personnel are bound by confidentiality obligations.</li>
            <li>Implement appropriate technical and organisational security measures (see Section 7).</li>
            <li>Assist the Controller in responding to Data Subject requests under GDPR Chapter III.</li>
            <li>Notify the Controller of any Personal Data breach within 72 hours of becoming aware of it.</li>
            <li>Delete or return all Personal Data upon termination, within 30 days.</li>
          </ul>
        </Section>

        <Section n={6} title="Sub-processors">
          <p>
            Aegis Lens engages sub-processors listed at{" "}
            <Link
              href={localePath(locale, "/legal/subprocessors")}
              className="text-accent hover:underline underline-offset-2"
            >
              aegislens.io/legal/subprocessors
            </Link>
            . We maintain a change log at that URL. Controllers who object to a new sub-processor
            must notify us within 14 days of the change notice; failure to object constitutes
            acceptance.
          </p>
        </Section>

        <Section n={7} title="Security measures">
          <p>Aegis Lens implements at minimum:</p>
          <ul className="mt-3 space-y-1 list-disc pl-5">
            <li>Encryption at rest (AES-256) and in transit (TLS 1.3).</li>
            <li>Role-based access control with least-privilege principles.</li>
            <li>Multi-factor authentication for all production system access.</li>
            <li>Annual penetration testing by an independent third party.</li>
            <li>Automated vulnerability scanning and patch management.</li>
            <li>SOC 2 Type II audit in progress (target completion 2026-Q3).</li>
          </ul>
        </Section>

        <Section n={8} title="International transfers">
          <p>
            Personal Data may be processed in EU, UA, and US regions. Transfers outside the EEA
            rely on Standard Contractual Clauses (SCCs) adopted by the European Commission
            (Decision 2021/914). A copy of the applicable SCCs is available on request at{" "}
            <a href="mailto:privacy@aegislens.io" className="text-accent hover:underline">
              privacy@aegislens.io
            </a>
            .
          </p>
        </Section>

        <Section n={9} title="Retention and deletion">
          <p>
            Upon termination or written request, Aegis Lens will delete all Personal Data within
            30 days, except where retention is required by applicable law (in which case data is
            isolated and deleted as soon as the legal basis expires). Anonymised aggregate
            statistics derived from usage data may be retained indefinitely.
          </p>
        </Section>

        <Section n={10} title="Audit rights">
          <p>
            The Controller may audit compliance with this DPA once per calendar year upon 30 days&apos;
            written notice. Audits may be conducted by the Controller or a mutually agreed
            third-party auditor. Aegis Lens may satisfy this obligation by providing its most
            recent SOC 2 Type II report in lieu of an on-site audit.
          </p>
        </Section>

        <div className="mt-10 border-t border-border-subtle pt-6 text-sm text-text-muted">
          <p>
            Questions about this DPA: contact{" "}
            <a href="mailto:privacy@aegislens.io" className="text-accent hover:underline">
              privacy@aegislens.io
            </a>
            . For enterprise DPA negotiations, contact{" "}
            <a href="mailto:sales@aegislens.io" className="text-accent hover:underline">
              sales@aegislens.io
            </a>
            .
          </p>
          <details className="group mt-8 rounded border border-border-subtle bg-bg-surface">
            <summary className="cursor-pointer px-5 py-3 font-mono text-[10px] uppercase tracking-wider text-text-muted group-open:text-accent">
              Version history ▸
            </summary>
            <ol className="divide-y divide-border-subtle border-t border-border-subtle">
              {[
                { version: "1.1", date: "2026-05-23", note: "Updated subprocessor references to match current Subprocessors list. Added data-residency options reference." },
                { version: "1.0", date: "2025-10-01", note: "Initial DPA published per GDPR Art. 28." },
              ].map((v) => (
                <li key={v.version} className="flex gap-6 px-5 py-3 text-sm">
                  <span className="w-10 shrink-0 font-mono text-[11px] text-accent">v{v.version}</span>
                  <span className="w-24 shrink-0 font-mono text-[10px] text-text-muted">{v.date}</span>
                  <span className="text-text-secondary">{v.note}</span>
                </li>
              ))}
            </ol>
          </details>

          <p className="mt-2">
            <Link
              href={localePath(locale, "/legal")}
              className="text-accent hover:underline underline-offset-2"
            >
              ← All legal documents
            </Link>
          </p>
        </div>
      </article>
    </>
  );
}

function Section({ n, title, children }: { n: number; title: string; children: React.ReactNode }) {
  return (
    <section className="mt-8">
      <h2 className="text-base font-semibold text-text-primary">
        {n}. {title}
      </h2>
      <div className="mt-2 text-sm">{children}</div>
    </section>
  );
}
