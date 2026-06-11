import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { urls } from "@aegis/url-builder";
import { ACTIVE_LOCALES, isLocale, type Locale } from "@aegis/i18n-config";
import { buildMetadata } from "@/lib/seo";
import { PageHeader } from "@/components/PageHeader";
import { MiniMap } from "@/components/Map/MiniMap";
import { EventsPerHourSparkline } from "@/components/Sparkline";
import { getRegion } from "@/lib/regions-seed";
import { getOblast } from "@/lib/oblasts-seed";
import { getCity, listCities, CITIES } from "@/lib/cities-seed";
import { listEvents } from "@/lib/events-seed";
import { timeAgo } from "@/lib/format";
import { SITE } from "@/lib/site";

type Params = { locale: string; country: string; oblast: string; city: string };

export const dynamicParams = false;

export function generateStaticParams(): Params[] {
  const out: Params[] = [];
  for (const c of CITIES) {
    for (const lc of ACTIVE_LOCALES) {
      out.push({ locale: lc, country: c.iso2, oblast: c.oblastSlug, city: c.slug });
    }
  }
  return out;
}

function name(c: ReturnType<typeof getCity>, locale: Locale): string {
  if (!c) return "";
  return c.name[locale] ?? c.name.en;
}

function cityHref(locale: Locale, p: { iso2: string; oblastSlug: string; slug: string }): string {
  const path = `/regions/${p.iso2}/${p.oblastSlug}/${p.slug}`;
  return locale === "en" ? path : `/${locale}${path}`;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { locale: raw, country, oblast, city } = await params;
  const locale = (isLocale(raw) ? raw : "en") as Locale;
  const c = getCity(country, oblast, city);
  if (!c) return { robots: { index: false } };
  const label = name(c, locale);
  return buildMetadata({
    locale,
    title: label,
    description: `Verified events, infrastructure, and recent activity in ${label}.`,
    pathFor: (lc) => cityHref(lc, c),
  });
}

export default async function CityPage({ params }: { params: Promise<Params> }) {
  const { locale: raw, country, oblast, city } = await params;
  const locale = (isLocale(raw) ? raw : "en") as Locale;
  const c = getCity(country, oblast, city);
  if (!c) notFound();
  const parentOblast = getOblast(country, oblast);
  const parentCountry = getRegion(country);

  const label = name(c, locale);

  // Events within ~30km radius — cheap rectangular approximation.
  const RADIUS_DEG = 0.3;
  const events = listEvents().filter((e) => {
    const dLon = Math.abs(e.location.lon - c.center[0]);
    const dLat = Math.abs(e.location.lat - c.center[1]);
    return dLon <= RADIUS_DEG && dLat <= RADIUS_DEG;
  });

  const severity = events.length
    ? Math.round(events.reduce((s, e) => s + e.dangerScore, 0) / events.length)
    : 0;
  const byClass = events.reduce<Record<string, number>>((acc, e) => {
    acc[e.class] = (acc[e.class] ?? 0) + 1;
    return acc;
  }, {});
  const topClass = Object.entries(byClass).sort((a, b) => b[1] - a[1])[0]?.[0];

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "City",
        name: label,
        geo: { "@type": "GeoCoordinates", latitude: c.center[1], longitude: c.center[0] },
        ...(c.population ? { populationStatistics: c.population } : {}),
        containedInPlace: parentOblast
          ? {
              "@type": "Place",
              name: parentOblast.name[locale] ?? parentOblast.name.en,
            }
          : undefined,
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          {
            "@type": "ListItem",
            position: 1,
            name: parentCountry?.name[locale] ?? parentCountry?.name.en ?? country.toUpperCase(),
            item: `${SITE.url}${urls.region(locale, country)}`,
          },
          {
            "@type": "ListItem",
            position: 2,
            name: parentOblast?.name[locale] ?? parentOblast?.name.en ?? oblast,
            item: `${SITE.url}${
              locale === "en"
                ? `/regions/${country}/${oblast}`
                : `/${locale}/regions/${country}/${oblast}`
            }`,
          },
          { "@type": "ListItem", position: 3, name: label },
        ],
      },
    ],
  };

  const siblings = listCities(country, oblast).filter((x) => x.slug !== c.slug);

  return (
    <article className="mx-auto max-w-4xl px-4 py-10">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <nav className="font-mono text-[11px] text-text-muted" aria-label="Breadcrumb">
        <Link href={urls.region(locale, country)} className="hover:text-text-primary">
          {parentCountry?.name[locale] ?? parentCountry?.name.en ?? country.toUpperCase()}
        </Link>
        <span className="mx-2 text-border-default">/</span>
        <Link
          href={
            locale === "en"
              ? `/regions/${country}/${oblast}`
              : `/${locale}/regions/${country}/${oblast}`
          }
          className="hover:text-text-primary"
        >
          {parentOblast?.name[locale] ?? parentOblast?.name.en ?? oblast}
        </Link>
        <span className="mx-2 text-border-default">/</span>
        <span className="text-text-secondary">{label}</span>
      </nav>

      <PageHeader
        eyebrow={c.capital ? "Oblast capital" : "City"}
        title={label}
        description={
          c.population
            ? `Population: ${c.population.toLocaleString("en-US")}. Events monitored within ~30 km radius.`
            : "Events monitored within ~30 km radius."
        }
      />

      <section className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <Kpi label="Events" value={String(events.length)} />
        <Kpi label="Severity" value={`${severity}/100`} />
        <Kpi label="Top class" value={topClass ?? "—"} />
        <Kpi label="Slug" value={c.slug} mono />
      </section>

      <section className="mt-8">
        <EventsPerHourSparkline events={events} hours={24} />
      </section>

      <section className="mt-6">
        <MiniMap center={c.center} zoom={10} events={events} height={300} />
      </section>

      <section className="mt-8">
        <h2 className="text-xl font-semibold text-text-primary">Recent events</h2>
        {events.length === 0 ? (
          <div className="mt-3 rounded border border-border-subtle bg-bg-surface p-6 text-sm text-text-muted">
            No events in this city right now.
          </div>
        ) : (
          <ul className="mt-3 divide-y divide-border-subtle rounded border border-border-subtle bg-bg-surface">
            {events.slice(0, 10).map((e) => (
              <li key={e.eventId} className="px-4 py-3">
                <Link href={urls.event(locale, e.eventId)} className="block">
                  <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-wider text-text-muted">
                    <span>{e.class}</span>
                    <span>·</span>
                    <span>{e.subclass}</span>
                    <span>·</span>
                    <span>{timeAgo(e.occurredAt, locale)}</span>
                  </div>
                  <div className="mt-1 text-sm text-text-primary">
                    {e.summary[locale] ?? e.summary.en}
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>

      {siblings.length > 0 && (
        <section className="mt-10">
          <h2 className="text-xl font-semibold text-text-primary">Other cities nearby</h2>
          <ul className="mt-3 grid grid-cols-2 gap-2 md:grid-cols-3">
            {siblings.map((s) => (
              <li key={s.slug}>
                <Link
                  href={cityHref(locale, s)}
                  className="block rounded border border-border-subtle bg-bg-surface px-3 py-2 text-sm text-text-secondary hover:bg-bg-elevated hover:text-text-primary"
                >
                  {name(s, locale)}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}
    </article>
  );
}

function Kpi({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="rounded border border-border-subtle bg-bg-surface p-3">
      <div className="font-mono text-[10px] uppercase tracking-widest text-text-muted">{label}</div>
      <div className={`mt-1 text-lg ${mono ? "font-mono" : ""} text-text-primary`}>{value}</div>
    </div>
  );
}
