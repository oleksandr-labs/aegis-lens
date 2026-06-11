import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { urls } from "@aegis/url-builder";
import { ACTIVE_LOCALES, isLocale, type Locale } from "@aegis/i18n-config";
import { buildMetadata } from "@/lib/seo";
import { PageHeader } from "@/components/PageHeader";
import { GLOSSARY, localized } from "@/lib/seed-data";
import { GLOSSARY_TERMS } from "@/lib/glossary-data";
import { SITE } from "@/lib/site";
import { GlossaryFeedback } from "@/components/GlossaryFeedback";

export const revalidate = 86400; // 24 hours — ISR for glossary term pages

type Params = { locale: string; slug: string };

/**
 * Static params come from both seed-data GLOSSARY and the new GLOSSARY_TERMS.
 * Deduplicated by slug to avoid duplicate routes.
 */
export function generateStaticParams() {
  const slugs = new Set<string>();
  // Existing seed-data terms (all locales including en)
  for (const g of GLOSSARY) {
    for (const locale of ACTIVE_LOCALES) {
      slugs.add(`${locale}:${g.slug}`);
    }
  }
  // New GLOSSARY_TERMS (en only for new terms not already in GLOSSARY)
  for (const t of GLOSSARY_TERMS) {
    for (const locale of ACTIVE_LOCALES) {
      slugs.add(`${locale}:${t.slug}`);
    }
  }

  return [...slugs].map((key) => {
    const [locale, slug] = key.split(":") as [string, string];
    return { locale, slug };
  });
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { locale: raw, slug } = await params;
  const locale = (isLocale(raw) ? raw : "en") as Locale;

  // Prefer rich seed-data entry; fall back to new glossary-data
  const g = GLOSSARY.find((x) => x.slug === slug);
  const t = GLOSSARY_TERMS.find((x) => x.slug === slug);

  if (!g && !t) return { robots: { index: false } };

  const title = g ? localized(g.term, locale) : (t?.term ?? slug);
  const description = g ? localized(g.definition, locale) : (t?.definition ?? "");

  return buildMetadata({
    locale,
    title,
    description,
    pathFor: (lc) => urls.glossary(lc, slug),
  });
}

export default async function GlossaryTermPage({ params }: { params: Promise<Params> }) {
  const { locale: raw, slug } = await params;
  const locale = (isLocale(raw) ? raw : "en") as Locale;

  // Try rich seed-data first, then new data
  const g = GLOSSARY.find((x) => x.slug === slug);
  const newTerm = GLOSSARY_TERMS.find((x) => x.slug === slug);

  if (!g && !newTerm) notFound();

  // Resolved display values ───────────────────────────────────────────────
  const term = g ? localized(g.term, locale) : (newTerm!.term);
  const def = g ? localized(g.definition, locale) : (newTerm!.definition);
  const abbreviation = newTerm?.abbreviation;
  const examples: string[] = g?.examples ?? newTerm?.examples ?? [];
  const category = newTerm?.category;

  // Related terms — from seed-data relatedSlugs or new data relatedTerms
  const relatedSlugs: string[] = g?.relatedSlugs ?? newTerm?.relatedTerms ?? [];
  const relatedTerms = relatedSlugs
    .map((rs) => {
      const seedMatch = GLOSSARY.find((x) => x.slug === rs);
      if (seedMatch) return { slug: rs, label: localized(seedMatch.term, locale) };
      const newMatch = GLOSSARY_TERMS.find((x) => x.slug === rs);
      if (newMatch) return { slug: rs, label: newMatch.term };
      return null;
    })
    .filter(Boolean) as { slug: string; label: string }[];

  const sources = g?.sources ?? [];

  // JSON-LD ────────────────────────────────────────────────────────────────
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "DefinedTerm",
        name: term,
        description: def,
        ...(abbreviation ? { alternateName: abbreviation } : {}),
        inDefinedTermSet: `${SITE.url}${urls.glossary(locale)}`,
        ...(sources.length
          ? {
              citation: sources.map((s) => ({
                "@type": "CreativeWork",
                name: s.label,
                url: s.url,
              })),
            }
          : {}),
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          {
            "@type": "ListItem",
            position: 1,
            name: "Glossary",
            item: `${SITE.url}${urls.glossary(locale)}`,
          },
          {
            "@type": "ListItem",
            position: 2,
            name: term,
            item: `${SITE.url}${urls.glossary(locale, slug)}`,
          },
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
      <PageHeader eyebrow="Glossary" title={term} />

      <div className="mx-auto max-w-3xl px-4 py-10 space-y-10">

        {/* Definition */}
        <section>
          <div className="flex flex-wrap items-center gap-3 mb-3">
            {/* Transliteration (seed-data terms) */}
            {g?.transliteration && locale !== "en" && (
              <p className="font-mono text-[11px] uppercase tracking-wider text-text-muted">
                Transliteration: {g.transliteration}
              </p>
            )}
            {/* Abbreviation badge (new terms) */}
            {abbreviation && abbreviation !== term && (
              <span className="rounded border border-border-subtle bg-bg-surface px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider text-text-muted">
                {abbreviation}
              </span>
            )}
            {/* Category badge */}
            {category && (
              <span className="rounded border border-accent/40 bg-accent/10 px-2 py-0.5 font-mono text-[9px] uppercase tracking-wider text-accent">
                {category}
              </span>
            )}
          </div>
          <p className="text-lg text-text-primary leading-relaxed">{def}</p>
        </section>

        {/* Examples */}
        {examples.length > 0 && (
          <section>
            <h2 className="text-base font-semibold text-text-primary">Examples</h2>
            <ul className="mt-3 space-y-2">
              {examples.map((ex, i) => (
                <li key={i} className="flex items-start gap-3 text-sm text-text-secondary">
                  <span className="mt-0.5 shrink-0 font-mono text-[10px] uppercase tracking-wider text-accent">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  {ex}
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* Related terms */}
        {relatedTerms.length > 0 && (
          <section>
            <h2 className="text-base font-semibold text-text-primary">Related terms</h2>
            <div className="mt-3 flex flex-wrap gap-2">
              {relatedTerms.map((rt) => (
                <Link
                  key={rt.slug}
                  href={urls.glossary(locale, rt.slug)}
                  className="rounded border border-border-subtle bg-bg-surface px-3 py-1.5 text-sm text-accent hover:bg-bg-elevated"
                >
                  {rt.label}
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Sources */}
        {sources.length > 0 && (
          <section>
            <h2 className="text-base font-semibold text-text-primary">
              Sources &amp; further reading
            </h2>
            <ul className="mt-3 space-y-1">
              {sources.map((s) => (
                <li key={s.url}>
                  <a
                    href={s.url}
                    target={s.url.startsWith("http") ? "_blank" : undefined}
                    rel={s.url.startsWith("http") ? "noopener noreferrer" : undefined}
                    className="text-sm text-accent underline-offset-2 hover:underline"
                  >
                    {s.label}
                  </a>
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* Was this helpful? */}
        <section className="rounded border border-border-subtle bg-bg-surface p-4">
          <GlossaryFeedback />
        </section>

        {/* Back link */}
        <div className="border-t border-border-subtle pt-6 text-sm">
          <Link
            href={urls.glossary(locale)}
            className="text-accent underline-offset-2 hover:underline"
          >
            ← All terms
          </Link>
        </div>
      </div>
    </>
  );
}
