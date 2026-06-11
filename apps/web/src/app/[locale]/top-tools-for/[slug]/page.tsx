import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { urls, localePath } from "@aegis/url-builder";
import { ACTIVE_LOCALES, isLocale, type Locale } from "@aegis/i18n-config";
import { buildMetadata } from "@/lib/seo";
import { PageHeader } from "@/components/PageHeader";
import { getIndustry, listIndustries } from "@/lib/industries";
import { SITE } from "@/lib/site";

type Params = { locale: string; slug: string };

const YEAR = new Date().getFullYear();
const TOP_N = 10;

export function generateStaticParams(): Params[] {
  const out: Params[] = [];
  for (const i of listIndustries()) {
    if (i.tools.length === 0) continue; // skip industries with no tools
    for (const lc of ACTIVE_LOCALES) out.push({ locale: lc, slug: i.slug });
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
  const ind = getIndustry(slug);
  if (!ind || ind.tools.length === 0) return { robots: { index: false } };
  return buildMetadata({
    locale,
    title: `Top ${ind.label} tools (${YEAR})`,
    description: `Curated list of ${Math.min(TOP_N, ind.tools.length)} ${ind.label} tools from the Aegis Lens directory. Methodology, region, and verification status for each.`,
    pathFor: (lc) => localePath(lc, `/top-tools-for/${ind.slug}`),
  });
}

export default async function TopToolsForIndustryPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { locale: raw, slug } = await params;
  const locale = (isLocale(raw) ? raw : "en") as Locale;
  const ind = getIndustry(slug);
  if (!ind || ind.tools.length === 0) notFound();

  // Ranking heuristic: verified entries first, then alphabetical.
  const ranked = ind.tools
    .slice()
    .sort((a, b) => {
      if (a.verified && !b.verified) return -1;
      if (!a.verified && b.verified) return 1;
      return a.name.localeCompare(b.name);
    })
    .slice(0, TOP_N);

  const pageUrl = `${SITE.url}${localePath(locale, `/top-tools-for/${ind.slug}`)}`;
  const lastReviewedAt = new Date().toISOString().slice(0, 10);

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "ItemList",
        name: `Top ${ind.label} tools (${YEAR})`,
        numberOfItems: ranked.length,
        itemListOrder: "Descending",
        url: pageUrl,
        itemListElement: ranked.map((t, idx) => ({
          "@type": "ListItem",
          position: idx + 1,
          name: t.name,
          url: `${SITE.url}${urls.toolDetail(locale, t.slug)}`,
        })),
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          {
            "@type": "ListItem",
            position: 1,
            name: "Industries",
            item: `${SITE.url}${urls.industries(locale)}`,
          },
          {
            "@type": "ListItem",
            position: 2,
            name: ind.label,
            item: `${SITE.url}${urls.industry(locale, ind.slug)}`,
          },
          {
            "@type": "ListItem",
            position: 3,
            name: `Top tools (${YEAR})`,
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

      <article className="mx-auto max-w-3xl px-4 py-10">
        <nav className="font-mono text-[11px] text-text-muted" aria-label="Breadcrumb">
          <Link href={urls.industries(locale)} className="hover:text-text-primary">
            Industries
          </Link>
          <span className="mx-2 text-border-default">/</span>
          <Link
            href={urls.industry(locale, ind.slug)}
            className="hover:text-text-primary"
          >
            {ind.label}
          </Link>
          <span className="mx-2 text-border-default">/</span>
          <span className="text-text-secondary">Top tools ({YEAR})</span>
        </nav>

        <PageHeader
          eyebrow={`Best of ${YEAR}`}
          title={`Top ${ind.label} tools`}
          description={`${ranked.length} hand-picked tools from the Aegis Lens directory in the ${ind.label} category. Listed by verification first, then alphabetically.`}
        />

        <section className="mt-6 rounded border border-border-subtle bg-bg-surface p-4 text-sm">
          <div className="font-mono text-[10px] uppercase tracking-wider text-text-muted">
            Methodology
          </div>
          <p className="mt-2 text-text-secondary">
            Inclusion: any tool in the public Aegis Lens directory with a verified or
            unverified-but-active listing in the {ind.label} category. Ordering: verified
            entries first, then alphabetical by name. We do not accept paid placement on
            this list — see{" "}
            <Link href={urls.methodology(locale)} className="text-accent hover:underline">
              methodology
            </Link>
            .
          </p>
          <p className="mt-2 text-xs text-text-muted">
            Last reviewed: {lastReviewedAt} · Refreshes quarterly or whenever a new
            directory entry is added.
          </p>
        </section>

        <section className="mt-8">
          <ol className="space-y-3">
            {ranked.map((t, idx) => (
              <li
                key={t.slug}
                className="flex gap-4 rounded border border-border-subtle bg-bg-surface p-4"
              >
                <div className="flex-none font-mono text-2xl font-semibold text-accent">
                  {String(idx + 1).padStart(2, "0")}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <Link
                      href={urls.toolDetail(locale, t.slug)}
                      className="text-base font-semibold text-text-primary hover:text-accent"
                    >
                      {t.name}
                    </Link>
                    {t.verified && (
                      <span className="rounded border border-green-500/40 bg-green-500/10 px-1.5 py-0.5 font-mono text-[9px] uppercase text-green-300">
                        verified
                      </span>
                    )}
                    <span className="font-mono text-[10px] uppercase text-text-muted">
                      {t.region}
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-text-secondary line-clamp-2">
                    {t.description}
                  </p>
                  <div className="mt-2 flex flex-wrap gap-3 font-mono text-[10px] uppercase tracking-wider">
                    <Link
                      href={urls.alternatives(locale, t.slug)}
                      className="text-accent hover:underline"
                    >
                      alternatives →
                    </Link>
                    <Link
                      href={urls.toolDetail(locale, t.slug)}
                      className="text-text-muted hover:text-text-primary"
                    >
                      detail →
                    </Link>
                  </div>
                </div>
              </li>
            ))}
          </ol>
        </section>

        <section className="mt-10 border-t border-border-subtle pt-6">
          <h2 className="text-base font-semibold text-text-primary">Other industries</h2>
          <ul className="mt-3 flex flex-wrap gap-2">
            {listIndustries()
              .filter((x) => x.slug !== ind.slug && x.tools.length > 0)
              .slice(0, 8)
              .map((r) => (
                <li key={r.slug}>
                  <Link
                    href={urls.topToolsForIndustry(locale, r.slug)}
                    className="inline-flex items-center gap-2 rounded border border-border-subtle bg-bg-surface px-3 py-1.5 text-xs text-text-secondary hover:bg-bg-elevated hover:text-text-primary"
                  >
                    <span>Top {r.label} tools</span>
                    <span className="font-mono text-[10px] text-text-muted">
                      {r.tools.length}
                    </span>
                  </Link>
                </li>
              ))}
          </ul>
        </section>
      </article>
    </>
  );
}
