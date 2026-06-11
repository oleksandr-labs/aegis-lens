import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { urls, localePath } from "@aegis/url-builder";
import { ACTIVE_LOCALES, isLocale, type Locale } from "@aegis/i18n-config";
import { buildMetadata } from "@/lib/seo";
import { PageHeader } from "@/components/PageHeader";
import {
  listVideos,
  formatVideoDuration,
  VIDEO_CATEGORY_LABEL,
  type Video,
} from "@/lib/videos-seed";
import { SITE } from "@/lib/site";

type Params = { locale: string; slug: string };

const ALL_CATEGORIES = Object.keys(VIDEO_CATEGORY_LABEL) as Video["category"][];

export function generateStaticParams(): Params[] {
  const out: Params[] = [];
  for (const cat of ALL_CATEGORIES) {
    const has = listVideos().some((v) => v.category === cat);
    if (!has) continue;
    for (const lc of ACTIVE_LOCALES) out.push({ locale: lc, slug: cat });
  }
  return out;
}

function isCategory(s: string): s is Video["category"] {
  return (ALL_CATEGORIES as string[]).includes(s);
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { locale: raw, slug } = await params;
  const locale = (isLocale(raw) ? raw : "en") as Locale;
  if (!isCategory(slug)) return { robots: { index: false } };
  const videos = listVideos().filter((v) => v.category === slug);
  if (videos.length === 0) return { robots: { index: false } };
  const label = VIDEO_CATEGORY_LABEL[slug];
  return buildMetadata({
    locale,
    title: `${label} videos`,
    description: `${videos.length} ${label.toLowerCase()} videos in the Aegis Lens library. Each ships with chapter markers and a publishable transcript.`,
    pathFor: (lc) => localePath(lc, `/videos/category/${slug}`),
  });
}

export default async function VideosByCategoryPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { locale: raw, slug } = await params;
  const locale = (isLocale(raw) ? raw : "en") as Locale;
  if (!isCategory(slug)) notFound();
  const videos = listVideos().filter((v) => v.category === slug);
  if (videos.length === 0) notFound();

  const label = VIDEO_CATEGORY_LABEL[slug];
  const pageUrl = `${SITE.url}${localePath(locale, `/videos/category/${slug}`)}`;

  const otherCategories = ALL_CATEGORIES.filter((c) => c !== slug && listVideos().some((v) => v.category === c));

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: `${label} videos`,
    description: `${videos.length} ${label.toLowerCase()} videos.`,
    url: pageUrl,
    inLanguage: locale,
    isPartOf: { "@type": "WebSite", url: SITE.url, name: SITE.name },
    mainEntity: {
      "@type": "ItemList",
      numberOfItems: videos.length,
      itemListElement: videos.map((v, idx) => ({
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

      <article className="mx-auto max-w-5xl px-4 py-10">
        <nav className="font-mono text-[11px] text-text-muted" aria-label="Breadcrumb">
          <Link href={urls.videos(locale)} className="hover:text-text-primary">
            Videos
          </Link>
          <span className="mx-2 text-border-default">/</span>
          <span className="text-text-secondary">{label}</span>
        </nav>

        <PageHeader
          eyebrow="Category"
          title={`${label} videos`}
          description={`${videos.length} ${label.toLowerCase()} videos in the library.`}
        />

        <section className="mt-8">
          <ul className="grid grid-cols-1 gap-3 md:grid-cols-2">
            {videos.map((v) => (
              <li key={v.slug}>
                <Link
                  href={urls.video(locale, v.slug)}
                  className="block h-full rounded border border-border-subtle bg-bg-surface p-4 hover:bg-bg-elevated"
                >
                  <div className="flex flex-wrap items-center gap-2 font-mono text-[10px] uppercase tracking-wider text-text-muted">
                    <span>{v.publishedAt.slice(0, 10)}</span>
                    <span>·</span>
                    <span>{formatVideoDuration(v.durationSeconds)}</span>
                  </div>
                  <h2 className="mt-2 text-base font-semibold text-text-primary">{v.title}</h2>
                  <p className="mt-2 text-sm text-text-secondary">{v.summary}</p>
                </Link>
              </li>
            ))}
          </ul>
        </section>

        {otherCategories.length > 0 && (
          <section className="mt-10 border-t border-border-subtle pt-6">
            <h2 className="text-base font-semibold text-text-primary">Other categories</h2>
            <ul className="mt-3 flex flex-wrap gap-2">
              {otherCategories.map((c) => (
                <li key={c}>
                  <Link
                    href={urls.videosByCategory(locale, c)}
                    className="inline-flex items-center rounded border border-border-subtle bg-bg-surface px-3 py-1.5 text-xs text-text-secondary hover:bg-bg-elevated hover:text-text-primary"
                  >
                    {VIDEO_CATEGORY_LABEL[c]}
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
