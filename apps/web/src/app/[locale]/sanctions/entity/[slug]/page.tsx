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
} from "@/lib/entities-seed";
import {
  SANCTIONS_LISTS,
  type SanctionsList,
  JURISDICTION_LABEL,
} from "@/lib/sanctions-seed";
import { SITE } from "@/lib/site";

type Params = { locale: string; slug: string };

/**
 * Entity-keyed sanctions history. Lists every sanctions list that names the
 * entity in its `relatedEntitySlugs`. Aegis Lens does NOT mirror the
 * authoritative data; we point to issuing-authority URLs for current state.
 */
function listsCitingEntity(slug: string): SanctionsList[] {
  return SANCTIONS_LISTS.filter((l) =>
    (l.relatedEntitySlugs ?? []).includes(slug),
  );
}

function entitiesWithSanctionsCitations(): string[] {
  const set = new Set<string>();
  for (const l of SANCTIONS_LISTS) {
    for (const s of l.relatedEntitySlugs ?? []) set.add(s);
  }
  return [...set];
}

export function generateStaticParams(): Params[] {
  const out: Params[] = [];
  for (const slug of entitiesWithSanctionsCitations()) {
    if (!getEntity(slug)) continue;
    for (const lc of ACTIVE_LOCALES) out.push({ locale: lc, slug });
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
  const e = getEntity(slug);
  if (!e) return { robots: { index: false } };
  const lists = listsCitingEntity(slug);
  if (lists.length === 0) return { robots: { index: false } };
  const name = e.name[locale] ?? e.name.en;
  return buildMetadata({
    locale,
    title: `${name} — sanctions citations`,
    description: `${name} is named in ${lists.length} sanctions list${lists.length === 1 ? "" : "s"} catalogued by Aegis Lens. Authoritative current state lives with the issuing authorities.`,
    pathFor: (lc) => localePath(lc, `/sanctions/entity/${slug}`),
  });
}

export default async function SanctionsEntityPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { locale: raw, slug } = await params;
  const locale = (isLocale(raw) ? raw : "en") as Locale;
  const e = getEntity(slug);
  if (!e) notFound();
  const lists = listsCitingEntity(slug);
  if (lists.length === 0) notFound();

  const name = e.name[locale] ?? e.name.en;
  const pageUrl = `${SITE.url}${localePath(locale, `/sanctions/entity/${slug}`)}`;

  // Group by jurisdiction.
  const byJ = new Map<SanctionsList["jurisdiction"], SanctionsList[]>();
  for (const l of lists) {
    const arr = byJ.get(l.jurisdiction) ?? [];
    arr.push(l);
    byJ.set(l.jurisdiction, arr);
  }

  const otherCited = entitiesWithSanctionsCitations()
    .filter((s) => s !== slug)
    .map((s) => getEntity(s))
    .filter((x): x is NonNullable<ReturnType<typeof getEntity>> => x !== null);

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Article",
        headline: `${name} — sanctions citations`,
        description: `${name} is named on ${lists.length} sanctions list${lists.length === 1 ? "" : "s"} catalogued by Aegis Lens.`,
        publisher: { "@type": "Organization", name: SITE.name, url: SITE.url },
        author: { "@type": "Organization", name: SITE.name, url: SITE.url },
        inLanguage: locale,
        url: pageUrl,
        mainEntityOfPage: pageUrl,
        about: {
          "@type": "Organization",
          name,
          ...(e.wikidata
            ? { sameAs: [`https://www.wikidata.org/wiki/${e.wikidata}`] }
            : {}),
        },
        citation: lists.map((l) => ({
          "@type": "CreativeWork",
          name: l.name,
          url: l.authorityUrl,
        })),
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          {
            "@type": "ListItem",
            position: 1,
            name: "Sanctions",
            item: `${SITE.url}${urls.sanctions(locale)}`,
          },
          { "@type": "ListItem", position: 2, name: `Entity: ${name}` },
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
          <Link href={urls.sanctions(locale)} className="hover:text-text-primary">
            Sanctions
          </Link>
          <span className="mx-2 text-border-default">/</span>
          <Link href={urls.entity(locale, slug)} className="hover:text-text-primary">
            {ENTITY_KIND_LABEL[e.kind]}: {name}
          </Link>
          <span className="mx-2 text-border-default">/</span>
          <span className="text-text-secondary">Sanctions history</span>
        </nav>

        <PageHeader
          eyebrow={`${ENTITY_KIND_LABEL[e.kind]} · ${e.country}`}
          title={`${name} — sanctions history`}
          description={`Catalogued sanctions-list citations for ${name}.`}
        />

        {(() => {
          // Cadence indicator: 7-day Aegis Lens re-check on entity-citation pages.
          // Authority-of-record cadence is stated per-list below.
          const RECHECK_DAYS = 7;
          const assembled = new Date();
          const nextCheck = new Date(assembled);
          nextCheck.setUTCDate(nextCheck.getUTCDate() + RECHECK_DAYS);
          const fmt = (d: Date) => d.toISOString().slice(0, 10);
          return (
            <section className="mt-6 rounded border border-border-subtle bg-bg-surface p-4 text-sm">
              <div className="font-mono text-[10px] uppercase tracking-wider text-text-muted">
                Verification cadence
              </div>
              <ul className="mt-2 grid grid-cols-1 gap-2 text-sm text-text-secondary sm:grid-cols-3">
                <li>
                  <div className="font-mono text-[10px] uppercase tracking-widest text-text-muted">
                    Page assembled
                  </div>
                  <div className="mt-1 text-text-primary">{fmt(assembled)}</div>
                </li>
                <li>
                  <div className="font-mono text-[10px] uppercase tracking-widest text-text-muted">
                    Re-check cadence
                  </div>
                  <div className="mt-1 text-text-primary">every {RECHECK_DAYS} days</div>
                </li>
                <li>
                  <div className="font-mono text-[10px] uppercase tracking-widest text-text-muted">
                    Next scheduled check
                  </div>
                  <div className="mt-1 text-accent">{fmt(nextCheck)}</div>
                </li>
              </ul>
              <p className="mt-3 text-xs text-text-muted">
                Authority-of-record cadence is stated per list below. Aegis Lens does not
                mirror the underlying data; for time-sensitive compliance decisions consult
                the issuing authority directly.
              </p>
            </section>
          );
        })()}

        <section className="mt-6 rounded border border-yellow-500/40 bg-yellow-500/5 p-4 text-sm text-text-secondary">
          <div className="font-mono text-[10px] uppercase tracking-wider text-yellow-200">
            Authority of record
          </div>
          <p className="mt-2">
            Aegis Lens does <strong className="text-text-primary">not</strong> mirror the
            underlying sanctions data. The authoritative current state lives with each
            issuing authority — links are provided per list. This page is a catalogue of
            citations, not a clearance signal.
          </p>
        </section>

        <section className="mt-8 space-y-6">
          {[...byJ.entries()].map(([j, arr]) => (
            <div key={j}>
              <h2 className="font-mono text-[11px] uppercase tracking-wider text-text-muted">
                {JURISDICTION_LABEL[j]} ({arr.length})
              </h2>
              <ul className="mt-3 space-y-2">
                {arr.map((l) => (
                  <li key={l.slug}>
                    <Link
                      href={urls.sanctionsList(locale, l.slug)}
                      className="block rounded border border-border-subtle bg-bg-surface px-3 py-2 text-sm hover:bg-bg-elevated"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-text-primary">{l.name}</span>
                        <span className="font-mono text-[10px] text-text-muted">
                          {l.shortName}
                        </span>
                      </div>
                      <p className="mt-1 text-xs text-text-secondary line-clamp-2">
                        {l.description}
                      </p>
                      <div className="mt-2 font-mono text-[10px] uppercase tracking-wider text-text-muted">
                        cadence: {l.updateCadence}
                      </div>
                    </Link>
                    <a
                      href={l.authorityUrl}
                      target="_blank"
                      rel="nofollow noopener noreferrer"
                      className="mt-1 inline-flex items-center gap-1 font-mono text-[10px] uppercase tracking-wider text-accent hover:underline"
                    >
                      authority ↗ {l.authorityUrl}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </section>

        {otherCited.length > 0 && (
          <section className="mt-10 border-t border-border-subtle pt-6">
            <h2 className="text-base font-semibold text-text-primary">
              Other entities with catalogued sanctions citations
            </h2>
            <ul className="mt-3 grid grid-cols-1 gap-2 md:grid-cols-2">
              {otherCited.map((x) => (
                <li key={x.slug}>
                  <Link
                    href={urls.sanctionsEntity(locale, x.slug)}
                    className="block rounded border border-border-subtle bg-bg-surface px-3 py-2 text-sm text-text-secondary hover:bg-bg-elevated hover:text-text-primary"
                  >
                    <div className="text-text-primary">{x.name[locale] ?? x.name.en}</div>
                    <div className="mt-1 font-mono text-[10px] uppercase tracking-wider text-text-muted">
                      {ENTITY_KIND_LABEL[x.kind]} · {x.country}
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )}

        <p className="mt-10 text-xs text-text-muted">
          Entity profile:{" "}
          <Link href={urls.entity(locale, slug)} className="text-accent hover:underline">
            full {name}
          </Link>{" "}
          · sanctions reference:{" "}
          <Link href={urls.sanctions(locale)} className="text-accent hover:underline">
            /sanctions
          </Link>
        </p>
      </article>
    </>
  );
}
