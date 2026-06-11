import Link from "next/link";
import type { Metadata } from "next";
import { urls, localePath } from "@aegis/url-builder";
import { ACTIVE_LOCALES, isLocale, type Locale } from "@aegis/i18n-config";
import { buildMetadata } from "@/lib/seo";
import { PageHeader } from "@/components/PageHeader";
import { PODCAST_EPISODES, listPodcastEpisodes } from "@/lib/podcast-data";
import { SITE } from "@/lib/site";

export function generateStaticParams() {
  return ACTIVE_LOCALES.map((locale) => ({ locale }));
}

const PODCAST_TITLE = "Intelligence Decoded";
const PODCAST_DESCRIPTION =
  "Weekly conversations with analysts, journalists, and technologists on open-source intelligence and conflict reporting.";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale: raw } = await params;
  const locale = (isLocale(raw) ? raw : "en") as Locale;
  return buildMetadata({
    locale,
    title: PODCAST_TITLE,
    description: PODCAST_DESCRIPTION,
    pathFor: (lc) => localePath(lc, "/podcast"),
  });
}

export default async function PodcastIndexPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: raw } = await params;
  const locale = (isLocale(raw) ? raw : "en") as Locale;
  const episodes = listPodcastEpisodes();

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "PodcastSeries",
    name: PODCAST_TITLE,
    description: PODCAST_DESCRIPTION,
    url: `${SITE.url}${localePath(locale, "/podcast")}`,
    author: { "@type": "Organization", name: "Aegis Lens", url: SITE.url },
    publisher: { "@type": "Organization", name: SITE.name, url: SITE.url },
    inLanguage: locale,
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <PageHeader
        eyebrow="Podcast"
        title={PODCAST_TITLE}
        description={PODCAST_DESCRIPTION}
      />

      <section className="mx-auto max-w-3xl px-4 py-10">
        {/* Subscribe links */}
        <div className="mb-8 flex flex-wrap items-center gap-3">
          <span className="font-mono text-[10px] uppercase tracking-wider text-text-muted">
            Subscribe:
          </span>
          <a
            href="https://spotify.com"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 rounded border border-border-subtle bg-bg-surface px-3 py-1.5 font-mono text-[11px] uppercase tracking-wider text-text-secondary hover:bg-bg-elevated hover:text-text-primary"
          >
            Spotify
          </a>
          <a
            href="https://podcasts.apple.com"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 rounded border border-border-subtle bg-bg-surface px-3 py-1.5 font-mono text-[11px] uppercase tracking-wider text-text-secondary hover:bg-bg-elevated hover:text-text-primary"
          >
            Apple Podcasts
          </a>
          <a
            href="/podcast/feed.xml"
            className="inline-flex items-center gap-1.5 rounded border border-border-subtle bg-bg-surface px-3 py-1.5 font-mono text-[11px] uppercase tracking-wider text-text-secondary hover:bg-bg-elevated hover:text-text-primary"
          >
            RSS
          </a>
        </div>

        {/* Episode list */}
        <ul className="space-y-4">
          {episodes.map((e) => (
            <li key={e.slug}>
              <Link
                href={urls.podcastEpisode(locale, e.slug)}
                className="block rounded border border-border-subtle bg-bg-surface p-5 hover:bg-bg-elevated"
              >
                <div className="flex flex-wrap items-center gap-2 font-mono text-[10px] uppercase tracking-wider text-text-muted">
                  <span className="rounded bg-bg-elevated px-1.5 py-0.5 text-accent">
                    Ep. {e.episodeNumber}
                  </span>
                  <span>·</span>
                  <span>{e.durationMin} min</span>
                  <span>·</span>
                  <span>{e.publishedAt}</span>
                </div>
                <h2 className="mt-3 text-base font-semibold text-text-primary">{e.title}</h2>
                {e.guestName && (
                  <div className="mt-1 font-mono text-[11px] text-text-muted">
                    {e.guestName}
                    {e.guestRole ? ` — ${e.guestRole}` : ""}
                  </div>
                )}
                <p className="mt-2 text-sm text-text-secondary">{e.description}</p>
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {e.tags.map((t) => (
                    <span
                      key={t}
                      className="inline-flex items-center rounded border border-border-subtle bg-bg-elevated px-1.5 py-0.5 font-mono text-[10px] text-text-muted"
                    >
                      {t}
                    </span>
                  ))}
                </div>
                <div className="mt-3 font-mono text-[11px] uppercase tracking-wider text-accent">
                  Listen →
                </div>
              </Link>
            </li>
          ))}
        </ul>

        {/* Bottom CTA */}
        <div className="mt-12 rounded border border-border-subtle bg-bg-surface p-5">
          <p className="font-mono text-[10px] uppercase tracking-wider text-text-muted">
            Be a guest
          </p>
          <p className="mt-2 text-sm text-text-secondary">
            We talk with analysts, journalists, and technologists working at the frontier of
            open-source intelligence. Reach out at{" "}
            <a
              href="mailto:podcast@aegislens.io"
              className="text-accent hover:underline"
            >
              podcast@aegislens.io
            </a>
            .
          </p>
        </div>
      </section>
    </>
  );
}
