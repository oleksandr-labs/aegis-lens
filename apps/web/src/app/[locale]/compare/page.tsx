import Link from "next/link";
import type { Metadata } from "next";
import { urls } from "@aegis/url-builder";
import { ACTIVE_LOCALES, isLocale, type Locale } from "@aegis/i18n-config";
import { buildMetadata } from "@/lib/seo";
import { PageHeader } from "@/components/PageHeader";
import { getOblast, listOblasts, type OblastSeed } from "@/lib/oblasts-seed";
import { eventsInBbox } from "@/lib/events-seed";
import { timeAgo } from "@/lib/format";
import { SITE } from "@/lib/site";

type Params = { locale: string };
type SearchParams = { oblasts?: string; o?: string | string[] };

const COUNTRIES = ["ua", "pl", "de"] as const;
const MAX_COMPARE = 4;

export function generateStaticParams(): Array<{ locale: string }> {
  return ACTIVE_LOCALES.map((locale) => ({ locale }));
}

function oblastName(o: OblastSeed, locale: Locale): string {
  return o.name[locale] ?? o.name.en;
}

function parseOblasts(sp: SearchParams): OblastSeed[] {
  // Two accepted forms:
  //   ?oblasts=ua:donetsk-oblast,pl:mazowieckie     (canonical, comma-joined)
  //   ?o=ua:donetsk-oblast&o=pl:mazowieckie         (raw repeated form submission)
  const tuples: string[] = [];
  if (sp.oblasts) {
    for (const t of sp.oblasts.split(",")) tuples.push(t.trim());
  }
  if (sp.o) {
    const arr = Array.isArray(sp.o) ? sp.o : [sp.o];
    for (const t of arr) tuples.push(String(t).trim());
  }
  const out: OblastSeed[] = [];
  const seen = new Set<string>();
  for (const t of tuples) {
    if (!t) continue;
    if (out.length >= MAX_COMPARE) break;
    const [country, slug] = t.split(":");
    if (!country || !slug) continue;
    const key = `${country}:${slug}`;
    if (seen.has(key)) continue;
    const o = getOblast(country, slug);
    if (o) {
      out.push(o);
      seen.add(key);
    }
  }
  return out;
}

export async function generateMetadata({
  params,
  searchParams,
}: {
  params: Promise<Params>;
  searchParams: Promise<SearchParams>;
}): Promise<Metadata> {
  const { locale: raw } = await params;
  const sp = await searchParams;
  const locale = (isLocale(raw) ? raw : "en") as Locale;
  const oblasts = parseOblasts(sp);
  const labels = oblasts.map((o) => oblastName(o, locale));
  const title =
    labels.length > 0
      ? `Compare: ${labels.join(" vs ")}`
      : "Compare regions";
  const description =
    labels.length > 0
      ? `Side-by-side comparison of ${labels.join(", ")} — events, severity, top classes, and recent activity.`
      : "Pick 2 to 4 oblasts or regions to compare events, severity, and recent activity side by side.";
  return buildMetadata({
    locale,
    title,
    description,
    pathFor: (lc) => {
      const base = lc === "en" ? "/compare" : `/${lc}/compare`;
      return sp.oblasts ? `${base}?oblasts=${sp.oblasts}` : base;
    },
  });
}

export default async function ComparePage({
  params,
  searchParams,
}: {
  params: Promise<Params>;
  searchParams: Promise<SearchParams>;
}) {
  const { locale: raw } = await params;
  const sp = await searchParams;
  const locale = (isLocale(raw) ? raw : "en") as Locale;
  const oblasts = parseOblasts(sp);

  if (oblasts.length === 0) {
    return <ComparePicker locale={locale} />;
  }

  // Per-oblast stats
  const cols = oblasts.map((o) => {
    const events = eventsInBbox(o.bbox).slice().sort(
      (a, b) => Date.parse(b.occurredAt) - Date.parse(a.occurredAt),
    );
    const eventCount = events.length;
    const avgDanger = events.length
      ? Math.round(events.reduce((s, e) => s + e.dangerScore, 0) / events.length)
      : 0;
    const byClass = events.reduce<Record<string, number>>((acc, e) => {
      acc[e.class] = (acc[e.class] ?? 0) + 1;
      return acc;
    }, {});
    const topClasses = Object.entries(byClass)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3);
    return { o, events, eventCount, avgDanger, topClasses };
  });

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: `Compare: ${cols.map((c) => oblastName(c.o, locale)).join(" vs ")}`,
    url: `${SITE.url}${locale === "en" ? "/compare" : `/${locale}/compare`}?oblasts=${sp.oblasts ?? ""}`,
    mainEntity: {
      "@type": "ItemList",
      itemListElement: cols.map((c, i) => ({
        "@type": "ListItem",
        position: i + 1,
        item: {
          "@type": "Place",
          name: oblastName(c.o, locale),
          address: {
            "@type": "PostalAddress",
            addressCountry: c.o.iso2.toUpperCase(),
            addressRegion: oblastName(c.o, locale),
          },
          geo: {
            "@type": "GeoCoordinates",
            latitude: c.o.center[1],
            longitude: c.o.center[0],
          },
        },
      })),
    },
  };

  return (
    <article className="mx-auto max-w-7xl px-4 py-10">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <PageHeader
        eyebrow="Compare"
        title={`Compare ${cols.length} region${cols.length === 1 ? "" : "s"}`}
        description="Side-by-side metrics drawn from current events within each administrative bounding box."
      />

      {/* Comparison table */}
      <section className="mt-6 overflow-x-auto rounded border border-border-subtle bg-bg-surface">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="border-b border-border-subtle">
              <th
                scope="col"
                className="sticky left-0 z-10 min-w-[160px] bg-bg-surface px-4 py-3 text-left font-mono text-[10px] uppercase tracking-widest text-text-muted"
              >
                Metric
              </th>
              {cols.map((c) => (
                <th
                  key={`${c.o.iso2}:${c.o.slug}`}
                  scope="col"
                  className="min-w-[180px] border-l border-border-subtle px-4 py-3 text-left"
                >
                  <Link
                    href={urls.region(locale, c.o.iso2, c.o.slug)}
                    className="block text-text-primary hover:text-accent"
                  >
                    <div className="font-mono text-[10px] uppercase tracking-wider text-text-muted">
                      {c.o.iso2.toUpperCase()} · {c.o.kindLabel}
                    </div>
                    <div className="mt-0.5 text-base font-semibold">
                      {oblastName(c.o, locale)}
                    </div>
                  </Link>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            <Row label="Capital" cols={cols} render={(c) => c.o.capital} />
            <Row
              label="Center"
              cols={cols}
              render={(c) => (
                <span className="font-mono text-xs text-text-secondary">
                  {c.o.center[1].toFixed(2)}, {c.o.center[0].toFixed(2)}
                </span>
              )}
            />
            <Row
              label="Events"
              cols={cols}
              render={(c) => (
                <span className="text-lg text-text-primary">{c.eventCount}</span>
              )}
            />
            <Row
              label="Avg danger"
              cols={cols}
              render={(c) => (
                <span className="text-lg text-text-primary">{c.avgDanger}/100</span>
              )}
            />
            <Row
              label="Top classes"
              cols={cols}
              render={(c) =>
                c.topClasses.length === 0 ? (
                  <span className="text-text-muted">—</span>
                ) : (
                  <ul className="space-y-1">
                    {c.topClasses.map(([cls, n]) => (
                      <li
                        key={cls}
                        className="flex items-center justify-between gap-2 font-mono text-[11px]"
                      >
                        <span className="text-text-secondary">{cls}</span>
                        <span className="text-text-muted">{n}</span>
                      </li>
                    ))}
                  </ul>
                )
              }
            />
            <Row
              label="Latest events"
              cols={cols}
              render={(c) =>
                c.events.length === 0 ? (
                  <span className="text-text-muted">No recent events.</span>
                ) : (
                  <ul className="space-y-2">
                    {c.events.slice(0, 3).map((e) => (
                      <li key={e.eventId}>
                        <Link
                          href={urls.event(locale, e.eventId)}
                          className="block hover:text-accent"
                        >
                          <div className="font-mono text-[10px] uppercase tracking-wider text-text-muted">
                            {e.class} · {timeAgo(e.occurredAt, locale)}
                          </div>
                          <div className="mt-0.5 line-clamp-2 text-xs text-text-primary">
                            {e.summary[locale] ?? e.summary.en}
                          </div>
                        </Link>
                      </li>
                    ))}
                  </ul>
                )
              }
            />
            <Row
              label="Page"
              cols={cols}
              render={(c) => (
                <Link
                  href={urls.region(locale, c.o.iso2, c.o.slug)}
                  className="font-mono text-xs text-accent hover:underline"
                >
                  View detail →
                </Link>
              )}
            />
          </tbody>
        </table>
      </section>

      <div className="mt-6">
        <Link
          href={locale === "en" ? "/compare" : `/${locale}/compare`}
          className="font-mono text-xs text-text-muted hover:text-text-primary"
        >
          ← Change selection
        </Link>
      </div>
    </article>
  );
}

function Row({
  label,
  cols,
  render,
}: {
  label: string;
  cols: Array<{
    o: OblastSeed;
    events: ReturnType<typeof eventsInBbox>;
    eventCount: number;
    avgDanger: number;
    topClasses: Array<[string, number]>;
  }>;
  render: (c: {
    o: OblastSeed;
    events: ReturnType<typeof eventsInBbox>;
    eventCount: number;
    avgDanger: number;
    topClasses: Array<[string, number]>;
  }) => React.ReactNode;
}) {
  return (
    <tr className="border-t border-border-subtle align-top">
      <th
        scope="row"
        className="sticky left-0 z-10 bg-bg-surface px-4 py-3 text-left font-mono text-[10px] uppercase tracking-widest text-text-muted"
      >
        {label}
      </th>
      {cols.map((c) => (
        <td
          key={`${c.o.iso2}:${c.o.slug}:${label}`}
          className="border-l border-border-subtle px-4 py-3 text-text-secondary"
        >
          {render(c)}
        </td>
      ))}
    </tr>
  );
}

function ComparePicker({ locale }: { locale: Locale }) {
  const action = locale === "en" ? "/compare" : `/${locale}/compare`;
  const groups = COUNTRIES.map((country) => ({
    country,
    items: listOblasts(country),
  }));

  return (
    <article className="mx-auto max-w-7xl px-4 py-10">
      <PageHeader
        eyebrow="Compare"
        title="Compare regions side by side"
        description="Pick 2 to 4 oblasts, voivodeships, or Bundesländer to compare events, severity, and recent activity."
      />

      <form
        method="GET"
        action={action}
        className="mt-6 rounded border border-border-subtle bg-bg-surface p-4"
      >
        <p className="font-mono text-[10px] uppercase tracking-widest text-text-muted">
          Select up to {MAX_COMPARE} — the first {MAX_COMPARE} are used if more are checked
        </p>

        <div className="mt-4 grid gap-6 md:grid-cols-3">
          {groups.map((g) => (
            <div key={g.country}>
              <h2 className="font-mono text-[11px] uppercase tracking-wider text-text-primary">
                {g.country.toUpperCase()}
              </h2>
              <ul className="mt-2 max-h-[420px] space-y-1 overflow-y-auto pr-2">
                {g.items.map((o) => (
                  <li key={`${o.iso2}:${o.slug}`}>
                    <label className="flex cursor-pointer items-center gap-2 rounded px-2 py-1 text-sm text-text-secondary hover:bg-bg-elevated hover:text-text-primary">
                      <input
                        type="checkbox"
                        name="o"
                        value={`${o.iso2}:${o.slug}`}
                        className="h-3.5 w-3.5 accent-accent"
                      />
                      <span>{oblastName(o, locale)}</span>
                    </label>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-6 flex items-center justify-end">
          <button
            type="submit"
            className="rounded border border-border-default bg-bg-elevated px-4 py-2 text-sm text-text-primary hover:border-accent hover:text-accent"
          >
            Compare →
          </button>
        </div>
      </form>
    </article>
  );
}
