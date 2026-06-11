import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { urls, localePath } from "@aegis/url-builder";
import { ACTIVE_LOCALES, isLocale, type Locale } from "@aegis/i18n-config";
import { buildMetadata } from "@/lib/seo";
import { PageHeader } from "@/components/PageHeader";
import {
  ENTITIES,
  getEntity,
  ENTITY_KIND_LABEL,
  entitySchemaType,
} from "@/lib/entities-seed";
import {
  ENTITIES_DATA,
  getEntityData,
  ENTITY_TYPE_LABEL,
  COUNTRY_NAME,
  ENTITY_SCHEMA_TYPE,
} from "@/lib/entities-data";
import { eventById } from "@/lib/events-seed";
import { getInvestigation } from "@/lib/investigations-seed";
import { getEquipment } from "@/lib/seed-helpers";
import { SITE } from "@/lib/site";

type Params = { locale: string; slug: string };

export function generateStaticParams(): Params[] {
  const out: Params[] = [];
  // Seed entities
  for (const e of ENTITIES) {
    for (const lc of ACTIVE_LOCALES) out.push({ locale: lc, slug: e.slug });
  }
  // New data entities (deduplicate if slug overlap)
  const seedSlugs = new Set(ENTITIES.map((e) => e.slug));
  for (const e of ENTITIES_DATA) {
    if (!seedSlugs.has(e.slug)) {
      for (const lc of ACTIVE_LOCALES) out.push({ locale: lc, slug: e.slug });
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

  // Try seed first, then data
  const seedEntity = getEntity(slug);
  if (seedEntity) {
    const name = seedEntity.name[locale] ?? seedEntity.name.en;
    const hasFeed =
      (seedEntity.relatedEventIds?.length ?? 0) +
        (seedEntity.relatedInvestigationSlugs?.length ?? 0) >
      0;
    return buildMetadata({
      locale,
      title: `${name} — ${ENTITY_KIND_LABEL[seedEntity.kind]}`,
      description: seedEntity.description[locale] ?? seedEntity.description.en,
      pathFor: (lc) => localePath(lc, `/entities/${seedEntity.slug}`),
      feeds: hasFeed
        ? [
            {
              type: "application/rss+xml",
              href: urls.entityFeedLocale(locale, seedEntity.slug),
              title: `${name} — events & investigations (RSS)`,
            },
          ]
        : undefined,
    });
  }

  const dataEntity = getEntityData(slug);
  if (!dataEntity) return { robots: { index: false } };
  return buildMetadata({
    locale,
    title: `${dataEntity.name} — ${ENTITY_TYPE_LABEL[dataEntity.type]}`,
    description: dataEntity.description,
    pathFor: (lc) => localePath(lc, `/entities/${dataEntity.slug}`),
  });
}

export default async function EntityDetailPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { locale: raw, slug } = await params;
  const locale = (isLocale(raw) ? raw : "en") as Locale;

  // ── Try seed entities first ────────────────────────────────────────────────
  const seedEntity = getEntity(slug);
  if (seedEntity) {
    return <SeedEntityPage locale={locale} slug={slug} />;
  }

  // ── Fall back to new data entities ────────────────────────────────────────
  const dataEntity = getEntityData(slug);
  if (!dataEntity) notFound();

  const pageUrl = `${SITE.url}${localePath(locale, `/entities/${dataEntity.slug}`)}`;
  const schemaType = ENTITY_SCHEMA_TYPE[dataEntity.type];

  const entityNode: Record<string, unknown> = {
    "@type": schemaType,
    name: dataEntity.name,
    description: dataEntity.description,
    url: pageUrl,
    inLanguage: locale,
  };
  if (dataEntity.aliases.length > 0) entityNode.alternateName = dataEntity.aliases;
  if (dataEntity.wikidata) {
    entityNode.sameAs = `https://www.wikidata.org/wiki/${dataEntity.wikidata}`;
  }
  if (dataEntity.country) {
    entityNode.addressCountry = dataEntity.country.toUpperCase();
  }

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      entityNode,
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          {
            "@type": "ListItem",
            position: 1,
            name: "Entities",
            item: `${SITE.url}${localePath(locale, "/entities")}`,
          },
          { "@type": "ListItem", position: 2, name: dataEntity.name },
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
        {/* Breadcrumb */}
        <nav
          className="font-mono text-[11px] text-text-muted"
          aria-label="Breadcrumb"
        >
          <Link
            href={localePath(locale, "/entities")}
            className="hover:text-text-primary"
          >
            Entities
          </Link>
          <span className="mx-2 text-border-default">/</span>
          <span className="text-text-secondary">{dataEntity.name}</span>
        </nav>

        {/* Header */}
        <PageHeader
          eyebrow={ENTITY_TYPE_LABEL[dataEntity.type]}
          title={dataEntity.name}
          description={dataEntity.description}
        />

        {/* Meta row: country, wikidata */}
        <div className="mt-2 flex flex-wrap items-center gap-3 font-mono text-[11px] uppercase tracking-wider text-text-muted">
          <span>
            Country:{" "}
            {COUNTRY_NAME[dataEntity.country] ?? dataEntity.country.toUpperCase()}
          </span>
          {dataEntity.wikidata && (
            <>
              <span>·</span>
              <a
                href={`https://www.wikidata.org/wiki/${dataEntity.wikidata}`}
                target="_blank"
                rel="nofollow noopener noreferrer"
                className="hover:text-accent"
              >
                Wikidata: {dataEntity.wikidata}
              </a>
            </>
          )}
          {!dataEntity.active && (
            <>
              <span>·</span>
              <span className="text-red-400">Inactive</span>
            </>
          )}
        </div>

        {/* Events count + "Browse events on map" link */}
        {dataEntity.eventCount > 0 && (
          <div className="mt-6 flex items-center gap-4 rounded border border-border-subtle bg-bg-surface px-5 py-4">
            <div>
              <div className="font-mono text-2xl font-bold text-text-primary">
                {dataEntity.eventCount.toLocaleString()}
              </div>
              <div className="font-mono text-[10px] uppercase tracking-wider text-text-muted">
                Linked events
              </div>
            </div>
            <div className="h-8 w-px bg-border-subtle" />
            <Link
              href={`/?entity=${dataEntity.slug}`}
              className="inline-flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-wider text-accent hover:underline"
            >
              Browse events on map →
            </Link>
          </div>
        )}

        {/* Aliases */}
        {dataEntity.aliases.length > 0 && (
          <section className="mt-6 rounded border border-border-subtle bg-bg-surface p-4">
            <div className="font-mono text-[10px] uppercase tracking-wider text-text-muted">
              Also known as
            </div>
            <ul className="mt-2 flex flex-wrap gap-2">
              {dataEntity.aliases.map((a) => (
                <li
                  key={a}
                  className="rounded border border-border-subtle bg-bg-elevated px-2 py-0.5 text-xs text-text-secondary"
                >
                  {a}
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* Tags */}
        {dataEntity.tags.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-1.5">
            {dataEntity.tags.map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center rounded border border-border-subtle bg-bg-elevated px-1.5 py-0.5 font-mono text-[10px] text-text-muted"
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* Wikidata cross-reference callout */}
        {dataEntity.wikidata && (
          <section className="mt-8 rounded border border-border-subtle bg-bg-surface p-4">
            <div className="font-mono text-[10px] uppercase tracking-wider text-text-muted">
              External cross-reference
            </div>
            <div className="mt-2 flex items-center gap-3">
              <a
                href={`https://www.wikidata.org/wiki/${dataEntity.wikidata}`}
                target="_blank"
                rel="nofollow noopener noreferrer"
                className="text-sm text-accent hover:underline"
              >
                {dataEntity.wikidata} on Wikidata →
              </a>
              <span className="font-mono text-[10px] text-text-muted">
                (verified open-data cross-link)
              </span>
            </div>
          </section>
        )}

        {/* Neutrality notice */}
        <p className="mt-10 text-xs text-text-muted">
          Neutrality policy: entity descriptions stick to publicly verifiable facts. See{" "}
          <Link
            href={urls.methodology(locale)}
            className="text-accent hover:underline"
          >
            methodology
          </Link>{" "}
          and{" "}
          <Link
            href={urls.trustDataPolicy(locale)}
            className="text-accent hover:underline"
          >
            data policy
          </Link>
          .
        </p>
      </article>
    </>
  );
}

// ── Seed-based entity page (existing logic, unchanged) ────────────────────────

async function SeedEntityPage({
  locale,
  slug,
}: {
  locale: Locale;
  slug: string;
}) {
  const e = getEntity(slug);
  if (!e) notFound();

  const name = e.name[locale] ?? e.name.en;
  const description = e.description[locale] ?? e.description.en;
  const pageUrl = `${SITE.url}${localePath(locale, `/entities/${e.slug}`)}`;

  const relatedEntities = (e.relatedSlugs ?? [])
    .map((s) => getEntity(s))
    .filter((x): x is NonNullable<ReturnType<typeof getEntity>> => x !== null);
  const equipment = (e.relatedEquipmentSlugs ?? [])
    .map((s) => getEquipment(s))
    .filter((x): x is NonNullable<ReturnType<typeof getEquipment>> => x !== null);
  const events = (e.relatedEventIds ?? [])
    .map((id) => eventById(id))
    .filter((x): x is NonNullable<ReturnType<typeof eventById>> => x !== null);
  const investigations = (e.relatedInvestigationSlugs ?? [])
    .map((s) => getInvestigation(s))
    .filter((x): x is NonNullable<ReturnType<typeof getInvestigation>> => x !== null);

  const sameAs: string[] = [];
  if (e.wikidata) sameAs.push(`https://www.wikidata.org/wiki/${e.wikidata}`);

  const entityNode: Record<string, unknown> = {
    "@type": entitySchemaType(e.kind),
    name,
    description,
    url: pageUrl,
    inLanguage: locale,
  };
  if (e.aliases && e.aliases.length > 0) entityNode.alternateName = e.aliases;
  if (sameAs.length > 0) entityNode.sameAs = sameAs;
  if (e.country) entityNode.addressCountry = e.country;

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      entityNode,
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          {
            "@type": "ListItem",
            position: 1,
            name: "Entities",
            item: `${SITE.url}${urls.entities(locale)}`,
          },
          { "@type": "ListItem", position: 2, name },
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
          <Link href={urls.entities(locale)} className="hover:text-text-primary">
            Entities
          </Link>
          <span className="mx-2 text-border-default">/</span>
          <span className="text-text-secondary">{name}</span>
        </nav>

        <PageHeader
          eyebrow={ENTITY_KIND_LABEL[e.kind]}
          title={name}
          description={description}
        />

        <div className="mt-2 flex flex-wrap items-center gap-3 font-mono text-[11px] uppercase tracking-wider text-text-muted">
          <span>Country: {e.country}</span>
          {e.wikidata && (
            <>
              <span>·</span>
              <a
                href={`https://www.wikidata.org/wiki/${e.wikidata}`}
                target="_blank"
                rel="nofollow noopener noreferrer"
                className="hover:text-accent"
              >
                Wikidata: {e.wikidata}
              </a>
            </>
          )}
          {(events.length > 0 || investigations.length > 0) && (
            <>
              <span>·</span>
              <a
                href={urls.entityFeed(e.slug)}
                className="hover:text-accent"
                title="RSS feed of events and investigations referencing this entity"
              >
                RSS feed →
              </a>
            </>
          )}
        </div>

        {/* Browse events on map link — shown when related events exist */}
        {events.length > 0 && (
          <div className="mt-6 flex items-center gap-4 rounded border border-border-subtle bg-bg-surface px-5 py-4">
            <div>
              <div className="font-mono text-2xl font-bold text-text-primary">
                {events.length}
              </div>
              <div className="font-mono text-[10px] uppercase tracking-wider text-text-muted">
                Linked events
              </div>
            </div>
            <div className="h-8 w-px bg-border-subtle" />
            <Link
              href={`/?entity=${e.slug}`}
              className="inline-flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-wider text-accent hover:underline"
            >
              Browse events on map →
            </Link>
          </div>
        )}

        {e.aliases && e.aliases.length > 0 && (
          <section className="mt-6 rounded border border-border-subtle bg-bg-surface p-4">
            <div className="font-mono text-[10px] uppercase tracking-wider text-text-muted">
              Also known as
            </div>
            <ul className="mt-2 flex flex-wrap gap-2">
              {e.aliases.map((a) => (
                <li
                  key={a}
                  className="rounded border border-border-subtle bg-bg-elevated px-2 py-0.5 text-xs text-text-secondary"
                >
                  {a}
                </li>
              ))}
            </ul>
          </section>
        )}

        <div className="mt-4 flex flex-wrap gap-1.5">
          {e.tags.map((tag) => (
            <Link
              key={tag}
              href={urls.tag(locale, tag)}
              className="inline-flex items-center rounded border border-border-subtle bg-bg-elevated px-1.5 py-0.5 font-mono text-[10px] text-text-muted hover:text-accent"
            >
              {tag}
            </Link>
          ))}
        </div>

        {e.wikidata && (
          <section className="mt-8 rounded border border-border-subtle bg-bg-surface p-4">
            <div className="font-mono text-[10px] uppercase tracking-wider text-text-muted">
              External cross-reference
            </div>
            <div className="mt-2 flex items-center gap-3">
              <a
                href={`https://www.wikidata.org/wiki/${e.wikidata}`}
                target="_blank"
                rel="nofollow noopener noreferrer"
                className="text-sm text-accent hover:underline"
              >
                {e.wikidata} on Wikidata →
              </a>
              <span className="font-mono text-[10px] text-text-muted">
                (verified open-data cross-link)
              </span>
            </div>
          </section>
        )}

        {relatedEntities.length > 0 && (
          <section className="mt-8">
            <h2 className="text-base font-semibold text-text-primary">
              Related entities
            </h2>
            <ul className="mt-3 grid grid-cols-1 gap-2 md:grid-cols-2">
              {relatedEntities.map((r) => (
                <li key={r.slug}>
                  <Link
                    href={urls.entity(locale, r.slug)}
                    className="block rounded border border-border-subtle bg-bg-surface px-3 py-2 text-sm hover:bg-bg-elevated"
                  >
                    <div className="text-text-primary">
                      {r.name[locale] ?? r.name.en}
                    </div>
                    <div className="mt-1 font-mono text-[10px] uppercase text-text-muted">
                      {ENTITY_KIND_LABEL[r.kind]} · {r.country}
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )}

        {investigations.length > 0 && (
          <section className="mt-8">
            <h2 className="text-base font-semibold text-text-primary">
              Investigations referencing this entity
            </h2>
            <ul className="mt-3 space-y-2">
              {investigations.map((inv) => (
                <li key={inv.slug}>
                  <Link
                    href={urls.investigation(locale, inv.slug)}
                    className="block rounded border border-border-subtle bg-bg-surface px-3 py-2 text-sm hover:bg-bg-elevated"
                  >
                    <div className="text-text-primary">{inv.title}</div>
                    <div className="mt-1 font-mono text-[10px] uppercase tracking-wider text-text-muted">
                      {inv.date} · lead: {inv.analyst}
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )}

        {events.length > 0 && (
          <section className="mt-8">
            <h2 className="text-base font-semibold text-text-primary">
              Recent mentions
            </h2>
            <ul className="mt-3 space-y-2">
              {events.map((ev) => (
                <li key={ev.eventId}>
                  <Link
                    href={urls.event(locale, ev.eventId)}
                    className="block rounded border border-border-subtle bg-bg-surface px-3 py-2 text-sm hover:bg-bg-elevated"
                  >
                    <div className="font-mono text-[10px] uppercase tracking-wider text-text-muted">
                      {ev.class}
                      {ev.subclass ? ` · ${ev.subclass}` : ""} ·{" "}
                      {ev.occurredAt.slice(0, 10)}
                    </div>
                    <div className="mt-1 text-text-primary">
                      {ev.summary[locale] ?? ev.summary.en}
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )}

        {equipment.length > 0 && (
          <section className="mt-8">
            <h2 className="text-base font-semibold text-text-primary">
              Related equipment
            </h2>
            <ul className="mt-3 grid grid-cols-1 gap-2 md:grid-cols-2">
              {equipment.map((eq) => (
                <li key={eq.slug}>
                  <Link
                    href={urls.equipment(locale, eq.slug)}
                    className="block rounded border border-border-subtle bg-bg-surface px-3 py-2 text-sm hover:bg-bg-elevated"
                  >
                    <div className="text-text-primary">
                      {eq.name[locale] ?? eq.name.en}
                    </div>
                    <div className="mt-1 font-mono text-[10px] uppercase tracking-wider text-text-muted">
                      {eq.origin}
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )}

        <p className="mt-10 text-xs text-text-muted">
          Neutrality policy: entity descriptions stick to publicly verifiable facts. See{" "}
          <Link href={urls.methodology(locale)} className="text-accent hover:underline">
            methodology
          </Link>{" "}
          and{" "}
          <Link
            href={urls.trustDataPolicy(locale)}
            className="text-accent hover:underline"
          >
            data policy
          </Link>
          .
        </p>
      </article>
    </>
  );
}
