import Link from "next/link";
import type { Metadata } from "next";
import { urls, localePath } from "@aegis/url-builder";
import { ACTIVE_LOCALES, isLocale, type Locale } from "@aegis/i18n-config";
import { buildMetadata } from "@/lib/seo";
import { PageHeader } from "@/components/PageHeader";
import { listThreats } from "@/lib/threats-seed";
import { SITE } from "@/lib/site";

export function generateStaticParams() {
  return ACTIVE_LOCALES.map((locale) => ({ locale }));
}

const TITLE = "Threats";
const DESCRIPTION =
  "Named-threat hubs covering kinetic, infrastructure, cyber, maritime, aviation, and humanitarian risks. Each page combines a threat profile, civilian + operator guidance, recent events, and methodology.";

const CATEGORY_LABEL: Record<string, string> = {
  kinetic: "Kinetic",
  infrastructure: "Infrastructure",
  cyber: "Cyber",
  maritime: "Maritime",
  aviation: "Aviation",
  humanitarian: "Humanitarian",
};

const SEVERITY_LABEL: Record<number, string> = {
  1: "Monitor",
  2: "Low",
  3: "Moderate",
  4: "High",
  5: "Critical",
};

const SEVERITY_STYLE: Record<number, string> = {
  1: "border-zinc-500/40 bg-zinc-500/10 text-zinc-400",
  2: "border-sky-500/40 bg-sky-500/10 text-sky-400",
  3: "border-amber-500/40 bg-amber-500/10 text-amber-400",
  4: "border-orange-500/40 bg-orange-500/10 text-orange-400",
  5: "border-red-500/40 bg-red-500/10 text-red-400",
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
    pathFor: (lc) => localePath(lc, "/threats"),
  });
}

export default async function ThreatsIndexPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ region?: string; category?: string }>;
}) {
  const { locale: raw } = await params;
  const locale = (isLocale(raw) ? raw : "en") as Locale;
  const sp = await searchParams;
  const filterRegion = sp.region ?? "";
  const filterCategory = sp.category ?? "";

  const allThreats = listThreats();

  const uniqueRegions = [...new Set(allThreats.flatMap((t) => t.affectedRegions))].sort();
  const uniqueCategories = [...new Set(allThreats.map((t) => t.category))].sort();

  const baseHref = localePath(locale, "/threats");
  const buildHref = (overrides: Record<string, string>) => {
    const p = new URLSearchParams();
    if (filterRegion) p.set("region", filterRegion);
    if (filterCategory) p.set("category", filterCategory);
    for (const [k, v] of Object.entries(overrides)) {
      if (v) p.set(k, v);
      else p.delete(k);
    }
    const qs = p.toString();
    return qs ? `${baseHref}?${qs}` : baseHref;
  };

  const threats = allThreats
    .filter((t) => !filterRegion || t.affectedRegions.includes(filterRegion))
    .filter((t) => !filterCategory || t.category === filterCategory);

  // Group by category for the index.
  const byCategory = new Map<string, typeof threats>();
  for (const t of threats) {
    const arr = byCategory.get(t.category) ?? [];
    arr.push(t);
    byCategory.set(t.category, arr);
  }

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: TITLE,
    description: DESCRIPTION,
    url: `${SITE.url}${localePath(locale, "/threats")}`,
    isPartOf: { "@type": "WebSite", url: SITE.url, name: SITE.name },
    mainEntity: {
      "@type": "ItemList",
      numberOfItems: allThreats.length,
      itemListElement: allThreats.map((t, idx) => ({
        "@type": "ListItem",
        position: idx + 1,
        url: `${SITE.url}${localePath(locale, `/threats/${t.slug}`)}`,
        name: t.name[locale] ?? t.name.en,
      })),
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <PageHeader eyebrow="Threat library" title={TITLE} description={DESCRIPTION} />
      <section className="mx-auto max-w-5xl px-4 py-10">
        {/* Severity index summary */}
        <div className="mb-8 grid grid-cols-2 gap-3 sm:grid-cols-5">
          {([5, 4, 3, 2, 1] as const).map((s) => {
            const count = allThreats.filter((t) => t.currentSeverity === s).length;
            return (
              <div
                key={s}
                className={`rounded border px-3 py-2 text-center ${SEVERITY_STYLE[s]}`}
              >
                <div className="font-mono text-[9px] uppercase tracking-wider opacity-70">
                  {SEVERITY_LABEL[s]}
                </div>
                <div className="mt-0.5 text-lg font-bold">{count}</div>
              </div>
            );
          })}
        </div>

        {/* Filters */}
        <div className="mb-4 flex flex-wrap items-center gap-2">
          <span className="font-mono text-[11px] uppercase tracking-wider text-text-muted">Category:</span>
          <a
            href={buildHref({ category: "" })}
            className={`rounded border px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider transition-colors ${!filterCategory ? "border-accent bg-accent/10 text-accent" : "border-border-subtle text-text-muted hover:border-text-muted"}`}
          >
            All
          </a>
          {uniqueCategories.map((cat) => (
            <a
              key={cat}
              href={buildHref({ category: filterCategory === cat ? "" : cat })}
              className={`rounded border px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider transition-colors ${filterCategory === cat ? "border-accent bg-accent/10 text-accent" : "border-border-subtle text-text-muted hover:border-text-muted"}`}
            >
              {CATEGORY_LABEL[cat] ?? cat}
            </a>
          ))}
        </div>
        <div className="mb-6 flex flex-wrap items-center gap-2">
          <span className="font-mono text-[11px] uppercase tracking-wider text-text-muted">Region:</span>
          <a
            href={buildHref({ region: "" })}
            className={`rounded border px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider transition-colors ${!filterRegion ? "border-accent bg-accent/10 text-accent" : "border-border-subtle text-text-muted hover:border-text-muted"}`}
          >
            All
          </a>
          {uniqueRegions.map((r) => (
            <a
              key={r}
              href={buildHref({ region: filterRegion === r ? "" : r })}
              className={`rounded border px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider transition-colors ${filterRegion === r ? "border-accent bg-accent/10 text-accent" : "border-border-subtle text-text-muted hover:border-text-muted"}`}
            >
              {r.toUpperCase()}
            </a>
          ))}
          {(filterRegion || filterCategory) && (
            <span className="ml-auto font-mono text-[10px] text-text-muted">
              {threats.length} / {allThreats.length} threats
            </span>
          )}
        </div>

        {threats.length === 0 ? (
          <p className="rounded border border-border-subtle bg-bg-surface p-6 text-sm text-text-muted">
            No threats match the current filter.
          </p>
        ) : (
          <div className="space-y-10">
            {[...byCategory.entries()].map(([cat, arr]) => (
              <div key={cat}>
                <h2 className="font-mono text-[11px] uppercase tracking-wider text-text-muted">
                  {CATEGORY_LABEL[cat] ?? cat}
                </h2>
                <ul className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-2">
                  {arr.map((t) => (
                    <li key={t.slug}>
                      <Link
                        href={urls.threat(locale, t.slug)}
                        className="block h-full rounded border border-border-subtle bg-bg-surface p-4 hover:bg-bg-elevated"
                      >
                        <div className="flex flex-wrap items-center gap-2 font-mono text-[10px] uppercase tracking-wider text-text-muted">
                          <span>{CATEGORY_LABEL[t.category]}</span>
                          <span>·</span>
                          <span>{t.affectedRegions.map((r) => r.toUpperCase()).join(" · ")}</span>
                          {t.currentSeverity && (
                            <>
                              <span>·</span>
                              <span
                                className={`rounded border px-1.5 py-0.5 text-[9px] ${SEVERITY_STYLE[t.currentSeverity]}`}
                              >
                                {SEVERITY_LABEL[t.currentSeverity]}
                              </span>
                            </>
                          )}
                        </div>
                        <h3 className="mt-2 text-base font-semibold text-text-primary">
                          {t.name[locale] ?? t.name.en}
                        </h3>
                        <p className="mt-2 text-sm text-text-secondary line-clamp-3">
                          {t.summary[locale] ?? t.summary.en}
                        </p>
                        <div className="mt-3 font-mono text-[10px] text-accent">
                          read full threat page →
                        </div>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        )}

        {/* Cross-links */}
        <div className="mt-14 rounded border border-border-subtle bg-bg-surface p-5">
          <p className="font-mono text-[11px] uppercase tracking-wider text-text-muted">Related</p>
          <div className="mt-3 flex flex-wrap gap-3 text-sm">
            <Link href={localePath(locale, "/conflicts")} className="text-accent hover:underline">
              Conflicts
            </Link>
            <Link href={localePath(locale, "/regions")} className="text-accent hover:underline">
              Regions
            </Link>
            <Link href={localePath(locale, "/glossary")} className="text-accent hover:underline">
              Glossary
            </Link>
            <Link href={localePath(locale, "/docs/confidence")} className="text-accent hover:underline">
              Scoring methodology
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
