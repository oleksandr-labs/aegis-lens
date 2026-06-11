import type { Metadata } from "next";
import { localePath } from "@aegis/url-builder";
import { ACTIVE_LOCALES, isLocale, type Locale } from "@aegis/i18n-config";
import { buildMetadata } from "@/lib/seo";
import { PageHeader } from "@/components/PageHeader";

export function generateStaticParams() {
  return ACTIVE_LOCALES.map((locale) => ({ locale }));
}

const TITLE = "Data policy";
const DESCRIPTION =
  "What data Aegis Lens collects, how we store and retain it, who processes it on our behalf, and how to exercise your data subject rights under GDPR.";

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
    pathFor: (lc) => localePath(lc, "/trust/data-policy"),
  });
}

const DATA_CATEGORIES = [
  {
    category: "Event records",
    what: "Structured incident data extracted from public sources: timestamps, coordinates, event class, confidence score, danger score, contributing source URLs.",
    personal: "No",
    basis: "Legitimate interest (public-interest journalism)",
  },
  {
    category: "User account data",
    what: "Email address, hashed password (bcrypt), optional display name, API key metadata, plan tier, billing country.",
    personal: "Yes",
    basis: "Contract performance",
  },
  {
    category: "User activity logs",
    what: "Map viewport coordinates, search queries, feature interactions, timestamps. Stored as anonymised session data — IP is never retained beyond request processing.",
    personal: "Pseudonymous",
    basis: "Legitimate interest (product analytics)",
  },
  {
    category: "API request logs",
    what: "Endpoint called, response code, latency, rate-limit bucket, API key fingerprint (not the full key). Used for abuse detection and quota enforcement.",
    personal: "Pseudonymous",
    basis: "Contract performance / Legitimate interest",
  },
  {
    category: "Source metadata",
    what: "Domain, tier assignment, historical corroboration rate, crawl timestamps, parsed content of each public report.",
    personal: "No",
    basis: "Legitimate interest",
  },
  {
    category: "Support communications",
    what: "Emails and in-app messages sent to our support address. Retained to resolve the query and improve support quality.",
    personal: "Yes",
    basis: "Legitimate interest / Contract performance",
  },
];

const RETENTION_ROWS = [
  {
    category: "Verified event records",
    period: "7 years (then archived)",
    note: "Published under CC BY 4.0. Retracted events are flagged but not deleted.",
  },
  {
    category: "User account data",
    period: "Until account deletion + 30 days",
    note: "30-day window allows recovery of accidentally deleted accounts.",
  },
  {
    category: "User activity logs (aggregate)",
    period: "90 days",
    note: "Raw session data aggregated after 30 days; raw data deleted.",
  },
  {
    category: "API request logs",
    period: "90 days",
    note: "After 90 days, logs are aggregated into statistical summaries and raw entries deleted.",
  },
  {
    category: "Support communications",
    period: "3 years from last contact",
    note: "Necessary for resolving follow-up queries and regulatory requests.",
  },
  {
    category: "Billing records",
    period: "7 years",
    note: "Required by EU financial regulations.",
  },
  {
    category: "Raw access logs (infrastructure)",
    period: "30 days then aggregated",
    note: "Necessary for security and abuse detection.",
  },
  {
    category: "Database backups",
    period: "30 days rolling",
    note: "Encrypted with separately managed keys.",
  },
];

const GDPR_RIGHTS = [
  {
    right: "Access (Art. 15)",
    description: "Request a copy of all personal data we hold about you.",
    how: "Email privacy@aegislens.io with subject line \"Access request\". We respond within 30 days.",
  },
  {
    right: "Rectification (Art. 16)",
    description: "Correct inaccurate or incomplete personal data.",
    how: "Update account details in Settings, or email privacy@aegislens.io for data we do not expose in the UI.",
  },
  {
    right: "Erasure (Art. 17)",
    description: "Request deletion of your personal data (\"right to be forgotten\").",
    how: "Use the Delete Account option in Settings, or email privacy@aegislens.io. Note: published event records are not personal data and are outside this right.",
  },
  {
    right: "Restriction (Art. 18)",
    description: "Ask us to pause processing of your data while a dispute is resolved.",
    how: "Email privacy@aegislens.io with the specific processing activity you wish to restrict.",
  },
  {
    right: "Portability (Art. 20)",
    description: "Receive your data in a machine-readable format to transfer to another service.",
    how: "Request a data export from Account Settings or email privacy@aegislens.io. Delivered as JSON within 30 days.",
  },
  {
    right: "Object (Art. 21)",
    description: "Object to processing based on legitimate interest, including direct marketing.",
    how: "Email privacy@aegislens.io. We will stop processing unless we can demonstrate compelling legitimate grounds.",
  },
  {
    right: "Lodge a complaint",
    description: "You may lodge a complaint with your national data protection supervisory authority.",
    how: "EU residents: contact your national DPA. UK residents: the ICO (ico.org.uk). We encourage you to contact us first so we can attempt to resolve the issue.",
  },
];

const PROCESSORS = [
  {
    processor: "Anthropic",
    country: "USA (EU DPA)",
    purpose: "AI copilot and report generation via Claude API",
    dataShared: "Public event text, user query context",
    dpa: "Yes",
  },
  {
    processor: "Stripe",
    country: "USA (EU DPA / SCC)",
    purpose: "Payment processing and subscription management",
    dataShared: "Name, email, billing address, payment card data",
    dpa: "Yes",
  },
  {
    processor: "Vercel",
    country: "USA (EU DPA / SCC)",
    purpose: "Frontend hosting and edge delivery",
    dataShared: "Request logs (IP anonymised at edge)",
    dpa: "Yes",
  },
  {
    processor: "AWS (eu-central-1)",
    country: "Germany (EU)",
    purpose: "Object storage and managed database",
    dataShared: "All stored event and user data (encrypted at rest)",
    dpa: "Yes",
  },
  {
    processor: "Hetzner Cloud",
    country: "Germany / Finland (EU)",
    purpose: "Primary compute and managed databases",
    dataShared: "All production data (encrypted at rest and in transit)",
    dpa: "Yes",
  },
  {
    processor: "Cloudflare",
    country: "USA (EU DPA / SCC)",
    purpose: "CDN, DDoS protection, bot mitigation",
    dataShared: "Request metadata (IP anonymised per Cloudflare DPA)",
    dpa: "Yes",
  },
  {
    processor: "Resend",
    country: "USA (EU DPA / SCC)",
    purpose: "Transactional email",
    dataShared: "Email address, email content",
    dpa: "Yes",
  },
  {
    processor: "Plausible Analytics",
    country: "EU",
    purpose: "Cookieless web analytics",
    dataShared: "Page URL, referrer, country (derived from IP, not stored)",
    dpa: "Yes",
  },
  {
    processor: "Sentry",
    country: "EU region",
    purpose: "Error monitoring",
    dataShared: "Stack traces, error context (PII scrubbing enabled)",
    dpa: "Yes",
  },
];

const COOKIE_CATEGORIES = [
  {
    category: "Essential",
    required: "Always on",
    examples: "Session token, CSRF token, locale preference",
    duration: "Session / 1 year",
    description:
      "Required for the application to function. Cannot be disabled. No personal data is shared with third parties via these cookies.",
  },
  {
    category: "Analytics",
    required: "Opt-out",
    examples: "Plausible analytics (cookieless — no cookie set)",
    duration: "N/A",
    description:
      "We use Plausible Analytics, which does not set any cookies and does not track individual users. No consent required.",
  },
  {
    category: "Preferences",
    required: "Optional",
    examples: "Map layer preferences, colour scheme, dismissed banners",
    duration: "1 year",
    description:
      "Store your display preferences so they persist across sessions. Stored in localStorage — not transmitted to third parties.",
  },
];

export default async function DataPolicyPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
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

      <article className="mx-auto max-w-4xl px-4 py-10 text-text-secondary">

        {/* ── 1. Data categories ── */}
        <section id="what-we-collect">
          <h2 className="text-2xl font-semibold text-text-primary">1. Data categories we collect</h2>
          <p className="mt-3 text-sm">
            The table below covers every category of data that Aegis Lens processes, whether it
            constitutes personal data under GDPR, and the legal basis for processing.
          </p>
          <div className="mt-5 overflow-x-auto rounded border border-border-subtle">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-border-subtle bg-bg-elevated">
                <tr>
                  {["Category", "What we collect", "Personal data?", "Legal basis"].map((h) => (
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
                {DATA_CATEGORIES.map((row) => (
                  <tr key={row.category} className="bg-bg-surface hover:bg-bg-elevated align-top">
                    <td className="px-4 py-3 font-medium text-text-primary whitespace-nowrap">
                      {row.category}
                    </td>
                    <td className="px-4 py-3 text-text-secondary text-xs">{row.what}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`rounded border px-2 py-0.5 font-mono text-[9px] uppercase tracking-wider ${
                          row.personal === "Yes"
                            ? "border-amber-500/40 bg-amber-500/10 text-amber-400"
                            : row.personal === "Pseudonymous"
                            ? "border-blue-500/40 bg-blue-500/10 text-blue-400"
                            : "border-zinc-500/40 bg-zinc-500/10 text-zinc-400"
                        }`}
                      >
                        {row.personal}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-text-secondary">{row.basis}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* ── 2. Where data lives ── */}
        <section id="where-data-lives" className="mt-12">
          <h2 className="text-2xl font-semibold text-text-primary">2. Where data lives</h2>
          <p className="mt-3 text-sm">
            All production data is stored in EU regions (primary: Frankfurt, Germany; failover:
            Helsinki, Finland). Object storage and managed databases are encrypted at rest with
            AES-256 and in transit with TLS 1.3. Backups are encrypted with separately managed
            keys and retained for 30 days. No production data is stored outside the EU without
            an active Standard Contractual Clause (SCC) arrangement.
          </p>
        </section>

        {/* ── 3. Retention periods ── */}
        <section id="retention" className="mt-12">
          <h2 className="text-2xl font-semibold text-text-primary">3. Retention periods</h2>
          <p className="mt-3 text-sm">
            Data is retained only as long as necessary for the purpose for which it was collected,
            or as required by law. The table below defines retention for each category.
          </p>
          <div className="mt-5 overflow-x-auto rounded border border-border-subtle">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="border-b border-border-subtle bg-bg-elevated text-left">
                  {["Data category", "Retention period", "Notes"].map((h) => (
                    <th
                      key={h}
                      className="px-4 py-3 font-mono text-[10px] uppercase tracking-wider text-text-muted"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border-subtle bg-bg-surface">
                {RETENTION_ROWS.map((row) => (
                  <tr key={row.category} className="hover:bg-bg-elevated align-top">
                    <td className="px-4 py-3 font-medium text-text-primary">{row.category}</td>
                    <td className="px-4 py-3 font-mono text-xs text-accent whitespace-nowrap">
                      {row.period}
                    </td>
                    <td className="px-4 py-3 text-xs text-text-secondary">{row.note}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* ── 4. Data subject rights ── */}
        <section id="rights" className="mt-12">
          <h2 className="text-2xl font-semibold text-text-primary">
            4. Data subject rights (GDPR)
          </h2>
          <p className="mt-3 text-sm">
            If you are located in the EU, UK, or EEA you have the rights listed below. We
            respond to all requests within 30 days. For complex requests we may extend to 90
            days; we will notify you within 30 days if an extension is needed.
          </p>
          <div className="mt-5 space-y-3">
            {GDPR_RIGHTS.map((right) => (
              <div
                key={right.right}
                className="rounded border border-border-subtle bg-bg-surface p-4"
              >
                <div className="font-semibold text-sm text-text-primary">{right.right}</div>
                <p className="mt-1 text-xs text-text-secondary">{right.description}</p>
                <p className="mt-2 text-xs text-text-muted">
                  <span className="font-mono uppercase tracking-wider text-[9px]">
                    How to exercise:{" "}
                  </span>
                  {right.how}
                </p>
              </div>
            ))}
          </div>
          <p className="mt-5 text-sm">
            Data protection contact:{" "}
            <a
              href="mailto:privacy@aegislens.io"
              className="text-accent underline-offset-2 hover:underline"
            >
              privacy@aegislens.io
            </a>
            . Published event records do not contain personal data and are not subject to erasure
            under GDPR Art. 17; correction requests are handled via the{" "}
            <a
              href={localePath(locale, "/trust/corrections")}
              className="text-accent underline-offset-2 hover:underline"
            >
              corrections log
            </a>
            .
          </p>
        </section>

        {/* ── 5. Third-party processors ── */}
        <section id="processors" className="mt-12">
          <h2 className="text-2xl font-semibold text-text-primary">5. Third-party processors</h2>
          <p className="mt-3 text-sm">
            We use a carefully selected set of subprocessors. Each is bound by a data processing
            agreement (DPA) and is reviewed annually. The complete subprocessor list (including
            change notifications) is available at{" "}
            <a
              href={localePath(locale, "/legal/subprocessors")}
              className="text-accent underline-offset-2 hover:underline"
            >
              /legal/subprocessors
            </a>
            .
          </p>
          <div className="mt-5 overflow-x-auto rounded border border-border-subtle">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-border-subtle bg-bg-elevated">
                <tr>
                  {["Processor", "Country", "Purpose", "Data shared", "DPA"].map((h) => (
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
                {PROCESSORS.map((p) => (
                  <tr key={p.processor} className="bg-bg-surface hover:bg-bg-elevated align-top">
                    <td className="px-4 py-3 font-medium text-text-primary whitespace-nowrap">
                      {p.processor}
                    </td>
                    <td className="px-4 py-3 text-xs text-text-secondary">{p.country}</td>
                    <td className="px-4 py-3 text-xs text-text-secondary">{p.purpose}</td>
                    <td className="px-4 py-3 text-xs text-text-secondary">{p.dataShared}</td>
                    <td className="px-4 py-3">
                      <span className="rounded border border-emerald-500/40 bg-emerald-500/10 px-2 py-0.5 font-mono text-[9px] uppercase tracking-wider text-emerald-400">
                        {p.dpa}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* ── 6. Cookie categories ── */}
        <section id="cookies" className="mt-12">
          <h2 className="text-2xl font-semibold text-text-primary">6. Cookie categories</h2>
          <p className="mt-3 text-sm">
            Aegis Lens uses a minimal cookie footprint. The table below describes each category,
            whether it is required, and how long cookies persist.
          </p>
          <div className="mt-5 space-y-3">
            {COOKIE_CATEGORIES.map((cat) => (
              <div
                key={cat.category}
                className="rounded border border-border-subtle bg-bg-surface p-4"
              >
                <div className="flex flex-wrap items-center gap-3">
                  <span className="font-semibold text-sm text-text-primary">{cat.category}</span>
                  <span
                    className={`rounded border px-2 py-0.5 font-mono text-[9px] uppercase tracking-wider ${
                      cat.required === "Always on"
                        ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-400"
                        : cat.required === "Opt-out"
                        ? "border-blue-500/40 bg-blue-500/10 text-blue-400"
                        : "border-zinc-500/40 bg-zinc-500/10 text-zinc-400"
                    }`}
                  >
                    {cat.required}
                  </span>
                  <span className="font-mono text-[10px] text-text-muted">
                    Duration: {cat.duration}
                  </span>
                </div>
                <p className="mt-2 text-xs text-text-secondary">{cat.description}</p>
                <p className="mt-1 text-[10px] text-text-muted">
                  <span className="uppercase tracking-wider">Examples: </span>
                  {cat.examples}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* ── 7. Changes to this policy ── */}
        <section id="changes" className="mt-12">
          <h2 className="text-2xl font-semibold text-text-primary">7. Changes to this policy</h2>
          <p className="mt-3 text-sm">
            We will notify registered users by email at least 14 days before any material change
            to this policy takes effect. Non-material changes (e.g. clarifications, corrected
            typos) may be made without prior notice. The effective date is shown at the top of
            this page. Historical versions are available on request at{" "}
            <a
              href="mailto:privacy@aegislens.io"
              className="text-accent underline-offset-2 hover:underline"
            >
              privacy@aegislens.io
            </a>
            .
          </p>
          <p className="mt-4 text-xs text-text-muted">
            Last updated: 2026-04-15. Effective: 2026-04-15.
          </p>
        </section>
      </article>
    </>
  );
}
