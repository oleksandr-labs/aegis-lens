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
import { listRegions, getRegion } from "@/lib/regions-seed";
import { TOOLS } from "@/lib/directory-seed";
import { eventsInCountry } from "@/lib/events-seed";
import { getThreat } from "@/lib/threats-seed";
import { SITE } from "@/lib/site";

type Params = {
  locale: string;
  vertical: string;
  task: string;
  country: string;
};

export function generateStaticParams(): Params[] {
  const out: Params[] = [];
  for (const t of USE_CASE_TASKS) {
    for (const r of listRegions()) {
      for (const lc of ACTIVE_LOCALES) {
        out.push({
          locale: lc,
          vertical: t.vertical,
          task: t.slug,
          country: r.iso2,
        });
      }
    }
  }
  return out;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { locale: raw, vertical, task, country } = await params;
  const locale = (isLocale(raw) ? raw : "en") as Locale;
  const t = getTask(vertical, task);
  const region = getRegion(country);
  if (!t || !region) return { robots: { index: false } };
  const countryLabel = region.name[locale] ?? region.name.en;
  return buildMetadata({
    locale,
    title: `${t.title} — ${VERTICAL_LABEL[t.vertical as UseCaseVertical]} in ${countryLabel}`,
    description: `${t.problem} Applied to ${countryLabel}.`,
    pathFor: (lc) =>
      localePath(lc, `/use-cases/${vertical}/${task}/in/${country}`),
  });
}

export default async function UseCaseCountryPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { locale: raw, vertical, task, country } = await params;
  const locale = (isLocale(raw) ? raw : "en") as Locale;
  const t = getTask(vertical, task);
  const region = getRegion(country);
  if (!t || !region) notFound();

  const verticalLabel = VERTICAL_LABEL[t.vertical as UseCaseVertical];
  const countryLabel = region.name[locale] ?? region.name.en;
  const pageUrl = `${SITE.url}${localePath(locale, `/use-cases/${vertical}/${task}/in/${country}`)}`;

  const recommendedTools = TOOLS.filter((tool) => t.toolCategories.includes(tool.category)).slice(0, 6);
  const threats = (t.threatSlugs ?? [])
    .map((s) => getThreat(s))
    .filter((x): x is NonNullable<ReturnType<typeof getThreat>> => x !== null);
  // Threats relevant to this country: filter on affected regions
  const countryThreats = threats.filter((th) =>
    th.affectedRegions.some((r) => r.toLowerCase() === country.toLowerCase()),
  );
  const eventsHere = eventsInCountry(country);

  const siblingTasks = listTasksFor(t.vertical as UseCaseVertical).filter(
    (x) => x.slug !== t.slug,
  );
  const otherCountries = listRegions().filter((r) => r.iso2 !== country);

  // Parametric FAQ per (vertical × task × country)
  const faqs: { q: string; a: string }[] = [
    {
      q: `Can I run this workflow against ${countryLabel} today?`,
      a: `Yes. Aegis Lens has catalogued ${eventsHere.length} events in ${countryLabel} relevant to ${verticalLabel.toLowerCase()} operations. The recommended workflow above references the Aegis Lens surfaces you'd plug in.`,
    },
    {
      q: `What tooling does Aegis Lens recommend here?`,
      a: `The "Recommended tools" section pulls from the Aegis Lens directory by tool category (${t.toolCategories.join(", ")}). Each card links to the tool's directory entry and to alternatives. We do not endorse vendors — listings are catalogued, not ranked editorially.`,
    },
    {
      q: `What's different about running this in ${countryLabel} vs. globally?`,
      a: `Country threat profile and sourcing diversity differ. The ${countryLabel} threat profile is surfaced above; the source bench depth varies by language and reporting density. See the /country/${country} brief for a deeper picture.`,
    },
    {
      q: `Where do I get help if the workflow doesn't fit our org?`,
      a: `Reach the team via /contact. For implementation-heavy engagements, the partner directory at /partners includes implementation specialists in defense, journalism, humanitarian, finance, and energy.`,
    },
  ];

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Article",
        headline: `${t.title} — ${verticalLabel} in ${countryLabel}`,
        description: t.problem,
        keywords: t.tags.join(", "),
        publisher: { "@type": "Organization", name: SITE.name, url: SITE.url },
        author: { "@type": "Organization", name: SITE.name, url: SITE.url },
        inLanguage: locale,
        url: pageUrl,
        mainEntityOfPage: pageUrl,
        about: {
          "@type": "Place",
          name: countryLabel,
          address: { "@type": "PostalAddress", addressCountry: country.toUpperCase() },
        },
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
          {
            "@type": "ListItem",
            position: 3,
            name: t.title,
            item: `${SITE.url}${urls.useCaseTask(locale, t.vertical, t.slug)}`,
          },
          { "@type": "ListItem", position: 4, name: countryLabel },
        ],
      },
      {
        "@type": "FAQPage",
        mainEntity: faqs.map((f) => ({
          "@type": "Question",
          name: f.q,
          acceptedAnswer: { "@type": "Answer", text: f.a },
        })),
      },
    ],
  };

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
          <Link
            href={urls.useCaseTask(locale, t.vertical, t.slug)}
            className="hover:text-text-primary"
          >
            {t.title}
          </Link>
          <span className="mx-2 text-border-default">/</span>
          <span className="text-text-secondary">{countryLabel}</span>
        </nav>

        <PageHeader
          eyebrow={`${verticalLabel} × ${countryLabel}`}
          title={`${t.title} in ${countryLabel}`}
          description={t.problem}
        />

        <section className="mt-6 rounded border border-border-subtle bg-bg-surface p-4 text-sm">
          <div className="font-mono text-[10px] uppercase tracking-wider text-text-muted">
            Country context
          </div>
          <p className="mt-2 text-text-secondary">
            Aegis Lens has catalogued{" "}
            <strong className="text-text-primary">{eventsHere.length}</strong>{" "}
            events in {countryLabel} relevant to {verticalLabel.toLowerCase()} operations.
            Recent activity at{" "}
            <Link
              href={urls.country(locale, country)}
              className="text-accent hover:underline"
            >
              /country/{country}
            </Link>
            .
          </p>
        </section>

        <section className="mt-8">
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

        {countryThreats.length > 0 && (
          <section className="mt-10">
            <h2 className="text-base font-semibold text-text-primary">
              {countryLabel} threat profile
            </h2>
            <ul className="mt-3 grid grid-cols-1 gap-2 md:grid-cols-2">
              {countryThreats.map((th) => (
                <li key={th.slug}>
                  <Link
                    href={urls.threatCountry(locale, th.slug, country)}
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

        {siblingTasks.length > 0 && (
          <section className="mt-10">
            <h2 className="text-base font-semibold text-text-primary">
              Other {verticalLabel} tasks in {countryLabel}
            </h2>
            <ul className="mt-3 grid grid-cols-1 gap-2 md:grid-cols-2">
              {siblingTasks.map((s) => (
                <li key={s.slug}>
                  <Link
                    href={urls.useCaseTaskCountry(
                      locale,
                      s.vertical,
                      s.slug,
                      country,
                    )}
                    className="block rounded border border-border-subtle bg-bg-surface px-3 py-2 text-sm text-text-secondary hover:bg-bg-elevated hover:text-text-primary"
                  >
                    {s.title}
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )}

        {otherCountries.length > 0 && (
          <section className="mt-8">
            <h2 className="text-base font-semibold text-text-primary">
              {t.title} in other countries
            </h2>
            <ul className="mt-3 flex flex-wrap gap-2">
              {otherCountries.map((r) => (
                <li key={r.iso2}>
                  <Link
                    href={urls.useCaseTaskCountry(
                      locale,
                      t.vertical,
                      t.slug,
                      r.iso2,
                    )}
                    className="inline-flex items-center rounded border border-border-subtle bg-bg-surface px-3 py-1.5 text-xs text-text-secondary hover:bg-bg-elevated hover:text-text-primary"
                  >
                    {r.name[locale] ?? r.name.en}
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )}

        <section className="mt-10">
          <h2 className="text-base font-semibold text-text-primary">FAQ</h2>
          <div className="mt-3 space-y-3">
            {faqs.map((f, i) => (
              <details
                key={i}
                className="group rounded border border-border-subtle bg-bg-surface p-4"
              >
                <summary className="cursor-pointer text-sm font-medium text-text-primary">
                  {f.q}
                </summary>
                <p className="mt-2 text-sm text-text-secondary">{f.a}</p>
              </details>
            ))}
          </div>
        </section>

        <p className="mt-10 text-xs text-text-muted">
          Base task:{" "}
          <Link
            href={urls.useCaseTask(locale, t.vertical, t.slug)}
            className="text-accent hover:underline"
          >
            {t.title}
          </Link>
          .
        </p>
      </article>
    </>
  );
}
