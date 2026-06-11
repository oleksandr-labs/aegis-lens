import Link from "next/link";
import type { Metadata } from "next";
import { urls, localePath } from "@aegis/url-builder";
import { ACTIVE_LOCALES, isLocale, type Locale } from "@aegis/i18n-config";
import { buildMetadata } from "@/lib/seo";
import { PageHeader } from "@/components/PageHeader";
import { listCaseStudies } from "@/lib/case-studies-seed";
import { SITE } from "@/lib/site";

export function generateStaticParams() {
  return ACTIVE_LOCALES.map((locale) => ({ locale }));
}

const TITLE = "Case studies";
const DESCRIPTION =
  "Anonymized customer stories — how defense ministries, investigative newsrooms, humanitarian NGOs, compliance teams, and energy utilities use Aegis Lens in production.";

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
    pathFor: (lc) => localePath(lc, "/case-studies"),
  });
}

export default async function CaseStudiesIndexPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: raw } = await params;
  const locale = (isLocale(raw) ? raw : "en") as Locale;
  const studies = listCaseStudies();

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: TITLE,
    description: DESCRIPTION,
    url: `${SITE.url}${localePath(locale, "/case-studies")}`,
    isPartOf: { "@type": "WebSite", url: SITE.url, name: SITE.name },
    mainEntity: {
      "@type": "ItemList",
      numberOfItems: studies.length,
      itemListElement: studies.map((c, idx) => ({
        "@type": "ListItem",
        position: idx + 1,
        url: `${SITE.url}${urls.caseStudy(locale, c.slug)}`,
        name: c.client,
      })),
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <PageHeader eyebrow="Customer stories" title={TITLE} description={DESCRIPTION} />
      <section className="mx-auto max-w-5xl px-4 py-10">
        <p className="mb-6 text-sm text-text-secondary">
          Case studies are anonymized by design — customer names are withheld unless
          publicly disclosed. Metrics are accurate; client identities are not.
        </p>
        <ul className="grid grid-cols-1 gap-3 md:grid-cols-2">
          {studies.map((c) => (
            <li key={c.slug}>
              <Link
                href={urls.caseStudy(locale, c.slug)}
                className="block h-full rounded border border-border-subtle bg-bg-surface p-4 hover:bg-bg-elevated"
              >
                <div className="flex flex-wrap items-center gap-2 font-mono text-[10px] uppercase tracking-wider text-text-muted">
                  <span>{c.industry}</span>
                  <span>·</span>
                  <span>{c.region}</span>
                  <span>·</span>
                  <span>{c.publishedAt.slice(0, 7)}</span>
                </div>
                <h2 className="mt-2 text-base font-semibold text-text-primary">{c.client}</h2>
                <p className="mt-2 text-sm text-text-secondary">{c.oneLiner}</p>
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </>
  );
}
