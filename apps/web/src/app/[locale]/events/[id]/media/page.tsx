import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { urls, localePath } from "@aegis/url-builder";
import { ACTIVE_LOCALES, isLocale, type Locale } from "@aegis/i18n-config";
import { buildMetadata } from "@/lib/seo";
import { PageHeader } from "@/components/PageHeader";
import { eventById, listEvents } from "@/lib/events-seed";
import { SITE } from "@/lib/site";

type Params = { locale: string; id: string };

export function generateStaticParams(): Params[] {
  const out: Params[] = [];
  for (const e of listEvents()) {
    for (const lc of ACTIVE_LOCALES) out.push({ locale: lc, id: e.eventId });
  }
  return out;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { locale: raw, id } = await params;
  const locale = (isLocale(raw) ? raw : "en") as Locale;
  const ev = eventById(id);
  if (!ev) return { robots: { index: false } };
  return buildMetadata({
    locale,
    title: `Media — ${ev.summary[locale] ?? ev.summary.en}`,
    description: `Media gallery for event ${ev.eventId} — verified photographs and imagery attached to this event.`,
    pathFor: (lc) => localePath(lc, `/events/${id}/media`),
  });
}

export default async function EventMediaPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { locale: raw, id } = await params;
  const locale = (isLocale(raw) ? raw : "en") as Locale;
  const ev = eventById(id);
  if (!ev) notFound();

  const summary = ev.summary[locale] ?? ev.summary.en;
  const pageUrl = `${SITE.url}${localePath(locale, `/events/${id}/media`)}`;

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Article",
        headline: `Media — ${ev.eventId}`,
        description: `Media gallery for event ${ev.eventId}.`,
        publisher: { "@type": "Organization", name: SITE.name, url: SITE.url },
        url: pageUrl,
        mainEntityOfPage: pageUrl,
        inLanguage: locale,
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          {
            "@type": "ListItem",
            position: 1,
            name: "Events",
            item: `${SITE.url}${urls.news(locale)}`,
          },
          {
            "@type": "ListItem",
            position: 2,
            name: ev.eventId,
            item: `${SITE.url}${urls.event(locale, id)}`,
          },
          { "@type": "ListItem", position: 3, name: "Media" },
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
          <Link href={urls.event(locale, id)} className="hover:text-text-primary">
            {ev.eventId}
          </Link>
          <span className="mx-2 text-border-default">/</span>
          <span className="text-text-secondary">Media</span>
        </nav>

        <PageHeader eyebrow="Media gallery" title={`Media — ${ev.eventId}`} description={summary} />

        {ev.media.length === 0 ? (
          <section className="mt-6 rounded border border-dashed border-border-subtle bg-bg-surface p-6 text-center">
            <div className="font-mono text-[11px] uppercase tracking-wider text-text-muted">
              No published media
            </div>
            <p className="mt-2 text-sm text-text-secondary">
              This event has no published media artifacts at this time. Media is added only
              after independent verification and rights review. See{" "}
              <Link
                href={urls.methodologyTopic(locale, "ethics")}
                className="text-accent hover:underline"
              >
                /methodology/ethics
              </Link>{" "}
              for the rights policy.
            </p>
          </section>
        ) : (
          <section className="mt-6">
            <ul className="grid grid-cols-1 gap-3 md:grid-cols-2">
              {ev.media.map((m, i) => (
                <li
                  key={i}
                  className="rounded border border-border-subtle bg-bg-surface p-3"
                >
                  {/* Media renderer placeholder. Real renderer wired when assets land. */}
                  <div className="aspect-video w-full overflow-hidden rounded bg-bg-elevated">
                    <div className="flex h-full items-center justify-center font-mono text-[10px] uppercase tracking-wider text-text-muted">
                      media placeholder
                    </div>
                  </div>
                  <pre className="mt-2 overflow-x-auto font-mono text-[10px] text-text-secondary">
                    {JSON.stringify(m, null, 2)}
                  </pre>
                </li>
              ))}
            </ul>
          </section>
        )}

        <p className="mt-10 text-xs text-text-muted">
          Source provenance:{" "}
          <Link
            href={urls.eventSources(locale, id)}
            className="text-accent hover:underline"
          >
            /events/{id}/sources
          </Link>{" "}
          · related events:{" "}
          <Link
            href={urls.eventRelated(locale, id)}
            className="text-accent hover:underline"
          >
            /events/{id}/related
          </Link>
        </p>
      </article>
    </>
  );
}
