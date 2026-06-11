import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { localePath } from "@aegis/url-builder";
import { ACTIVE_LOCALES, isLocale, type Locale } from "@aegis/i18n-config";
import { buildMetadata } from "@/lib/seo";
import { PageHeader } from "@/components/PageHeader";
import { SITE } from "@/lib/site";
import {
  HELP_ARTICLES,
  HELP_CATEGORIES_META,
  getHelpArticle,
  relatedArticles,
} from "@/lib/help-kb";

type Params = { locale: string; slug: string };

export function generateStaticParams() {
  const out: Params[] = [];
  for (const a of HELP_ARTICLES) {
    for (const locale of ACTIVE_LOCALES) {
      out.push({ locale, slug: a.slug });
    }
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
  const a = getHelpArticle(slug);
  if (!a) return { robots: { index: false } };
  return buildMetadata({
    locale,
    title: `${a.title} — Help Center`,
    description: a.body
      .slice(0, 200)
      .replace(/\*\*([^*]+)\*\*/g, "$1")
      .replace(/`([^`]+)`/g, "$1")
      .replace(/\s+/g, " ")
      .trim(),
    pathFor: (lc) => localePath(lc, `/help/${slug}`),
  });
}

/** Render body: split on double newlines; handle **bold** and `code` inline. */
function renderBody(body: string) {
  const paragraphs = body.split(/\n{2,}/);
  return paragraphs.map((p, i) => {
    // Detect heading lines (## Heading)
    if (p.startsWith("## ")) {
      return (
        <h2
          key={i}
          className="mt-8 text-lg font-semibold text-text-primary first:mt-0"
        >
          {p.slice(3)}
        </h2>
      );
    }
    // Detect numbered / bulleted lists (lines starting with "- " or "N. ")
    const listLines = p
      .split("\n")
      .filter((l) => /^(\d+\.|-)/.test(l.trim()));
    if (listLines.length > 0 && listLines.length === p.split("\n").filter(Boolean).length) {
      const isOrdered = /^\d+\./.test(listLines[0]?.trim() ?? "");
      const Tag = isOrdered ? "ol" : "ul";
      return (
        <Tag
          key={i}
          className={`mt-4 space-y-1 pl-6 text-text-secondary ${isOrdered ? "list-decimal" : "list-disc"}`}
        >
          {listLines.map((line, j) => (
            <li key={j}>{renderInline(line.replace(/^(\d+\.|-)\s*/, ""))}</li>
          ))}
        </Tag>
      );
    }
    const parts = renderInline(p);
    return (
      <p key={i} className="mt-4 text-text-secondary first:mt-0">
        {parts}
      </p>
    );
  });
}

function renderInline(text: string): React.ReactNode[] {
  const parts: React.ReactNode[] = [];
  const re = /(\*\*[^*]+\*\*|`[^`]+`)/g;
  let last = 0;
  let key = 0;
  let m: RegExpExecArray | null;
  while ((m = re.exec(text)) !== null) {
    if (m.index > last) parts.push(text.slice(last, m.index));
    const tok = m[0];
    if (tok.startsWith("**")) {
      parts.push(
        <strong key={key++} className="font-semibold text-text-primary">
          {tok.slice(2, -2)}
        </strong>,
      );
    } else {
      parts.push(
        <code
          key={key++}
          className="rounded bg-bg-base px-1.5 py-0.5 font-mono text-sm text-text-primary"
        >
          {tok.slice(1, -1)}
        </code>,
      );
    }
    last = m.index + tok.length;
  }
  if (last < text.length) parts.push(text.slice(last));
  return parts;
}

export default async function HelpArticlePage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { locale: raw, slug } = await params;
  const locale = (isLocale(raw) ? raw : "en") as Locale;
  const article = getHelpArticle(slug);
  if (!article) notFound();

  const related = relatedArticles(article);
  const catMeta = HELP_CATEGORIES_META[article.category];

  const url = `${SITE.url}${localePath(locale, `/help/${slug}`)}`;
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: article.title,
    description: article.body
      .slice(0, 200)
      .replace(/\*\*([^*]+)\*\*/g, "$1")
      .replace(/`([^`]+)`/g, "$1")
      .replace(/\s+/g, " ")
      .trim(),
    inLanguage: locale,
    articleSection: article.category,
    keywords: article.tags.join(", "),
    dateModified: article.updatedAt,
    mainEntityOfPage: url,
    author: {
      "@type": "Organization",
      name: SITE.name,
      url: SITE.url,
    },
    publisher: {
      "@type": "Organization",
      name: SITE.name,
      url: SITE.url,
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <PageHeader eyebrow={catMeta?.label ?? article.category} title={article.title} />

      <article className="mx-auto max-w-3xl px-4 py-10">
        {/* Breadcrumb */}
        <nav className="mb-6 flex items-center gap-2 text-sm text-text-muted" aria-label="Breadcrumb">
          <Link href={localePath(locale, "/help")} className="hover:text-accent">
            Help Center
          </Link>
          <span aria-hidden="true">/</span>
          <Link
            href={`${localePath(locale, "/help")}?category=${encodeURIComponent(article.category)}`}
            className="hover:text-accent"
          >
            {catMeta?.label ?? article.category}
          </Link>
          <span aria-hidden="true">/</span>
          <span className="text-text-secondary">{article.title}</span>
        </nav>

        <p className="font-mono text-xs uppercase tracking-widest text-text-muted">
          Updated {article.updatedAt}
        </p>

        <div className="mt-4 prose-article">{renderBody(article.body)}</div>

        {/* Tags */}
        {article.tags.length > 0 && (
          <div className="mt-10 flex flex-wrap gap-2">
            {article.tags.map((t) => (
              <span
                key={t}
                className="rounded border border-border-subtle bg-bg-surface px-2 py-1 font-mono text-xs text-text-muted"
              >
                #{t}
              </span>
            ))}
          </div>
        )}

        {/* Was this helpful? */}
        <div className="mt-10 rounded border border-border-subtle bg-bg-surface p-5">
          <p className="font-mono text-[10px] uppercase tracking-widest text-text-muted">
            Was this article helpful?
          </p>
          <div className="mt-3 flex flex-wrap items-center gap-3">
            <a
              href={`mailto:feedback@aegislens.io?subject=Help+article+feedback+%E2%80%94+${encodeURIComponent(article.title)}&body=Article%3A+${encodeURIComponent(article.slug)}%0A%0AWhat+worked%3A%0A%0AWhat+could+be+better%3A`}
              className="inline-block rounded border border-accent px-3 py-1.5 font-mono text-xs text-accent hover:bg-accent hover:text-bg-base transition-colors"
            >
              Yes, resolved ↗
            </a>
            <Link
              href={localePath(locale, "/contact")}
              className="inline-block rounded border border-border-subtle px-3 py-1.5 font-mono text-xs text-text-muted hover:border-text-muted hover:text-text-primary transition-colors"
            >
              No, I need more help
            </Link>
          </div>
        </div>

        {/* Related articles */}
        {related.length > 0 && (
          <section className="mt-10">
            <h2 className="text-base font-semibold text-text-primary">
              More in {catMeta?.label ?? article.category}
            </h2>
            <ul className="mt-3 divide-y divide-border-subtle rounded border border-border-subtle bg-bg-surface">
              {related.map((r) => (
                <li key={r.slug}>
                  <Link
                    href={localePath(locale, `/help/${r.slug}`)}
                    className="group flex items-center justify-between gap-4 p-4 hover:bg-bg-elevated"
                  >
                    <p className="font-medium text-text-primary group-hover:text-accent">
                      {r.title}
                    </p>
                    <span className="shrink-0 text-text-muted group-hover:text-accent" aria-hidden="true">
                      →
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* Bottom nav */}
        <nav className="mt-8 flex flex-wrap items-center justify-between gap-4 border-t border-border-subtle pt-6 text-sm">
          <Link
            href={localePath(locale, "/help")}
            className="text-accent underline-offset-2 hover:underline"
          >
            ← Back to help center
          </Link>
          <Link
            href={localePath(locale, "/contact")}
            className="text-accent underline-offset-2 hover:underline"
          >
            Still stuck? Contact support →
          </Link>
        </nav>
      </article>
    </>
  );
}
