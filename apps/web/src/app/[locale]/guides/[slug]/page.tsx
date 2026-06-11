import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { urls, localePath } from "@aegis/url-builder";
import { ACTIVE_LOCALES, isLocale, type Locale } from "@aegis/i18n-config";
import { buildMetadata } from "@/lib/seo";
import { PageHeader } from "@/components/PageHeader";
import { GUIDES, getGuide, listGuides } from "@/lib/guides-seed";
import { getGlossaryEntry } from "@/lib/seed-helpers";
import { getInvestigation } from "@/lib/investigations-seed";
import { SITE } from "@/lib/site";

type Params = { locale: string; slug: string };

export function generateStaticParams(): Params[] {
  const out: Params[] = [];
  for (const g of GUIDES) {
    for (const lc of ACTIVE_LOCALES) out.push({ locale: lc, slug: g.slug });
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
  const g = getGuide(slug);
  if (!g) return { robots: { index: false } };
  return buildMetadata({
    locale,
    title: g.title[locale] ?? g.title.en,
    description: g.summary[locale] ?? g.summary.en,
    pathFor: (lc) => localePath(lc, `/guides/${g.slug}`),
  });
}

export default async function GuideDetailPage({ params }: { params: Promise<Params> }) {
  const { locale: raw, slug } = await params;
  const locale = (isLocale(raw) ? raw : "en") as Locale;
  const g = getGuide(slug);
  if (!g) notFound();

  const title = g.title[locale] ?? g.title.en;
  const summary = g.summary[locale] ?? g.summary.en;
  const pageUrl = `${SITE.url}${localePath(locale, `/guides/${g.slug}`)}`;

  const related = listGuides()
    .filter(
      (x) => x.slug !== g.slug && x.tags.some((t) => g.tags.includes(t)),
    )
    .slice(0, 3);

  const glossary = (g.relatedGlossarySlugs ?? [])
    .map((s) => getGlossaryEntry(s))
    .filter((x): x is NonNullable<ReturnType<typeof getGlossaryEntry>> => x !== null);
  const investigations = (g.relatedInvestigationSlugs ?? [])
    .map((s) => getInvestigation(s))
    .filter((x): x is NonNullable<ReturnType<typeof getInvestigation>> => x !== null);

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "TechArticle",
        headline: title,
        description: summary,
        datePublished: g.publishedAt,
        dateModified: g.updatedAt,
        proficiencyLevel: g.level,
        timeRequired: `PT${g.readingMinutes}M`,
        keywords: g.tags.join(", "),
        author: { "@type": "Person", name: g.author },
        publisher: { "@type": "Organization", name: SITE.name, url: SITE.url },
        inLanguage: locale,
        url: pageUrl,
        mainEntityOfPage: pageUrl,
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          {
            "@type": "ListItem",
            position: 1,
            name: "Guides",
            item: `${SITE.url}${urls.guides(locale)}`,
          },
          { "@type": "ListItem", position: 2, name: title },
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
          <Link href={urls.guides(locale)} className="hover:text-text-primary">
            Guides
          </Link>
          <span className="mx-2 text-border-default">/</span>
          <span className="text-text-secondary">{title}</span>
        </nav>

        <PageHeader eyebrow="Guide" title={title} description={summary} />

        <div className="mt-2 flex flex-wrap items-center gap-3 font-mono text-[11px] uppercase tracking-wider text-text-muted">
          <span>{g.level}</span>
          <span>·</span>
          <span>{g.readingMinutes} min read</span>
          <span>·</span>
          <span>by {g.author}</span>
          <span>·</span>
          <span>updated {g.updatedAt}</span>
        </div>

        <div className="mt-4 flex flex-wrap gap-1.5">
          {g.tags.map((t) => (
            <Link
              key={t}
              href={urls.tag(locale, t)}
              className="inline-flex items-center rounded border border-border-subtle bg-bg-elevated px-1.5 py-0.5 font-mono text-[10px] text-text-muted hover:text-accent"
            >
              {t}
            </Link>
          ))}
        </div>

        {g.sections.map((s) => (
          <section key={s.heading} className="mt-8">
            <h2 className="text-base font-semibold text-text-primary">{s.heading}</h2>
            <p className="mt-3 text-sm leading-relaxed text-text-secondary">{s.body}</p>
          </section>
        ))}

        {glossary.length > 0 && (
          <section className="mt-8">
            <h2 className="text-base font-semibold text-text-primary">Glossary terms</h2>
            <ul className="mt-3 grid grid-cols-1 gap-2 md:grid-cols-2">
              {glossary.map((gl) => (
                <li key={gl.slug}>
                  <Link
                    href={urls.glossary(locale, gl.slug)}
                    className="block rounded border border-border-subtle bg-bg-surface px-3 py-2 text-sm text-text-secondary hover:bg-bg-elevated hover:text-text-primary"
                  >
                    {gl.term[locale] ?? gl.term.en}
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )}

        {investigations.length > 0 && (
          <section className="mt-8">
            <h2 className="text-base font-semibold text-text-primary">Related investigations</h2>
            <ul className="mt-3 space-y-2">
              {investigations.map((inv) => (
                <li key={inv.slug}>
                  <Link
                    href={urls.investigation(locale, inv.slug)}
                    className="block rounded border border-border-subtle bg-bg-surface px-3 py-2 text-sm text-text-secondary hover:bg-bg-elevated hover:text-text-primary"
                  >
                    {inv.title}
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )}

        {related.length > 0 && (
          <section className="mt-10 border-t border-border-subtle pt-6">
            <h2 className="text-base font-semibold text-text-primary">Related guides</h2>
            <ul className="mt-3 grid grid-cols-1 gap-2 md:grid-cols-2">
              {related.map((r) => (
                <li key={r.slug}>
                  <Link
                    href={urls.guide(locale, r.slug)}
                    className="block rounded border border-border-subtle bg-bg-surface px-3 py-2 text-sm text-text-secondary hover:bg-bg-elevated hover:text-text-primary"
                  >
                    {r.title[locale] ?? r.title.en}
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* Reader feedback */}
        <div className="mt-10 rounded border border-border-subtle bg-bg-surface p-5">
          <p className="font-mono text-[10px] uppercase tracking-widest text-text-muted">
            Was this guide helpful?
          </p>
          <div className="mt-3 flex flex-wrap items-center gap-3">
            <a
              href={`mailto:feedback@aegislens.io?subject=Guide+feedback+%E2%80%94+${encodeURIComponent(title)}&body=Guide%3A+${encodeURIComponent(pageUrl)}%0A%0AWhat+worked%3A%0A%0AWhat+could+be+better%3A`}
              className="inline-block rounded border border-accent px-3 py-1.5 font-mono text-xs text-accent hover:bg-accent hover:text-bg-base"
            >
              Yes, it helped ↗
            </a>
            <a
              href={`mailto:feedback@aegislens.io?subject=Guide+feedback+%E2%80%94+${encodeURIComponent(title)}&body=Guide%3A+${encodeURIComponent(pageUrl)}%0A%0AWhat+was+missing+or+unclear%3A`}
              className="inline-block rounded border border-border-subtle px-3 py-1.5 font-mono text-xs text-text-muted hover:border-text-muted hover:text-text-primary"
            >
              Could be better
            </a>
          </div>
          <p className="mt-3 text-xs text-text-muted">
            This guide is reviewed on a quarterly cadence. Last updated:{" "}
            {new Date(g.updatedAt).toLocaleDateString(locale, {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
            .
          </p>
        </div>
      </article>
    </>
  );
}
