import type { Metadata } from "next";
import Link from "next/link";
import { localePath } from "@aegis/url-builder";
import { ACTIVE_LOCALES, isLocale, type Locale } from "@aegis/i18n-config";
import { buildMetadata } from "@/lib/seo";
import { PageHeader } from "@/components/PageHeader";
import { VERTICAL_LABEL, VERTICAL_BLURB, type UseCaseVertical } from "@/lib/use-case-tasks";
import { SITE } from "@/lib/site";

const USE_CASES_GRID = [
  { vertical: "journalists", task: "citing-osint", title: "Citing OSINT in Journalism", icon: "📰" },
  { vertical: "analysts", task: "threat-monitoring", title: "24/7 Threat Monitoring", icon: "🎯" },
  { vertical: "finance", task: "risk-mapping", title: "Geopolitical Risk Mapping", icon: "📊" },
  { vertical: "ngos", task: "humanitarian-monitoring", title: "Humanitarian Situation Monitoring", icon: "🤝" },
  { vertical: "government", task: "intelligence-briefing", title: "Intelligence Briefing Preparation", icon: "🏛" },
  { vertical: "security", task: "threat-assessment", title: "Corporate Security Threat Assessment", icon: "🔒" },
] as const;

export function generateStaticParams() {
  return ACTIVE_LOCALES.map((locale) => ({ locale }));
}

const TITLE = "Use cases";
const DESCRIPTION =
  "Aegis Lens across seven audiences — defense, journalism, humanitarian, financial, intelligence analysts, corporate security, and civilians. Verified conflict data with transparent methodology.";

const ALL_VERTICALS: UseCaseVertical[] = [
  "defense",
  "journalism",
  "humanitarian",
  "financial",
  "analysts",
  "security",
  "civilians",
];

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
    pathFor: (lc) => localePath(lc, "/use-cases"),
  });
}

export default async function UseCasesIndexPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: raw } = await params;
  const locale = (isLocale(raw) ? raw : "en") as Locale;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: TITLE,
    description: DESCRIPTION,
    url: `${SITE.url}${localePath(locale, "/use-cases")}`,
    inLanguage: locale,
    isPartOf: { "@type": "WebSite", url: SITE.url, name: SITE.name },
    hasPart: ALL_VERTICALS.map((v) => ({
      "@type": "WebPage",
      name: VERTICAL_LABEL[v],
      description: VERTICAL_BLURB[v],
      url: `${SITE.url}${localePath(locale, `/use-cases/${v}`)}`,
    })),
  };

  return (
    <>
      <PageHeader eyebrow="Use cases" title={TITLE} description={DESCRIPTION} />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="mx-auto max-w-4xl px-4 py-10">
        <section>
          <h2 className="text-xl font-semibold text-text-primary">Built for seven audiences</h2>
          <p className="mt-3 text-text-secondary">
            The same verified event stream and methodology underpins every deployment. What changes
            is the workflow on top — the dashboards, the alerts, the integrations. Pick the vertical
            closest to your work to see how teams put Aegis Lens into operation.
          </p>
        </section>

        <section className="mt-10">
          <div className="grid gap-4 md:grid-cols-2">
            {ALL_VERTICALS.map((v) => (
              <Link
                key={v}
                href={localePath(locale, `/use-cases/${v}`)}
                className="group rounded border border-border-subtle bg-bg-surface p-5 transition hover:border-accent"
              >
                <p className="font-mono text-xs uppercase tracking-widest text-accent">{v}</p>
                <h3 className="mt-2 text-lg font-semibold text-text-primary group-hover:text-accent">
                  {VERTICAL_LABEL[v]}
                </h3>
                <p className="mt-2 text-sm text-text-secondary">{VERTICAL_BLURB[v]}</p>
                <p className="mt-4 font-mono text-xs text-text-muted">
                  Read more <span aria-hidden="true">→</span>
                </p>
              </Link>
            ))}
          </div>
        </section>

        {/* Specific task cards */}
        <section className="mt-12">
          <h2 className="text-xl font-semibold text-text-primary">Popular workflows</h2>
          <p className="mt-2 text-sm text-text-secondary">
            Jump straight to a specific task with step-by-step guidance.
          </p>
          <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {USE_CASES_GRID.map(({ vertical, task, title, icon }) => (
              <Link
                key={`${vertical}/${task}`}
                href={localePath(locale, `/use-cases/${vertical}/${task}`)}
                className="group flex items-start gap-3 rounded border border-border-subtle bg-bg-surface p-4 transition hover:border-accent"
              >
                <span className="text-2xl leading-none shrink-0" aria-hidden="true">
                  {icon}
                </span>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-text-primary group-hover:text-accent line-clamp-2">
                    {title}
                  </p>
                  <p className="mt-1 font-mono text-[10px] uppercase tracking-widest text-text-muted">
                    {vertical}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </section>

        <section className="mt-12">
          <h2 className="text-xl font-semibold text-text-primary">Not sure which fits?</h2>
          <p className="mt-3 text-text-secondary">
            Most organisations span more than one of these workflows. Talk to us and we will scope a
            deployment that matches the way your teams actually operate.
          </p>
          <p className="mt-4">
            <a
              className="inline-block rounded border border-accent px-4 py-2 font-mono text-sm text-accent hover:bg-accent hover:text-bg-base"
              href="mailto:sales@aegislens.io"
            >
              sales@aegislens.io
            </a>
          </p>
        </section>
      </div>
    </>
  );
}
