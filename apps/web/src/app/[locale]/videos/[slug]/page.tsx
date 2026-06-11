import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { urls, localePath } from "@aegis/url-builder";
import { ACTIVE_LOCALES, isLocale, type Locale } from "@aegis/i18n-config";
import { buildMetadata } from "@/lib/seo";
import { PageHeader } from "@/components/PageHeader";
import {
  VIDEOS,
  getVideo,
  listVideos,
  formatVideoDuration,
  isoVideoDuration,
  VIDEO_CATEGORY_LABEL,
} from "@/lib/videos-seed";
import { SITE } from "@/lib/site";

type Params = { locale: string; slug: string };

export function generateStaticParams(): Params[] {
  const out: Params[] = [];
  for (const v of VIDEOS) {
    for (const lc of ACTIVE_LOCALES) out.push({ locale: lc, slug: v.slug });
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
  const v = getVideo(slug);
  if (!v) return { robots: { index: false } };
  return buildMetadata({
    locale,
    title: v.title,
    description: v.summary,
    pathFor: (lc) => localePath(lc, `/videos/${v.slug}`),
  });
}

function surfaceHref(
  locale: Locale,
  s: { kind: "event" | "report" | "investigation"; id: string },
): string {
  switch (s.kind) {
    case "event":
      return urls.event(locale, s.id);
    case "report":
      return urls.report(locale, s.id);
    case "investigation":
      return urls.investigation(locale, s.id);
  }
}

export default async function VideoDetailPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { locale: raw, slug } = await params;
  const locale = (isLocale(raw) ? raw : "en") as Locale;
  const v = getVideo(slug);
  if (!v) notFound();

  const pageUrl = `${SITE.url}${localePath(locale, `/videos/${v.slug}`)}`;
  const related = listVideos().filter((x) => x.slug !== v.slug && x.category === v.category).slice(0, 3);

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "VideoObject",
        name: v.title,
        description: v.summary,
        uploadDate: v.publishedAt,
        duration: isoVideoDuration(v.durationSeconds),
        url: pageUrl,
        thumbnailUrl: `${SITE.url}${localePath(locale, `/videos/${v.slug}/opengraph-image`)}`,
        inLanguage: locale,
        publisher: { "@type": "Organization", name: SITE.name, url: SITE.url },
        keywords: v.tags.join(", "),
        hasPart: v.chapters.map((ch) => ({
          "@type": "Clip",
          name: ch.title,
          startOffset: ch.startSeconds,
        })),
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          {
            "@type": "ListItem",
            position: 1,
            name: "Videos",
            item: `${SITE.url}${urls.videos(locale)}`,
          },
          { "@type": "ListItem", position: 2, name: v.title },
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
          <Link href={urls.videos(locale)} className="hover:text-text-primary">
            Videos
          </Link>
          <span className="mx-2 text-border-default">/</span>
          <span className="text-text-secondary">{v.title}</span>
        </nav>

        <PageHeader
          eyebrow={VIDEO_CATEGORY_LABEL[v.category]}
          title={v.title}
          description={v.summary}
        />

        <div className="mt-2 flex flex-wrap items-center gap-3 font-mono text-[11px] uppercase tracking-wider text-text-muted">
          <span>{v.publishedAt.slice(0, 10)}</span>
          <span>·</span>
          <span>{formatVideoDuration(v.durationSeconds)}</span>
          <span>·</span>
          <span>Transcript published</span>
        </div>

        <div className="mt-4 flex flex-wrap gap-1.5">
          {v.tags.map((t) => (
            <Link
              key={t}
              href={urls.tag(locale, t)}
              className="inline-flex items-center rounded border border-border-subtle bg-bg-elevated px-1.5 py-0.5 font-mono text-[10px] text-text-muted hover:text-accent"
            >
              {t}
            </Link>
          ))}
        </div>

        {/* Placeholder embed — real player wired when hosting is set up */}
        <div className="mt-6 aspect-video w-full overflow-hidden rounded border border-border-subtle bg-bg-elevated">
          <div className="flex h-full items-center justify-center font-mono text-xs uppercase tracking-wider text-text-muted">
            Video player placeholder · {formatVideoDuration(v.durationSeconds)}
          </div>
        </div>

        <section className="mt-8">
          <h2 className="text-base font-semibold text-text-primary">Chapters</h2>
          <ul className="mt-3 space-y-1.5">
            {v.chapters.map((ch, i) => (
              <li
                key={i}
                className="flex items-baseline gap-3 rounded border border-border-subtle bg-bg-surface px-3 py-2 text-sm"
              >
                <span className="font-mono text-[10px] text-text-muted">
                  {formatVideoDuration(ch.startSeconds)}
                </span>
                <span className="text-text-primary">{ch.title}</span>
              </li>
            ))}
          </ul>
        </section>

        {v.linkedSurfaces.length > 0 && (
          <section className="mt-8">
            <h2 className="text-base font-semibold text-text-primary">Referenced surfaces</h2>
            <ul className="mt-3 space-y-2">
              {v.linkedSurfaces.map((s, i) => (
                <li key={i}>
                  <Link
                    href={surfaceHref(locale, s)}
                    className="block rounded border border-border-subtle bg-bg-surface px-3 py-2 text-sm hover:bg-bg-elevated"
                  >
                    <span className="font-mono text-[10px] uppercase tracking-wider text-text-muted">
                      {s.kind}
                    </span>
                    <span className="ml-2 text-text-primary">{s.label}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )}

        <section className="mt-10">
          <h2 className="text-base font-semibold text-text-primary">Transcript</h2>
          <div className="mt-3 space-y-3 text-sm leading-relaxed text-text-secondary">
            {v.transcript.map((line, i) => (
              <p key={i}>{line}</p>
            ))}
          </div>
        </section>

        {related.length > 0 && (
          <section className="mt-10 border-t border-border-subtle pt-6">
            <h2 className="text-base font-semibold text-text-primary">
              More {VIDEO_CATEGORY_LABEL[v.category].toLowerCase()}s
            </h2>
            <ul className="mt-3 grid grid-cols-1 gap-2 md:grid-cols-2">
              {related.map((r) => (
                <li key={r.slug}>
                  <Link
                    href={urls.video(locale, r.slug)}
                    className="block rounded border border-border-subtle bg-bg-surface px-3 py-2 text-sm hover:bg-bg-elevated"
                  >
                    <div className="font-mono text-[10px] uppercase tracking-wider text-text-muted">
                      {formatVideoDuration(r.durationSeconds)}
                    </div>
                    <div className="mt-1 text-text-primary">{r.title}</div>
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
