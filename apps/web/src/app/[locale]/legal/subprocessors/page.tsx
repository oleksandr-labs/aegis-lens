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

const TITLE = "Sub-processor list";
const DESCRIPTION =
  "List of third-party processors Aegis Lens engages to deliver its services. Updated with 14-day notice before additions.";
const LAST_UPDATED = "2026-05-01";

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
    pathFor: (lc) => localePath(lc, "/legal/subprocessors"),
  });
}

type Subprocessor = {
  name: string;
  purpose: string;
  location: string;
  mechanism: string;
  url: string;
};

const SUBPROCESSORS: Subprocessor[] = [
  {
    name: "Amazon Web Services (AWS)",
    purpose: "Cloud infrastructure, compute, storage (S3, RDS, ECS, CloudFront)",
    location: "EU (Frankfurt, Ireland), US (N. Virginia)",
    mechanism: "SCCs + AWS DPA",
    url: "https://aws.amazon.com/compliance/gdpr-center/",
  },
  {
    name: "Cloudflare",
    purpose: "CDN, DDoS protection, DNS, edge caching",
    location: "Global CDN (EU-first routing)",
    mechanism: "SCCs + Cloudflare DPA",
    url: "https://www.cloudflare.com/trust-hub/gdpr/",
  },
  {
    name: "Stripe",
    purpose: "Payment processing, invoicing, subscription management",
    location: "USA (Dublin entity for EU customers)",
    mechanism: "SCCs + Stripe DPA",
    url: "https://stripe.com/en-gb/legal/dpa",
  },
  {
    name: "Postmark (ActiveCampaign)",
    purpose: "Transactional email delivery (alerts, receipts, confirmations)",
    location: "USA",
    mechanism: "SCCs",
    url: "https://postmarkapp.com/gdpr",
  },
  {
    name: "Anthropic",
    purpose: "AI model inference for event classification and summarisation",
    location: "USA",
    mechanism: "Anthropic commercial API DPA",
    url: "https://www.anthropic.com/privacy",
  },
  {
    name: "Qdrant Cloud",
    purpose: "Vector database for semantic search and similarity retrieval",
    location: "EU (Germany)",
    mechanism: "SCCs + Qdrant DPA",
    url: "https://qdrant.tech/legal/privacy-policy/",
  },
  {
    name: "Sentry",
    purpose: "Error monitoring and performance tracing",
    location: "USA (EU data residency enabled)",
    mechanism: "SCCs + Sentry DPA",
    url: "https://sentry.io/privacy/",
  },
  {
    name: "Datadog",
    purpose: "Infrastructure metrics, logs, and APM",
    location: "USA (EU region available)",
    mechanism: "SCCs + Datadog DPA",
    url: "https://www.datadoghq.com/legal/gdpr/",
  },
  {
    name: "Vercel",
    purpose: "Edge hosting for Next.js web application",
    location: "Global (EU-first for European visitors)",
    mechanism: "SCCs + Vercel DPA",
    url: "https://vercel.com/legal/dpa",
  },
];

type ChangeLogEntry = {
  date: string;
  change: string;
  processor: string;
};

const CHANGE_LOG: ChangeLogEntry[] = [
  { date: "2026-05-01", change: "Added", processor: "Qdrant Cloud — vector database" },
  { date: "2026-03-15", change: "Added", processor: "Anthropic — AI inference" },
  { date: "2026-01-01", change: "Initial list published", processor: "All above except Qdrant and Anthropic" },
];

export default async function SubprocessorsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: raw } = await params;
  const locale = (isLocale(raw) ? raw : "en") as Locale;

  const pageUrl = `${SITE.url}${localePath(locale, "/legal/subprocessors")}`;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: TITLE,
    description: DESCRIPTION,
    url: pageUrl,
    inLanguage: locale,
    dateModified: LAST_UPDATED,
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <PageHeader eyebrow="Legal" title={TITLE} description={DESCRIPTION} />

      <article className="mx-auto max-w-3xl px-4 py-10 text-text-secondary">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3 text-sm">
          <p className="text-text-muted">
            Last updated: <time dateTime={LAST_UPDATED}>{LAST_UPDATED}</time>
          </p>
          <p className="text-text-secondary">
            Changes are published here with 14 days&apos; notice before taking effect, per our{" "}
            <Link href={localePath(locale, "/legal/dpa")} className="text-accent hover:underline">
              DPA Section 6
            </Link>
            .
          </p>
        </div>

        {/* Plain-language note */}
        <div className="mb-8 rounded border border-accent/30 bg-accent/5 p-4 text-sm">
          <div className="font-semibold text-text-primary">What this page covers</div>
          <p className="mt-2">
            A sub-processor is a third-party company that Aegis Lens uses to deliver its services
            and that has access to customer Personal Data. This page lists every such company, what
            they do, where data is processed, and the legal mechanism used to protect your data
            under GDPR.
          </p>
        </div>

        {/* Sub-processor table */}
        <section>
          <h2 className="text-base font-semibold text-text-primary">Current sub-processors</h2>
          <div className="mt-4 overflow-x-auto rounded border border-border-subtle bg-bg-surface">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border-subtle text-left">
                  <th className="px-4 py-3 font-medium text-text-primary">Sub-processor</th>
                  <th className="px-4 py-3 font-medium text-text-primary">Purpose</th>
                  <th className="px-4 py-3 font-medium text-text-primary">Location</th>
                  <th className="px-4 py-3 font-medium text-text-primary">Legal basis</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-subtle">
                {SUBPROCESSORS.map((sp) => (
                  <tr key={sp.name} className="align-top">
                    <td className="px-4 py-3">
                      <a
                        href={sp.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-medium text-accent hover:underline"
                      >
                        {sp.name}
                      </a>
                    </td>
                    <td className="px-4 py-3 text-text-secondary">{sp.purpose}</td>
                    <td className="px-4 py-3 font-mono text-xs text-text-muted">{sp.location}</td>
                    <td className="px-4 py-3 font-mono text-xs text-text-muted">{sp.mechanism}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Change log */}
        <section className="mt-10">
          <h2 className="text-base font-semibold text-text-primary">Change log</h2>
          <ul className="mt-3 divide-y divide-border-subtle rounded border border-border-subtle bg-bg-surface">
            {CHANGE_LOG.map((entry) => (
              <li key={entry.date + entry.processor} className="flex flex-wrap items-baseline gap-3 px-4 py-3 text-sm">
                <time dateTime={entry.date} className="font-mono text-xs text-text-muted shrink-0">
                  {entry.date}
                </time>
                <span
                  className={`rounded border px-1.5 py-0.5 font-mono text-[10px] uppercase tracking-widest shrink-0 ${
                    entry.change === "Added"
                      ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-400"
                      : entry.change === "Removed"
                      ? "border-red-500/30 bg-red-500/10 text-red-400"
                      : "border-blue-500/30 bg-blue-500/10 text-blue-400"
                  }`}
                >
                  {entry.change}
                </span>
                <span className="text-text-secondary">{entry.processor}</span>
              </li>
            ))}
          </ul>
        </section>

        {/* Objection notice */}
        <section className="mt-10 rounded border border-border-subtle bg-bg-surface p-5 text-sm text-text-secondary">
          <h2 className="font-semibold text-text-primary">Objecting to a sub-processor change</h2>
          <p className="mt-2">
            Per our DPA, you have 14 days from the date of a change notice to object. Send
            objections to{" "}
            <a href="mailto:privacy@aegislens.io" className="text-accent hover:underline">
              privacy@aegislens.io
            </a>{" "}
            with the subject line <em>Sub-processor objection — [processor name]</em>. We will
            work with you to find an alternative arrangement or, where that is not possible,
            allow termination without penalty.
          </p>
        </section>

        <div className="mt-8 border-t border-border-subtle pt-6 text-sm text-text-muted">
          <Link
            href={localePath(locale, "/legal")}
            className="text-accent hover:underline underline-offset-2"
          >
            ← All legal documents
          </Link>
        </div>
      </article>
    </>
  );
}
