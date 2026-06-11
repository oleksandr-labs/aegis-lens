import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { urls, localePath } from "@aegis/url-builder";
import { ACTIVE_LOCALES, isLocale, type Locale } from "@aegis/i18n-config";
import { buildMetadata } from "@/lib/seo";
import { PageHeader } from "@/components/PageHeader";
import {
  PARTNERS,
  getPartner,
  listPartners,
  PARTNER_TIER_LABEL,
} from "@/lib/partners-seed";
import { SITE } from "@/lib/site";

type Params = { locale: string; slug: string };

export function generateStaticParams(): Params[] {
  const out: Params[] = [];
  for (const p of PARTNERS) {
    for (const lc of ACTIVE_LOCALES) out.push({ locale: lc, slug: p.slug });
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
  const p = getPartner(slug);
  if (!p) return { robots: { index: false } };
  return buildMetadata({
    locale,
    title: `${p.name} — Aegis Lens partner`,
    description: p.oneLiner,
    pathFor: (lc) => localePath(lc, `/partners/${p.slug}`),
  });
}

export default async function PartnerDetailPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { locale: raw, slug } = await params;
  const locale = (isLocale(raw) ? raw : "en") as Locale;
  const p = getPartner(slug);
  if (!p) notFound();

  const pageUrl = `${SITE.url}${localePath(locale, `/partners/${p.slug}`)}`;
  const sameTier = listPartners()
    .filter((x) => x.tier === p.tier && x.slug !== p.slug)
    .slice(0, 4);

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        name: p.name,
        description: p.oneLiner,
        url: pageUrl,
        memberOf: {
          "@type": "ProgramMembership",
          programName: `Aegis Lens — ${PARTNER_TIER_LABEL[p.tier]} partner`,
        },
        knowsAbout: p.industries,
        areaServed: p.regions,
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          {
            "@type": "ListItem",
            position: 1,
            name: "Partners",
            item: `${SITE.url}${urls.partners(locale)}`,
          },
          { "@type": "ListItem", position: 2, name: p.name },
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
          <Link href={urls.partners(locale)} className="hover:text-text-primary">
            Partners
          </Link>
          <span className="mx-2 text-border-default">/</span>
          <span className="text-text-secondary">{p.name}</span>
        </nav>

        <PageHeader
          eyebrow={`${PARTNER_TIER_LABEL[p.tier]} partner`}
          title={p.name}
          description={p.oneLiner}
        />

        <div className="mt-2 flex flex-wrap items-center gap-3 font-mono text-[11px] uppercase tracking-wider text-text-muted">
          <span>Industries: {p.industries.join(", ")}</span>
          <span>·</span>
          <span>Regions: {p.regions.join(", ")}</span>
        </div>

        <div className="mt-4 flex flex-wrap gap-1.5">
          {p.tags.map((t) => (
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
          <h2 className="text-base font-semibold text-text-primary">Expertise</h2>
          <p className="mt-3 text-sm leading-relaxed text-text-secondary">{p.expertise}</p>
        </section>

        <section className="mt-8">
          <h2 className="text-base font-semibold text-text-primary">Engagement model</h2>
          <p className="mt-3 text-sm leading-relaxed text-text-secondary">
            {p.engagementModel}
          </p>
        </section>

        <section className="mt-8">
          <h2 className="text-base font-semibold text-text-primary">Outcomes</h2>
          <ul className="mt-3 list-disc space-y-1.5 pl-5 text-sm text-text-secondary">
            {p.outcomes.map((o, i) => (
              <li key={i}>{o}</li>
            ))}
          </ul>
        </section>

        <section className="mt-8 rounded border border-border-subtle bg-bg-surface p-4">
          <div className="font-mono text-[10px] uppercase tracking-wider text-text-muted">
            Co-marketing assets
          </div>
          <ul className="mt-3 space-y-1.5">
            {p.assets.map((a, i) => (
              <li key={i} className="flex items-center justify-between text-sm">
                <span className="text-text-primary">{a.label}</span>
                <span
                  className={`rounded border px-1.5 py-0.5 font-mono text-[9px] uppercase ${
                    a.status === "ready"
                      ? "border-green-500/40 bg-green-500/10 text-green-300"
                      : "border-border-subtle bg-bg-elevated text-text-muted"
                  }`}
                >
                  {a.status}
                </span>
              </li>
            ))}
          </ul>
        </section>

        {sameTier.length > 0 && (
          <section className="mt-10 border-t border-border-subtle pt-6">
            <h2 className="text-base font-semibold text-text-primary">
              Other {PARTNER_TIER_LABEL[p.tier]} partners
            </h2>
            <ul className="mt-3 grid grid-cols-1 gap-2 md:grid-cols-2">
              {sameTier.map((r) => (
                <li key={r.slug}>
                  <Link
                    href={urls.partner(locale, r.slug)}
                    className="block rounded border border-border-subtle bg-bg-surface px-3 py-2 text-sm text-text-secondary hover:bg-bg-elevated hover:text-text-primary"
                  >
                    {r.name}
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )}

        <p className="mt-10 text-xs text-text-muted">
          Become a partner via{" "}
          <Link href={urls.contact(locale)} className="text-accent hover:underline">
            /contact
          </Link>{" "}
          · partners overview at{" "}
          <Link href={urls.partners(locale)} className="text-accent hover:underline">
            /partners
          </Link>
          .
        </p>
      </article>
    </>
  );
}
