import type { Metadata } from "next";
import Link from "next/link";
import { localePath } from "@aegis/url-builder";
import { ACTIVE_LOCALES, isLocale, type Locale } from "@aegis/i18n-config";
import { buildMetadata } from "@/lib/seo";
import { PageHeader } from "@/components/PageHeader";
import { eventYearMonths, eventsInMonth, monthName, monthSlug } from "@/lib/news-archive";
import { SITE } from "@/lib/site";

export function generateStaticParams() {
  return ACTIVE_LOCALES.map((locale) => ({ locale }));
}

const TITLE = "Event archive";
const DESCRIPTION =
  "Browse all verified Aegis Lens events by year and month. Each month links to the full event list and to available regional breakdowns.";

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
    pathFor: (lc) => localePath(lc, "/archive"),
  });
}

export default async function ArchiveIndexPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: raw } = await params;
  const locale = (isLocale(raw) ? raw : "en") as Locale;

  const months = eventYearMonths();

  const byYear = months.reduce<Record<number, typeof months>>((acc, ym) => {
    (acc[ym.year] ??= []).push(ym);
    return acc;
  }, {});
  const years = Object.keys(byYear)
    .map(Number)
    .sort((a, b) => b - a);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: TITLE,
    description: DESCRIPTION,
    url: `${SITE.url}${localePath(locale, "/archive")}`,
    isPartOf: { "@type": "WebSite", url: SITE.url, name: SITE.name },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <PageHeader eyebrow="Archive" title={TITLE} description={DESCRIPTION} />
      <section className="mx-auto max-w-4xl px-4 py-10 space-y-10">
        {years.map((year) => (
          <div key={year}>
            <h2 className="text-lg font-semibold text-text-primary">{year}</h2>
            <ul className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4">
              {(byYear[year] ?? []).map((ym) => {
                const count = eventsInMonth(ym.year, ym.month).length;
                const href = localePath(
                  locale,
                  `/archive/${ym.year}/${monthSlug(ym.month)}`,
                );
                return (
                  <li key={`${ym.year}-${ym.month}`}>
                    <Link
                      href={href}
                      className="flex items-center justify-between rounded border border-border-subtle bg-bg-surface px-3 py-2 hover:bg-bg-elevated"
                    >
                      <span className="text-sm text-text-primary">
                        {monthName(ym.month)}
                      </span>
                      <span className="font-mono text-[10px] text-text-muted">{count}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </section>
    </>
  );
}
