import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { urls, localePath } from "@aegis/url-builder";
import { ACTIVE_LOCALES, isLocale, type Locale } from "@aegis/i18n-config";
import { buildMetadata } from "@/lib/seo";
import { PageHeader } from "@/components/PageHeader";
import {
  SANCTIONS_LISTS,
  getSanctionsList,
  sanctionsByJurisdiction,
  JURISDICTION_LABEL,
} from "@/lib/sanctions-seed";
import { getEntity } from "@/lib/entities-seed";
import { SITE } from "@/lib/site";

type Params = { locale: string; slug: string };

export function generateStaticParams(): Params[] {
  const out: Params[] = [];
  for (const s of SANCTIONS_LISTS) {
    for (const lc of ACTIVE_LOCALES) out.push({ locale: lc, slug: s.slug });
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
  const s = getSanctionsList(slug);
  if (!s) return { robots: { index: false } };
  return buildMetadata({
    locale,
    title: `${s.name} — Aegis Lens reference`,
    description: s.description,
    pathFor: (lc) => localePath(lc, `/sanctions/${s.slug}`),
  });
}

export default async function SanctionsDetailPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { locale: raw, slug } = await params;
  const locale = (isLocale(raw) ? raw : "en") as Locale;
  const s = getSanctionsList(slug);
  if (!s) notFound();

  const pageUrl = `${SITE.url}${localePath(locale, `/sanctions/${s.slug}`)}`;
  const sameJurisdiction = sanctionsByJurisdiction(s.jurisdiction).filter(
    (x) => x.slug !== s.slug,
  );
  const entities = (s.relatedEntitySlugs ?? [])
    .map((slug) => getEntity(slug))
    .filter((x): x is NonNullable<ReturnType<typeof getEntity>> => x !== null);

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Article",
        headline: s.name,
        description: s.description,
        publisher: { "@type": "Organization", name: SITE.name, url: SITE.url },
        author: { "@type": "Organization", name: SITE.name, url: SITE.url },
        inLanguage: locale,
        url: pageUrl,
        mainEntityOfPage: pageUrl,
        citation: [
          { "@type": "CreativeWork", name: s.shortName, url: s.authorityUrl },
        ],
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
          { "@type": "ListItem", position: 2, name: s.name },
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
          <span className="text-text-secondary">{s.shortName}</span>
        </nav>

        <PageHeader
          eyebrow={JURISDICTION_LABEL[s.jurisdiction]}
          title={s.name}
          description={s.description}
        />

        <div className="mt-2 flex flex-wrap items-center gap-3 font-mono text-[11px] uppercase tracking-wider text-text-muted">
          <span>{s.shortName}</span>
          <span>·</span>
          <span>{s.updateCadence}</span>
        </div>

        <div className="mt-4 flex flex-wrap gap-1.5">
          {s.tags.map((tag) => (
            <Link
              key={tag}
              href={urls.tag(locale, tag)}
              className="inline-flex items-center rounded border border-border-subtle bg-bg-elevated px-1.5 py-0.5 font-mono text-[10px] text-text-muted hover:text-accent"
            >
              {tag}
            </Link>
          ))}
        </div>

        <section className="mt-6 rounded border border-border-subtle bg-bg-surface p-4">
          <div className="font-mono text-[10px] uppercase tracking-wider text-text-muted">
            Authoritative source
          </div>
          <a
            href={s.authorityUrl}
            target="_blank"
            rel="nofollow noopener noreferrer"
            className="mt-2 inline-flex items-center gap-2 text-sm text-accent hover:underline"
          >
            {s.authorityUrl}
            <span className="font-mono text-[10px] text-text-muted">↗</span>
          </a>
          <p className="mt-3 text-xs text-text-muted">
            Aegis Lens does not redistribute this list. Consult the issuing authority for
            authoritative current data.
          </p>
        </section>

        <section className="mt-8">
          <h2 className="text-base font-semibold text-text-primary">Use cases</h2>
          <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-text-secondary">
            {s.useCases.map((u, idx) => (
              <li key={idx}>{u}</li>
            ))}
          </ul>
        </section>

        {entities.length > 0 && (
          <section className="mt-8">
            <h2 className="text-base font-semibold text-text-primary">
              Related entities catalogued by Aegis Lens
            </h2>
            <p className="mt-1 text-xs text-text-muted">
              These entities appear in the Aegis Lens knowledge graph and may be referenced
              on this list — verify against the authority's current data.
            </p>
            <ul className="mt-3 grid grid-cols-1 gap-2 md:grid-cols-2">
              {entities.map((e) => (
                <li key={e.slug}>
                  <Link
                    href={urls.entity(locale, e.slug)}
                    className="block rounded border border-border-subtle bg-bg-surface px-3 py-2 text-sm hover:bg-bg-elevated"
                  >
                    <div className="text-text-primary">{e.name[locale] ?? e.name.en}</div>
                    <div className="mt-1 font-mono text-[10px] uppercase tracking-wider text-text-muted">
                      {e.country}
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )}

        {sameJurisdiction.length > 0 && (
          <section className="mt-10 border-t border-border-subtle pt-6">
            <h2 className="text-base font-semibold text-text-primary">
              Other {JURISDICTION_LABEL[s.jurisdiction]} lists
            </h2>
            <ul className="mt-3 grid grid-cols-1 gap-2 md:grid-cols-2">
              {sameJurisdiction.map((o) => (
                <li key={o.slug}>
                  <Link
                    href={urls.sanctionsList(locale, o.slug)}
                    className="block rounded border border-border-subtle bg-bg-surface px-3 py-2 text-sm text-text-secondary hover:bg-bg-elevated hover:text-text-primary"
                  >
                    {o.name}
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )}

        <p className="mt-10 text-xs text-text-muted">
          Operational context:{" "}
          <Link
            href={urls.investigation(locale, "iran-russia-drone-supply-chain")}
            className="text-accent hover:underline"
          >
            sanctions-evasion investigations
          </Link>{" "}
          ·{" "}
          <Link href={urls.threat(locale, "ais-spoofing")} className="text-accent hover:underline">
            AIS spoofing threat
          </Link>
          .
        </p>
      </article>
    </>
  );
}
