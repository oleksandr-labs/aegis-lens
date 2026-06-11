import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { urls, localePath } from "@aegis/url-builder";
import { ACTIVE_LOCALES, isLocale, type Locale } from "@aegis/i18n-config";
import { buildMetadata } from "@/lib/seo";
import { PageHeader } from "@/components/PageHeader";
import {
  PODCAST_EPISODES,
  getPodcastEpisode,
  listPodcastEpisodes,
} from "@/lib/podcast-data";
import { SITE } from "@/lib/site";

type Params = { locale: string; slug: string };

export function generateStaticParams(): Params[] {
  const out: Params[] = [];
  for (const e of PODCAST_EPISODES) {
    for (const lc of ACTIVE_LOCALES) out.push({ locale: lc, slug: e.slug });
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
  const e = getPodcastEpisode(slug);
  if (!e) return { robots: { index: false } };
  return buildMetadata({
    locale,
    title: `${e.title} — Intelligence Decoded`,
    description: e.description,
    pathFor: (lc) => localePath(lc, `/podcast/${e.slug}`),
  });
}

export default async function PodcastEpisodePage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { locale: raw, slug } = await params;
  const locale = (isLocale(raw) ? raw : "en") as Locale;
  const e = getPodcastEpisode(slug);
  if (!e) notFound();

  const pageUrl = `${SITE.url}${localePath(locale, `/podcast/${e.slug}`)}`;
  const related = listPodcastEpisodes()
    .filter((x) => x.slug !== e.slug)
    .slice(0, 3);

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "PodcastEpisode",
        episodeNumber: e.episodeNumber,
        name: e.title,
        description: e.description,
        datePublished: e.publishedAt,
        duration: `PT${e.durationMin}M`,
        url: pageUrl,
        partOfSeries: {
          "@type": "PodcastSeries",
          name: "Intelligence Decoded",
          description:
            "Weekly conversations with analysts, journalists, and technologists on open-source intelligence and conflict reporting.",
          author: { "@type": "Organization", name: "Aegis Lens", url: SITE.url },
        },
        inLanguage: locale,
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          {
            "@type": "ListItem",
            position: 1,
            name: "Podcast",
            item: `${SITE.url}${urls.podcast(locale)}`,
          },
          { "@type": "ListItem", position: 2, name: e.title },
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
        <nav className="font-mono text-[11px] text-text-muted" aria-label="Breadcrumb">
          <Link href={urls.podcast(locale)} className="hover:text-text-primary">
            Podcast
          </Link>
          <span className="mx-2 text-border-default">/</span>
          <span className="text-text-secondary">Ep. {e.episodeNumber}</span>
        </nav>

        <PageHeader
          eyebrow={`Episode ${e.episodeNumber}`}
          title={e.title}
          description={e.description}
        />

        <div className="mt-2 flex flex-wrap items-center gap-3 font-mono text-[11px] uppercase tracking-wider text-text-muted">
          <span>{e.publishedAt}</span>
          <span>·</span>
          <span>{e.durationMin} min</span>
        </div>

        {/* Tags */}
        <div className="mt-4 flex flex-wrap gap-1.5">
          {e.tags.map((t) => (
            <Link
              key={t}
              href={urls.tag(locale, t)}
              className="inline-flex items-center rounded border border-border-subtle bg-bg-elevated px-1.5 py-0.5 font-mono text-[10px] text-text-muted hover:text-accent"
            >
              {t}
            </Link>
          ))}
        </div>

        {/* Guest info card */}
        {(e.guestName || e.guestRole) && (
          <section className="mt-6 rounded border border-border-subtle bg-bg-surface p-4">
            <div className="font-mono text-[10px] uppercase tracking-wider text-text-muted">
              Guest
            </div>
            <div className="mt-2">
              {e.guestName && (
                <span className="text-sm font-semibold text-text-primary">{e.guestName}</span>
              )}
              {e.guestRole && (
                <span className="ml-2 text-sm text-text-muted">— {e.guestRole}</span>
              )}
            </div>
          </section>
        )}

        {/* Listen links */}
        {(e.spotifyUrl || e.appleUrl) && (
          <section className="mt-6">
            <div className="font-mono text-[10px] uppercase tracking-wider text-text-muted">
              Listen on
            </div>
            <div className="mt-2 flex flex-wrap gap-3">
              {e.spotifyUrl && (
                <a
                  href={e.spotifyUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center rounded border border-border-subtle bg-bg-surface px-4 py-2 text-sm text-text-secondary hover:bg-bg-elevated hover:text-text-primary"
                >
                  Spotify
                </a>
              )}
              {e.appleUrl && (
                <a
                  href={e.appleUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center rounded border border-border-subtle bg-bg-surface px-4 py-2 text-sm text-text-secondary hover:bg-bg-elevated hover:text-text-primary"
                >
                  Apple Podcasts
                </a>
              )}
            </div>
          </section>
        )}

        {/* Description / show notes */}
        <section className="mt-8">
          <h2 className="text-base font-semibold text-text-primary">About this episode</h2>
          <p className="mt-3 text-sm leading-relaxed text-text-secondary">{e.description}</p>
        </section>

        {/* Transcript */}
        <section className="mt-10">
          <h2 className="text-base font-semibold text-text-primary">Transcript</h2>
          <div className="mt-3 rounded border border-border-subtle bg-bg-surface p-4">
            <p className="text-sm leading-relaxed text-text-secondary">
              {e.transcript ?? "Transcript coming soon."}
            </p>
          </div>
        </section>

        {/* Related episodes */}
        {related.length > 0 && (
          <section className="mt-10 border-t border-border-subtle pt-6">
            <h2 className="text-base font-semibold text-text-primary">Other episodes</h2>
            <ul className="mt-3 grid grid-cols-1 gap-2 md:grid-cols-2">
              {related.map((o) => (
                <li key={o.slug}>
                  <Link
                    href={urls.podcastEpisode(locale, o.slug)}
                    className="block rounded border border-border-subtle bg-bg-surface px-3 py-3 text-sm hover:bg-bg-elevated"
                  >
                    <div className="font-mono text-[10px] uppercase tracking-wider text-text-muted">
                      Ep. {o.episodeNumber} · {o.durationMin} min
                    </div>
                    <div className="mt-1 text-text-primary">{o.title}</div>
                    {o.guestName && (
                      <div className="mt-0.5 text-xs text-text-muted">{o.guestName}</div>
                    )}
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )}
      </article>
    </>
  );
}
