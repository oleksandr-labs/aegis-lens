import type { Metadata } from "next";
import Link from "next/link";
import { localePath } from "@aegis/url-builder";
import { ACTIVE_LOCALES, isLocale, type Locale } from "@aegis/i18n-config";
import { buildMetadata } from "@/lib/seo";
import { PageHeader } from "@/components/PageHeader";
import { COMPETITORS as SEED_COMPETITORS } from "@/lib/competitors-seed";
import { COMPETITORS as DATA_COMPETITORS, getVerdict } from "@/lib/competitors-data";
import { SITE } from "@/lib/site";

export function generateStaticParams() {
  return ACTIVE_LOCALES.map((locale) => ({ locale }));
}

const TITLE = `${SITE.name} vs Competitors`;
const DESCRIPTION =
  "Honest, up-to-date comparisons of Aegis Lens against alternative conflict-intelligence and OSINT platforms — including LiveUAmap, Palantir Gotham, Dataminr, Bellingcat, and more.";

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
    pathFor: (lc) => localePath(lc, "/vs"),
  });
}

/** Merge seed data with extended data for the index cards. */
function buildCards() {
  return SEED_COMPETITORS.map((seed) => {
    const extra = DATA_COMPETITORS.find((d) => d.slug === seed.slug);
    return {
      slug: seed.slug,
      name: seed.name,
      category: seed.category,
      description: seed.tagline,
      pricing: extra?.pricing ?? null,
      targetAudience: extra?.targetAudience ?? null,
      keyDifferentiator: getVerdict(seed.slug),
    };
  });
}

export default async function VsIndexPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: raw } = await params;
  const locale = (isLocale(raw) ? raw : "en") as Locale;
  const cards = buildCards();

  return (
    <>
      <PageHeader eyebrow="Comparisons" title={TITLE} description={DESCRIPTION} />

      <section className="mx-auto max-w-4xl px-4 py-10">
        <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {cards.map((c) => (
            <li key={c.slug}>
              <Link
                href={localePath(locale, `/vs/${c.slug}`)}
                className="group block rounded border border-border-subtle bg-bg-surface p-5 hover:border-accent transition-colors"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="font-mono text-[10px] uppercase tracking-widest text-text-muted">
                      {c.category}
                    </p>
                    <h2 className="mt-1 text-base font-semibold text-text-primary group-hover:text-accent">
                      {SITE.name} vs {c.name}
                    </h2>
                    <p className="mt-1 text-sm text-text-secondary line-clamp-1">{c.description}</p>
                  </div>
                  {c.pricing && (
                    <span className="shrink-0 rounded bg-bg-elevated px-2 py-0.5 font-mono text-[10px] text-text-muted whitespace-nowrap">
                      {c.pricing}
                    </span>
                  )}
                </div>
                <p className="mt-3 text-xs text-text-muted line-clamp-2 border-t border-border-subtle pt-3">
                  {c.keyDifferentiator}
                </p>
                <span className="mt-3 inline-block font-mono text-xs text-accent group-hover:underline">
                  Compare →
                </span>
              </Link>
            </li>
          ))}
        </ul>

        <div className="mt-12 rounded border border-border-subtle bg-bg-surface p-5 text-sm text-text-secondary">
          <p className="font-semibold text-text-primary">Our comparison policy</p>
          <p className="mt-2">
            We aim to be accurate and fair. If you believe a comparison is incorrect or out of date,{" "}
            <a href="mailto:hello@aegislens.io" className="text-accent hover:underline">
              let us know
            </a>
            . We update pages when products change. We do not misrepresent competitors — our
            credibility depends on it.
          </p>
        </div>
      </section>
    </>
  );
}
