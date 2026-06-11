import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { urls, localePath } from "@aegis/url-builder";
import { ACTIVE_LOCALES, isLocale, type Locale } from "@aegis/i18n-config";
import { buildMetadata } from "@/lib/seo";
import { PageHeader } from "@/components/PageHeader";
import { RECIPES, getRecipe } from "@/lib/cookbook-seed";
import { SITE } from "@/lib/site";

type Params = { locale: string; slug: string };

export function generateStaticParams(): Params[] {
  const out: Params[] = [];
  for (const r of RECIPES) {
    for (const lc of ACTIVE_LOCALES) out.push({ locale: lc, slug: r.slug });
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
  const r = getRecipe(slug);
  if (!r) return { robots: { index: false } };
  return buildMetadata({
    locale,
    title: `${r.title} — Aegis Lens API recipe`,
    description: r.goal,
    pathFor: (lc) => localePath(lc, `/cookbook/${r.slug}`),
  });
}

export default async function CookbookRecipePage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { locale: raw, slug } = await params;
  const locale = (isLocale(raw) ? raw : "en") as Locale;
  const r = getRecipe(slug);
  if (!r) notFound();

  const pageUrl = `${SITE.url}${localePath(locale, `/cookbook/${r.slug}`)}`;
  const related = (r.relatedSlugs ?? [])
    .map((s) => getRecipe(s))
    .filter((x): x is NonNullable<ReturnType<typeof getRecipe>> => x !== null);

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "HowTo",
        name: r.title,
        description: r.goal,
        publisher: { "@type": "Organization", name: SITE.name, url: SITE.url },
        author: { "@type": "Organization", name: SITE.name, url: SITE.url },
        inLanguage: locale,
        url: pageUrl,
        mainEntityOfPage: pageUrl,
        step: r.steps.map((s, idx) => ({
          "@type": "HowToStep",
          position: idx + 1,
          text: s,
        })),
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          {
            "@type": "ListItem",
            position: 1,
            name: "Cookbook",
            item: `${SITE.url}${urls.cookbook(locale)}`,
          },
          { "@type": "ListItem", position: 2, name: r.title },
        ],
      },
    ],
  };

  const PRE_CLASS =
    "rounded border border-border-subtle bg-bg-elevated p-3 font-mono text-xs text-text-secondary overflow-x-auto";

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <article className="mx-auto max-w-3xl px-4 py-10">
        <nav className="font-mono text-[11px] text-text-muted" aria-label="Breadcrumb">
          <Link href={urls.cookbook(locale)} className="hover:text-text-primary">
            Cookbook
          </Link>
          <span className="mx-2 text-border-default">/</span>
          <span className="text-text-secondary">{r.title}</span>
        </nav>

        <PageHeader eyebrow="Recipe" title={r.title} description={r.goal} />

        <div className="mt-4 flex flex-wrap gap-1.5">
          {r.tags.map((t) => (
            <Link
              key={t}
              href={urls.tag(locale, t)}
              className="inline-flex items-center rounded border border-border-subtle bg-bg-elevated px-1.5 py-0.5 font-mono text-[10px] text-text-muted hover:text-accent"
            >
              {t}
            </Link>
          ))}
        </div>

        <section className="mt-8">
          <h2 className="text-base font-semibold text-text-primary">Steps</h2>
          <ol className="mt-3 space-y-2 list-decimal pl-5 text-sm text-text-secondary">
            {r.steps.map((s, i) => (
              <li key={i}>{s}</li>
            ))}
          </ol>
        </section>

        <section className="mt-8">
          <h2 className="text-base font-semibold text-text-primary">Code</h2>
          <div className="mt-3 space-y-5">
            {r.snippets.map((sn, i) => (
              <div key={i}>
                <div className="mb-1.5 font-mono text-[10px] uppercase tracking-wider text-text-muted">
                  {sn.label}
                </div>
                <pre className={PRE_CLASS}>
                  <code>{sn.code}</code>
                </pre>
              </div>
            ))}
          </div>
        </section>

        {related.length > 0 && (
          <section className="mt-10 border-t border-border-subtle pt-6">
            <h2 className="text-base font-semibold text-text-primary">Related recipes</h2>
            <ul className="mt-3 grid grid-cols-1 gap-2 md:grid-cols-2">
              {related.map((rr) => (
                <li key={rr.slug}>
                  <Link
                    href={urls.cookbookRecipe(locale, rr.slug)}
                    className="block rounded border border-border-subtle bg-bg-surface px-3 py-2 text-sm text-text-secondary hover:bg-bg-elevated hover:text-text-primary"
                  >
                    {rr.title}
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )}

        <section className="mt-10 rounded border border-border-subtle bg-bg-surface p-4">
          <div className="font-mono text-[10px] uppercase tracking-wider text-text-muted">
            Run this recipe
          </div>
          <p className="mt-2 text-xs text-text-muted">
            Download the Postman / Bruno / Insomnia collection for this single request,
            or copy the full multi-endpoint collection.
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            <a
              href={`/api/cookbook/${r.slug}/postman.json`}
              className="rounded border border-border-default bg-bg-elevated px-3 py-1.5 text-xs text-text-primary hover:border-accent hover:text-accent"
            >
              Recipe collection (.json) ↓
            </a>
            <a
              href="/api/postman.json"
              className="rounded border border-border-subtle bg-bg-surface px-3 py-1.5 text-xs text-text-secondary hover:bg-bg-elevated hover:text-text-primary"
            >
              Full API collection
            </a>
          </div>
        </section>

        <p className="mt-10 text-xs text-text-muted">
          See also{" "}
          <Link href={urls.docsApi(locale)} className="text-accent hover:underline">
            full API reference
          </Link>{" "}
          ·{" "}
          <Link href={urls.docsApiExplorer(locale)} className="text-accent hover:underline">
            interactive explorer
          </Link>{" "}
          ·{" "}
          <Link href={urls.docsSdks(locale)} className="text-accent hover:underline">
            SDKs
          </Link>
          .
        </p>
      </article>
    </>
  );
}
