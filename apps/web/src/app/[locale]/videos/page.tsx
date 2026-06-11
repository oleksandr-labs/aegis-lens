import Link from "next/link";
import type { Metadata } from "next";
import { urls, localePath } from "@aegis/url-builder";
import { ACTIVE_LOCALES, isLocale, type Locale } from "@aegis/i18n-config";
import { buildMetadata } from "@/lib/seo";
import { PageHeader } from "@/components/PageHeader";
import {
  VIDEOS,
  listVideoEntries,
  VIDEO_CATEGORY_LABELS,
  type VideoEntry,
} from "@/lib/videos-data";
import { SITE } from "@/lib/site";

export function generateStaticParams() {
  return ACTIVE_LOCALES.map((locale) => ({ locale }));
}

const TITLE = "Video Library";
const DESCRIPTION =
  "Tutorials, demos, explainers, and interviews covering OSINT techniques, geolocation, satellite imagery analysis, and the Aegis Lens platform.";

const ALL_CATEGORIES = ["tutorial", "demo", "explainer", "interview"] as const;

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
    pathFor: (lc) => localePath(lc, "/videos"),
  });
}

export default async function VideosIndexPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: raw } = await params;
  const locale = (isLocale(raw) ? raw : "en") as Locale;
  const all = listVideoEntries();

  // Group by category for display
  const byCategory = new Map<VideoEntry["category"], VideoEntry[]>();
  for (const v of all) {
    const arr = byCategory.get(v.category) ?? [];
    arr.push(v);
    byCategory.set(v.category, arr);
  }

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: TITLE,
    description: DESCRIPTION,
    url: `${SITE.url}${localePath(locale, "/videos")}`,
    isPartOf: { "@type": "WebSite", url: SITE.url, name: SITE.name },
    mainEntity: {
      "@type": "ItemList",
      numberOfItems: VIDEOS.length,
      itemListElement: VIDEOS.map((v, idx) => ({
        "@type": "ListItem",
        position: idx + 1,
        url: `${SITE.url}${urls.video(locale, v.slug)}`,
        name: v.title,
      })),
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <PageHeader eyebrow="Watch" title={TITLE} description={DESCRIPTION} />

      <section className="mx-auto max-w-5xl px-4 py-10">
        {/* Category filter chips (static — All is always shown first) */}
        <div className="mb-8 flex flex-wrap gap-2">
          <span className="inline-flex items-center rounded border border-accent bg-accent/10 px-3 py-1.5 font-mono text-[11px] uppercase tracking-wider text-accent">
            All
          </span>
          {ALL_CATEGORIES.map((cat) => (
            <span
              key={cat}
              className="inline-flex items-center rounded border border-border-subtle bg-bg-surface px-3 py-1.5 font-mono text-[11px] uppercase tracking-wider text-text-muted"
            >
              {VIDEO_CATEGORY_LABELS[cat]}
            </span>
          ))}
        </div>

        {/* Video grid by category */}
        <div className="space-y-12">
          {ALL_CATEGORIES.filter((cat) => byCategory.has(cat)).map((cat) => {
            const videos = byCategory.get(cat)!;
            return (
              <div key={cat}>
                <h2 className="mb-4 font-mono text-[11px] uppercase tracking-wider text-text-muted">
                  {VIDEO_CATEGORY_LABELS[cat]} ({videos.length})
                </h2>
                <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {videos.map((v) => (
                    <li key={v.slug}>
                      <Link
                        href={urls.video(locale, v.slug)}
                        className="group block h-full rounded border border-border-subtle bg-bg-surface hover:bg-bg-elevated"
                      >
                        {/* Thumbnail */}
                        <div className="relative flex aspect-square items-center justify-center overflow-hidden rounded-t border-b border-border-subtle bg-bg-elevated text-5xl">
                          {v.thumbnailEmoji}
                          {/* Duration badge */}
                          <span className="absolute bottom-2 right-2 rounded bg-bg-surface/90 px-1.5 py-0.5 font-mono text-[10px] text-text-primary">
                            {v.duration}
                          </span>
                          {/* Category badge */}
                          <span className="absolute left-2 top-2 rounded border border-border-subtle bg-bg-surface/90 px-1.5 py-0.5 font-mono text-[10px] uppercase tracking-wider text-accent">
                            {VIDEO_CATEGORY_LABELS[v.category]}
                          </span>
                        </div>

                        {/* Card body */}
                        <div className="p-3">
                          <h3 className="text-sm font-semibold leading-snug text-text-primary group-hover:text-accent">
                            {v.title}
                          </h3>
                          <div className="mt-2 flex items-center gap-2 font-mono text-[10px] text-text-muted">
                            <span>{v.views} views</span>
                            <span>·</span>
                            <span>{v.publishedAt}</span>
                          </div>
                        </div>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>

        {/* Bottom CTA */}
        <div className="mt-14 rounded border border-border-subtle bg-bg-surface p-5">
          <p className="font-mono text-[10px] uppercase tracking-wider text-text-muted">
            Submit a video
          </p>
          <p className="mt-2 text-sm text-text-secondary">
            Produced an OSINT walkthrough, geolocation tutorial, or investigation breakdown?
            We review community submissions at{" "}
            <a href="mailto:community@aegislens.io" className="text-accent hover:underline">
              community@aegislens.io
            </a>
            .
          </p>
        </div>
      </section>
    </>
  );
}
