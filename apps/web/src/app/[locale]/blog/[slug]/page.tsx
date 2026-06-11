import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { localePath } from "@aegis/url-builder";
import { ACTIVE_LOCALES, isLocale, type Locale } from "@aegis/i18n-config";
import { buildMetadata } from "@/lib/seo";
import { PageHeader } from "@/components/PageHeader";
import { BLOG_POSTS, getPost, relatedPosts, type BlogCategory } from "@/lib/blog-seed";
import {
  BLOG_POSTS_DATA,
  CATEGORY_CHIP_STYLES,
  PLACEHOLDER_SOURCES,
  getDataPost,
  relatedDataPosts,
  type BlogDataPost,
} from "@/lib/blog-data";
import { SITE } from "@/lib/site";

type Params = { locale: string; slug: string };

export function generateStaticParams(): Params[] {
  const out: Params[] = [];
  // Legacy seed posts
  for (const p of BLOG_POSTS) {
    for (const lc of ACTIVE_LOCALES) out.push({ locale: lc, slug: p.slug });
  }
  // New curated posts
  for (const p of BLOG_POSTS_DATA) {
    for (const lc of ACTIVE_LOCALES) out.push({ locale: lc, slug: p.slug });
  }
  return out;
}

const SEED_CATEGORY_STYLES: Record<BlogCategory, string> = {
  Briefs: "text-blue-400 border-blue-500/40 bg-blue-500/10",
  "Deep Dives": "text-purple-400 border-purple-500/40 bg-purple-500/10",
  Methodology: "text-amber-400 border-amber-500/40 bg-amber-500/10",
  Releases: "text-emerald-400 border-emerald-500/40 bg-emerald-500/10",
};

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { locale: raw, slug } = await params;
  const locale = (isLocale(raw) ? raw : "en") as Locale;

  // Check curated posts first, then seed
  const dataPost = getDataPost(slug);
  if (dataPost) {
    return buildMetadata({
      locale,
      title: dataPost.title,
      description: dataPost.excerpt,
      pathFor: (lc) => localePath(lc, `/blog/${slug}`),
    });
  }

  const post = getPost(slug);
  if (!post) return { robots: { index: false } };
  return buildMetadata({
    locale,
    title: post.title,
    description: post.excerpt,
    pathFor: (lc) => localePath(lc, `/blog/${slug}`),
  });
}

// ── Placeholder body paragraphs for curated posts ───────────────────────────
function getBodyParagraphs(post: BlogDataPost): string[] {
  return [
    `This report presents a comprehensive examination of ${post.title.toLowerCase()}. Drawing on verified open-source intelligence gathered over a multi-week period, our analysts have cross-referenced Telegram channels, satellite imagery, and official communiqués to build a coherent picture of the current situation.`,
    `The data underpinning this analysis was gathered through the Aegis Lens event ingestion pipeline, which processes thousands of raw reports daily. Each event passes through a three-stage verification process: initial triage by automated classifiers, secondary review by a regional analyst, and final sign-off against at least two independent sources. Only events meeting the confidence threshold are published to the platform.`,
    `Across the monitoring period, several notable trends emerged. The geographic distribution of verified events shifted compared to the previous reporting window, with activity concentrating around key logistical nodes. This pattern is consistent with established operational rhythms but also shows evidence of adaptive behaviour in response to observed countermeasures.`,
    `Source reliability remains a central methodological challenge. Social media amplification can artificially inflate the apparent significance of a single incident as reposts circulate. Our pipeline applies a repost-discount algorithm to detect and down-weight corroboration chains that originate from the same primary source, ensuring that independent confirmation, not echo, drives confidence scores.`,
    `Looking ahead, the indicators monitored in this brief will be tracked in subsequent issues. Subscribers to the Aegis Lens intelligence digest receive automated alerts when threshold changes are detected. The structured data, citation links, and export formats for all events referenced in this brief are available to Pro and Team plan subscribers via the platform and API.`,
  ];
}

// ── Pull-quote per category ──────────────────────────────────────────────────
function getPullQuote(post: BlogDataPost): string {
  const quotes: Record<string, string> = {
    Analysis:
      "The pattern of events, when examined at scale, reveals operational logic that individual incidents obscure. Data without context is noise; context without data is speculation.",
    "OSINT Guide":
      "Every pixel in an image carries metadata; every shadow encodes time. The analyst's task is not to find the truth — it is to reduce the space of possible lies.",
    "Conflict Brief":
      "Verified facts, clearly sourced and honestly bounded, are the only sustainable foundation for understanding a conflict zone. Uncertainty, named and quantified, is more useful than false precision.",
    "Product Update":
      "Intelligence infrastructure should be invisible when it works and loud when something changes. We build for analysts who need signal, not dashboards that demand attention.",
    "Data Release":
      "Open data accelerates scrutiny. When we publish, we invite challenge. That challenge makes the underlying work more rigorous over time.",
  };
  return quotes[post.category] ?? quotes["Analysis"];
}

export default async function BlogPostPage({ params }: { params: Promise<Params> }) {
  const { locale: raw, slug } = await params;
  const locale = (isLocale(raw) ? raw : "en") as Locale;
  const blogBase = locale === "en" ? "/blog" : `/${locale}/blog`;

  // ── Try curated post first ────────────────────────────────────────────────
  const dataPost = getDataPost(slug);
  if (dataPost) {
    const related = relatedDataPosts(dataPost);
    const bodyParagraphs = getBodyParagraphs(dataPost);
    const pullQuote = getPullQuote(dataPost);

    const pageUrl = `${SITE.url}${localePath(locale, `/blog/${dataPost.slug}`)}`;
    const blogUrl = `${SITE.url}${localePath(locale, "/blog")}`;

    const jsonLd = {
      "@context": "https://schema.org",
      "@graph": [
        {
          "@type": "Article",
          headline: dataPost.title,
          description: dataPost.excerpt,
          datePublished: dataPost.date,
          author: { "@type": "Person", name: dataPost.author },
          publisher: { "@type": "Organization", name: SITE.name, url: SITE.url },
          url: pageUrl,
          inLanguage: locale,
          mainEntityOfPage: pageUrl,
        },
        {
          "@type": "BreadcrumbList",
          itemListElement: [
            { "@type": "ListItem", position: 1, name: "Blog", item: blogUrl },
            { "@type": "ListItem", position: 2, name: dataPost.title },
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

        <div className="mx-auto max-w-6xl px-4 py-10">
          {/* Breadcrumb */}
          <nav className="mb-6 font-mono text-[11px] text-text-muted" aria-label="Breadcrumb">
            <Link href={blogBase} className="hover:text-text-primary">
              Blog
            </Link>
            <span className="mx-2 text-border-default">/</span>
            <span className="text-text-secondary">{dataPost.category}</span>
          </nav>

          {/* ── Two-column layout ──────────────────────────────────── */}
          <div className="grid gap-10 md:grid-cols-[1fr_280px]">

            {/* ── Article ───────────────────────────────────────────── */}
            <article>
              {/* Category chip + title */}
              <span
                className={`inline-block rounded border px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-wider ${CATEGORY_CHIP_STYLES[dataPost.category]}`}
              >
                {dataPost.category}
              </span>
              <h1 className="mt-3 text-3xl font-semibold tracking-tight text-text-primary md:text-4xl">
                {dataPost.title}
              </h1>

              {/* Author + meta */}
              <div className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-1 font-mono text-[11px] text-text-muted">
                <div className="flex items-center gap-2">
                  <div
                    aria-hidden
                    className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-bg-elevated font-mono text-[9px] uppercase text-accent"
                  >
                    {dataPost.author
                      .split(" ")
                      .map((w) => w[0])
                      .join("")
                      .slice(0, 2)}
                  </div>
                  <span className="text-text-secondary">{dataPost.author}</span>
                </div>
                <span className="text-border-default">·</span>
                <time dateTime={dataPost.date}>
                  {new Date(dataPost.date).toLocaleDateString(locale, {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </time>
                <span className="text-border-default">·</span>
                <span>{dataPost.readTime} read</span>
              </div>

              {/* Summary excerpt */}
              <div className="mt-8 rounded border-l-4 border-accent bg-bg-surface p-5">
                <p className="font-mono text-[10px] uppercase tracking-wider text-accent">Summary</p>
                <p className="mt-2 text-sm leading-relaxed text-text-secondary">{dataPost.excerpt}</p>
              </div>

              {/* Body paragraphs */}
              <div className="mt-8 space-y-5 text-sm leading-7 text-text-secondary">
                <p>{bodyParagraphs[0]}</p>
                <p>{bodyParagraphs[1]}</p>

                {/* Pull-quote */}
                <blockquote className="border-l-4 border-accent pl-4 italic text-text-secondary">
                  {pullQuote}
                </blockquote>

                <p>{bodyParagraphs[2]}</p>
                <p>{bodyParagraphs[3]}</p>
                <p>{bodyParagraphs[4]}</p>
              </div>

              {/* Related events */}
              {dataPost.eventCount !== null && (
                <div className="mt-10 rounded border border-accent/20 bg-accent/5 p-5">
                  <p className="font-mono text-[10px] uppercase tracking-wider text-accent">
                    Events cited
                  </p>
                  <p className="mt-2 text-sm text-text-secondary">
                    This brief cites{" "}
                    <span className="font-semibold text-text-primary">
                      {dataPost.eventCount.toLocaleString()} verified events
                    </span>
                    . Each event has been independently corroborated against at least two
                    primary sources.
                  </p>
                  <p className="mt-3">
                    <Link
                      href="/map"
                      className="font-mono text-[11px] text-accent underline-offset-2 hover:underline"
                    >
                      Browse them on the map →
                    </Link>
                  </p>
                </div>
              )}

              {/* CTA for full platform access */}
              <div className="mt-10 rounded border border-dashed border-accent/40 bg-bg-elevated p-6 text-center">
                <p className="font-mono text-[10px] uppercase tracking-widest text-text-muted">
                  Full platform access
                </p>
                <p className="mt-3 text-sm text-text-secondary">
                  Structured event data, citation export, and API access are available to Pro
                  and Team subscribers.
                </p>
                <p className="mt-5">
                  <Link
                    href={localePath(locale, "/signup")}
                    className="inline-block rounded border border-accent px-5 py-2 font-mono text-sm text-accent hover:bg-accent hover:text-bg-base"
                  >
                    Start free trial →
                  </Link>
                </p>
              </div>

              <p className="mt-10 text-sm">
                <Link
                  href={blogBase}
                  className="text-accent underline-offset-2 hover:underline"
                >
                  ← All posts
                </Link>
              </p>
            </article>

            {/* ── Sidebar ───────────────────────────────────────────── */}
            <aside className="space-y-8">

              {/* Related articles */}
              {related.length > 0 && (
                <div className="rounded border border-border-subtle bg-bg-surface p-5">
                  <p className="font-mono text-[10px] uppercase tracking-wider text-text-muted">
                    Related articles
                  </p>
                  <ul className="mt-4 space-y-4">
                    {related.map((r) => (
                      <li key={r.slug}>
                        <Link
                          href={`${blogBase}/${r.slug}`}
                          className="group block"
                        >
                          <span
                            className={`inline-block rounded border px-1.5 py-0.5 font-mono text-[8px] uppercase tracking-wider ${CATEGORY_CHIP_STYLES[r.category]}`}
                          >
                            {r.category}
                          </span>
                          <p className="mt-1.5 text-sm font-medium text-text-primary group-hover:text-accent">
                            {r.title}
                          </p>
                          <p className="mt-0.5 font-mono text-[10px] text-text-muted">
                            {r.readTime} read
                          </p>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Author card */}
              <div className="rounded border border-border-subtle bg-bg-surface p-5">
                <p className="font-mono text-[10px] uppercase tracking-wider text-text-muted">
                  Author
                </p>
                <div className="mt-3 flex items-center gap-3">
                  <div
                    aria-hidden
                    className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-bg-elevated font-mono text-[11px] uppercase text-accent"
                  >
                    {dataPost.author
                      .split(" ")
                      .map((w) => w[0])
                      .join("")
                      .slice(0, 2)}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-text-primary">{dataPost.author}</p>
                    <p className="font-mono text-[9px] uppercase tracking-wider text-text-muted">
                      Aegis Lens Editorial
                    </p>
                  </div>
                </div>
                <p className="mt-3 text-xs leading-relaxed text-text-secondary">
                  The Aegis Lens editorial team comprises OSINT analysts, data engineers, and
                  regional specialists who verify and contextualise conflict intelligence across
                  Europe and the Black Sea region.
                </p>
              </div>

              {/* Subscribe form */}
              <div className="rounded border border-border-subtle bg-bg-surface p-5">
                <p className="font-mono text-[10px] uppercase tracking-wider text-text-muted">
                  Intelligence brief
                </p>
                <p className="mt-2 text-sm text-text-secondary">
                  Receive verified briefings directly in your inbox. No noise, no spam.
                </p>
                <form
                  action="/api/subscribe"
                  method="POST"
                  className="mt-4 flex flex-col gap-2"
                >
                  <input
                    type="email"
                    name="email"
                    required
                    placeholder="you@example.com"
                    className="w-full rounded border border-border-subtle bg-bg-elevated px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:border-accent focus:outline-none"
                  />
                  <button
                    type="submit"
                    className="w-full rounded border border-accent px-4 py-2 font-mono text-[11px] uppercase tracking-wider text-accent transition-colors hover:bg-accent hover:text-bg-base"
                  >
                    Subscribe
                  </button>
                </form>
              </div>

              {/* Sources cited */}
              <div className="rounded border border-border-subtle bg-bg-surface p-5">
                <p className="font-mono text-[10px] uppercase tracking-wider text-text-muted">
                  Sources cited
                </p>
                <ul className="mt-4 space-y-2">
                  {PLACEHOLDER_SOURCES.map((src) => (
                    <li key={src.name}>
                      <a
                        href={src.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-start gap-2 text-xs text-accent underline-offset-2 hover:underline"
                      >
                        <span className="mt-0.5 shrink-0 font-mono text-[10px] text-text-muted">↗</span>
                        {src.name}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            </aside>
          </div>
        </div>
      </>
    );
  }

  // ── Fall back to legacy seed post ────────────────────────────────────────
  const post = getPost(slug);
  if (!post) notFound();

  const pageUrl = `${SITE.url}${localePath(locale, `/blog/${post.slug}`)}`;
  const blogUrl = `${SITE.url}${localePath(locale, "/blog")}`;
  const related = relatedPosts(post);

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": post.aiGenerated ? "Article" : "NewsArticle",
        headline: post.title,
        description: post.excerpt,
        datePublished: post.publishedAt,
        ...(post.lastVerifiedAt ? { dateModified: post.lastVerifiedAt } : {}),
        author: { "@type": "Person", name: post.author, jobTitle: post.authorRole },
        publisher: { "@type": "Organization", name: SITE.name, url: SITE.url },
        keywords: post.tags.join(", "),
        url: pageUrl,
        inLanguage: locale,
        mainEntityOfPage: pageUrl,
        timeRequired: `PT${post.readingTimeMin}M`,
        ...(post.aiGenerated
          ? {
              additionalProperty: {
                "@type": "PropertyValue",
                propertyID: "aiGenerated",
                value: "true",
              },
            }
          : {}),
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Blog", item: blogUrl },
          { "@type": "ListItem", position: 2, name: post.title },
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

      <div className="mx-auto max-w-6xl px-4 py-10">
        {/* Breadcrumb */}
        <nav className="mb-6 font-mono text-[11px] text-text-muted" aria-label="Breadcrumb">
          <Link href={localePath(locale, "/blog")} className="hover:text-text-primary">
            Blog
          </Link>
          <span className="mx-2 text-border-default">/</span>
          <span className="text-text-secondary">{post.category}</span>
        </nav>

        {/* ── Two-column layout ────────────────────────────────────── */}
        <div className="grid gap-10 md:grid-cols-[1fr_280px]">

          {/* ── Article ─────────────────────────────────────────────── */}
          <article>
            <PageHeader eyebrow={post.category} title={post.title} />

            {/* Meta row */}
            <div className="mt-4 flex flex-wrap items-center gap-3">
              <span
                className={`rounded border px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-wider ${SEED_CATEGORY_STYLES[post.category]}`}
              >
                {post.category}
              </span>
              {post.aiGenerated && (
                <span className="rounded border border-zinc-500/40 bg-zinc-500/10 px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-wider text-zinc-400">
                  AI-assisted
                </span>
              )}
              <time dateTime={post.publishedAt} className="font-mono text-[10px] text-text-muted">
                {new Date(post.publishedAt).toLocaleDateString(locale, {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </time>
              <span className="font-mono text-[10px] text-text-muted">
                {post.readingTimeMin} min read
              </span>
              {post.lastVerifiedAt && (
                <span className="font-mono text-[10px] text-text-muted">
                  Last verified:{" "}
                  {new Date(post.lastVerifiedAt).toLocaleDateString(locale, {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  })}
                </span>
              )}
            </div>

            {/* Author */}
            <div className="mt-4 flex items-center gap-3">
              <div
                aria-hidden
                className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-bg-elevated font-mono text-[10px] uppercase text-accent"
              >
                {post.author
                  .split(" ")
                  .map((w) => w[0])
                  .join("")
                  .slice(0, 2)}
              </div>
              <div>
                <p className="text-sm font-medium text-text-primary">{post.author}</p>
                <p className="font-mono text-[9px] uppercase tracking-wider text-text-muted">
                  {post.authorRole}
                </p>
              </div>
            </div>

            {/* Tags */}
            <ul className="mt-5 flex flex-wrap gap-1.5">
              {post.tags.map((tag) => (
                <li
                  key={tag}
                  className="rounded border border-border-subtle px-2 py-0.5 font-mono text-[9px] text-text-muted"
                >
                  {tag}
                </li>
              ))}
            </ul>

            {/* Excerpt / summary */}
            <div className="mt-8 rounded border-l-4 border-accent bg-bg-surface p-5">
              <p className="font-mono text-[10px] uppercase tracking-wider text-accent">Summary</p>
              <p className="mt-2 text-sm leading-relaxed text-text-secondary">{post.excerpt}</p>
            </div>

            {/* Full article CTA */}
            <div className="mt-10 rounded border border-dashed border-accent/40 bg-bg-elevated p-6 text-center">
              <p className="font-mono text-[10px] uppercase tracking-widest text-text-muted">
                Full article
              </p>
              <p className="mt-3 text-sm text-text-secondary">
                Full article text is available in the platform for Pro and Team subscribers. The
                structured data, citations, and export formats are available via the API.
              </p>
              <p className="mt-5">
                <Link
                  href={localePath(locale, "/signup")}
                  className="inline-block rounded border border-accent px-5 py-2 font-mono text-sm text-accent hover:bg-accent hover:text-bg-base"
                >
                  Start free trial →
                </Link>
              </p>
            </div>

            <p className="mt-10 text-sm">
              <Link
                href={localePath(locale, "/blog")}
                className="text-accent underline-offset-2 hover:underline"
              >
                ← All posts
              </Link>
            </p>
          </article>

          {/* ── Sidebar ─────────────────────────────────────────────── */}
          <aside className="space-y-8">

            {/* Related articles */}
            {related.length > 0 && (
              <div className="rounded border border-border-subtle bg-bg-surface p-5">
                <p className="font-mono text-[10px] uppercase tracking-wider text-text-muted">
                  Related articles
                </p>
                <ul className="mt-4 space-y-4">
                  {related.map((r) => (
                    <li key={r.slug}>
                      <Link
                        href={localePath(locale, `/blog/${r.slug}`)}
                        className="group block rounded border border-border-subtle bg-bg-elevated p-3 transition-colors hover:border-accent/40"
                      >
                        <p className="text-sm font-medium text-text-primary group-hover:text-accent">
                          {r.title}
                        </p>
                        <p className="mt-1 font-mono text-[10px] text-text-muted">
                          {new Date(r.publishedAt).toLocaleDateString(locale, {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          })}{" "}
                          · {r.readingTimeMin} min read
                        </p>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Author card */}
            <div className="rounded border border-border-subtle bg-bg-surface p-5">
              <p className="font-mono text-[10px] uppercase tracking-wider text-text-muted">
                Author
              </p>
              <div className="mt-3 flex items-center gap-3">
                <div
                  aria-hidden
                  className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-bg-elevated font-mono text-[11px] uppercase text-accent"
                >
                  {post.author
                    .split(" ")
                    .map((w) => w[0])
                    .join("")
                    .slice(0, 2)}
                </div>
                <div>
                  <p className="text-sm font-semibold text-text-primary">{post.author}</p>
                  <p className="font-mono text-[9px] uppercase tracking-wider text-text-muted">
                    {post.authorRole}
                  </p>
                </div>
              </div>
              <p className="mt-3 text-xs leading-relaxed text-text-secondary">
                A member of the Aegis Lens intelligence team, specialising in OSINT
                methodology, event verification, and conflict data analysis across the
                Eastern European theatre.
              </p>
            </div>

            {/* Subscribe form */}
            <div className="rounded border border-border-subtle bg-bg-surface p-5">
              <p className="font-mono text-[10px] uppercase tracking-wider text-text-muted">
                Intelligence brief
              </p>
              <p className="mt-2 text-sm text-text-secondary">
                Receive verified briefings directly in your inbox. No noise, no spam.
              </p>
              <form
                action="/api/subscribe"
                method="POST"
                className="mt-4 flex flex-col gap-2"
              >
                <input
                  type="email"
                  name="email"
                  required
                  placeholder="you@example.com"
                  className="w-full rounded border border-border-subtle bg-bg-elevated px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:border-accent focus:outline-none"
                />
                <button
                  type="submit"
                  className="w-full rounded border border-accent px-4 py-2 font-mono text-[11px] uppercase tracking-wider text-accent transition-colors hover:bg-accent hover:text-bg-base"
                >
                  Subscribe
                </button>
              </form>
            </div>

            {/* Sources cited */}
            <div className="rounded border border-border-subtle bg-bg-surface p-5">
              <p className="font-mono text-[10px] uppercase tracking-wider text-text-muted">
                Sources cited
              </p>
              <ul className="mt-4 space-y-2">
                {PLACEHOLDER_SOURCES.map((src) => (
                  <li key={src.name}>
                    <a
                      href={src.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-start gap-2 text-xs text-accent underline-offset-2 hover:underline"
                    >
                      <span className="mt-0.5 shrink-0 font-mono text-[10px] text-text-muted">↗</span>
                      {src.name}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </aside>
        </div>
      </div>
    </>
  );
}
