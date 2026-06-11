import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { localePath } from "@aegis/url-builder";
import { ACTIVE_LOCALES, isLocale, type Locale } from "@aegis/i18n-config";
import { buildMetadata } from "@/lib/seo";
import { PageHeader } from "@/components/PageHeader";
import {
  COMPETITORS,
  getCompetitorData,
  getVerdict,
  getAegisWhy,
} from "@/lib/competitors-data";
import { getCompetitor, COMPETITORS as SEED_COMPETITORS } from "@/lib/competitors-seed";
import { SITE } from "@/lib/site";

type Params = { locale: string; slug: string };

/** Migration guide steps per competitor */
const MIGRATION_STEPS: Record<string, [string, string, string]> = {
  palantir: [
    "Export your existing data layers as GeoJSON or CSV from Palantir, then import them into Aegis Lens via the API or the dashboard uploader.",
    "Set up your AOIs (areas of interest) and alert rules in Aegis Lens — the same regions you were monitoring in Palantir can be recreated in minutes.",
    "Connect your downstream tools via the Aegis Lens REST API or webhooks — we use standard OAuth 2.0 and JSON schemas, no custom SDK required.",
  ],
  liveuamap: [
    "Create a free Aegis Lens account — no credit card needed. Your existing LiveUAmap bookmarks can be recreated as named AOIs in the dashboard.",
    "Subscribe to alert rules for your regions of interest; choose delivery via email, Telegram, or webhook to mirror what you were watching on the map.",
    "Use the structured API or RSS feeds to integrate verified event data into your workflow — something LiveUAmap does not provide.",
  ],
  dataminr: [
    "Sign up for a free Aegis Lens account and configure your conflict topics and regions — no enterprise procurement required.",
    "Set up alert rules with your preferred delivery channel (email, Telegram, webhook). Aegis Lens delivers OSINT-verified alerts rather than raw social signal.",
    "Pull historical and real-time events via the REST API using standard GeoJSON responses — compatible with your existing data pipelines.",
  ],
  bellingcat: [
    "Create an Aegis Lens account and explore the real-time event feed — Bellingcat's methodology is used as a reference for our verification tiers.",
    "Set up monitoring for the regions or topics you investigate. Aegis Lens will surface relevant events automatically, reducing manual search time.",
    "Export event data as CSV or GeoJSON for your investigation workflow; the source chain and confidence score give you citable provenance for each event.",
  ],
};

const DEFAULT_MIGRATION: [string, string, string] = [
  "Create your free Aegis Lens account and configure your regions and topics of interest.",
  "Set up alert rules with your preferred delivery method — email, Telegram, or webhook.",
  "Connect to the REST API or use the dashboard to monitor and export verified conflict intelligence.",
];

export function generateStaticParams(): Params[] {
  const out: Params[] = [];
  for (const c of COMPETITORS) {
    for (const lc of ACTIVE_LOCALES) {
      out.push({ locale: lc, slug: c.slug });
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
  const c = getCompetitorData(slug);
  if (!c) return { robots: { index: false } };
  return buildMetadata({
    locale,
    title: `Best ${c.name} alternative for conflict intelligence`,
    description: `Looking for a ${c.name} alternative? Aegis Lens offers OSINT-verified conflict intelligence, real-time monitoring, and a free API — switch in minutes.`,
    pathFor: (lc) => localePath(lc, `/alternatives/${slug}`),
  });
}

export default async function AlternativesPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { locale: raw, slug } = await params;
  const locale = (isLocale(raw) ? raw : "en") as Locale;

  const c = getCompetitorData(slug);
  if (!c) notFound();

  const seed = getCompetitor(slug);
  const verdict = getVerdict(slug);
  const aegisWhy = getAegisWhy(slug);
  const migrationSteps = MIGRATION_STEPS[slug] ?? DEFAULT_MIGRATION;

  // Other alternatives to suggest
  const others = COMPETITORS.filter((x) => x.slug !== slug).slice(0, 3);

  const pageUrl = `${SITE.url}${localePath(locale, `/alternatives/${slug}`)}`;

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Article",
        headline: `The best ${c.name} alternative for conflict intelligence`,
        description: `Why Aegis Lens is the leading ${c.name} alternative — features, pricing, and migration guide.`,
        url: pageUrl,
        inLanguage: locale,
        publisher: { "@type": "Organization", name: SITE.name, url: SITE.url },
        author: { "@type": "Organization", name: SITE.name, url: SITE.url },
        mainEntityOfPage: pageUrl,
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: SITE.url },
          { "@type": "ListItem", position: 2, name: "Alternatives" },
          { "@type": "ListItem", position: 3, name: `${c.name} alternative` },
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

      <PageHeader
        eyebrow={`${c.name} Alternative`}
        title={`The best ${c.name} alternative for conflict intelligence`}
        description={`Aegis Lens gives you everything ${c.name} offers — and more — with a free tier, full API access, and OSINT-verified data. No procurement cycle. No lock-in.`}
      />

      <article className="mx-auto max-w-4xl px-4 py-10 space-y-12">

        {/* Verdict */}
        <div className="rounded border border-accent/20 bg-accent/5 p-4 text-sm text-text-secondary">
          <strong className="text-text-primary">Bottom line:</strong>{" "}
          {verdict}
        </div>

        {/* What they are */}
        <section>
          <h2 className="text-xl font-semibold text-text-primary">
            What is {c.name}?
          </h2>
          <p className="mt-3 text-text-secondary">{c.description}</p>
          <div className="mt-3 flex flex-wrap gap-4 text-xs text-text-muted font-mono">
            <span>Founded: <span className="text-text-secondary">{c.founded}</span></span>
            <span>Pricing: <span className="text-text-secondary">{c.pricing}</span></span>
            <span>Audience: <span className="text-text-secondary">{c.targetAudience}</span></span>
          </div>
        </section>

        {/* Why Aegis Lens */}
        <section>
          <h2 className="text-xl font-semibold text-text-primary">
            Why choose Aegis Lens over {c.name}?
          </h2>
          <ul className="mt-4 space-y-3">
            {aegisWhy.map((point) => (
              <li
                key={point}
                className="flex items-start gap-3 rounded border border-border-subtle bg-bg-surface p-3 text-sm text-text-secondary"
              >
                <span className="mt-0.5 text-accent shrink-0 text-base">✓</span>
                {point}
              </li>
            ))}
          </ul>
        </section>

        {/* Feature comparison */}
        <section>
          <h2 className="text-xl font-semibold text-text-primary">
            Aegis Lens vs {c.name} — feature by feature
          </h2>
          <div className="mt-4 overflow-x-auto rounded border border-border-subtle">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="border-b border-border-subtle bg-bg-surface">
                  <th
                    scope="col"
                    className="px-4 py-3 text-left font-mono text-[10px] uppercase tracking-widest text-text-muted"
                  >
                    Feature
                  </th>
                  <th
                    scope="col"
                    className="px-4 py-3 text-center font-mono text-[10px] uppercase tracking-widest text-accent"
                  >
                    {SITE.name}
                  </th>
                  <th
                    scope="col"
                    className="px-4 py-3 text-center font-mono text-[10px] uppercase tracking-widest text-text-muted"
                  >
                    {c.name}
                  </th>
                </tr>
              </thead>
              <tbody>
                {c.features.map((row, i) => (
                  <tr
                    key={row.feature}
                    className={`border-t border-border-subtle ${i % 2 === 0 ? "bg-bg-base" : "bg-bg-surface"}`}
                  >
                    <td className="px-4 py-2.5 text-text-secondary">{row.feature}</td>
                    <td className="px-4 py-2.5 text-center">
                      <Cell value={row.aegis} />
                    </td>
                    <td className="px-4 py-2.5 text-center">
                      <Cell value={row.competitor} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Migration guide */}
        <section>
          <h2 className="text-xl font-semibold text-text-primary">
            How to switch from {c.name} to Aegis Lens
          </h2>
          <p className="mt-2 text-sm text-text-muted">
            Migration takes minutes, not months. Here is how:
          </p>
          <ol className="mt-4 space-y-4">
            {migrationSteps.map((step, i) => (
              <li key={i} className="flex items-start gap-4">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-accent/40 bg-accent/10 font-mono text-xs font-semibold text-accent">
                  {i + 1}
                </span>
                <p className="pt-1 text-sm text-text-secondary">{step}</p>
              </li>
            ))}
          </ol>
        </section>

        {/* Weaknesses — honest section */}
        {c.strengths.length > 0 && (
          <section className="rounded border border-border-subtle bg-bg-surface p-5">
            <h2 className="text-base font-semibold text-text-primary mb-3">
              When {c.name} might still be the right choice
            </h2>
            <ul className="space-y-2">
              {c.strengths.map((s) => (
                <li key={s} className="flex items-start gap-2 text-sm text-text-secondary">
                  <span className="mt-0.5 text-text-muted shrink-0">→</span>
                  {s}
                </li>
              ))}
            </ul>
            <p className="mt-4 text-xs text-text-muted">
              We believe in honest comparisons. Our credibility depends on it.
            </p>
          </section>
        )}

        {/* FAQ from seed data */}
        {seed && seed.faq.length > 0 && (
          <section>
            <h2 className="text-xl font-semibold text-text-primary">Frequently asked questions</h2>
            <div className="mt-4 space-y-3">
              {seed.faq.map((f, i) => (
                <details
                  key={i}
                  className="group rounded border border-border-subtle bg-bg-surface p-4"
                >
                  <summary className="cursor-pointer font-medium text-text-primary group-open:text-accent">
                    {f.q}
                  </summary>
                  <p className="mt-3 text-sm text-text-secondary">{f.a}</p>
                </details>
              ))}
            </div>
          </section>
        )}

        {/* CTA */}
        <section className="rounded border border-border-subtle bg-bg-surface p-6 text-center">
          <h2 className="text-lg font-semibold text-text-primary">
            Ready to switch from {c.name}?
          </h2>
          <p className="mt-2 text-sm text-text-secondary">
            Get started in minutes. Free tier includes full API access — no credit card required.
          </p>
          <div className="mt-4 flex justify-center gap-3 flex-wrap">
            <Link
              href={localePath(locale, "/signup")}
              className="rounded bg-accent px-5 py-2 font-mono text-sm text-bg-base hover:bg-accent/90"
            >
              Try Aegis Lens free →
            </Link>
            <Link
              href={localePath(locale, `/vs/${slug}`)}
              className="rounded border border-border-default px-5 py-2 font-mono text-sm text-text-primary hover:border-accent hover:text-accent"
            >
              Full comparison
            </Link>
          </div>
        </section>

        {/* Other alternatives */}
        {others.length > 0 && (
          <section>
            <h2 className="text-base font-semibold text-text-primary">
              Other alternatives we cover
            </h2>
            <ul className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-3">
              {others.map((o) => (
                <li key={o.slug}>
                  <Link
                    href={localePath(locale, `/alternatives/${o.slug}`)}
                    className="block rounded border border-border-subtle bg-bg-surface px-3 py-2 text-sm text-text-secondary hover:bg-bg-elevated hover:text-text-primary"
                  >
                    {o.name} alternative →
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

function Cell({ value }: { value: string | boolean }) {
  if (value === true) {
    return <span className="text-accent" aria-label="Yes">✓</span>;
  }
  if (value === false) {
    return <span className="text-red-400" aria-label="No">✗</span>;
  }
  return <span className="font-mono text-[11px] text-text-secondary">{value}</span>;
}
