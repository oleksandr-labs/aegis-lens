import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { localePath } from "@aegis/url-builder";
import { ACTIVE_LOCALES, isLocale, type Locale } from "@aegis/i18n-config";
import { buildMetadata } from "@/lib/seo";
import { PageHeader } from "@/components/PageHeader";
import {
  eventYears,
  eventYearMonths,
  eventsInMonth,
  monthName,
  monthSlug,
  parseYearSlug,
} from "@/lib/news-archive";
import { SITE } from "@/lib/site";

type Params = { locale: string; year: string };

const MIN_EVENTS = 3;

export function generateStaticParams(): Params[] {
  const out: Params[] = [];
  for (const y of eventYears()) {
    for (const lc of ACTIVE_LOCALES) {
      out.push({ locale: lc, year: String(y) });
    }
  }
  return out;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { locale: raw, year } = await params;
  const locale = (isLocale(raw) ? raw : "en") as Locale;
  const y = parseYearSlug(year);
  if (!y) return { robots: { index: false } };
  return buildMetadata({
    locale,
    title: `${y} — event archive`,
    description: `All verified Aegis Lens events from ${y}, organized by month.`,
    pathFor: (lc) => localePath(lc, `/archive/${y}`),
  });
}

export default async function ArchiveYearPage({ params }: { params: Promise<Params> }) {
  const { locale: raw, year } = await params;
  const locale = (isLocale(raw) ? raw : "en") as Locale;
  const y = parseYearSlug(year);
  if (!y) notFound();

  const months = eventYearMonths().filter((ym) => ym.year === y);
  if (months.length === 0) notFound();

  const totalEvents = months.reduce((sum, ym) => sum + eventsInMonth(ym.year, ym.month).length, 0);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: `${y} — event archive`,
    url: `${SITE.url}${localePath(locale, `/archive/${y}`)}`,
    isPartOf: { "@type": "WebSite", url: SITE.url, name: SITE.name },
    dateCreated: `${y}-01-01`,
    temporalCoverage: `${y}-01-01/${y}-12-31`,
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <article className="mx-auto max-w-3xl px-4 py-10">
        <nav className="font-mono text-[11px] text-text-muted" aria-label="Breadcrumb">
          <Link href={localePath(locale, "/archive")} className="hover:text-text-primary">
            Archive
          </Link>
          <span className="mx-2 text-border-default">/</span>
          <span className="text-text-secondary">{y}</span>
        </nav>

        <PageHeader
          eyebrow="Year archive"
          title={String(y)}
          description={`${totalEvents} verified events in ${y}.`}
        />

        <ul className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3">
          {months.map((ym) => {
            const count = eventsInMonth(ym.year, ym.month).length;
            if (count < MIN_EVENTS) return null;
            return (
              <li key={`${ym.year}-${ym.month}`}>
                <Link
                  href={localePath(locale, `/archive/${ym.year}/${monthSlug(ym.month)}`)}
                  className="flex items-center justify-between rounded border border-border-subtle bg-bg-surface px-4 py-3 hover:bg-bg-elevated"
                >
                  <span className="text-sm text-text-primary">{monthName(ym.month)}</span>
                  <span className="font-mono text-[10px] text-text-muted">{count}</span>
                </Link>
              </li>
            );
          })}
        </ul>

        <div className="mt-8">
          <Link
            href={localePath(locale, "/archive")}
            className="font-mono text-xs text-text-muted hover:text-text-primary"
          >
            ← All years
          </Link>
        </div>
      </article>
    </>
  );
}
