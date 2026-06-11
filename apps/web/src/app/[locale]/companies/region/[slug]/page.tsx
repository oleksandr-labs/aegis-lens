import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { urls, localePath } from "@aegis/url-builder";
import { ACTIVE_LOCALES, isLocale, type Locale } from "@aegis/i18n-config";
import { buildMetadata } from "@/lib/seo";
import { PageHeader } from "@/components/PageHeader";
import { COMPANIES } from "@/lib/directory-seed";
import { industrySlug } from "@/lib/industries";
import { SITE } from "@/lib/site";

type Params = { locale: string; slug: string };

const REGION_LABEL: Record<string, string> = {
  ua: "Ukraine",
  pl: "Poland",
  de: "Germany",
  eu: "European Union",
  us: "United States",
  uk: "United Kingdom",
  ca: "Canada",
};

function regionSlugFor(raw: string): string {
  return raw
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function listRegionSlugs(): string[] {
  const set = new Set<string>();
  for (const c of COMPANIES) {
    const s = regionSlugFor(c.region);
    if (s && s !== "-") set.add(s);
  }
  return [...set];
}

function companiesInRegion(slug: string) {
  return COMPANIES.filter((c) => regionSlugFor(c.region) === slug);
}

function regionDisplayLabel(slug: string): string {
  // Find canonical region string from any company in this region.
  const sample = COMPANIES.find((c) => regionSlugFor(c.region) === slug);
  const raw = sample?.region ?? slug;
  return REGION_LABEL[slug] ?? raw.toUpperCase();
}

export function generateStaticParams(): Params[] {
  const out: Params[] = [];
  for (const s of listRegionSlugs()) {
    for (const lc of ACTIVE_LOCALES) out.push({ locale: lc, slug: s });
  }
  return out;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { locale: raw, slug } = await params;
  const locale = (isLocale(raw) ? raw : "en") as Locale;
  const items = companiesInRegion(slug);
  if (items.length === 0) return { robots: { index: false } };
  const label = regionDisplayLabel(slug);
  return buildMetadata({
    locale,
    title: `Companies in ${label}`,
    description: `${items.length} companies in ${label} from the Aegis Lens directory across OSINT, cybersecurity, geospatial, satellite, and verification.`,
    pathFor: (lc) => localePath(lc, `/companies/region/${slug}`),
  });
}

export default async function CompaniesByRegionPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { locale: raw, slug } = await params;
  const locale = (isLocale(raw) ? raw : "en") as Locale;
  const items = companiesInRegion(slug);
  if (items.length === 0) notFound();

  const label = regionDisplayLabel(slug);
  const pageUrl = `${SITE.url}${localePath(locale, `/companies/region/${slug}`)}`;

  // Group by category for skimmability.
  const byCategory = new Map<string, typeof items>();
  for (const c of items) {
    const arr = byCategory.get(c.category) ?? [];
    arr.push(c);
    byCategory.set(c.category, arr);
  }

  const otherRegions = listRegionSlugs()
    .filter((s) => s !== slug)
    .map((s) => ({ slug: s, label: regionDisplayLabel(s), count: companiesInRegion(s).length }))
    .sort((a, b) => b.count - a.count);

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "CollectionPage",
        name: `Companies in ${label}`,
        description: `${items.length} companies in ${label} catalogued by Aegis Lens.`,
        url: pageUrl,
        inLanguage: locale,
        isPartOf: { "@type": "WebSite", url: SITE.url, name: SITE.name },
        mainEntity: {
          "@type": "ItemList",
          numberOfItems: items.length,
          itemListElement: items.map((c, idx) => ({
            "@type": "ListItem",
            position: idx + 1,
            url: `${SITE.url}${urls.companyDetail(locale, c.slug)}`,
            name: c.name,
          })),
        },
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          {
            "@type": "ListItem",
            position: 1,
            name: "Companies",
            item: `${SITE.url}${urls.companies(locale)}`,
          },
          {
            "@type": "ListItem",
            position: 2,
            name: label,
            item: pageUrl,
          },
        ],
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <article className="mx-auto max-w-5xl px-4 py-10">
        <nav className="font-mono text-[11px] text-text-muted" aria-label="Breadcrumb">
          <Link href={urls.companies(locale)} className="hover:text-text-primary">
            Companies
          </Link>
          <span className="mx-2 text-border-default">/</span>
          <span className="text-text-secondary">{label}</span>
        </nav>

        <PageHeader
          eyebrow="Directory by region"
          title={`Companies in ${label}`}
          description={`${items.length} companies catalogued in Aegis Lens across ${byCategory.size} industries.`}
        />

        <section className="mt-8 space-y-8">
          {[...byCategory.entries()]
            .sort((a, b) => b[1].length - a[1].length)
            .map(([category, arr]) => (
              <div key={category}>
                <div className="mb-3 flex items-center gap-2 border-b border-border-subtle pb-2">
                  <h2 className="font-mono text-xs uppercase tracking-wider text-text-primary">
                    {category}
                  </h2>
                  <span className="font-mono text-[10px] text-text-muted">
                    {arr.length} {arr.length === 1 ? "company" : "companies"}
                  </span>
                  <Link
                    href={urls.industry(locale, industrySlug(category))}
                    className="ml-auto font-mono text-[10px] text-accent hover:underline"
                  >
                    industry hub →
                  </Link>
                </div>
                <ul className="grid grid-cols-1 gap-2 md:grid-cols-2">
                  {arr.map((c) => (
                    <li key={c.slug}>
                      <Link
                        href={urls.companyDetail(locale, c.slug)}
                        className="block rounded border border-border-subtle bg-bg-surface px-3 py-2 text-sm hover:bg-bg-elevated"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-text-primary">{c.name}</span>
                          {c.verified && (
                            <span className="rounded border border-green-500/40 bg-green-500/10 px-1.5 py-0.5 font-mono text-[9px] uppercase text-green-300">
                              verified
                            </span>
                          )}
                        </div>
                        <p className="mt-1 text-xs text-text-secondary line-clamp-2">
                          {c.description}
                        </p>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
        </section>

        {otherRegions.length > 0 && (
          <section className="mt-10 border-t border-border-subtle pt-6">
            <h2 className="text-base font-semibold text-text-primary">Other regions</h2>
            <ul className="mt-3 flex flex-wrap gap-2">
              {otherRegions.map((r) => (
                <li key={r.slug}>
                  <Link
                    href={urls.companiesByRegion(locale, r.slug)}
                    className="inline-flex items-center gap-2 rounded border border-border-subtle bg-bg-surface px-3 py-1.5 text-xs text-text-secondary hover:bg-bg-elevated hover:text-text-primary"
                  >
                    <span>{r.label}</span>
                    <span className="font-mono text-[10px] text-text-muted">{r.count}</span>
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
