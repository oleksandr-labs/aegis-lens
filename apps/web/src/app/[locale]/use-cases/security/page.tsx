import type { Metadata } from "next";
import Link from "next/link";
import { localePath } from "@aegis/url-builder";
import { ACTIVE_LOCALES, isLocale, type Locale } from "@aegis/i18n-config";
import { buildMetadata } from "@/lib/seo";
import { PageHeader } from "@/components/PageHeader";
import { listTasksFor } from "@/lib/use-case-tasks";
import { SITE } from "@/lib/site";

export function generateStaticParams() {
  return ACTIVE_LOCALES.map((locale) => ({ locale }));
}

const TITLE = "Aegis Lens for corporate security";
const DESCRIPTION =
  "Travel risk assessment, physical asset protection, and threat intelligence briefing for corporate security operations, duty-of-care teams, and security managers.";

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
    pathFor: (lc) => localePath(lc, "/use-cases/security"),
  });
}

const USE_CASES = [
  {
    name: "Travel risk",
    body: "Pre-deployment risk assessment for any country or city: event count, severity index, top threat classes, and 30-day trend — in under 60 seconds.",
  },
  {
    name: "Asset protection",
    body: "Register facility or asset coordinates as watch areas with per-class danger-score thresholds. Wire alerts into your SOC or physical-security ticketing system.",
  },
  {
    name: "Threat intelligence",
    body: "Structured threat briefs combining event data, actor profiles, equipment assessments, and conflict context — ready to present to senior leadership or boards.",
  },
  {
    name: "Duty-of-care compliance",
    body: "Demonstrate a documented, real-time monitoring posture for conflict-affected geographies. Exportable event history with timestamps, confidence scores, and source citations.",
  },
];

const FEATURES = [
  {
    name: "Region pages",
    body: "Per-country and per-oblast hubs with live KPI strip (event count, severity index, top class) and 24-hour sparkline. Subscribe to email or webhook alerts directly from the page.",
  },
  {
    name: "Threat library",
    body: "Named threat profiles covering kinetic, infrastructure, cyber, maritime, aviation, and humanitarian risks — each with operator-facing mitigation guidance.",
  },
  {
    name: "Alerts",
    body: "Geofenced webhooks and email alerts with per-class and per-severity filtering. Median latency < 90 seconds from first verified report to delivery.",
  },
];

export default async function SecurityVerticalPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: raw } = await params;
  const locale = (isLocale(raw) ? raw : "en") as Locale;

  const tasks = listTasksFor("security");

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: TITLE,
    description: DESCRIPTION,
    url: `${SITE.url}${localePath(locale, "/use-cases/security")}`,
    inLanguage: locale,
    breadcrumb: {
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Use cases", item: `${SITE.url}${localePath(locale, "/use-cases")}` },
        { "@type": "ListItem", position: 2, name: "Corporate security", item: `${SITE.url}${localePath(locale, "/use-cases/security")}` },
      ],
    },
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <PageHeader eyebrow="Use cases · Security" title={TITLE} description={DESCRIPTION} />

      <div className="mx-auto max-w-4xl px-4 py-10">
        <section>
          <p className="text-text-secondary">
            Corporate security teams operate under a duty-of-care obligation that requires a
            documented, real-time understanding of risk in locations where employees, contractors,
            and assets are deployed. Aegis Lens provides that baseline — with verified data,
            explicit confidence scores, and alert infrastructure that integrates into how security
            operations actually run.
          </p>
        </section>

        <section className="mt-12">
          <h2 className="text-xl font-semibold text-text-primary">Where it fits</h2>
          <ul className="mt-4 grid gap-3 md:grid-cols-2">
            {USE_CASES.map((u) => (
              <li key={u.name} className="rounded border border-border-subtle bg-bg-surface p-4">
                <p className="font-mono text-xs uppercase tracking-widest text-accent">{u.name}</p>
                <p className="mt-2 text-sm text-text-secondary">{u.body}</p>
              </li>
            ))}
          </ul>
        </section>

        {tasks.length > 0 && (
          <section className="mt-12">
            <h2 className="text-xl font-semibold text-text-primary">Step-by-step workflows</h2>
            <ul className="mt-4 space-y-3">
              {tasks.map((t) => (
                <li key={t.slug}>
                  <Link
                    href={localePath(locale, `/use-cases/security/${t.slug}`)}
                    className="block rounded border border-border-subtle bg-bg-surface p-4 hover:bg-bg-elevated"
                  >
                    <p className="font-semibold text-text-primary">{t.title}</p>
                    <p className="mt-1 text-sm text-text-secondary">{t.problem}</p>
                    <p className="mt-2 font-mono text-[10px] text-accent">Read workflow →</p>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )}

        <section className="mt-12">
          <div className="rounded border border-border-subtle bg-bg-surface p-5">
            <p className="font-mono text-xs uppercase tracking-widest text-accent">
              Illustrative · Fortune 500 security team
            </p>
            <blockquote className="mt-3 text-text-secondary">
              "We replaced three different provider subscriptions with one Aegis Lens Team account.
              The region pages give our analysts a starting point before they dig into the API."
            </blockquote>
            <p className="mt-2 text-sm text-text-muted">— Head of global security, illustrative.</p>
          </div>
        </section>

        <section className="mt-12">
          <h2 className="text-xl font-semibold text-text-primary">Product highlights</h2>
          <div className="mt-4 grid gap-4 md:grid-cols-3">
            {FEATURES.map((f) => (
              <article key={f.name} className="rounded border border-border-subtle bg-bg-surface p-4">
                <p className="font-mono text-xs uppercase tracking-widest text-accent">{f.name}</p>
                <p className="mt-2 text-sm text-text-secondary">{f.body}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="mt-12">
          <h2 className="text-xl font-semibold text-text-primary">Next step</h2>
          <p className="mt-3 text-text-secondary">
            Start with a region page for your highest-risk location, or contact sales for a
            deployment scoped to your specific footprint.
          </p>
          <div className="mt-4 flex flex-wrap gap-3">
            <Link
              href={localePath(locale, "/regions")}
              className="inline-block rounded border border-accent px-4 py-2 font-mono text-sm text-accent hover:bg-accent hover:text-bg-base"
            >
              Browse regions
            </Link>
            <a
              href="mailto:sales@aegislens.io"
              className="inline-block rounded border border-border-default px-4 py-2 font-mono text-sm text-text-primary hover:border-accent hover:text-accent"
            >
              Talk to sales
            </a>
          </div>
        </section>
      </div>
    </>
  );
}
