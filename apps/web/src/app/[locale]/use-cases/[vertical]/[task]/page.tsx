import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { urls, localePath } from "@aegis/url-builder";
import { ACTIVE_LOCALES, isLocale, type Locale } from "@aegis/i18n-config";
import { buildMetadata } from "@/lib/seo";
import { PageHeader } from "@/components/PageHeader";
import {
  USE_CASE_TASKS,
  getTask,
  listTasksFor,
  VERTICAL_LABEL,
  type UseCaseVertical,
} from "@/lib/use-case-tasks";
import { TOOLS } from "@/lib/directory-seed";
import { getThreat } from "@/lib/threats-seed";
import { getGuide } from "@/lib/guides-seed";
import { PATHS } from "@/lib/academy-seed";
import { SITE } from "@/lib/site";

// ---------------------------------------------------------------------------
// Inline use-case content map
// ---------------------------------------------------------------------------

type UseCaseContent = {
  title: string;
  description: string;
  persona: string;
  scenario: string;
  steps: string[];
  features: string[];
  cta: string;
};

const USE_CASE_CONTENT: Record<string, UseCaseContent> = {
  "journalists/citing-osint": {
    title: "How Journalists Use Aegis Lens to Cite OSINT",
    description:
      "A step-by-step guide for journalists integrating verified OSINT into conflict reporting.",
    persona: "journalist",
    scenario:
      "You're filing a story about a reported drone strike. You need verified coordinates, source attribution, and an archive link — in minutes.",
    steps: [
      "Search the event on Aegis Lens: type the location or event type in the search bar",
      "Check the confidence score and verification state — publish only events marked Corroborated",
      "Copy the event permalink for your article (signed URL, never changes)",
      "Click 'Sources' tab to get archive.org links for all source material",
      "Use the AI Copilot to draft a 2-sentence factual description with inline citations",
    ],
    features: [
      "Confidence scoring",
      "Source provenance chain",
      "AI Copilot with citations",
      "Event permalinks",
      "Archive.org snapshot links",
    ],
    cta: "Start your first OSINT report",
  },
  "analysts/threat-monitoring": {
    title: "Continuous Threat Monitoring for OSINT Analysts",
    description:
      "Set up automated alerts, watchlists, and dashboards for 24/7 threat awareness.",
    persona: "analyst",
    scenario:
      "You monitor 3 regions for a defense contractor. You need immediate alerts on high-severity events, not a news digest.",
    steps: [
      "Create AOIs for each monitored region using the AOI draw tool",
      "Set alert rules: military_action events with confidence ≥ 80%, immediate delivery",
      "Connect Telegram or Slack for instant notification",
      "Configure your dashboard with event feed + anomaly widget + source health",
      "Use the AI Morning Brief for daily executive summary",
    ],
    features: [
      "AOI monitoring",
      "Custom alert rules",
      "Real-time notifications",
      "AI Morning Brief",
      "Analyst Dashboard",
    ],
    cta: "Set up your monitoring workspace",
  },
  "finance/risk-mapping": {
    title: "Geopolitical Risk Mapping for Finance",
    description:
      "Map conflict exposure against your asset locations and supply chains.",
    persona: "trader",
    scenario:
      "You manage a commodity portfolio with Ukrainian grain exposure. You need real-time infrastructure disruption data.",
    steps: [
      "Filter to infrastructure events in relevant regions",
      "Export event data as CSV for your risk models",
      "Set threshold alerts: infrastructure + danger ≥ 60",
      "Use the API to integrate live event data into your risk dashboard",
      "Generate weekly reports for risk committee",
    ],
    features: [
      "Infrastructure layer",
      "CSV/GeoJSON export",
      "API access",
      "Alert thresholds",
      "AI reports",
    ],
    cta: "Request enterprise data access",
  },
};

const PERSONA_BADGE_COLOR: Record<string, string> = {
  journalist: "text-blue-400 border-blue-500/30 bg-blue-500/10",
  analyst: "text-purple-400 border-purple-500/30 bg-purple-500/10",
  trader: "text-yellow-400 border-yellow-500/30 bg-yellow-500/10",
};

const FEATURE_LINK: Record<string, string> = {
  "Confidence scoring": "/methodology",
  "Source provenance chain": "/sources",
  "AI Copilot with citations": "/tools/ai-copilot",
  "Event permalinks": "/docs/api",
  "Archive.org snapshot links": "/methodology",
  "AOI monitoring": "/alerts",
  "Custom alert rules": "/alerts",
  "Real-time notifications": "/alerts",
  "AI Morning Brief": "/dashboard",
  "Analyst Dashboard": "/dashboard",
  "Infrastructure layer": "/map",
  "CSV/GeoJSON export": "/docs/api",
  "API access": "/docs/api",
  "Alert thresholds": "/alerts",
  "AI reports": "/reports",
};

type Params = { locale: string; vertical: string; task: string };

export function generateStaticParams(): Params[] {
  const out: Params[] = [];
  for (const t of USE_CASE_TASKS) {
    for (const lc of ACTIVE_LOCALES) {
      out.push({ locale: lc, vertical: t.vertical, task: t.slug });
    }
  }
  return out;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { locale: raw, vertical, task } = await params;
  const locale = (isLocale(raw) ? raw : "en") as Locale;
  const t = getTask(vertical, task);
  if (!t) return { robots: { index: false } };
  return buildMetadata({
    locale,
    title: `${t.title} — ${VERTICAL_LABEL[t.vertical]}`,
    description: t.problem,
    pathFor: (lc) => localePath(lc, `/use-cases/${t.vertical}/${t.slug}`),
  });
}

export default async function UseCaseTaskPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { locale: raw, vertical, task } = await params;
  const locale = (isLocale(raw) ? raw : "en") as Locale;
  const t = getTask(vertical, task);
  if (!t) notFound();

  const verticalLabel = VERTICAL_LABEL[t.vertical];
  const pageUrl = `${SITE.url}${localePath(locale, `/use-cases/${t.vertical}/${t.slug}`)}`;

  const recommendedTools = TOOLS.filter((tool) => t.toolCategories.includes(tool.category))
    .slice(0, 6);
  const threats = (t.threatSlugs ?? [])
    .map((s) => getThreat(s))
    .filter((x): x is NonNullable<ReturnType<typeof getThreat>> => x !== null);
  const guides = (t.guideSlugs ?? [])
    .map((s) => getGuide(s))
    .filter((x): x is NonNullable<ReturnType<typeof getGuide>> => x !== null);

  const academyPaths = (t.academyPathSlugs ?? [])
    .map((s) => PATHS.find((p) => p.slug === s))
    .filter((x): x is NonNullable<(typeof PATHS)[number]> => x !== undefined);

  const siblingTasks = listTasksFor(t.vertical as UseCaseVertical).filter(
    (x) => x.slug !== t.slug,
  );

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Article",
        headline: t.title,
        description: t.problem,
        keywords: t.tags.join(", "),
        publisher: { "@type": "Organization", name: SITE.name, url: SITE.url },
        author: { "@type": "Organization", name: SITE.name, url: SITE.url },
        inLanguage: locale,
        url: pageUrl,
        mainEntityOfPage: pageUrl,
        about: { "@type": "Thing", name: verticalLabel },
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          {
            "@type": "ListItem",
            position: 1,
            name: "Use cases",
            item: `${SITE.url}${urls.useCases(locale)}`,
          },
          {
            "@type": "ListItem",
            position: 2,
            name: verticalLabel,
            item: `${SITE.url}${urls.useCase(locale, t.vertical)}`,
          },
          { "@type": "ListItem", position: 3, name: t.title },
        ],
      },
    ],
  };

  // Look up rich content for this vertical/task combination
  const contentKey = `${t.vertical}/${t.slug}`;
  const richContent = USE_CASE_CONTENT[contentKey] ?? null;

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <article className="mx-auto max-w-4xl px-4 py-10">
        <nav className="font-mono text-[11px] text-text-muted" aria-label="Breadcrumb">
          <Link href={urls.useCases(locale)} className="hover:text-text-primary">
            Use cases
          </Link>
          <span className="mx-2 text-border-default">/</span>
          <Link
            href={urls.useCase(locale, t.vertical)}
            className="hover:text-text-primary"
          >
            {verticalLabel}
          </Link>
          <span className="mx-2 text-border-default">/</span>
          <span className="text-text-secondary">{t.title}</span>
        </nav>

        <PageHeader
          eyebrow="Use Case"
          title={richContent ? richContent.title : t.title}
          description={richContent ? richContent.description : t.problem}
        />

        {/* Persona badge */}
        {richContent && (
          <div className="mt-4 flex items-center gap-2">
            <span
              className={`inline-flex items-center rounded border px-2 py-1 font-mono text-[10px] uppercase tracking-widest ${PERSONA_BADGE_COLOR[richContent.persona] ?? "text-text-muted border-border-subtle bg-bg-elevated"}`}
            >
              For: {richContent.persona}
            </span>
          </div>
        )}

        {/* Tags */}
        <div className="mt-4 flex flex-wrap gap-1.5">
          {t.tags.map((tag) => (
            <Link
              key={tag}
              href={urls.tag(locale, tag)}
              className="inline-flex items-center rounded border border-border-subtle bg-bg-elevated px-1.5 py-0.5 font-mono text-[10px] text-text-muted hover:text-accent"
            >
              {tag}
            </Link>
          ))}
        </div>

        {/* Rich content: scenario + steps + features + CTA */}
        {richContent ? (
          <>
            {/* Scenario callout */}
            <section className="mt-8">
              <h2 className="text-base font-semibold text-text-primary">Scenario</h2>
              <blockquote className="mt-3 rounded border border-accent/20 bg-accent/5 px-4 py-3 text-sm italic text-text-secondary">
                {richContent.scenario}
              </blockquote>
            </section>

            {/* Steps */}
            <section className="mt-8">
              <h2 className="text-base font-semibold text-text-primary">Step-by-step workflow</h2>
              <ol className="mt-4 space-y-4">
                {richContent.steps.map((step, idx) => (
                  <li key={idx} className="flex gap-4">
                    <span className="text-3xl font-bold leading-none text-accent/30 select-none w-8 shrink-0">
                      {idx + 1}
                    </span>
                    <p className="pt-1 text-sm text-text-secondary">{step}</p>
                  </li>
                ))}
              </ol>
            </section>

            {/* Features */}
            <section className="mt-8">
              <h2 className="text-base font-semibold text-text-primary">Features used</h2>
              <ul className="mt-3 flex flex-wrap gap-2">
                {richContent.features.map((feature) => {
                  const href = FEATURE_LINK[feature];
                  return href ? (
                    <li key={feature}>
                      <Link
                        href={localePath(locale, href)}
                        className="inline-flex items-center rounded border border-accent/30 bg-accent/5 px-2.5 py-1 font-mono text-[11px] text-accent hover:bg-accent/10"
                      >
                        {feature} →
                      </Link>
                    </li>
                  ) : (
                    <li
                      key={feature}
                      className="inline-flex items-center rounded border border-border-subtle bg-bg-elevated px-2.5 py-1 font-mono text-[11px] text-text-muted"
                    >
                      {feature}
                    </li>
                  );
                })}
              </ul>
            </section>

            {/* CTA */}
            <div className="mt-10 flex items-center gap-4">
              <Link
                href={urls.signup(locale)}
                className="inline-block rounded border border-accent bg-accent/10 px-5 py-2.5 font-mono text-sm text-accent hover:bg-accent hover:text-bg-base transition"
              >
                {richContent.cta}
              </Link>
              <Link
                href={urls.useCases(locale)}
                className="font-mono text-xs text-text-muted hover:text-text-primary"
              >
                ← All use cases
              </Link>
            </div>
          </>
        ) : (
          /* Generic fallback for unknown verticals/tasks */
          <section className="mt-8">
            <div className="rounded border border-border-subtle bg-bg-surface p-5">
              <p className="text-sm font-semibold text-text-primary capitalize">
                {verticalLabel}: {t.title}
              </p>
              <p className="mt-2 text-sm text-text-secondary">{t.problem}</p>
              <p className="mt-4 text-xs text-text-muted">
                Detailed workflow documentation for this use case is coming soon. In the meantime,
                see the recommended workflow below or{" "}
                <a href="mailto:support@aegislens.io" className="text-accent hover:underline">
                  contact us
                </a>{" "}
                for a personalised walkthrough.
              </p>
            </div>
          </section>
        )}

        <section className="mt-10">
          <h2 className="text-base font-semibold text-text-primary">Recommended workflow</h2>
          <ol className="mt-3 space-y-2">
            {t.workflow.map((w, idx) => (
              <li
                key={idx}
                className="flex gap-3 rounded border border-border-subtle bg-bg-surface p-3 text-sm text-text-secondary"
              >
                <span className="font-mono text-[10px] text-text-muted">
                  {String(idx + 1).padStart(2, "0")}
                </span>
                <span className="flex-1">
                  {w.step}
                  {w.surface && (
                    <span className="ml-2 font-mono text-[10px] text-accent">
                      {w.surface}
                    </span>
                  )}
                </span>
              </li>
            ))}
          </ol>
        </section>

        {recommendedTools.length > 0 && (
          <section className="mt-10">
            <h2 className="text-base font-semibold text-text-primary">
              Recommended tools
            </h2>
            <ul className="mt-3 grid grid-cols-1 gap-2 md:grid-cols-2">
              {recommendedTools.map((tool) => (
                <li key={tool.slug}>
                  <Link
                    href={urls.toolDetail(locale, tool.slug)}
                    className="block rounded border border-border-subtle bg-bg-surface px-3 py-2 text-sm hover:bg-bg-elevated"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-text-primary">{tool.name}</span>
                      <span className="font-mono text-[10px] text-text-muted">
                        {tool.category}
                      </span>
                    </div>
                    <p className="mt-1 text-xs text-text-secondary line-clamp-2">
                      {tool.description}
                    </p>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )}

        {threats.length > 0 && (
          <section className="mt-10">
            <h2 className="text-base font-semibold text-text-primary">Related threats</h2>
            <ul className="mt-3 grid grid-cols-1 gap-2 md:grid-cols-2">
              {threats.map((th) => (
                <li key={th.slug}>
                  <Link
                    href={urls.threat(locale, th.slug)}
                    className="block rounded border border-border-subtle bg-bg-surface px-3 py-2 text-sm hover:bg-bg-elevated"
                  >
                    <div className="text-text-primary">{th.name[locale] ?? th.name.en}</div>
                    <p className="mt-1 text-xs text-text-secondary line-clamp-2">
                      {th.summary[locale] ?? th.summary.en}
                    </p>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )}

        {guides.length > 0 && (
          <section className="mt-10">
            <h2 className="text-base font-semibold text-text-primary">Related guides</h2>
            <ul className="mt-3 space-y-2">
              {guides.map((g) => (
                <li key={g.slug}>
                  <Link
                    href={urls.guide(locale, g.slug)}
                    className="block rounded border border-border-subtle bg-bg-surface px-3 py-2 text-sm hover:bg-bg-elevated"
                  >
                    <div className="text-text-primary">{g.title[locale] ?? g.title.en}</div>
                    <div className="mt-1 font-mono text-[10px] uppercase tracking-wider text-text-muted">
                      {g.level} · {g.readingMinutes} min
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )}

        {academyPaths.length > 0 && (
          <section className="mt-10">
            <h2 className="text-base font-semibold text-text-primary">Academy learning paths</h2>
            <p className="mt-1 text-xs text-text-muted">
              Build the foundational skills this workflow requires.
            </p>
            <ul className="mt-3 grid grid-cols-1 gap-2 md:grid-cols-2">
              {academyPaths.map((p) => (
                <li key={p.slug}>
                  <Link
                    href={urls.academyPath(locale, p.slug)}
                    className="block rounded border border-border-subtle bg-bg-surface px-3 py-2 text-sm hover:bg-bg-elevated"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-text-primary">{p.title[locale] ?? p.title.en}</span>
                      <span className="font-mono text-[10px] text-text-muted capitalize">{p.level}</span>
                    </div>
                    <p className="mt-1 text-xs text-text-secondary line-clamp-2">
                      {p.summary[locale] ?? p.summary.en}
                    </p>
                    <p className="mt-1 font-mono text-[10px] text-text-muted">
                      {p.hours}h · {p.lessons.length} lessons
                    </p>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )}

        {siblingTasks.length > 0 && (
          <section className="mt-10 border-t border-border-subtle pt-6">
            <h2 className="text-base font-semibold text-text-primary">
              Other {verticalLabel} tasks
            </h2>
            <ul className="mt-3 grid grid-cols-1 gap-2 md:grid-cols-2">
              {siblingTasks.map((s) => (
                <li key={s.slug}>
                  <Link
                    href={urls.useCaseTask(locale, s.vertical, s.slug)}
                    className="block rounded border border-border-subtle bg-bg-surface px-3 py-2 text-sm text-text-secondary hover:bg-bg-elevated hover:text-text-primary"
                  >
                    {s.title}
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )}
      </article>
    </>
  );
}
