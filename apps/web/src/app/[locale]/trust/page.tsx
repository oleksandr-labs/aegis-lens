import type { Metadata } from "next";
import Link from "next/link";
import { localePath } from "@aegis/url-builder";
import { ACTIVE_LOCALES, isLocale, type Locale } from "@aegis/i18n-config";
import { buildMetadata } from "@/lib/seo";
import { PageHeader } from "@/components/PageHeader";

export function generateStaticParams() {
  return ACTIVE_LOCALES.map((locale) => ({ locale }));
}

const TITLE = "Trust Center";
const DESCRIPTION =
  "Public artifacts that make Aegis Lens accountable: methodology, security, data handling, transparency reports, takedown policy, and the corrections log.";

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
    pathFor: (lc) => localePath(lc, "/trust"),
  });
}

type Card = {
  title: string;
  description: string;
  href: (lc: Locale) => string;
};

const CARDS: Card[] = [
  {
    title: "Methodology",
    description: "Source tiering, confidence scoring, verification workflow, and danger model.",
    href: (lc) => localePath(lc, "/methodology"),
  },
  {
    title: "Security policy",
    description: "Encryption, access controls, audit logging, and incident response.",
    href: (lc) => localePath(lc, "/security"),
  },
  {
    title: "Data policy",
    description: "What we collect, where it lives, how long we keep it, and your rights.",
    href: (lc) => localePath(lc, "/trust/data-policy"),
  },
  {
    title: "Transparency report",
    description: "Quarterly numbers on government requests, takedowns, moderation, and uptime.",
    href: (lc) => localePath(lc, "/trust/transparency"),
  },
  {
    title: "Acceptable Use Policy",
    description: "What you may and may not do with Aegis Lens data, APIs, and services.",
    href: (lc) => localePath(lc, "/legal/aup"),
  },
  {
    title: "DMCA",
    description: "How to file a takedown notice and how we evaluate and respond.",
    href: (lc) => localePath(lc, "/legal/dmca"),
  },
  {
    title: "Privacy",
    description: "Personal data we process, lawful bases, and processor relationships.",
    href: (lc) => localePath(lc, "/legal/privacy"),
  },
  {
    title: "Corrections log",
    description: "Every public correction to a published event, with date and source.",
    href: (lc) => localePath(lc, "/trust/corrections"),
  },
  {
    title: "Data Processing Addendum (DPA)",
    description: "GDPR Art. 28 DPA covering instructions, sub-processors, and your rights. Available for signature.",
    href: (lc) => localePath(lc, "/legal/dpa"),
  },
  {
    title: "Subprocessors",
    description: "Full list of third-party subprocessors with country, purpose, and change notification policy.",
    href: (lc) => localePath(lc, "/legal/subprocessors"),
  },
];

type ComplianceBadge = {
  label: string;
  status: "active" | "in-progress" | "planned";
  note: string;
};

const COMPLIANCE: ComplianceBadge[] = [
  { label: "GDPR", status: "active", note: "Data processing under EU GDPR. DPA available on request." },
  { label: "SOC 2 Type II", status: "in-progress", note: "Audit in progress — expected Q4 2026." },
  { label: "ISO 27001", status: "planned", note: "Planned for 2027 after SOC 2 completion." },
  { label: "CCPA", status: "active", note: "California privacy rights honored for all users." },
];

const STATUS_STYLES: Record<ComplianceBadge["status"], string> = {
  active: "border-emerald-500/40 bg-emerald-500/10 text-emerald-400",
  "in-progress": "border-amber-500/40 bg-amber-500/10 text-amber-400",
  planned: "border-zinc-500/40 bg-zinc-500/10 text-zinc-400",
};

const STATUS_LABELS: Record<ComplianceBadge["status"], string> = {
  active: "Active",
  "in-progress": "In progress",
  planned: "Planned",
};

type AiUsageItem = {
  capability: string;
  model: string;
  dataUsed: string;
  retains: string;
};

const AI_USAGE: AiUsageItem[] = [
  {
    capability: "Event summarisation",
    model: "Anthropic Claude (API)",
    dataUsed: "Public event text, source URLs",
    retains: "No — prompt & response not stored by provider per data-processing addendum.",
  },
  {
    capability: "Geolocation assistance",
    model: "Internal CV model + Overpass API",
    dataUsed: "Satellite imagery (public), map tiles",
    retains: "No personal data processed.",
  },
  {
    capability: "Translation",
    model: "DeepL API",
    dataUsed: "Source text (public)",
    retains: "No retention per DeepL DPA.",
  },
  {
    capability: "Search re-ranking",
    model: "Internal bi-encoder (hosted)",
    dataUsed: "Query text, indexed document embeddings",
    retains: "Queries retained 30 days for quality monitoring, then deleted.",
  },
  {
    capability: "AI copilot (Pro/Team)",
    model: "Anthropic Claude (API)",
    dataUsed: "Map viewport context, user query",
    retains: "Session context discarded after session end. No fine-tuning on user queries.",
  },
];

export default async function TrustPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: raw } = await params;
  const locale = (isLocale(raw) ? raw : "en") as Locale;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: TITLE,
    description: DESCRIPTION,
    inLanguage: locale,
    publisher: { "@type": "Organization", name: "Aegis Lens" },
  };

  return (
    <>
      <PageHeader eyebrow="Trust Center" title={TITLE} description={DESCRIPTION} />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="mx-auto max-w-5xl px-4 py-10">
        {/* Documents grid */}
        <section id="documents">
          <h2 className="mb-4 text-xl font-semibold text-text-primary">Documents & policies</h2>
          <ul className="grid gap-3 md:grid-cols-2">
            {CARDS.map((c) => (
              <li key={c.title}>
                <Link
                  href={c.href(locale)}
                  className="block h-full rounded border border-border-subtle bg-bg-surface p-5 transition-colors hover:border-accent"
                >
                  <h3 className="text-base font-semibold text-text-primary">{c.title}</h3>
                  <p className="mt-2 text-sm text-text-secondary">{c.description}</p>
                </Link>
              </li>
            ))}
          </ul>
        </section>

        {/* Compliance badges */}
        <section id="compliance" className="mt-12">
          <h2 className="mb-4 text-xl font-semibold text-text-primary">Compliance</h2>
          <p className="mb-6 text-sm text-text-secondary">
            Current certification and compliance status. Enterprise customers may request a full
            compliance package at{" "}
            <a href="mailto:security@aegislens.io" className="text-accent underline-offset-2 hover:underline">
              security@aegislens.io
            </a>
            .
          </p>
          <ul className="grid gap-3 sm:grid-cols-2">
            {COMPLIANCE.map((c) => (
              <li
                key={c.label}
                className="rounded border border-border-subtle bg-bg-surface p-4"
              >
                <div className="flex items-center justify-between gap-3">
                  <span className="text-sm font-semibold text-text-primary">{c.label}</span>
                  <span
                    className={`rounded border px-2 py-0.5 font-mono text-[9px] uppercase tracking-wider ${STATUS_STYLES[c.status]}`}
                  >
                    {STATUS_LABELS[c.status]}
                  </span>
                </div>
                <p className="mt-2 text-xs text-text-muted">{c.note}</p>
              </li>
            ))}
          </ul>
        </section>

        {/* Security overview */}
        <section id="security" className="mt-12">
          <h2 className="mb-4 text-xl font-semibold text-text-primary">Security overview</h2>
          <ul className="space-y-3">
            {[
              { label: "Encryption in transit", detail: "TLS 1.2+ enforced on all endpoints. HSTS with 12-month max-age." },
              { label: "Encryption at rest", detail: "AES-256 for all stored data. Managed keys via cloud KMS." },
              { label: "Access controls", detail: "Role-based access control (RBAC). Principle of least privilege. MFA required for all staff." },
              { label: "Audit logging", detail: "Immutable audit log for all data access and configuration changes. 12-month retention." },
              { label: "Penetration testing", detail: "Annual third-party penetration test. Summary available to enterprise customers under NDA." },
              { label: "Vulnerability disclosure", detail: <>Coordinated disclosure program. Report to <a href="mailto:security@aegislens.io" className="text-accent underline-offset-2 hover:underline">security@aegislens.io</a> or via <Link href={localePath(locale, "/security")} className="text-accent underline-offset-2 hover:underline">/security</Link>.</> },
            ].map((item) => (
              <li
                key={item.label}
                className="flex flex-col gap-1 rounded border border-border-subtle bg-bg-surface px-4 py-3 sm:flex-row sm:items-baseline sm:gap-6"
              >
                <span className="w-44 shrink-0 font-mono text-[11px] uppercase tracking-wider text-text-muted">
                  {item.label}
                </span>
                <span className="text-sm text-text-secondary">{item.detail}</span>
              </li>
            ))}
          </ul>
        </section>

        {/* AI usage transparency */}
        <section id="ai-usage" className="mt-12">
          <h2 className="mb-2 text-xl font-semibold text-text-primary">AI usage transparency</h2>
          <p className="mb-6 text-sm text-text-secondary">
            We use AI models to assist analysis — not to replace human judgment. The table below
            describes every AI capability deployed in the platform, the underlying model, what data
            is processed, and our data retention position.
          </p>
          <div className="overflow-x-auto rounded border border-border-subtle">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-border-subtle bg-bg-elevated">
                <tr>
                  {["Capability", "Model / provider", "Data processed", "Provider retention"].map((h) => (
                    <th
                      key={h}
                      className="px-4 py-3 font-mono text-[10px] uppercase tracking-wider text-text-muted"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border-subtle">
                {AI_USAGE.map((row) => (
                  <tr key={row.capability} className="bg-bg-surface hover:bg-bg-elevated">
                    <td className="px-4 py-3 font-medium text-text-primary">{row.capability}</td>
                    <td className="px-4 py-3 text-text-secondary">{row.model}</td>
                    <td className="px-4 py-3 text-text-secondary">{row.dataUsed}</td>
                    <td className="px-4 py-3 text-text-muted">{row.retains}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-4 text-xs text-text-muted">
            AI outputs are never used as primary evidence without human review. All AI-generated
            summaries carry an explicit label in the UI and in exports.
          </p>
        </section>

        {/* Penetration test summary */}
        <section id="pentest" className="mt-12">
          <h2 className="mb-4 text-xl font-semibold text-text-primary">Penetration test summary</h2>
          <div className="rounded border border-border-subtle bg-bg-surface p-5">
            <div className="mb-4 flex flex-wrap items-center gap-4">
              {[
                { label: "Scope", value: "Web app, API, infrastructure" },
                { label: "Last test", value: "Q4 2025" },
                { label: "Provider", value: "Independent third party (NDA)" },
                { label: "Frequency", value: "Annual" },
              ].map(({ label, value }) => (
                <div key={label}>
                  <div className="font-mono text-[9px] uppercase tracking-widest text-text-muted">{label}</div>
                  <div className="mt-0.5 text-sm font-medium text-text-primary">{value}</div>
                </div>
              ))}
            </div>
            <ul className="space-y-2">
              {[
                { severity: "Critical", count: 0, note: "No critical findings." },
                { severity: "High", count: 0, note: "No high findings." },
                { severity: "Medium", count: 2, note: "Both remediated within 14 days of report delivery." },
                { severity: "Low / informational", count: 5, note: "4 remediated; 1 accepted risk (no user-impact path)." },
              ].map((row) => (
                <li key={row.severity} className="flex items-baseline gap-3 text-sm">
                  <span className="w-36 shrink-0 font-mono text-[10px] uppercase tracking-wider text-text-muted">{row.severity}</span>
                  <span className={`shrink-0 font-semibold ${row.count === 0 ? "text-emerald-400" : row.severity === "Medium" ? "text-amber-400" : "text-text-muted"}`}>
                    {row.count}
                  </span>
                  <span className="text-text-secondary">{row.note}</span>
                </li>
              ))}
            </ul>
            <p className="mt-4 text-xs text-text-muted">
              Full report (redacted) available to enterprise customers under NDA.{" "}
              <a href="mailto:security@aegislens.io" className="text-accent hover:underline">
                Request access →
              </a>
            </p>
          </div>
        </section>

        {/* Incident history */}
        <section id="incidents" className="mt-12">
          <h2 className="mb-4 text-xl font-semibold text-text-primary">Incident history</h2>
          <p className="mb-4 text-sm text-text-secondary">
            We publish postmortems for all severity-1 and severity-2 incidents. Severity-3 and below
            are summarised in quarterly transparency reports.
          </p>
          <ul className="space-y-3">
            {[
              {
                date: "2026-03-12",
                severity: "SEV-2",
                title: "Source-ingest latency degradation",
                duration: "47 min",
                summary:
                  "Elevated queue depth on the Telegram-ingest worker caused processing delays up to 47 minutes. No events were lost; publication lag exceeded SLA for 3 sources.",
                resolved: true,
              },
              {
                date: "2025-11-28",
                severity: "SEV-2",
                title: "API rate-limit misconfiguration",
                duration: "2h 11 min",
                summary:
                  "A deployment rolled out incorrect per-user rate limits, allowing burst calls above the documented cap. Rolled back. No data leaked; billing impact: nil.",
                resolved: true,
              },
              {
                date: "2025-08-04",
                severity: "SEV-3",
                title: "Satellite-imagery tile cache miss spike",
                duration: "22 min",
                summary:
                  "CDN cache invalidation after a layer update caused a 3× origin-traffic spike. Tiles served correctly; p99 latency briefly elevated.",
                resolved: true,
              },
            ].map((inc) => (
              <li key={inc.date} className="rounded border border-border-subtle bg-bg-surface p-4">
                <div className="flex flex-wrap items-center gap-3">
                  <span className="font-mono text-[10px] text-text-muted">{inc.date}</span>
                  <span className="rounded border border-amber-500/40 bg-amber-500/10 px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-wider text-amber-400">
                    {inc.severity}
                  </span>
                  <span className="font-mono text-[10px] text-text-muted">Duration: {inc.duration}</span>
                  {inc.resolved && (
                    <span className="rounded border border-emerald-500/40 bg-emerald-500/10 px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-wider text-emerald-400">
                      Resolved
                    </span>
                  )}
                </div>
                <p className="mt-2 text-sm font-medium text-text-primary">{inc.title}</p>
                <p className="mt-1 text-xs text-text-secondary">{inc.summary}</p>
              </li>
            ))}
          </ul>
          <p className="mt-4 text-xs text-text-muted">
            Full postmortems available to Pro and Team customers in the account portal.
          </p>
        </section>

        {/* Data residency */}
        <section id="data-residency" className="mt-12">
          <h2 className="mb-4 text-xl font-semibold text-text-primary">Data residency</h2>
          <p className="mb-4 text-sm text-text-secondary">
            Default data residency is EU (Frankfurt). Enterprise customers may request dedicated
            residency options as part of a custom contract.
          </p>
          <div className="overflow-x-auto rounded border border-border-subtle">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="border-b border-border-subtle bg-bg-elevated">
                  {["Region", "Available on", "Notes"].map((h) => (
                    <th key={h} className="px-4 py-3 text-left font-mono text-[10px] uppercase tracking-wider text-text-muted">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border-subtle bg-bg-surface">
                {[
                  { region: "EU (Frankfurt)", plan: "All plans", note: "Default. GDPR-compliant. EU Standard Contractual Clauses available." },
                  { region: "US East (Virginia)", plan: "Team + Enterprise", note: "Available on request. BAA available for health-sector clients." },
                  { region: "UK (London)", plan: "Enterprise", note: "UK GDPR-compliant. Requires custom contract." },
                  { region: "Custom / on-premise", plan: "Enterprise only", note: "Contact us. Minimum 12-month contract. Limited to supported stack." },
                ].map((row) => (
                  <tr key={row.region} className="hover:bg-bg-elevated">
                    <td className="px-4 py-3 font-medium text-text-primary">{row.region}</td>
                    <td className="px-4 py-3 font-mono text-[11px] text-accent">{row.plan}</td>
                    <td className="px-4 py-3 text-xs text-text-secondary">{row.note}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-4 text-xs text-text-muted">
            For data residency requests:{" "}
            <a href="mailto:security@aegislens.io" className="text-accent hover:underline">
              security@aegislens.io
            </a>
          </p>
        </section>

        {/* Status link */}
        <section id="status" className="mt-12">
          <h2 className="mb-4 text-xl font-semibold text-text-primary">System status</h2>
          <div className="rounded border border-border-subtle bg-bg-surface p-5">
            <p className="text-sm text-text-secondary">
              Live uptime, source-health, and incident history are published on our status page.
            </p>
            <p className="mt-3">
              <Link
                href={localePath(locale, "/status")}
                className="text-accent underline-offset-2 hover:underline"
              >
                View status page →
              </Link>
            </p>
          </div>
        </section>

        {/* Contact */}
        <section id="contact" className="mt-12 rounded border border-border-subtle bg-bg-elevated p-6">
          <h2 className="text-base font-semibold text-text-primary">Enterprise procurement</h2>
          <p className="mt-2 text-sm text-text-secondary">
            If you are evaluating Aegis Lens for enterprise or government use, we can provide:
            compliance questionnaire responses, penetration test summaries (under NDA), custom DPAs,
            and a security briefing call.
          </p>
          <p className="mt-4">
            <a
              href="mailto:security@aegislens.io"
              className="inline-block rounded border border-accent px-4 py-2 font-mono text-sm text-accent hover:bg-accent hover:text-bg-base"
            >
              security@aegislens.io
            </a>
          </p>
        </section>
      </div>
    </>
  );
}
