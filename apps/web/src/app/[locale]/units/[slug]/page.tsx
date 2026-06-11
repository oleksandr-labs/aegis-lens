import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { localePath } from "@aegis/url-builder";
import { ACTIVE_LOCALES, isLocale, type Locale } from "@aegis/i18n-config";
import { buildMetadata } from "@/lib/seo";
import { PageHeader } from "@/components/PageHeader";
import { SITE } from "@/lib/site";
import {
  MILITARY_UNITS,
  COUNTRY_FLAG,
  COUNTRY_LABEL,
  UNIT_TYPE_LABEL,
  getUnit,
  getRelatedUnits,
} from "@/lib/units-data";

type Params = { locale: string; slug: string };

export function generateStaticParams(): Params[] {
  const out: Params[] = [];
  for (const unit of MILITARY_UNITS) {
    for (const lc of ACTIVE_LOCALES) {
      out.push({ locale: lc, slug: unit.slug });
    }
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
  const unit = getUnit(slug);
  if (!unit) return { robots: { index: false } };
  return buildMetadata({
    locale,
    title: `${unit.name} — Military Unit Profile`,
    description: unit.description,
    pathFor: (lc) => localePath(lc, `/units/${slug}`),
  });
}

// Hardcoded seed events per unit slug
const SEED_EVENTS: Record<string, { date: string; summary: string; class: string }[]> = {
  "ru-58th-combined-arms-army": [
    {
      date: "2022-03-12",
      summary: "58th CAA elements confirmed near Kherson by satellite imagery and open reporting.",
      class: "military_action",
    },
    {
      date: "2022-08-29",
      summary: "Ukrainian counter-offensive reportedly engaged 58th CAA rear logistics.",
      class: "military_action",
    },
    {
      date: "2023-05-04",
      summary:
        "ISW documented 58th CAA involvement in defensive operations in southern sector.",
      class: "military_action",
    },
  ],
  "ru-1st-guards-tank-army": [
    {
      date: "2022-02-24",
      summary: "1st GTA units entered Ukraine from the north on the first day of the full-scale invasion.",
      class: "military_action",
    },
    {
      date: "2022-04-02",
      summary: "1st GTA reportedly withdrew from Kyiv Oblast following failed assault.",
      class: "military_action",
    },
    {
      date: "2022-09-11",
      summary: "Elements of 1st GTA repositioned to eastern front following Kharkiv offensive.",
      class: "military_action",
    },
  ],
  "ua-3rd-separate-assault-brigade": [
    {
      date: "2023-01-15",
      summary: "3rd SAB publicly acknowledged operations in Bakhmut direction.",
      class: "military_action",
    },
    {
      date: "2023-06-10",
      summary: "Unit participated in documented counter-offensive operations.",
      class: "military_action",
    },
    {
      date: "2024-02-17",
      summary: "3rd SAB commander gave public interview confirming unit's defensive posture.",
      class: "military_action",
    },
  ],
  "ua-air-command-center": [
    {
      date: "2022-02-25",
      summary: "Ukrainian Air Force confirmed operational and conducting defensive sorties.",
      class: "aviation",
    },
    {
      date: "2023-08-04",
      summary: "Air Force Command announced first F-16 integration into operational squadrons.",
      class: "aviation",
    },
    {
      date: "2024-01-10",
      summary: "Air defense coordination attributed to Air Force Command during major missile wave.",
      class: "military_action",
    },
  ],
};

const STATUS_DOT: Record<string, string> = {
  active: "bg-green-500",
  inactive: "bg-neutral-500",
  unknown: "bg-yellow-500",
  destroyed: "bg-red-500",
};

const CONFIDENCE_BADGE: Record<string, string> = {
  high: "text-green-400 border-green-500/30 bg-green-500/10",
  medium: "text-yellow-400 border-yellow-500/30 bg-yellow-500/10",
  low: "text-red-400 border-red-500/30 bg-red-500/10",
};

export default async function UnitDetailPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { locale: raw, slug } = await params;
  const locale = (isLocale(raw) ? raw : "en") as Locale;
  const unit = getUnit(slug);
  if (!unit) notFound();

  const relatedUnits = getRelatedUnits(unit);
  const seedEvents = SEED_EVENTS[unit.slug] ?? [];
  const pageUrl = `${SITE.url}${localePath(locale, `/units/${unit.slug}`)}`;

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Article",
        headline: unit.name,
        description: unit.description,
        url: pageUrl,
        inLanguage: locale,
        publisher: { "@type": "Organization", name: SITE.name, url: SITE.url },
        author: { "@type": "Organization", name: SITE.name, url: SITE.url },
        ...(unit.wikidata
          ? { sameAs: `https://www.wikidata.org/wiki/${unit.wikidata}` }
          : {}),
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          {
            "@type": "ListItem",
            position: 1,
            name: "Units",
            item: `${SITE.url}${localePath(locale, "/units")}`,
          },
          { "@type": "ListItem", position: 2, name: unit.name },
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

      <article className="mx-auto max-w-4xl px-4 py-10">
        {/* Breadcrumb */}
        <nav className="font-mono text-[11px] text-text-muted mb-6" aria-label="Breadcrumb">
          <Link href={localePath(locale, "/units")} className="hover:text-text-primary">
            Units
          </Link>
          <span className="mx-2 text-border-default">/</span>
          <span className="text-text-secondary">{unit.shortName}</span>
        </nav>

        <PageHeader
          eyebrow={`${COUNTRY_FLAG[unit.country]} ${COUNTRY_LABEL[unit.country]}`}
          title={unit.name}
          description={unit.description}
        />

        {/* Status + type badges */}
        <div className="mt-4 flex flex-wrap gap-2">
          <span className="inline-flex items-center gap-1.5 rounded border border-border-subtle bg-bg-elevated px-2 py-1 font-mono text-[10px] text-text-muted">
            <span
              className={`h-1.5 w-1.5 rounded-full ${STATUS_DOT[unit.status] ?? "bg-neutral-500"}`}
            />
            <span className="capitalize">{unit.status}</span>
          </span>
          <span className="inline-flex items-center rounded border border-border-subtle bg-bg-elevated px-2 py-1 font-mono text-[10px] text-text-muted">
            {UNIT_TYPE_LABEL[unit.type]}
          </span>
          <span className="inline-flex items-center rounded border border-border-subtle bg-bg-elevated px-2 py-1 font-mono text-[10px] text-text-muted capitalize">
            {unit.commandLevel} command
          </span>
          <span
            className={`inline-flex items-center rounded border px-2 py-1 font-mono text-[10px] capitalize ${CONFIDENCE_BADGE[unit.sourceConfidence]}`}
          >
            {unit.sourceConfidence} confidence
          </span>
        </div>

        {/* Metadata table */}
        <section className="mt-8">
          <h2 className="text-base font-semibold text-text-primary">Unit profile</h2>
          <dl className="mt-3 divide-y divide-border-subtle rounded border border-border-subtle bg-bg-surface">
            {(
              [
                ["Theater", unit.theater],
                ["Command level", unit.commandLevel],
                ["First documented", unit.firstDocumented],
                ["Source confidence", unit.sourceConfidence],
                ["Documented events", String(unit.eventCount)],
                ["Country", COUNTRY_LABEL[unit.country]],
              ] as [string, string][]
            ).map(([label, value]) => (
              <div key={label} className="flex items-baseline gap-4 px-4 py-2.5">
                <dt className="w-40 shrink-0 font-mono text-[11px] text-text-muted">{label}</dt>
                <dd className="text-sm text-text-secondary capitalize">{value}</dd>
              </div>
            ))}
            {unit.wikidata && (
              <div className="flex items-baseline gap-4 px-4 py-2.5">
                <dt className="w-40 shrink-0 font-mono text-[11px] text-text-muted">Wikidata</dt>
                <dd className="text-sm">
                  <a
                    href={`https://www.wikidata.org/wiki/${unit.wikidata}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-accent hover:underline"
                  >
                    {unit.wikidata} ↗
                  </a>
                </dd>
              </div>
            )}
          </dl>
        </section>

        {/* Documented events */}
        {seedEvents.length > 0 && (
          <section className="mt-10">
            <h2 className="text-base font-semibold text-text-primary">
              Documented events involving this unit
            </h2>
            <p className="mt-1 text-xs text-text-muted">
              Sample of publicly documented events. Full event feed requires account access.
            </p>
            <ul className="mt-3 space-y-2">
              {seedEvents.map((ev, i) => (
                <li
                  key={i}
                  className="rounded border border-border-subtle bg-bg-surface px-4 py-3 text-sm"
                >
                  <div className="flex items-center justify-between gap-4">
                    <span className="font-mono text-[10px] text-text-muted">{ev.date}</span>
                    <span className="font-mono text-[10px] text-text-muted">{ev.class}</span>
                  </div>
                  <p className="mt-1 text-text-secondary">{ev.summary}</p>
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* Related units */}
        {relatedUnits.length > 0 && (
          <section className="mt-10">
            <h2 className="text-base font-semibold text-text-primary">Related units</h2>
            <p className="mt-1 text-xs text-text-muted">
              Same country and unit type.
            </p>
            <ul className="mt-3 grid grid-cols-1 gap-2 md:grid-cols-2">
              {relatedUnits.map((u) => (
                <li key={u.slug}>
                  <Link
                    href={localePath(locale, `/units/${u.slug}`)}
                    className="block rounded border border-border-subtle bg-bg-surface px-3 py-2 text-sm hover:bg-bg-elevated"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-text-primary">
                        {COUNTRY_FLAG[u.country]} {u.shortName}
                      </span>
                      <span className="font-mono text-[10px] text-text-muted capitalize">
                        {u.status}
                      </span>
                    </div>
                    <p className="mt-1 text-xs text-text-secondary line-clamp-2">
                      {u.description}
                    </p>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* Source disclaimer */}
        <div className="mt-10 rounded border border-red-500/20 bg-red-500/5 p-3 text-xs text-red-400">
          🔒 Source limitations: All information on this page is derived from publicly available
          open-source intelligence, official statements, and press reporting. No classified or
          operationally sensitive data is published. Accuracy depends on the reliability of open
          sources at time of documentation. Ukrainian unit positions and operational details are
          deliberately omitted.
        </div>
      </article>
    </>
  );
}
