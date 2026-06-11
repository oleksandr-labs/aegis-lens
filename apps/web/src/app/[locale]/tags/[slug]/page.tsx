import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { urls, localePath } from "@aegis/url-builder";
import { ACTIVE_LOCALES, isLocale, type Locale } from "@aegis/i18n-config";
import { buildMetadata } from "@/lib/seo";
import { PageHeader } from "@/components/PageHeader";
import { getTag, listTags } from "@/lib/tags-index";
import { SITE } from "@/lib/site";

type Params = { locale: string; slug: string };

export function generateStaticParams(): Params[] {
  const out: Params[] = [];
  for (const t of listTags()) {
    for (const lc of ACTIVE_LOCALES) out.push({ locale: lc, slug: t.slug });
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
  const tag = getTag(slug);
  if (!tag) return { robots: { index: false } };
  return buildMetadata({
    locale,
    title: `${tag.label} — tag`,
    description: `${tag.total} items tagged ${tag.label} across Aegis Lens investigations, guides, and equipment.`,
    pathFor: (lc) => localePath(lc, `/tags/${tag.slug}`),
  });
}

export default async function TagDetailPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { locale: raw, slug } = await params;
  const locale = (isLocale(raw) ? raw : "en") as Locale;
  const tag = getTag(slug);
  if (!tag) notFound();

  const pageUrl = `${SITE.url}${localePath(locale, `/tags/${tag.slug}`)}`;

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "CollectionPage",
        name: `${tag.label} — tag`,
        description: `${tag.total} items tagged ${tag.label}.`,
        url: pageUrl,
        inLanguage: locale,
        isPartOf: { "@type": "WebSite", url: SITE.url, name: SITE.name },
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          {
            "@type": "ListItem",
            position: 1,
            name: "Tags",
            item: `${SITE.url}${urls.tags(locale)}`,
          },
          { "@type": "ListItem", position: 2, name: tag.label },
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

      <article className="mx-auto max-w-4xl px-4 py-10">
        <nav className="font-mono text-[11px] text-text-muted" aria-label="Breadcrumb">
          <Link href={urls.tags(locale)} className="hover:text-text-primary">
            Tags
          </Link>
          <span className="mx-2 text-border-default">/</span>
          <span className="text-text-secondary">{tag.label}</span>
        </nav>

        <PageHeader
          eyebrow="Tag"
          title={tag.label}
          description={`${tag.total} item${tag.total === 1 ? "" : "s"} share this tag — surfaced from investigations, guides, and equipment.`}
        />

        <div className="mt-2 flex items-center">
          <a
            href={urls.tagFeed(tag.slug)}
            className="font-mono text-[11px] uppercase tracking-wider text-accent hover:underline"
          >
            RSS feed →
          </a>
        </div>

        {tag.investigations.length > 0 && (
          <section className="mt-8">
            <h2 className="text-base font-semibold text-text-primary">
              Investigations ({tag.investigations.length})
            </h2>
            <ul className="mt-3 space-y-2">
              {tag.investigations.map((inv) => (
                <li key={inv.slug}>
                  <Link
                    href={urls.investigation(locale, inv.slug)}
                    className="block rounded border border-border-subtle bg-bg-surface px-3 py-2 text-sm hover:bg-bg-elevated"
                  >
                    <div className="font-mono text-[10px] uppercase tracking-wider text-text-muted">
                      {inv.date} · lead: {inv.analyst}
                    </div>
                    <div className="mt-1 text-text-primary">{inv.title}</div>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )}

        {tag.guides.length > 0 && (
          <section className="mt-8">
            <h2 className="text-base font-semibold text-text-primary">
              Guides ({tag.guides.length})
            </h2>
            <ul className="mt-3 space-y-2">
              {tag.guides.map((g) => (
                <li key={g.slug}>
                  <Link
                    href={urls.guide(locale, g.slug)}
                    className="block rounded border border-border-subtle bg-bg-surface px-3 py-2 text-sm hover:bg-bg-elevated"
                  >
                    <div className="font-mono text-[10px] uppercase tracking-wider text-text-muted">
                      {g.category} · {g.level} · {g.readingMinutes} min
                    </div>
                    <div className="mt-1 text-text-primary">{g.title[locale] ?? g.title.en}</div>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )}

        {tag.equipment.length > 0 && (
          <section className="mt-8">
            <h2 className="text-base font-semibold text-text-primary">
              Equipment ({tag.equipment.length})
            </h2>
            <ul className="mt-3 grid grid-cols-1 gap-2 md:grid-cols-2">
              {tag.equipment.map((eq) => (
                <li key={eq.slug}>
                  <Link
                    href={urls.equipment(locale, eq.slug)}
                    className="block rounded border border-border-subtle bg-bg-surface px-3 py-2 text-sm hover:bg-bg-elevated"
                  >
                    <div className="text-text-primary">{eq.name[locale] ?? eq.name.en}</div>
                    <div className="mt-1 font-mono text-[10px] uppercase tracking-wider text-text-muted">
                      {eq.origin}
                    </div>
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
