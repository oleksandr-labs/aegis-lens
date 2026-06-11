import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { urls, localePath } from "@aegis/url-builder";
import { ACTIVE_LOCALES, isLocale, type Locale } from "@aegis/i18n-config";
import { buildMetadata } from "@/lib/seo";
import { PageHeader } from "@/components/PageHeader";
import { THREATS, getThreat, listThreats } from "@/lib/threats-seed";
import { eventById } from "@/lib/events-seed";
import { getEquipment } from "@/lib/seed-helpers";
import { SITE } from "@/lib/site";

type Params = { locale: string; slug: string };

export function generateStaticParams(): Params[] {
  const out: Params[] = [];
  for (const t of THREATS) {
    for (const lc of ACTIVE_LOCALES) out.push({ locale: lc, slug: t.slug });
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
  const t = getThreat(slug);
  if (!t) return { robots: { index: false } };
  return buildMetadata({
    locale,
    title: t.name[locale] ?? t.name.en,
    description: t.summary[locale] ?? t.summary.en,
    pathFor: (lc) => localePath(lc, `/threats/${t.slug}`),
  });
}

export default async function ThreatDetailPage({ params }: { params: Promise<Params> }) {
  const { locale: raw, slug } = await params;
  const locale = (isLocale(raw) ? raw : "en") as Locale;
  const t = getThreat(slug);
  if (!t) notFound();

  const name = t.name[locale] ?? t.name.en;
  const summary = t.summary[locale] ?? t.summary.en;
  const pageUrl = `${SITE.url}${localePath(locale, `/threats/${t.slug}`)}`;

  const events = (t.citedEventIds ?? [])
    .map((id) => eventById(id))
    .filter((e): e is NonNullable<ReturnType<typeof eventById>> => e !== null);
  const equipment = (t.relatedEquipmentSlugs ?? [])
    .map((s) => getEquipment(s))
    .filter((x): x is NonNullable<ReturnType<typeof getEquipment>> => x !== null);
  const related = listThreats()
    .filter(
      (x) =>
        x.slug !== t.slug &&
        (x.category === t.category || x.tags.some((tag) => t.tags.includes(tag))),
    )
    .slice(0, 4);

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Article",
        headline: name,
        description: summary,
        keywords: t.tags.join(", "),
        publisher: { "@type": "Organization", name: SITE.name, url: SITE.url },
        author: { "@type": "Organization", name: SITE.name, url: SITE.url },
        inLanguage: locale,
        url: pageUrl,
        mainEntityOfPage: pageUrl,
        citation: events.map((e) => ({
          "@type": "CreativeWork",
          name: e.summary.en,
          url: `${SITE.url}${urls.event(locale, e.eventId)}`,
          identifier: e.eventId,
        })),
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          {
            "@type": "ListItem",
            position: 1,
            name: "Threats",
            item: `${SITE.url}${urls.threats(locale)}`,
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
          <Link href={urls.threats(locale)} className="hover:text-text-primary">
            Threats
          </Link>
          <span className="mx-2 text-border-default">/</span>
          <span className="text-text-secondary">{name}</span>
        </nav>

        <PageHeader eyebrow={t.category} title={name} description={summary} />

        <div className="mt-2 flex flex-wrap items-center gap-3 font-mono text-[11px] uppercase tracking-wider text-text-muted">
          <span>Affected: {t.affectedRegions.map((r) => r.toUpperCase()).join(", ")}</span>
          <span>·</span>
          <Link
            href={urls.topic(locale, t.eventClass)}
            className="hover:text-accent"
          >
            topic feed: {t.eventClass}
          </Link>
        </div>

        <div className="mt-4 flex flex-wrap gap-1.5">
          {t.tags.map((tag) => (
            <Link
              key={tag}
              href={urls.tag(locale, tag)}
              className="inline-flex items-center rounded border border-border-subtle bg-bg-elevated px-1.5 py-0.5 font-mono text-[10px] text-text-muted hover:text-accent"
            >
              {tag}
            </Link>
          ))}
        </div>

        <section className="mt-6 grid grid-cols-1 gap-3 md:grid-cols-2">
          <div className="rounded border border-border-subtle bg-bg-surface p-4">
            <div className="font-mono text-[10px] uppercase tracking-wider text-text-muted">
              Civilian guidance
            </div>
            <p className="mt-2 text-sm text-text-secondary">
              {t.civilianGuidance[locale] ?? t.civilianGuidance.en}
            </p>
          </div>
          <div className="rounded border border-border-subtle bg-bg-surface p-4">
            <div className="font-mono text-[10px] uppercase tracking-wider text-text-muted">
              Operator guidance
            </div>
            <p className="mt-2 text-sm text-text-secondary">
              {t.operatorGuidance[locale] ?? t.operatorGuidance.en}
            </p>
          </div>
        </section>

        {t.sections.map((s) => (
          <section key={s.heading} className="mt-8">
            <h2 className="text-base font-semibold text-text-primary">{s.heading}</h2>
            <p className="mt-3 text-sm leading-relaxed text-text-secondary">{s.body}</p>
          </section>
        ))}

        {events.length > 0 && (
          <section className="mt-8">
            <h2 className="text-base font-semibold text-text-primary">Recent events</h2>
            <ul className="mt-3 space-y-2">
              {events.map((e) => (
                <li key={e.eventId}>
                  <Link
                    href={urls.event(locale, e.eventId)}
                    className="block rounded border border-border-subtle bg-bg-surface px-3 py-2 text-sm hover:bg-bg-elevated"
                  >
                    <div className="font-mono text-[10px] uppercase tracking-wider text-text-muted">
                      {e.class}{e.subclass ? ` · ${e.subclass}` : ""} · danger {e.dangerScore}
                    </div>
                    <div className="mt-1 text-text-primary">
                      {e.summary[locale] ?? e.summary.en}
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )}

        {equipment.length > 0 && (
          <section className="mt-8">
            <h2 className="text-base font-semibold text-text-primary">Related equipment</h2>
            <ul className="mt-3 grid grid-cols-1 gap-2 md:grid-cols-2">
              {equipment.map((eq) => (
                <li key={eq.slug}>
                  <Link
                    href={urls.equipment(locale, eq.slug)}
                    className="block rounded border border-border-subtle bg-bg-surface px-3 py-2 text-sm hover:bg-bg-elevated"
                  >
                    <div className="text-text-primary">{eq.name[locale] ?? eq.name.en}</div>
                    <div className="mt-1 font-mono text-[10px] uppercase tracking-wider text-text-muted">
                      {eq.origin}
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )}

        {related.length > 0 && (
          <section className="mt-10 border-t border-border-subtle pt-6">
            <h2 className="text-base font-semibold text-text-primary">Related threats</h2>
            <ul className="mt-3 grid grid-cols-1 gap-2 md:grid-cols-2">
              {related.map((r) => (
                <li key={r.slug}>
                  <Link
                    href={urls.threat(locale, r.slug)}
                    className="block rounded border border-border-subtle bg-bg-surface px-3 py-2 text-sm text-text-secondary hover:bg-bg-elevated hover:text-text-primary"
                  >
                    {r.name[locale] ?? r.name.en}
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )}

        <p className="mt-10 text-xs text-text-muted">
          Not an official advisory — see{" "}
          <Link href={urls.methodology(locale)} className="text-accent hover:underline">
            methodology
          </Link>{" "}
          for scoring + caveats.
        </p>
      </article>
    </>
  );
}
