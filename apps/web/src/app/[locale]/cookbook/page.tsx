import Link from "next/link";
import type { Metadata } from "next";
import { urls, localePath } from "@aegis/url-builder";
import { ACTIVE_LOCALES, isLocale, type Locale } from "@aegis/i18n-config";
import { buildMetadata } from "@/lib/seo";
import { PageHeader } from "@/components/PageHeader";
import { listRecipes } from "@/lib/cookbook-seed";
import { SITE } from "@/lib/site";

export function generateStaticParams() {
  return ACTIVE_LOCALES.map((locale) => ({ locale }));
}

const TITLE = "API cookbook";
const DESCRIPTION =
  "Concrete, copy-pasteable recipes for the Aegis Lens public API. Fetch events, paginate, filter, subscribe to feeds, build dashboards, and gate on danger thresholds.";

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
    pathFor: (lc) => localePath(lc, "/cookbook"),
  });
}

export default async function CookbookIndexPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: raw } = await params;
  const locale = (isLocale(raw) ? raw : "en") as Locale;
  const recipes = listRecipes();

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: TITLE,
    description: DESCRIPTION,
    url: `${SITE.url}${localePath(locale, "/cookbook")}`,
    isPartOf: { "@type": "WebSite", url: SITE.url, name: SITE.name },
    mainEntity: {
      "@type": "ItemList",
      numberOfItems: recipes.length,
      itemListElement: recipes.map((r, idx) => ({
        "@type": "ListItem",
        position: idx + 1,
        url: `${SITE.url}${localePath(locale, `/cookbook/${r.slug}`)}`,
        name: r.title,
      })),
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <PageHeader eyebrow="Recipes" title={TITLE} description={DESCRIPTION} />
      <section className="mx-auto max-w-4xl px-4 py-10">
        <div className="mb-8 flex flex-wrap gap-3">
          <Link
            href={urls.docsApi(locale)}
            className="rounded border border-border-default bg-bg-elevated px-3 py-1.5 text-sm text-text-primary hover:border-accent hover:text-accent"
          >
            API reference →
          </Link>
          <Link
            href={urls.docsApiExplorer(locale)}
            className="rounded border border-border-subtle bg-bg-surface px-3 py-1.5 text-sm text-text-secondary hover:bg-bg-elevated hover:text-text-primary"
          >
            Open API explorer
          </Link>
          <a
            href="/api/openapi.json"
            className="rounded border border-border-subtle bg-bg-surface px-3 py-1.5 text-sm text-text-secondary hover:bg-bg-elevated hover:text-text-primary"
          >
            OpenAPI 3.1 (JSON)
          </a>
          <a
            href="/api/postman.json"
            className="rounded border border-border-subtle bg-bg-surface px-3 py-1.5 text-sm text-text-secondary hover:bg-bg-elevated hover:text-text-primary"
          >
            Postman collection
          </a>
        </div>

        <ul className="grid grid-cols-1 gap-3 md:grid-cols-2">
          {recipes.map((r) => (
            <li key={r.slug}>
              <Link
                href={urls.cookbookRecipe(locale, r.slug)}
                className="block h-full rounded border border-border-subtle bg-bg-surface p-4 hover:bg-bg-elevated"
              >
                <div className="font-mono text-[10px] uppercase tracking-wider text-text-muted">
                  {r.snippets.map((s) => s.language).join(" · ")}
                </div>
                <h2 className="mt-2 text-base font-semibold text-text-primary">{r.title}</h2>
                <p className="mt-2 text-sm text-text-secondary">{r.goal}</p>
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {r.tags.map((t) => (
                    <span
                      key={t}
                      className="inline-flex items-center rounded border border-border-subtle bg-bg-elevated px-1.5 py-0.5 font-mono text-[10px] text-text-muted"
                    >
                      {t}
                    </span>
                  ))}
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </>
  );
}
