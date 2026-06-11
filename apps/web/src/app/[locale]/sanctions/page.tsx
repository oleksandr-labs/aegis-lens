import Link from "next/link";
import type { Metadata } from "next";
import { urls, localePath } from "@aegis/url-builder";
import { ACTIVE_LOCALES, isLocale, type Locale } from "@aegis/i18n-config";
import { buildMetadata } from "@/lib/seo";
import { PageHeader } from "@/components/PageHeader";
import {
  listSanctionsLists,
  JURISDICTION_LABEL,
  type SanctionsList,
} from "@/lib/sanctions-seed";
import { SITE } from "@/lib/site";

export function generateStaticParams() {
  return ACTIVE_LOCALES.map((locale) => ({ locale }));
}

const TITLE = "Sanctions lists";
const DESCRIPTION =
  "Reference index of major sanctions and export-control lists: OFAC, BIS Entity List, EU consolidated, UK OFSI, Canada SEMA, Australia DFAT, Ukraine NSDC, and UN consolidated. Authorities, cadence, and use-cases for each.";

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
    pathFor: (lc) => localePath(lc, "/sanctions"),
  });
}

export default async function SanctionsIndexPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: raw } = await params;
  const locale = (isLocale(raw) ? raw : "en") as Locale;
  const all = listSanctionsLists();

  // Bucket by jurisdiction.
  const byJ = new Map<SanctionsList["jurisdiction"], typeof all>();
  for (const s of all) {
    const arr = byJ.get(s.jurisdiction) ?? [];
    arr.push(s);
    byJ.set(s.jurisdiction, arr);
  }

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: TITLE,
    description: DESCRIPTION,
    url: `${SITE.url}${localePath(locale, "/sanctions")}`,
    isPartOf: { "@type": "WebSite", url: SITE.url, name: SITE.name },
    mainEntity: {
      "@type": "ItemList",
      numberOfItems: all.length,
      itemListElement: all.map((s, idx) => ({
        "@type": "ListItem",
        position: idx + 1,
        url: `${SITE.url}${localePath(locale, `/sanctions/${s.slug}`)}`,
        name: s.name,
      })),
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <PageHeader eyebrow="Reference" title={TITLE} description={DESCRIPTION} />
      <section className="mx-auto max-w-5xl px-4 py-10">
        <p className="mb-6 text-sm text-text-secondary">
          Aegis Lens does <strong className="text-text-primary">not</strong> redistribute the
          underlying sanctions data. Each list links to the authoritative source. We provide
          context, related entities, and use-cases.
        </p>

        <div className="space-y-10">
          {[...byJ.entries()].map(([j, arr]) => (
            <div key={j}>
              <h2 className="font-mono text-[11px] uppercase tracking-wider text-text-muted">
                {JURISDICTION_LABEL[j]} ({arr.length})
              </h2>
              <ul className="mt-3 grid grid-cols-1 gap-2 md:grid-cols-2">
                {arr.map((s) => (
                  <li key={s.slug}>
                    <Link
                      href={urls.sanctionsList(locale, s.slug)}
                      className="block h-full rounded border border-border-subtle bg-bg-surface p-3 hover:bg-bg-elevated"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-text-primary">{s.name}</span>
                        <span className="font-mono text-[10px] text-text-muted">
                          {s.shortName}
                        </span>
                      </div>
                      <p className="mt-1 text-xs text-text-secondary line-clamp-2">
                        {s.description}
                      </p>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <p className="mt-10 text-xs text-text-muted">
          See related{" "}
          <Link href={urls.threat(locale, "ais-spoofing")} className="text-accent hover:underline">
            AIS spoofing
          </Link>{" "}
          and{" "}
          <Link
            href={urls.investigation(locale, "iran-russia-drone-supply-chain")}
            className="text-accent hover:underline"
          >
            sanctions-evasion investigations
          </Link>{" "}
          for operational context.
        </p>
      </section>
    </>
  );
}
