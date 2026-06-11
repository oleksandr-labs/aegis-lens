import type { Metadata } from "next";
import Link from "next/link";
import { localePath } from "@aegis/url-builder";
import { ACTIVE_LOCALES, isLocale, type Locale } from "@aegis/i18n-config";
import { buildMetadata } from "@/lib/seo";
import { PageHeader } from "@/components/PageHeader";
import { SITE } from "@/lib/site";
import {
  HELP_ARTICLES,
  HELP_CATEGORIES,
  HELP_CATEGORIES_META,
  articlesByCategory,
  popularArticles,
  searchHelp,
  type HelpCategory,
} from "@/lib/help-kb";

export function generateStaticParams() {
  return ACTIVE_LOCALES.map((locale) => ({ locale }));
}

const TITLE = "Help Center";
const DESCRIPTION =
  "Guides, tutorials, and reference docs for analysts, developers, and organizations using Aegis Lens.";

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
    pathFor: (lc) => localePath(lc, "/help"),
  });
}

type SearchParams = { q?: string | string[]; category?: string | string[] };

function pickStr(sp: string | string[] | undefined): string {
  if (Array.isArray(sp)) return sp[0] ?? "";
  return sp ?? "";
}

export default async function HelpPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<SearchParams>;
}) {
  const { locale: raw } = await params;
  const locale = (isLocale(raw) ? raw : "en") as Locale;
  const sp = await searchParams;
  const q = pickStr(sp.q);
  const categoryFilter = pickStr(sp.category) as HelpCategory | "";
  const searchResults = q ? searchHelp(q) : [];

  const helpUrl = `${SITE.url}${localePath(locale, "/help")}`;

  const faqItems = HELP_ARTICLES.slice(0, 8);

  const websiteJsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebSite",
        name: `${SITE.name} Help Center`,
        url: helpUrl,
        inLanguage: locale,
        potentialAction: {
          "@type": "SearchAction",
          target: `${helpUrl}?q={search_term_string}`,
          "query-input": "required name=search_term_string",
        },
      },
      {
        "@type": "FAQPage",
        mainEntity: faqItems.map((a) => ({
          "@type": "Question",
          name: a.title,
          acceptedAnswer: {
            "@type": "Answer",
            text: a.body
              .split("\n\n")[0]
              ?.replace(/\*\*([^*]+)\*\*/g, "$1")
              .replace(/`([^`]+)`/g, "$1") ?? a.body.slice(0, 300),
          },
          url: `${helpUrl}/${a.slug}`,
        })),
      },
    ],
  };

  const popular = popularArticles();

  // Which categories to show in the "All articles" section
  const categoriesToShow: HelpCategory[] =
    categoryFilter && HELP_CATEGORIES.includes(categoryFilter as HelpCategory)
      ? [categoryFilter as HelpCategory]
      : HELP_CATEGORIES;

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }}
      />

      <PageHeader
        eyebrow="Help Center"
        title="How can we help?"
        description={DESCRIPTION}
      />

      {/* ── Search ── */}
      <div className="mx-auto max-w-3xl px-4 pt-10">
        <form
          method="GET"
          action={localePath(locale, "/help")}
          role="search"
          className="flex flex-wrap items-center gap-3"
        >
          <label htmlFor="q" className="sr-only">
            Search help articles
          </label>
          <input
            id="q"
            name="q"
            type="search"
            defaultValue={q}
            placeholder="Search the help center…"
            autoComplete="off"
            className="min-w-0 flex-1 rounded border border-border-subtle bg-bg-surface p-3 text-text-primary outline-none focus:border-accent"
          />
          <button
            type="submit"
            className="rounded bg-accent px-5 py-3 text-sm font-medium text-bg-base hover:bg-accent/90"
          >
            Search
          </button>
        </form>
      </div>

      {/* ── Search results ── */}
      {q ? (
        <div className="mx-auto max-w-3xl px-4 py-10">
          <h2 className="text-xl font-semibold text-text-primary">
            {searchResults.length} result{searchResults.length === 1 ? "" : "s"} for &ldquo;
            {q}&rdquo;
          </h2>
          {searchResults.length === 0 ? (
            <p className="mt-3 text-text-secondary">
              No articles matched. Try a different keyword, or{" "}
              <Link
                href={localePath(locale, "/contact")}
                className="text-accent underline-offset-2 hover:underline"
              >
                contact support
              </Link>
              .
            </p>
          ) : (
            <ul className="mt-6 divide-y divide-border-subtle rounded border border-border-subtle bg-bg-surface">
              {searchResults.map((a) => (
                <li key={a.slug} className="p-4">
                  <Link
                    href={localePath(locale, `/help/${a.slug}`)}
                    className="group block"
                  >
                    <p className="font-medium text-text-primary group-hover:text-accent">
                      {a.title}
                    </p>
                    <p className="mt-1 font-mono text-[10px] uppercase tracking-widest text-text-muted">
                      {a.category}
                    </p>
                  </Link>
                </li>
              ))}
            </ul>
          )}
          <p className="mt-6 text-sm">
            <Link
              href={localePath(locale, "/help")}
              className="text-accent underline-offset-2 hover:underline"
            >
              ← Browse all categories
            </Link>
          </p>
        </div>
      ) : (
        <div className="mx-auto max-w-5xl px-4 py-10 space-y-16">

          {/* ── Popular articles ── */}
          {popular.length > 0 && (
            <section>
              <h2 className="text-xl font-semibold text-text-primary">Popular articles</h2>
              <ul className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {popular.map((a) => (
                  <li key={a.slug}>
                    <Link
                      href={localePath(locale, `/help/${a.slug}`)}
                      className="group flex flex-col rounded border border-border-subtle bg-bg-surface p-5 hover:border-accent transition-colors"
                    >
                      <span className="font-mono text-[10px] uppercase tracking-widest text-text-muted">
                        {a.category}
                      </span>
                      <span className="mt-2 font-medium text-text-primary group-hover:text-accent">
                        {a.title}
                      </span>
                      <span className="mt-2 text-sm text-text-secondary line-clamp-2">
                        {a.body.split("\n\n")[0]?.replace(/\*\*([^*]+)\*\*/g, "$1").replace(/`([^`]+)`/g, "$1") ?? ""}
                      </span>
                      <span className="mt-4 text-xs text-accent">Read →</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {/* ── Categories grid ── */}
          <section>
            <h2 className="text-xl font-semibold text-text-primary">Browse by category</h2>
            <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {HELP_CATEGORIES.map((cat) => {
                const meta = HELP_CATEGORIES_META[cat];
                const count = articlesByCategory(cat).length;
                return (
                  <Link
                    key={cat}
                    href={`${localePath(locale, "/help")}?category=${encodeURIComponent(cat)}`}
                    className="group flex flex-col rounded border border-border-subtle bg-bg-surface p-5 hover:border-accent transition-colors"
                  >
                    <span className="text-2xl" aria-hidden="true">
                      {meta.icon}
                    </span>
                    <span className="mt-3 font-semibold text-text-primary group-hover:text-accent">
                      {meta.label}
                    </span>
                    <span className="mt-1 text-sm text-text-secondary line-clamp-2">
                      {meta.description}
                    </span>
                    <span className="mt-3 font-mono text-[10px] uppercase tracking-widest text-text-muted">
                      {count} article{count === 1 ? "" : "s"}
                    </span>
                  </Link>
                );
              })}
            </div>
          </section>

          {/* ── All articles (optionally filtered by category) ── */}
          <section>
            {categoryFilter ? (
              <div className="mb-4 flex items-center gap-3">
                <h2 className="text-xl font-semibold text-text-primary">
                  {HELP_CATEGORIES_META[categoryFilter as HelpCategory]?.label ?? categoryFilter}
                </h2>
                <Link
                  href={localePath(locale, "/help")}
                  className="text-xs text-accent underline-offset-2 hover:underline"
                >
                  ← All categories
                </Link>
              </div>
            ) : (
              <h2 className="text-xl font-semibold text-text-primary mb-4">All articles</h2>
            )}

            <div className="space-y-8">
              {categoriesToShow.map((cat) => {
                const articles = articlesByCategory(cat);
                if (articles.length === 0) return null;
                const meta = HELP_CATEGORIES_META[cat];
                return (
                  <div key={cat}>
                    <h3 className="flex items-center gap-2 text-base font-semibold text-text-primary">
                      <span aria-hidden="true">{meta.icon}</span>
                      {meta.label}
                    </h3>
                    <ul className="mt-3 divide-y divide-border-subtle rounded border border-border-subtle bg-bg-surface">
                      {articles.map((a) => (
                        <li key={a.slug}>
                          <Link
                            href={localePath(locale, `/help/${a.slug}`)}
                            className="group flex items-center justify-between gap-4 p-4 hover:bg-bg-elevated"
                          >
                            <div>
                              <p className="font-medium text-text-primary group-hover:text-accent">
                                {a.title}
                              </p>
                              <p className="mt-0.5 text-sm text-text-secondary line-clamp-1">
                                {a.body
                                  .split("\n\n")[0]
                                  ?.replace(/\*\*([^*]+)\*\*/g, "$1")
                                  .replace(/`([^`]+)`/g, "$1")
                                  .slice(0, 120) ?? ""}
                              </p>
                            </div>
                            <span className="shrink-0 text-text-muted group-hover:text-accent" aria-hidden="true">
                              →
                            </span>
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                );
              })}
            </div>
          </section>

          {/* ── Support CTA ── */}
          <section className="rounded border border-border-subtle bg-bg-elevated p-6 text-center">
            <p className="font-mono text-[10px] uppercase tracking-widest text-text-muted">
              Need more help?
            </p>
            <p className="mt-2 text-text-secondary">
              Can&rsquo;t find what you need? Our support team is here.
            </p>
            <Link
              href={localePath(locale, "/contact")}
              className="mt-4 inline-block rounded border border-accent px-5 py-2 text-sm font-medium text-accent hover:bg-accent hover:text-bg-base transition-colors"
            >
              Contact support →
            </Link>
          </section>

          {/* ── Changelog cross-link ── */}
          <div className="rounded border border-border-subtle bg-bg-surface p-4 text-sm">
            <p className="font-mono text-[10px] uppercase tracking-widest text-text-muted">
              Looking for what changed?
            </p>
            <p className="mt-2 text-text-secondary">
              Platform updates, new features, and fixes are listed in the public changelog.
            </p>
            <p className="mt-3">
              <Link
                href={localePath(locale, "/changelog")}
                className="text-accent underline-offset-2 hover:underline"
              >
                View changelog →
              </Link>
            </p>
          </div>
        </div>
      )}
    </>
  );
}
