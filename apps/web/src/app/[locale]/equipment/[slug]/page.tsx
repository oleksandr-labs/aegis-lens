import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { urls } from "@aegis/url-builder";
import { ACTIVE_LOCALES, isLocale, type Locale } from "@aegis/i18n-config";
import { buildMetadata } from "@/lib/seo";
import { PageHeader } from "@/components/PageHeader";
import { EQUIPMENT, localized } from "@/lib/seed-data";
import { listEvents } from "@/lib/events-seed";
import { timeAgo } from "@/lib/format";
import { SITE } from "@/lib/site";

export const revalidate = 86400; // 24 hours — ISR for equipment detail pages

const FLAG: Record<string, string> = {
  ru: "🇷🇺", ua: "🇺🇦", tr: "🇹🇷", us: "🇺🇸", ir: "🇮🇷",
  pl: "🇵🇱", az: "🇦🇿", am: "🇦🇲",
};

/**
 * Map equipment slug → event subclass keywords. Crude string match for now;
 * Sprint 2 swaps for KG entity links.
 */
const SUBCLASS_HINTS: Record<string, string[]> = {
  "shahed-136": ["drone"],
  "bayraktar-tb2": ["drone"],
  "iskander-m": ["missile"],
};

// ─── Placeholder image / silhouette ──────────────────────────────────────────

function slugEmoji(slug: string): string {
  if (slug.includes("shahed") || slug.includes("drone") || slug.includes("uav") || slug.includes("geran")) return "🛸";
  if (slug.includes("tank") || slug.includes("t-72") || slug.includes("t-80") || slug.includes("leopard")) return "🚗";
  if (slug.includes("missile") || slug.includes("iskander") || slug.includes("kalibr") || slug.includes("kinzhal")) return "🚀";
  if (slug.includes("vessel") || slug.includes("ship") || slug.includes("corvette") || slug.includes("frigate")) return "⛵";
  if (slug.includes("aircraft") || slug.includes("su-") || slug.includes("mig-") || slug.includes("f-16") || slug.includes("bayraktar")) return "✈";
  return "🔧";
}

// ─── Shahed / generic specs fallback ─────────────────────────────────────────

type SpecRow = { label: string; value: string; source?: string };

function getFallbackSpecs(slug: string): SpecRow[] | null {
  if (slug.includes("shahed")) {
    return [
      { label: "Type", value: "Loitering munition", source: "Open-source analysis" },
      { label: "Origin", value: "Iran (HESA)", source: "IAEA / OSINT" },
      { label: "Range", value: "1,000–2,500 km", source: "Manufacturer data / field estimates" },
      { label: "Payload", value: "36–50 kg", source: "Field recovery reports" },
      { label: "Propulsion", value: "MD550 piston engine", source: "OSINT" },
      { label: "Wingspan", value: "~2.5 m", source: "OSINT imagery" },
    ];
  }
  // Generic fallback when no specs defined
  return [
    { label: "Type", value: "Military equipment", source: "—" },
    { label: "Status", value: "Documented in conflict", source: "Aegis Lens seed" },
    { label: "Detail", value: "Specifications pending verification", source: "—" },
  ];
}

// ─── Documented incidents count ───────────────────────────────────────────────

function incidentCount(hints: string[]): number {
  if (!hints.length) return 0;
  return listEvents().filter((e) =>
    hints.some((h) => (e.subclass ?? "").toLowerCase().includes(h))
  ).length;
}

type Params = { locale: string; slug: string };

export function generateStaticParams() {
  const out: Params[] = [];
  for (const eq of EQUIPMENT) {
    for (const locale of ACTIVE_LOCALES) {
      if (locale === "en") continue;
      out.push({ locale, slug: eq.slug });
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
  const eq = EQUIPMENT.find((e) => e.slug === slug);
  if (!eq) return { robots: { index: false } };
  return buildMetadata({
    locale,
    title: localized(eq.name, locale),
    description: localized(eq.description, locale),
    pathFor: (lc) => urls.equipment(lc, slug),
  });
}

export default async function EquipmentPage({ params }: { params: Promise<Params> }) {
  const { locale: raw, slug } = await params;
  const locale = (isLocale(raw) ? raw : "en") as Locale;
  const eq = EQUIPMENT.find((e) => e.slug === slug);
  if (!eq) notFound();

  const name = localized(eq.name, locale);
  const desc = localized(eq.description, locale);

  const relatedEquipment = (eq.relatedSlugs ?? [])
    .map((rs) => EQUIPMENT.find((e) => e.slug === rs))
    .filter(Boolean);

  const equipUrl = `${SITE.url}${urls.equipment(locale, slug)}`;

  // Aliases: pull from name variants if different from primary name
  const aliases = [eq.slug, ...(eq.variants?.map((v) => v.name) ?? [])].filter(
    (a) => a !== name,
  );

  // Operators
  const operators = eq.operators ?? [];

  // Documented incidents
  const hints = SUBCLASS_HINTS[eq.slug] ?? [];
  const incidents = incidentCount(hints);
  const relatedEvents = hints.length
    ? listEvents()
        .filter((e) => hints.some((h) => (e.subclass ?? "").toLowerCase().includes(h)))
        .slice(0, 10)
    : [];

  // Specs: prefer seed, fallback to Shahed-aware defaults
  const specsToShow: SpecRow[] =
    eq.specs && eq.specs.length > 0 ? eq.specs : (getFallbackSpecs(slug) ?? []);

  const emoji = slugEmoji(slug);

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Product",
        name,
        description: desc,
        category: eq.type,
        brand: { "@type": "Organization", name: eq.origin },
        url: equipUrl,
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Equipment", item: `${SITE.url}/equipment` },
          { "@type": "ListItem", position: 2, name, item: equipUrl },
        ],
      },
      ...(eq.faq?.length
        ? [{
            "@type": "FAQPage",
            mainEntity: eq.faq.map((f) => ({
              "@type": "Question",
              name: f.q,
              acceptedAnswer: { "@type": "Answer", text: f.a },
            })),
          }]
        : []),
    ],
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <PageHeader eyebrow="Equipment" title={name} description={desc} />

      <div className="mx-auto max-w-3xl space-y-10 px-4 py-10">

        {/* Placeholder image area + identity */}
        <div className="flex flex-col gap-6 sm:flex-row">
          {/* Silhouette placeholder */}
          <div className="flex h-36 w-full shrink-0 items-center justify-center rounded border border-border-subtle bg-bg-surface sm:w-48">
            <span className="text-6xl" role="img" aria-label={`${name} silhouette`}>
              {emoji}
            </span>
          </div>

          {/* Identity facts */}
          <div className="flex-1 space-y-3">
            <dl className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <Fact label="Type" value={eq.type} />
              <Fact label="Origin" value={eq.origin} />
              <Fact label="ID" value={eq.slug} mono />
              <div className="rounded border border-border-subtle bg-bg-surface p-4">
                <dt className="font-mono text-[10px] uppercase tracking-widest text-text-muted">
                  Documented incidents
                </dt>
                <dd className="mt-1 text-sm text-text-primary">
                  {incidents > 0 ? (
                    <Link
                      href={`${urls.map(locale)}?subclass=${hints[0] ?? ""}`}
                      className="font-semibold text-accent hover:underline"
                    >
                      {incidents} events →
                    </Link>
                  ) : (
                    <span className="text-text-muted">None in seed</span>
                  )}
                </dd>
              </div>
            </dl>

            {/* Aliases */}
            {aliases.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                <span className="font-mono text-[10px] uppercase tracking-wider text-text-muted">
                  Also known as:
                </span>
                {aliases.map((a) => (
                  <span
                    key={a}
                    className="rounded border border-border-subtle bg-bg-elevated px-1.5 py-0.5 font-mono text-[10px] text-text-muted"
                  >
                    {a}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Technical specifications */}
        <section>
          <h2 className="text-lg font-semibold text-text-primary">Technical specifications</h2>
          <p className="mt-1 text-xs text-text-muted">
            Public figures only. No targeting-grade detail.
          </p>
          <div className="mt-3 overflow-x-auto rounded border border-border-subtle bg-bg-surface">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border-subtle text-left">
                  <th className="px-4 py-2 font-medium text-text-primary">Parameter</th>
                  <th className="px-4 py-2 font-medium text-text-primary">Value</th>
                  <th className="px-4 py-2 font-medium text-text-primary">Source</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-subtle">
                {specsToShow.map((s) => (
                  <tr key={s.label}>
                    <td className="px-4 py-2 text-text-secondary">{s.label}</td>
                    <td className="px-4 py-2 font-mono text-xs text-text-primary">{s.value}</td>
                    <td className="px-4 py-2 font-mono text-xs text-text-muted">{s.source ?? "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Identification cues */}
        {eq.identificationCues && eq.identificationCues.length > 0 && (
          <section>
            <h2 className="text-lg font-semibold text-text-primary">Identification cues</h2>
            <ul className="mt-3 space-y-2">
              {eq.identificationCues.map((cue, i) => (
                <li key={i} className="flex items-start gap-3 text-sm text-text-secondary">
                  <span className="mt-0.5 shrink-0 font-mono text-[10px] uppercase tracking-wider text-accent">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  {cue}
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* Operated by */}
        {operators.length > 0 && (
          <section>
            <h2 className="text-lg font-semibold text-text-primary">Operated by</h2>
            <ul className="mt-3 divide-y divide-border-subtle rounded border border-border-subtle bg-bg-surface">
              {operators.map((op) => (
                <li key={op.iso2 + op.name} className="flex items-start gap-3 px-4 py-3 text-sm">
                  <span className="text-lg" aria-hidden>{FLAG[op.iso2] ?? "🌐"}</span>
                  <div>
                    <span className="font-medium text-text-primary">{op.name}</span>
                    {op.note && <p className="mt-0.5 text-xs text-text-secondary">{op.note}</p>}
                  </div>
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* Variants */}
        {eq.variants && eq.variants.length > 0 && (
          <section>
            <h2 className="text-lg font-semibold text-text-primary">Variants</h2>
            <ul className="mt-3 divide-y divide-border-subtle rounded border border-border-subtle bg-bg-surface">
              {eq.variants.map((v) => (
                <li key={v.name} className="px-4 py-3 text-sm">
                  <span className="font-semibold text-text-primary">{v.name}</span>
                  <p className="mt-0.5 text-text-secondary">{v.note}</p>
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* Related equipment */}
        {relatedEquipment.length > 0 && (
          <section>
            <h2 className="text-lg font-semibold text-text-primary">Related equipment</h2>
            <div className="mt-3 flex flex-wrap gap-2">
              {relatedEquipment.map((re) => {
                if (!re) return null;
                return (
                  <Link
                    key={re.slug}
                    href={urls.equipment(locale, re.slug)}
                    className="rounded border border-border-subtle bg-bg-surface px-3 py-1.5 text-sm text-accent hover:bg-bg-elevated"
                  >
                    {localized(re.name, locale)}
                  </Link>
                );
              })}
            </div>
          </section>
        )}

        {/* Recent related events */}
        {relatedEvents.length > 0 ? (
          <section>
            <h2 className="text-lg font-semibold text-text-primary">Recent related events</h2>
            <ul className="mt-3 divide-y divide-border-subtle rounded border border-border-subtle bg-bg-surface">
              {relatedEvents.map((e) => (
                <li key={e.eventId}>
                  <Link href={urls.event(locale, e.eventId)} className="block px-4 py-3 hover:bg-bg-elevated">
                    <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-wider text-text-muted">
                      <span>{e.class}</span>
                      <span>·</span>
                      <span>{e.subclass}</span>
                      <span>·</span>
                      <span>{timeAgo(e.occurredAt, locale)}</span>
                    </div>
                    <div className="mt-1 text-sm text-text-primary">
                      {e.summary[locale] ?? e.summary.en}
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        ) : (
          <p className="rounded border border-border-subtle bg-bg-surface p-4 text-sm text-text-muted">
            No related events in seed data yet. Live ingestion lands in Sprint 2.
          </p>
        )}

        {/* FAQ */}
        {eq.faq && eq.faq.length > 0 && (
          <section>
            <h2 className="text-lg font-semibold text-text-primary">Frequently asked questions</h2>
            <div className="mt-3 space-y-3">
              {eq.faq.map((f, i) => (
                <details key={i} className="rounded border border-border-subtle bg-bg-surface">
                  <summary className="cursor-pointer px-4 py-3 text-sm font-medium text-text-primary select-none">
                    {f.q}
                  </summary>
                  <p className="px-4 pb-4 pt-2 text-sm text-text-secondary">{f.a}</p>
                </details>
              ))}
            </div>
          </section>
        )}
      </div>
    </>
  );
}

function Fact({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="rounded border border-border-subtle bg-bg-surface p-4">
      <dt className="font-mono text-[10px] uppercase tracking-widest text-text-muted">{label}</dt>
      <dd className={`mt-1 text-sm ${mono ? "font-mono" : ""} text-text-primary`}>{value}</dd>
    </div>
  );
}
