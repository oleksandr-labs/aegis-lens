import Link from "next/link";
import type { Metadata } from "next";
import { urls, localePath } from "@aegis/url-builder";
import { ACTIVE_LOCALES, isLocale, type Locale } from "@aegis/i18n-config";
import { buildMetadata } from "@/lib/seo";
import { PageHeader } from "@/components/PageHeader";
import { listIndustries, listFeaturedIndustries } from "@/lib/industries";
import { SITE } from "@/lib/site";

export function generateStaticParams() {
  return ACTIVE_LOCALES.map((locale) => ({ locale }));
}

const TITLE = "Industries";
const DESCRIPTION =
  "Browse the Aegis Lens directory by industry — OSINT, cybersecurity, geospatial, satellite, threat intel, verification, and more. Cross-references companies and tools.";

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
    pathFor: (lc) => localePath(lc, "/industries"),
  });
}

export default async function IndustriesIndexPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: raw } = await params;
  const locale = (isLocale(raw) ? raw : "en") as Locale;
  const industries = listIndustries();
  const featured = listFeaturedIndustries();
  const rest = industries.filter((i) => !i.featured);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: TITLE,
    description: DESCRIPTION,
    url: `${SITE.url}${localePath(locale, "/industries")}`,
    isPartOf: { "@type": "WebSite", url: SITE.url, name: SITE.name },
    mainEntity: {
      "@type": "ItemList",
      numberOfItems: industries.length,
      itemListElement: industries.map((i, idx) => ({
        "@type": "ListItem",
        position: idx + 1,
        url: `${SITE.url}${localePath(locale, `/industries/${i.slug}`)}`,
        name: i.label,
      })),
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <PageHeader eyebrow="Directory" title={TITLE} description={DESCRIPTION} />
      <section className="mx-auto max-w-5xl px-4 py-10 space-y-10">

        {/* Featured industries */}
        {featured.length > 0 && (
          <div>
            <p className="font-mono text-[10px] uppercase tracking-widest text-text-muted mb-4">
              Featured industries
            </p>
            <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {featured.map((i) => (
                <li key={i.slug}>
                  <Link
                    href={urls.industry(locale, i.slug)}
                    className="group flex h-full flex-col rounded border border-border-subtle bg-bg-surface p-4 transition hover:border-accent"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-semibold text-text-primary group-hover:text-accent">
                        {i.label}
                      </span>
                      <span className="shrink-0 rounded border border-accent/30 bg-accent/10 px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-wider text-accent">
                        Featured
                      </span>
                    </div>
                    {i.description && (
                      <p className="mt-2 text-xs text-text-secondary line-clamp-2 flex-1">
                        {i.description}
                      </p>
                    )}
                    <div className="mt-3 flex items-center justify-between">
                      <span className="font-mono text-[10px] text-text-muted">
                        {i.companies.length} co · {i.tools.length} tools
                      </span>
                      {i.useCaseVertical && (
                        <Link
                          href={localePath(locale, `/use-cases/${i.useCaseVertical}`)}
                          onClick={(e) => e.stopPropagation()}
                          className="font-mono text-[10px] text-accent hover:underline"
                        >
                          Use cases →
                        </Link>
                      )}
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* All other industries */}
        {rest.length > 0 && (
          <div>
            <p className="font-mono text-[10px] uppercase tracking-widest text-text-muted mb-4">
              All industries
            </p>
            <ul className="grid grid-cols-1 gap-2 md:grid-cols-2">
              {rest.map((i) => (
                <li key={i.slug}>
                  <Link
                    href={urls.industry(locale, i.slug)}
                    className="flex items-center justify-between rounded border border-border-subtle bg-bg-surface px-4 py-3 text-sm text-text-secondary hover:bg-bg-elevated hover:text-text-primary"
                  >
                    <span className="text-text-primary">{i.label}</span>
                    <span className="font-mono text-[10px] text-text-muted">
                      {i.companies.length} co · {i.tools.length} tools
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Cross-links */}
        <div className="rounded border border-border-subtle bg-bg-surface p-5">
          <p className="font-mono text-[10px] uppercase tracking-widest text-text-muted mb-3">
            Related
          </p>
          <div className="flex flex-wrap gap-3 text-sm">
            <Link
              href={localePath(locale, "/use-cases")}
              className="text-text-secondary hover:text-accent hover:underline"
            >
              Use cases by persona →
            </Link>
            <Link
              href={urls.tools(locale)}
              className="text-text-secondary hover:text-accent hover:underline"
            >
              All tools directory →
            </Link>
            <Link
              href={localePath(locale, "/compare")}
              className="text-text-secondary hover:text-accent hover:underline"
            >
              Compare tools →
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
