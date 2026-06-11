import Link from "next/link";
import type { Metadata } from "next";
import { urls, localePath } from "@aegis/url-builder";
import { ACTIVE_LOCALES, isLocale, type Locale } from "@aegis/i18n-config";
import { buildMetadata } from "@/lib/seo";
import { PageHeader } from "@/components/PageHeader";
import { listGuides } from "@/lib/guides-seed";
import { SITE } from "@/lib/site";

export function generateStaticParams() {
  return ACTIVE_LOCALES.map((locale) => ({ locale }));
}

const TITLE = "Guides";
const DESCRIPTION =
  "Practical guides for OSINT analysts, geospatial researchers, journalists, and developers. From first principles to publication-ready writeups.";

const CATEGORY_LABEL: Record<string, string> = {
  osint: "OSINT",
  verification: "Verification",
  geospatial: "Geospatial",
  developer: "Developer",
  analyst: "Analyst craft",
};

const LEVEL_LABEL: Record<string, string> = {
  intro: "Intro",
  intermediate: "Intermediate",
  advanced: "Advanced",
};

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
    pathFor: (lc) => localePath(lc, "/guides"),
  });
}

export default async function GuidesIndexPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ category?: string; level?: string }>;
}) {
  const { locale: raw } = await params;
  const locale = (isLocale(raw) ? raw : "en") as Locale;
  const sp = await searchParams;

  const allGuides = listGuides();
  const allCategories = [...new Set(allGuides.map((g) => g.category))].sort();
  const allLevels = [...new Set(allGuides.map((g) => g.level))];

  const filterCategory = allCategories.includes(sp.category ?? "") ? sp.category : undefined;
  const filterLevel = allLevels.includes(sp.level ?? "") ? sp.level : undefined;

  const guides = allGuides
    .filter((g) => !filterCategory || g.category === filterCategory)
    .filter((g) => !filterLevel || g.level === filterLevel);

  const guidesBase = localePath(locale, "/guides");
  const buildHref = (overrides: Record<string, string | undefined>) => {
    const p = new URLSearchParams();
    if (filterCategory) p.set("category", filterCategory);
    if (filterLevel) p.set("level", filterLevel);
    for (const [k, v] of Object.entries(overrides)) {
      if (v) p.set(k, v);
      else p.delete(k);
    }
    const qs = p.toString();
    return qs ? `${guidesBase}?${qs}` : guidesBase;
  };

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: TITLE,
    description: DESCRIPTION,
    url: `${SITE.url}${guidesBase}`,
    inLanguage: locale,
    isPartOf: { "@type": "WebSite", url: SITE.url, name: SITE.name },
    mainEntity: {
      "@type": "ItemList",
      numberOfItems: guides.length,
      itemListElement: guides.map((g, idx) => ({
        "@type": "ListItem",
        position: idx + 1,
        url: `${SITE.url}${localePath(locale, `/guides/${g.slug}`)}`,
        name: g.title[locale] ?? g.title.en,
      })),
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <PageHeader eyebrow="Learn" title={TITLE} description={DESCRIPTION} />
      <section className="mx-auto max-w-5xl px-4 py-10">
        {/* Category filter chips */}
        <div className="mb-3 flex flex-wrap items-center gap-2">
          <span className="font-mono text-[10px] uppercase tracking-wider text-text-muted">Topic:</span>
          <Link
            href={buildHref({ category: undefined })}
            className={`rounded border px-3 py-1 font-mono text-[11px] uppercase tracking-wider transition-colors ${
              !filterCategory
                ? "border-accent bg-accent/10 text-accent"
                : "border-border-subtle bg-bg-surface text-text-muted hover:border-text-muted"
            }`}
          >
            All ({allGuides.length})
          </Link>
          {allCategories.map((cat) => {
            const count = allGuides.filter((g) => g.category === cat).length;
            return (
              <Link
                key={cat}
                href={buildHref({ category: filterCategory === cat ? undefined : cat })}
                className={`rounded border px-3 py-1 font-mono text-[11px] uppercase tracking-wider transition-colors ${
                  filterCategory === cat
                    ? "border-accent bg-accent/10 text-accent"
                    : "border-border-subtle bg-bg-surface text-text-muted hover:border-text-muted"
                }`}
              >
                {CATEGORY_LABEL[cat] ?? cat} ({count})
              </Link>
            );
          })}
        </div>

        {/* Level filter chips */}
        <div className="mb-6 flex flex-wrap items-center gap-2">
          <span className="font-mono text-[10px] uppercase tracking-wider text-text-muted">Level:</span>
          <Link
            href={buildHref({ level: undefined })}
            className={`rounded border px-3 py-1 font-mono text-[11px] uppercase tracking-wider transition-colors ${
              !filterLevel
                ? "border-accent bg-accent/10 text-accent"
                : "border-border-subtle bg-bg-surface text-text-muted hover:border-text-muted"
            }`}
          >
            All
          </Link>
          {["intro", "intermediate", "advanced"].filter((l) => allLevels.includes(l)).map((lvl) => (
            <Link
              key={lvl}
              href={buildHref({ level: filterLevel === lvl ? undefined : lvl })}
              className={`rounded border px-3 py-1 font-mono text-[11px] uppercase tracking-wider transition-colors ${
                filterLevel === lvl
                  ? "border-accent bg-accent/10 text-accent"
                  : "border-border-subtle bg-bg-surface text-text-muted hover:border-text-muted"
              }`}
            >
              {LEVEL_LABEL[lvl]}
            </Link>
          ))}
          {(filterCategory || filterLevel) && (
            <span className="ml-auto font-mono text-[10px] text-text-muted">
              {guides.length} / {allGuides.length} guides
            </span>
          )}
        </div>

        {guides.length === 0 ? (
          <p className="rounded border border-border-subtle bg-bg-surface p-6 text-sm text-text-muted">
            No guides match this filter.
          </p>
        ) : (
          <ul className="grid grid-cols-1 gap-3 md:grid-cols-2">
            {guides.map((g) => (
              <li key={g.slug}>
                <Link
                  href={urls.guide(locale, g.slug)}
                  className="block h-full rounded border border-border-subtle bg-bg-surface p-4 transition-colors hover:border-accent/40 hover:bg-bg-elevated"
                >
                  <div className="flex flex-wrap items-center gap-2 font-mono text-[10px] uppercase tracking-wider text-text-muted">
                    <span>{CATEGORY_LABEL[g.category]}</span>
                    <span>·</span>
                    <span>{LEVEL_LABEL[g.level]}</span>
                    <span>·</span>
                    <span>{g.readingMinutes} min read</span>
                  </div>
                  <h2 className="mt-2 text-base font-semibold text-text-primary">
                    {g.title[locale] ?? g.title.en}
                  </h2>
                  <p className="mt-2 text-sm text-text-secondary">
                    {g.summary[locale] ?? g.summary.en}
                  </p>
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {g.tags.map((t) => (
                      <span
                        key={t}
                        className="inline-flex items-center rounded border border-border-subtle bg-bg-elevated px-1.5 py-0.5 font-mono text-[10px] text-text-muted"
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </>
  );
}
