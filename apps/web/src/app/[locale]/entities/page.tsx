import Link from "next/link";
import type { Metadata } from "next";
import { urls, localePath } from "@aegis/url-builder";
import { ACTIVE_LOCALES, isLocale, type Locale } from "@aegis/i18n-config";
import { buildMetadata } from "@/lib/seo";
import { PageHeader } from "@/components/PageHeader";
import { EQUIPMENT, CONFLICTS, GLOSSARY, localized } from "@/lib/seed-data";
import { listEntities, listFeaturedEntities, ENTITY_KIND_LABEL } from "@/lib/entities-seed";
import { ENTITIES_DATA } from "@/lib/entities-data";
import { EntityRegistryClient } from "./EntityRegistryClient";
import { SITE } from "@/lib/site";

export function generateStaticParams() {
  return ACTIVE_LOCALES.map((locale) => ({ locale }));
}

const TITLE = "Entities — knowledge graph";
const DESCRIPTION =
  "Browse the Aegis Lens knowledge graph: equipment, conflicts, glossary terms, and named entities — all linked to verified events.";

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
    pathFor: urls.entities,
  });
}

const COUNTRY_LABEL: Record<string, string> = {
  UA: "Ukraine",
  RU: "Russia",
  IR: "Iran",
  BY: "Belarus",
  PL: "Poland",
  DE: "Germany",
};

export default async function EntitiesIndex({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: raw } = await params;
  const locale = (isLocale(raw) ? raw : "en") as Locale;

  const allSeedEntities = listEntities();
  const featuredSeedEntities = listFeaturedEntities();

  const groups = [
    {
      title: "Equipment",
      count: EQUIPMENT.length,
      items: EQUIPMENT.map((e) => ({
        label: localized(e.name, locale),
        sub: e.type,
        href: urls.equipment(locale, e.slug),
      })),
    },
    {
      title: "Conflicts",
      count: CONFLICTS.length,
      items: CONFLICTS.map((c) => ({
        label: localized(c.name, locale),
        sub: c.status,
        href: urls.conflict(locale, c.slug),
      })),
    },
    {
      title: "Glossary terms",
      count: GLOSSARY.length,
      items: GLOSSARY.map((g) => ({
        label: localized(g.term, locale),
        sub: localized(g.definition, locale).slice(0, 60) + "…",
        href: urls.glossary(locale, g.slug),
      })),
    },
  ];

  const totalItems =
    allSeedEntities.length +
    ENTITIES_DATA.length +
    EQUIPMENT.length +
    CONFLICTS.length +
    GLOSSARY.length;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: TITLE,
    description: DESCRIPTION,
    url: `${SITE.url}${localePath(locale, "/entities")}`,
    inLanguage: locale,
    isPartOf: { "@type": "WebSite", url: SITE.url, name: SITE.name },
    mainEntity: {
      "@type": "ItemList",
      numberOfItems: totalItems,
      itemListElement: [
        ...ENTITIES_DATA.slice(0, 10).map((e, i) => ({
          "@type": "ListItem",
          position: i + 1,
          url: `${SITE.url}${localePath(locale, `/entities/${e.slug}`)}`,
          name: e.name,
        })),
        ...allSeedEntities.slice(0, 10).map((e, i) => ({
          "@type": "ListItem",
          position: ENTITIES_DATA.length + i + 1,
          url: `${SITE.url}${urls.entity(locale, e.slug)}`,
          name: e.name[locale] ?? e.name.en,
        })),
        ...EQUIPMENT.slice(0, 5).map((e, i) => ({
          "@type": "ListItem",
          position: ENTITIES_DATA.length + allSeedEntities.length + i + 1,
          url: `${SITE.url}${urls.equipment(locale, e.slug)}`,
          name: localized(e.name, locale),
        })),
      ],
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <PageHeader
        eyebrow="Knowledge graph"
        title="Entities"
        description="Equipment, conflicts, glossary terms, and named organisations — linked to verified events."
      />

      <section className="mx-auto max-w-5xl px-4 py-10">

        {/* ── Featured seed entities ─────────────────────────────────── */}
        {featuredSeedEntities.length > 0 && (
          <div className="mb-10">
            <p className="mb-3 font-mono text-[10px] uppercase tracking-wider text-text-muted">
              Featured
            </p>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {featuredSeedEntities.map((e) => (
                <Link
                  key={e.slug}
                  href={urls.entity(locale, e.slug)}
                  className="rounded border border-accent/30 bg-accent/5 px-4 py-3 transition-colors hover:border-accent"
                >
                  <div className="text-sm font-semibold text-text-primary">
                    {e.name[locale] ?? e.name.en}
                  </div>
                  <div className="mt-1 font-mono text-[10px] uppercase text-text-muted">
                    {ENTITY_KIND_LABEL[e.kind]} · {e.country}
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* ── Entity Registry (client island: search + type filter) ─── */}
        <EntityRegistryClient />

        {/* ── Legacy KG entities ────────────────────────────────────── */}
        <div className="mb-12">
          <div className="mb-4 flex items-baseline justify-between">
            <h2 className="text-xl font-semibold text-text-primary">
              Knowledge graph
            </h2>
            <span className="font-mono text-xs text-text-muted">
              {allSeedEntities.length} entities
            </span>
          </div>

          <ul className="grid gap-2 md:grid-cols-2 lg:grid-cols-3">
            {allSeedEntities.map((e) => (
              <li key={e.slug} className="relative">
                <Link
                  href={urls.entity(locale, e.slug)}
                  className="block rounded border border-border-subtle bg-bg-surface px-4 py-3 hover:bg-bg-elevated"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold text-text-primary">
                      {e.name[locale] ?? e.name.en}
                    </span>
                    <span className="font-mono text-[10px] text-text-muted">
                      {e.country}
                    </span>
                  </div>
                  <div className="mt-1 font-mono text-[10px] uppercase text-text-muted">
                    {ENTITY_KIND_LABEL[e.kind]}
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* ── Static groups (equipment, conflicts, glossary) ─────────── */}
        <div className="space-y-10">
          {groups.map((g) => (
            <div key={g.title}>
              <div className="mb-3 flex items-baseline justify-between">
                <h2 className="text-xl font-semibold text-text-primary">{g.title}</h2>
                <span className="font-mono text-xs text-text-muted">
                  {g.count} items
                </span>
              </div>
              <ul className="grid gap-2 md:grid-cols-2 lg:grid-cols-3">
                {g.items.map((it) => (
                  <li key={it.href}>
                    <Link
                      href={it.href}
                      className="block rounded border border-border-subtle bg-bg-surface px-4 py-3 hover:bg-bg-elevated"
                    >
                      <div className="text-sm font-semibold text-text-primary">
                        {it.label}
                      </div>
                      <div className="mt-1 font-mono text-[10px] uppercase text-text-muted">
                        {it.sub}
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
