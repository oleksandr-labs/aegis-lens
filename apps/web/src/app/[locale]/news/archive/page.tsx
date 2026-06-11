import Link from "next/link";
import type { Metadata } from "next";
import { urls, localePath } from "@aegis/url-builder";
import { ACTIVE_LOCALES, isLocale, type Locale } from "@aegis/i18n-config";
import { buildMetadata } from "@/lib/seo";
import { PageHeader } from "@/components/PageHeader";
import { eventYears, eventsInYear } from "@/lib/news-archive";
import { SITE } from "@/lib/site";

export function generateStaticParams() {
  return ACTIVE_LOCALES.map((locale) => ({ locale }));
}

const TITLE = "News archive";
const DESCRIPTION =
  "Browse Aegis Lens verified events by year and month. Each year roll-up cross-links to its year-in-review.";

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
    pathFor: (lc) => localePath(lc, "/news/archive"),
  });
}

export default async function NewsArchiveIndexPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: raw } = await params;
  const locale = (isLocale(raw) ? raw : "en") as Locale;
  const years = eventYears();

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: TITLE,
    description: DESCRIPTION,
    url: `${SITE.url}${localePath(locale, "/news/archive")}`,
    isPartOf: { "@type": "WebSite", url: SITE.url, name: SITE.name },
    mainEntity: {
      "@type": "ItemList",
      numberOfItems: years.length,
      itemListElement: years.map((y, idx) => ({
        "@type": "ListItem",
        position: idx + 1,
        url: `${SITE.url}${urls.newsArchiveYear(locale, y)}`,
        name: String(y),
      })),
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <PageHeader eyebrow="Archive" title={TITLE} description={DESCRIPTION} />
      <section className="mx-auto max-w-3xl px-4 py-10">
        <ul className="grid grid-cols-1 gap-3">
          {years.map((y) => {
            const count = eventsInYear(y).length;
            return (
              <li key={y}>
                <Link
                  href={urls.newsArchiveYear(locale, y)}
                  className="flex items-center justify-between rounded border border-border-subtle bg-bg-surface px-4 py-3 hover:bg-bg-elevated"
                >
                  <span className="text-lg font-semibold text-text-primary">{y}</span>
                  <span className="flex items-center gap-3">
                    <span className="font-mono text-[11px] text-text-muted">
                      {count} {count === 1 ? "event" : "events"}
                    </span>
                    <Link
                      href={urls.bestOfYear(locale, y)}
                      className="font-mono text-[10px] uppercase tracking-wider text-accent hover:underline"
                    >
                      year in review →
                    </Link>
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      </section>
    </>
  );
}
