import type { Metadata } from "next";
import Link from "next/link";
import { urls, localePath } from "@aegis/url-builder";
import { isLocale, type Locale } from "@aegis/i18n-config";
import { getT } from "@/lib/i18n";
import { buildMetadata } from "@/lib/seo";
import { PageHeader } from "@/components/PageHeader";
import { BLOG_CATEGORIES, listPosts, listPinnedPosts, type BlogCategory } from "@/lib/blog-seed";
import {
  BLOG_POSTS_DATA,
  BLOG_DATA_CATEGORIES,
  CATEGORY_CHIP_STYLES,
  type BlogDataCategory,
} from "@/lib/blog-data";

const SEED_CATEGORY_STYLES: Record<BlogCategory, string> = {
  Briefs: "text-blue-400 border-blue-500/40 bg-blue-500/10",
  "Deep Dives": "text-purple-400 border-purple-500/40 bg-purple-500/10",
  Methodology: "text-amber-400 border-amber-500/40 bg-amber-500/10",
  Releases: "text-emerald-400 border-emerald-500/40 bg-emerald-500/10",
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale: raw } = await params;
  const locale = (isLocale(raw) ? raw : "en") as Locale;
  const t = await getT(locale, "marketing");
  return buildMetadata({
    locale,
    title: t("blog.title"),
    description: t("blog.subtitle"),
    pathFor: (lc) => urls.blog(lc),
    feeds: [
      {
        type: "application/rss+xml",
        href: "/blog/feed.xml",
        title: `${t("blog.title")} — RSS`,
      },
    ],
  });
}

export default async function BlogPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ category?: string }>;
}) {
  const { locale: raw } = await params;
  const locale = (isLocale(raw) ? raw : "en") as Locale;
  const t = await getT(locale, "marketing");
  const sp = await searchParams;

  // --- Legacy seed posts (pinned strip + list) ---
  const activeCategory = (
    BLOG_CATEGORIES.includes(sp.category as BlogCategory) ? sp.category : undefined
  ) as BlogCategory | undefined;

  const allPosts = listPosts();
  const posts = activeCategory ? listPosts({ category: activeCategory }) : allPosts;
  const pinnedPosts = listPinnedPosts();
  const blogBase = locale === "en" ? "/blog" : `/${locale}/blog`;

  // --- New curated posts with category filter ---
  const activeDataCategory = (
    BLOG_DATA_CATEGORIES.includes(sp.category as BlogDataCategory)
      ? sp.category
      : undefined
  ) as BlogDataCategory | undefined;

  const filteredDataPosts = activeDataCategory
    ? BLOG_POSTS_DATA.filter((p) => p.category === activeDataCategory)
    : BLOG_POSTS_DATA;

  const blogJsonLd = {
    "@context": "https://schema.org",
    "@type": "Blog",
    name: t("blog.title"),
    description: t("blog.subtitle"),
    inLanguage: locale,
    blogPost: posts.map((p) => ({
      "@type": p.aiGenerated ? "Article" : "NewsArticle",
      headline: p.title,
      description: p.excerpt,
      datePublished: p.publishedAt,
      author: { "@type": "Person", name: p.author },
      keywords: p.tags.join(", "),
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(blogJsonLd) }}
      />

      {/* ── Hero ────────────────────────────────────────────────────── */}
      <PageHeader
        eyebrow="Intelligence Briefs"
        title="The Aegis Lens Blog"
        description="Analysis, OSINT guides, conflict briefings, and product updates."
      />

      <section className="mx-auto max-w-6xl px-4 py-10">

        {/* RSS link */}
        <div className="mb-6 flex justify-end">
          <a
            href="/blog/feed.xml"
            className="flex items-center gap-1.5 rounded border border-orange-500/30 bg-orange-500/10 px-2.5 py-1 font-mono text-[10px] text-orange-400 hover:border-orange-400"
            aria-label="Blog RSS feed"
          >
            RSS
          </a>
        </div>

        {/* ── Category filter chips ────────────────────────────────── */}
        <div className="mb-8 flex flex-wrap items-center gap-2">
          <Link
            href={blogBase}
            className={`rounded-full border px-4 py-1.5 font-mono text-[11px] uppercase tracking-wider transition-colors ${
              !activeDataCategory && !activeCategory
                ? "border-accent bg-accent text-black"
                : "border-border-subtle text-text-secondary hover:border-accent/50"
            }`}
          >
            All
          </Link>
          {BLOG_DATA_CATEGORIES.map((cat) => {
            const isActive = activeDataCategory === cat;
            return (
              <Link
                key={cat}
                href={`${blogBase}?category=${encodeURIComponent(cat)}`}
                className={`rounded-full border px-4 py-1.5 font-mono text-[11px] uppercase tracking-wider transition-colors ${
                  isActive
                    ? "border-accent bg-accent text-black"
                    : "border-border-subtle text-text-secondary hover:border-accent/50"
                }`}
              >
                {cat}
              </Link>
            );
          })}
        </div>

        {/* ── Featured post grid (new curated posts) ───────────────── */}
        {filteredDataPosts.length > 0 && (
          <div className="mb-14">
            <p className="mb-5 font-mono text-[10px] uppercase tracking-widest text-text-muted">
              Latest Intelligence
            </p>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 stagger-children">
              {filteredDataPosts.map((post) => (
                <Link key={post.slug} href={`${blogBase}/${post.slug}`}>
                  <article className="group flex h-full flex-col rounded border border-border-subtle bg-bg-surface p-5 transition-colors hover:border-accent/30">
                    {/* Category chip */}
                    <span
                      className={`self-start rounded border px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-wider ${CATEGORY_CHIP_STYLES[post.category]}`}
                    >
                      {post.category}
                    </span>

                    {/* Title */}
                    <h3 className="mt-3 font-semibold text-text-primary group-hover:text-accent">
                      {post.title}
                    </h3>

                    {/* Excerpt */}
                    <p className="mt-2 flex-1 text-sm text-text-secondary line-clamp-3">
                      {post.excerpt}
                    </p>

                    {/* Meta row */}
                    <div className="mt-4 flex flex-wrap items-center gap-x-2 gap-y-1 font-mono text-[10px] text-text-muted">
                      <span>{post.author}</span>
                      <span className="text-border-default">·</span>
                      <time dateTime={post.date}>
                        {new Date(post.date).toLocaleDateString(locale, {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })}
                      </time>
                      <span className="text-border-default">·</span>
                      <span>{post.readTime} read</span>
                      {post.eventCount !== null && (
                        <>
                          <span className="text-border-default">·</span>
                          <span className="text-accent">{post.eventCount.toLocaleString()} events cited</span>
                        </>
                      )}
                    </div>

                    <p className="mt-3 font-mono text-[10px] uppercase tracking-wider text-accent opacity-0 transition-opacity group-hover:opacity-100">
                      Read more →
                    </p>
                  </article>
                </Link>
              ))}
            </div>
          </div>
        )}

        {filteredDataPosts.length === 0 && activeDataCategory && (
          <p className="mb-12 rounded border border-border-subtle bg-bg-surface p-6 text-sm text-text-muted">
            No posts in this category yet.
          </p>
        )}

        {/* ── Divider before legacy posts ──────────────────────────── */}
        {!activeDataCategory && (
          <>
            <div className="mb-10 border-t border-border-subtle" />

            {/* Pinned posts strip */}
            {pinnedPosts.length > 0 && (
              <div className="mb-8">
                <p className="mb-3 font-mono text-[10px] uppercase tracking-wider text-text-muted">Pinned</p>
                <div className="grid gap-3 sm:grid-cols-2">
                  {pinnedPosts.map((post) => (
                    <Link key={post.slug} href={`${blogBase}/${post.slug}`}>
                      <article className="flex h-full flex-col rounded border border-accent/30 bg-accent/5 p-4 transition-colors hover:border-accent">
                        <div className="flex items-center gap-2">
                          <span
                            className={`rounded border px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-wider ${SEED_CATEGORY_STYLES[post.category]}`}
                          >
                            {post.category}
                          </span>
                          <span className="font-mono text-[9px] text-accent">Pinned</span>
                        </div>
                        <h2 className="mt-2 text-sm font-semibold text-text-primary">{post.title}</h2>
                        <p className="mt-1 text-xs text-text-secondary line-clamp-2">{post.excerpt}</p>
                        <p className="mt-3 font-mono text-[10px] text-text-muted">
                          {post.author} · {post.readingTimeMin} min
                        </p>
                      </article>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Legacy category filter chips */}
            <div className="mb-6 flex flex-wrap items-center gap-2">
              <span className="font-mono text-[10px] uppercase tracking-wider text-text-muted">
                Browse by collection:
              </span>
              {BLOG_CATEGORIES.map((cat) => {
                const count = listPosts({ category: cat }).length;
                return (
                  <Link
                    key={cat}
                    href={`${blogBase}?category=${encodeURIComponent(cat)}`}
                    className="rounded border border-border-subtle bg-bg-surface px-3 py-1.5 font-mono text-[11px] uppercase tracking-wider text-text-muted transition-colors hover:border-text-muted"
                  >
                    {cat} ({count})
                  </Link>
                );
              })}
            </div>

            {/* Legacy post list */}
            <ol className="space-y-5">
              {posts.map((post) => (
                <li key={post.slug}>
                  <Link href={`${blogBase}/${post.slug}`}>
                    <article className="group rounded border border-border-subtle bg-bg-surface p-5 transition-colors hover:border-accent/40">
                      <div className="flex flex-wrap items-center gap-3">
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
                        <time
                          dateTime={post.publishedAt}
                          className="font-mono text-[10px] text-text-muted"
                        >
                          {new Date(post.publishedAt).toLocaleDateString(locale, {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          })}
                        </time>
                        <span className="font-mono text-[10px] text-text-muted">
                          {post.readingTimeMin} min read
                        </span>
                      </div>

                      <h2 className="mt-3 text-lg font-semibold text-text-primary group-hover:text-accent">
                        {post.title}
                      </h2>
                      <p className="mt-2 text-sm text-text-secondary line-clamp-2">{post.excerpt}</p>

                      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                        <div className="flex items-center gap-2">
                          <div
                            aria-hidden
                            className="grid h-7 w-7 place-items-center rounded-full bg-bg-elevated font-mono text-[9px] uppercase text-accent"
                          >
                            {post.author
                              .split(" ")
                              .map((w) => w[0])
                              .join("")
                              .slice(0, 2)}
                          </div>
                          <div>
                            <p className="text-xs font-medium text-text-primary">{post.author}</p>
                            <p className="font-mono text-[9px] uppercase tracking-wider text-text-muted">
                              {post.authorRole}
                            </p>
                          </div>
                        </div>
                        <ul className="flex flex-wrap gap-1.5">
                          {post.tags.slice(0, 4).map((tag) => (
                            <li
                              key={tag}
                              className="rounded border border-border-subtle px-2 py-0.5 font-mono text-[9px] text-text-muted"
                            >
                              {tag}
                            </li>
                          ))}
                        </ul>
                      </div>

                      <p className="mt-4 font-mono text-[10px] uppercase tracking-wider text-accent opacity-0 transition-opacity group-hover:opacity-100">
                        Read more →
                      </p>
                    </article>
                  </Link>
                </li>
              ))}
            </ol>
          </>
        )}

        {/* ── Subscribe CTA ────────────────────────────────────────── */}
        <div className="mt-10 rounded border border-border-subtle bg-bg-elevated p-5 text-sm">
          <p className="font-mono text-[10px] uppercase tracking-widest text-text-muted">
            Subscribe
          </p>
          <p className="mt-2 text-text-secondary">
            Get intelligence briefs and deep dives in your inbox. No noise.
          </p>
          <p className="mt-3">
            <Link
              href={localePath(locale, "/")}
              className="text-accent underline-offset-2 hover:underline"
            >
              Subscribe on the home page →
            </Link>
          </p>
        </div>
      </section>
    </>
  );
}
