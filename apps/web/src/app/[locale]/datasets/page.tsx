import type { Metadata } from "next";
import Link from "next/link";
import { localePath } from "@aegis/url-builder";
import { ACTIVE_LOCALES, isLocale, type Locale } from "@aegis/i18n-config";
import { buildMetadata } from "@/lib/seo";
import { PageHeader } from "@/components/PageHeader";
import {
  DATASETS_DATA,
  CATEGORY_LABEL,
  FORMAT_LABEL,
  LICENSE_LABEL,
  LICENSE_URL_DATA,
  type DatasetCategory,
  type DatasetLicense,
} from "@/lib/datasets-data";
import { SITE } from "@/lib/site";

export function generateStaticParams() {
  return ACTIVE_LOCALES.map((locale) => ({ locale }));
}

const TITLE = "Intelligence Datasets";
const DESCRIPTION =
  "Verified conflict intelligence data, free for research and journalism. All datasets are peer-reviewed before release.";

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
    pathFor: (lc) => localePath(lc, "/datasets"),
    feeds: [
      {
        type: "application/rss+xml",
        href: "/datasets/feed.xml",
        title: `${TITLE} — RSS`,
      },
    ],
  });
}

const ALL_CATEGORIES = [
  ...new Set(DATASETS_DATA.map((d) => d.category)),
].sort() as DatasetCategory[];

const ALL_LICENSES = [
  ...new Set(DATASETS_DATA.map((d) => d.license)),
].sort() as DatasetLicense[];

const TOTAL_RECORDS = DATASETS_DATA.reduce((sum, d) => sum + d.recordCount, 0);
const LAST_UPDATED = DATASETS_DATA.reduce((latest, d) =>
  d.lastUpdated > latest ? d.lastUpdated : latest,
  ""
);

function formatNumber(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(0)}K`;
  return n.toString();
}

const LICENSE_COLOR: Record<DatasetLicense, string> = {
  "cc-by-4.0": "border-emerald-500/40 bg-emerald-500/10 text-emerald-400",
  "cc-by-nc-4.0": "border-amber-500/40 bg-amber-500/10 text-amber-400",
  proprietary: "border-red-500/40 bg-red-500/10 text-red-400",
  "public-domain": "border-sky-500/40 bg-sky-500/10 text-sky-400",
};

const FREQ_LABEL: Record<string, string> = {
  hourly: "Hourly",
  daily: "Daily",
  weekly: "Weekly",
  monthly: "Monthly",
  static: "Static",
};

export default async function DatasetsPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ category?: string; license?: string }>;
}) {
  const { locale: raw } = await params;
  const locale = (isLocale(raw) ? raw : "en") as Locale;
  const sp = await searchParams;

  const activeCategory = ALL_CATEGORIES.includes(sp.category as DatasetCategory)
    ? (sp.category as DatasetCategory)
    : null;
  const activeLicense = ALL_LICENSES.includes(sp.license as DatasetLicense)
    ? (sp.license as DatasetLicense)
    : null;

  const pageUrl = `${SITE.url}${localePath(locale, "/datasets")}`;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "DataCatalog",
    name: TITLE,
    description: DESCRIPTION,
    url: pageUrl,
    inLanguage: locale,
    publisher: { "@type": "Organization", name: SITE.name, url: SITE.url },
    dataset: DATASETS_DATA.map((d) => ({
      "@type": "Dataset",
      name: d.title,
      description: d.description,
      license: LICENSE_URL_DATA[d.license],
      encodingFormat: d.formats.join(", "),
      dateModified: d.lastUpdated,
      url: `${SITE.url}${localePath(locale, `/datasets/${d.slug}`)}`,
      distribution: d.formats.map((fmt) => ({
        "@type": "DataDownload",
        encodingFormat: FORMAT_LABEL[fmt],
        contentUrl: `${SITE.url}/data/${d.slug}.${fmt}`,
      })),
      publisher: { "@type": "Organization", name: SITE.name, url: SITE.url },
      inLanguage: locale,
    })),
  };

  const filteredDatasets = DATASETS_DATA.filter((d) => {
    if (activeCategory && d.category !== activeCategory) return false;
    if (activeLicense && d.license !== activeLicense) return false;
    return true;
  });

  const datasetsBase = localePath(locale, "/datasets");

  function filterHref(
    category: DatasetCategory | null,
    license: DatasetLicense | null
  ): string {
    const p = new URLSearchParams();
    if (category) p.set("category", category);
    if (license) p.set("license", license);
    const qs = p.toString();
    return qs ? `${datasetsBase}?${qs}` : datasetsBase;
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <PageHeader
        eyebrow="Open Data"
        title="Intelligence Datasets"
        description={DESCRIPTION}
      />

      <section className="mx-auto max-w-5xl px-4 py-10">

        {/* Stats bar */}
        <div className="mb-8 flex flex-wrap items-center gap-6 rounded border border-border-subtle bg-bg-surface px-5 py-3">
          <div className="text-center">
            <div className="font-mono text-lg font-bold text-text-primary">
              {DATASETS_DATA.length}
            </div>
            <div className="font-mono text-[10px] uppercase tracking-wider text-text-muted">
              Datasets
            </div>
          </div>
          <div className="h-8 w-px bg-border-subtle" />
          <div className="text-center">
            <div className="font-mono text-lg font-bold text-text-primary">
              {formatNumber(TOTAL_RECORDS)}
            </div>
            <div className="font-mono text-[10px] uppercase tracking-wider text-text-muted">
              Total records
            </div>
          </div>
          <div className="h-8 w-px bg-border-subtle" />
          <div className="text-center">
            <div className="font-mono text-lg font-bold text-text-primary">
              {LAST_UPDATED}
            </div>
            <div className="font-mono text-[10px] uppercase tracking-wider text-text-muted">
              Last updated
            </div>
          </div>
          <div className="ml-auto">
            <a
              href="/datasets/feed.xml"
              className="flex items-center gap-1.5 rounded border border-orange-500/30 bg-orange-500/10 px-2.5 py-1 font-mono text-[10px] text-orange-400 hover:border-orange-400"
              aria-label="Datasets RSS feed"
            >
              RSS
            </a>
          </div>
        </div>

        {/* Filter bar — Category */}
        <div className="mb-3 flex flex-wrap items-center gap-2">
          <span className="font-mono text-[10px] uppercase tracking-wider text-text-muted">
            Category:
          </span>
          <a
            href={filterHref(null, activeLicense)}
            className={`rounded border px-2.5 py-1 font-mono text-[10px] uppercase tracking-wider transition-colors ${
              !activeCategory
                ? "border-accent bg-accent/10 text-accent"
                : "border-border-subtle bg-bg-surface text-text-muted hover:border-text-muted"
            }`}
          >
            All
          </a>
          {ALL_CATEGORIES.map((cat) => (
            <a
              key={cat}
              href={filterHref(cat, activeLicense)}
              className={`rounded border px-2.5 py-1 font-mono text-[10px] uppercase tracking-wider transition-colors ${
                activeCategory === cat
                  ? "border-accent bg-accent/10 text-accent"
                  : "border-border-subtle bg-bg-surface text-text-muted hover:border-text-muted"
              }`}
            >
              {CATEGORY_LABEL[cat]}
            </a>
          ))}
        </div>

        {/* Filter bar — License */}
        <div className="mb-6 flex flex-wrap items-center gap-2">
          <span className="font-mono text-[10px] uppercase tracking-wider text-text-muted">
            License:
          </span>
          <a
            href={filterHref(activeCategory, null)}
            className={`rounded border px-2.5 py-1 font-mono text-[10px] uppercase tracking-wider transition-colors ${
              !activeLicense
                ? "border-accent bg-accent/10 text-accent"
                : "border-border-subtle bg-bg-surface text-text-muted hover:border-text-muted"
            }`}
          >
            All
          </a>
          {ALL_LICENSES.map((lic) => (
            <a
              key={lic}
              href={filterHref(activeCategory, lic)}
              className={`rounded border px-2.5 py-1 font-mono text-[10px] uppercase tracking-wider transition-colors ${
                activeLicense === lic
                  ? "border-accent bg-accent/10 text-accent"
                  : "border-border-subtle bg-bg-surface text-text-muted hover:border-text-muted"
              }`}
            >
              {LICENSE_LABEL[lic]}
            </a>
          ))}
          <span className="ml-auto font-mono text-[10px] text-text-muted">
            {filteredDatasets.length} / {DATASETS_DATA.length} datasets
          </span>
        </div>

        {/* Dataset cards grid */}
        {filteredDatasets.length === 0 ? (
          <p className="rounded border border-border-subtle bg-bg-surface p-6 text-sm text-text-muted">
            No datasets match the selected filters.
          </p>
        ) : (
          <ul className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {filteredDatasets.map((d) => (
              <li key={d.slug} id={d.slug}>
                <article className="flex h-full flex-col rounded border border-border-subtle bg-bg-surface p-5 hover:bg-bg-elevated transition-colors">
                  {/* Top badge row */}
                  <div className="flex flex-wrap items-center gap-2">
                    {/* Category badge */}
                    <span className="rounded border border-border-subtle bg-bg-elevated px-2 py-0.5 font-mono text-[9px] uppercase tracking-wider text-text-muted">
                      {CATEGORY_LABEL[d.category]}
                    </span>
                    {/* Format badges */}
                    {d.formats.map((fmt) => (
                      <span
                        key={fmt}
                        className="rounded border border-border-subtle bg-bg-elevated px-2 py-0.5 font-mono text-[9px] uppercase tracking-wider text-text-muted"
                      >
                        {FORMAT_LABEL[fmt]}
                      </span>
                    ))}
                    {/* License badge */}
                    <span
                      className={`ml-auto rounded border px-2 py-0.5 font-mono text-[9px] uppercase tracking-wider ${LICENSE_COLOR[d.license]}`}
                    >
                      {LICENSE_LABEL[d.license]}
                    </span>
                  </div>

                  {/* Title + description */}
                  <h2 className="mt-3 text-base font-semibold text-text-primary">
                    {d.title}
                  </h2>
                  <p className="mt-1.5 text-sm text-text-secondary flex-1">
                    {d.description}
                  </p>

                  {/* Meta row */}
                  <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-1 font-mono text-[10px] text-text-muted">
                    <span>
                      <span className="text-text-muted/60">Records:</span>{" "}
                      {formatNumber(d.recordCount)}
                    </span>
                    <span>
                      <span className="text-text-muted/60">Size:</span> {d.size}
                    </span>
                    <span>
                      <span className="text-text-muted/60">Updated:</span>{" "}
                      {FREQ_LABEL[d.updateFrequency]}
                    </span>
                    <span>
                      <span className="text-text-muted/60">As of:</span>{" "}
                      {d.lastUpdated}
                    </span>
                  </div>

                  {/* API key notice */}
                  {d.requiresAuth && (
                    <div className="mt-3 flex items-center gap-1.5 font-mono text-[10px] text-amber-400">
                      <svg
                        className="h-3 w-3 shrink-0"
                        viewBox="0 0 16 16"
                        fill="currentColor"
                        aria-hidden="true"
                      >
                        <path d="M8 1a5 5 0 1 0 0 10A5 5 0 0 0 8 1zm0 8.5A3.5 3.5 0 1 1 8 2a3.5 3.5 0 0 1 0 7.5zM7 12h2v3H7z" />
                      </svg>
                      API key required
                    </div>
                  )}

                  {/* Action buttons */}
                  <div className="mt-4 flex flex-wrap items-center gap-2">
                    {d.requiresAuth ? (
                      <Link
                        href={`/contact?type=dataset-request&dataset=${d.slug}`}
                        className="inline-flex items-center rounded border border-accent/50 bg-accent/5 px-3 py-1.5 font-mono text-[11px] uppercase tracking-wider text-accent hover:border-accent hover:bg-accent/10"
                      >
                        Request access →
                      </Link>
                    ) : (
                      <a
                        href={`/data/${d.slug}.${d.formats[0]}`}
                        className="inline-flex items-center rounded border border-border-default bg-bg-elevated px-3 py-1.5 font-mono text-[11px] uppercase tracking-wider text-text-primary hover:border-accent hover:text-accent"
                      >
                        Download ↓
                      </a>
                    )}
                    <Link
                      href={localePath(locale, `/datasets/${d.slug}`)}
                      className="inline-flex items-center rounded border border-border-subtle px-3 py-1.5 font-mono text-[11px] uppercase tracking-wider text-text-muted hover:border-accent hover:text-accent"
                    >
                      Details →
                    </Link>
                  </div>
                </article>
              </li>
            ))}
          </ul>
        )}

        {/* "Request a dataset" CTA */}
        <div className="mt-8 rounded border border-border-subtle bg-bg-surface p-6">
          <h2 className="text-base font-semibold text-text-primary">
            Missing a dataset?
          </h2>
          <p className="mt-1 text-sm text-text-secondary">
            We accept dataset requests from verified researchers, journalists, and NGOs.
          </p>
          <Link
            href="/contact?type=dataset-request"
            className="mt-3 inline-block rounded bg-accent px-4 py-2 text-sm font-semibold text-black hover:bg-accent/90"
          >
            Request a dataset →
          </Link>
        </div>
      </section>
    </>
  );
}
