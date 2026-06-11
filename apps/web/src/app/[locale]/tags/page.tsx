import Link from "next/link";
import type { Metadata } from "next";
import { urls, localePath } from "@aegis/url-builder";
import { ACTIVE_LOCALES, isLocale, type Locale } from "@aegis/i18n-config";
import { buildMetadata } from "@/lib/seo";
import { PageHeader } from "@/components/PageHeader";
import { listTags } from "@/lib/tags-index";
import { SITE } from "@/lib/site";

export function generateStaticParams() {
  return ACTIVE_LOCALES.map((locale) => ({ locale }));
}

const TITLE = "Tags";
const DESCRIPTION =
  "Cross-cutting tag index linking investigations, guides, and equipment. Pivot from a single concept (drones, sanctions, geolocation, accountability) to every surface that touches it.";

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
    pathFor: (lc) => localePath(lc, "/tags"),
  });
}

export default async function TagsIndexPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: raw } = await params;
  const locale = (isLocale(raw) ? raw : "en") as Locale;
  const tags = listTags();
  const total = tags.length;

  // Bucket by first letter for an alphabetic browse.
  const byLetter = new Map<string, typeof tags>();
  for (const t of tags.slice().sort((a, b) => a.label.localeCompare(b.label))) {
    const letter = t.label[0]?.toUpperCase() ?? "#";
    const arr = byLetter.get(letter) ?? [];
    arr.push(t);
    byLetter.set(letter, arr);
  }

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: TITLE,
    description: DESCRIPTION,
    url: `${SITE.url}${localePath(locale, "/tags")}`,
    isPartOf: { "@type": "WebSite", url: SITE.url, name: SITE.name },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <PageHeader
        eyebrow="Cross-reference"
        title={TITLE}
        description={`${total} tags pivot across investigations, guides, and equipment.`}
      />
      <section className="mx-auto max-w-5xl px-4 py-10">
        {/* Most-used cloud */}
        <div className="mb-10">
          <h2 className="font-mono text-[11px] uppercase tracking-wider text-text-muted">
            Most used
          </h2>
          <ul className="mt-3 flex flex-wrap gap-2">
            {tags.slice(0, 24).map((t) => (
              <li key={t.slug}>
                <Link
                  href={urls.tag(locale, t.slug)}
                  className="inline-flex items-center gap-2 rounded border border-border-subtle bg-bg-surface px-3 py-1.5 text-xs text-text-secondary hover:bg-bg-elevated hover:text-text-primary"
                >
                  <span>{t.label}</span>
                  <span className="font-mono text-[10px] text-text-muted">{t.total}</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Alphabetic */}
        <div>
          <h2 className="font-mono text-[11px] uppercase tracking-wider text-text-muted">
            All ({total})
          </h2>
          <div className="mt-3 space-y-6">
            {[...byLetter.entries()].sort(([a], [b]) => a.localeCompare(b)).map(([letter, arr]) => (
              <div key={letter}>
                <div className="font-mono text-[10px] uppercase tracking-widest text-text-muted">
                  {letter}
                </div>
                <ul className="mt-2 flex flex-wrap gap-2">
                  {arr.map((t) => (
                    <li key={t.slug}>
                      <Link
                        href={urls.tag(locale, t.slug)}
                        className="inline-flex items-center gap-2 rounded border border-border-subtle bg-bg-surface px-2.5 py-1 text-xs text-text-secondary hover:bg-bg-elevated hover:text-text-primary"
                      >
                        <span>{t.label}</span>
                        <span className="font-mono text-[10px] text-text-muted">{t.total}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
