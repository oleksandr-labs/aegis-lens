import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { urls, localePath } from "@aegis/url-builder";
import { ACTIVE_LOCALES, isLocale, type Locale } from "@aegis/i18n-config";
import { buildMetadata } from "@/lib/seo";
import { PageHeader } from "@/components/PageHeader";
import {
  THREATS,
  getThreat,
  threatsByRegion,
  listThreats,
} from "@/lib/threats-seed";
import { getRegion, listRegions } from "@/lib/regions-seed";
import { eventById, eventsInCountry } from "@/lib/events-seed";
import { SITE } from "@/lib/site";

type Params = { locale: string; slug: string; country: string };

export const dynamicParams = false;

export function generateStaticParams(): Params[] {
  const out: Params[] = [];
  for (const t of THREATS) {
    for (const iso2 of t.affectedRegions) {
      if (!getRegion(iso2)) continue; // we only have content for UA/PL/DE
      for (const lc of ACTIVE_LOCALES) {
        out.push({ locale: lc, slug: t.slug, country: iso2.toLowerCase() });
      }
    }
  }
  return out;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { locale: raw, slug, country } = await params;
  const locale = (isLocale(raw) ? raw : "en") as Locale;
  const t = getThreat(slug);
  const region = getRegion(country);
  if (!t || !region) return { robots: { index: false } };
  if (!t.affectedRegions.some((r) => r.toLowerCase() === country.toLowerCase())) {
    return { robots: { index: false } };
  }
  const name = t.name[locale] ?? t.name.en;
  const countryLabel = region.name[locale] ?? region.name.en;
  return buildMetadata({
    locale,
    title: `${name} in ${countryLabel}`,
    description: `${name} threat profile applied to ${countryLabel}: events, civilian + operator guidance, related threats.`,
    pathFor: (lc) => localePath(lc, `/threats/${slug}/in/${country}`),
  });
}

export default async function ThreatCountryPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { locale: raw, slug, country } = await params;
  const locale = (isLocale(raw) ? raw : "en") as Locale;
  const t = getThreat(slug);
  const region = getRegion(country);
  if (!t || !region) notFound();
  if (!t.affectedRegions.some((r) => r.toLowerCase() === country.toLowerCase())) {
    notFound();
  }

  const name = t.name[locale] ?? t.name.en;
  const countryLabel = region.name[locale] ?? region.name.en;
  const pageUrl = `${SITE.url}${localePath(locale, `/threats/${slug}/in/${country}`)}`;

  // Threat's cited events that fall in this country
  const citedEventsInCountry = (t.citedEventIds ?? [])
    .map((id) => eventById(id))
    .filter((e): e is NonNullable<ReturnType<typeof eventById>> => e !== null);

  // Also: country-wide events of the same event class as the threat
  const classEventsInCountry = eventsInCountry(country)
    .filter((e) => e.class === t.eventClass)
    .slice(0, 12);

  const otherCountries = t.affectedRegions
    .filter((r) => r.toLowerCase() !== country.toLowerCase())
    .map((iso2) => {
      const reg = getRegion(iso2);
      return reg ? { iso2, label: reg.name[locale] ?? reg.name.en } : null;
    })
    .filter((x): x is { iso2: string; label: string } => x !== null);

  const sameCountryOtherThreats = threatsByRegion(country)
    .filter((x) => x.slug !== t.slug)
    .slice(0, 6);

  // Parametric FAQ — same shape for every threat × country page.
  const faqs: { q: string; a: string }[] = [
    {
      q: `Is ${name} active in ${countryLabel} right now?`,
      a: `${name} is catalogued by Aegis Lens as an affected-threat for ${countryLabel}. "Active" is a stronger claim — check the live /incidents feed and the topic feed (${t.eventClass}) for current event-level signal.`,
    },
    {
      q: `What should civilians in ${countryLabel} do?`,
      a: t.civilianGuidance[locale] ?? t.civilianGuidance.en,
    },
    {
      q: `What should operators in ${countryLabel} do?`,
      a: t.operatorGuidance[locale] ?? t.operatorGuidance.en,
    },
    {
      q: `Where does this assessment come from?`,
      a: `Threat profiles are written by Aegis Lens analysts using publicly available information and corroborated against the event corpus. See /methodology for the discipline; this page is not an official advisory.`,
    },
  ];

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Article",
        headline: `${name} in ${countryLabel}`,
        description: `${name} threat applied to ${countryLabel}.`,
        publisher: { "@type": "Organization", name: SITE.name, url: SITE.url },
        author: { "@type": "Organization", name: SITE.name, url: SITE.url },
        inLanguage: locale,
        url: pageUrl,
        mainEntityOfPage: pageUrl,
        about: {
          "@type": "Place",
          name: countryLabel,
          address: { "@type": "PostalAddress", addressCountry: country.toUpperCase() },
        },
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          {
            "@type": "ListItem",
            position: 1,
            name: "Threats",
            item: `${SITE.url}${urls.threats(locale)}`,
          },
          {
            "@type": "ListItem",
            position: 2,
            name,
            item: `${SITE.url}${urls.threat(locale, t.slug)}`,
          },
          { "@type": "ListItem", position: 3, name: countryLabel },
        ],
      },
      {
        "@type": "FAQPage",
        mainEntity: faqs.map((f) => ({
          "@type": "Question",
          name: f.q,
          acceptedAnswer: { "@type": "Answer", text: f.a },
        })),
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
          <Link href={urls.threats(locale)} className="hover:text-text-primary">
            Threats
          </Link>
          <span className="mx-2 text-border-default">/</span>
          <Link href={urls.threat(locale, t.slug)} className="hover:text-text-primary">
            {name}
          </Link>
          <span className="mx-2 text-border-default">/</span>
          <span className="text-text-secondary">{countryLabel}</span>
        </nav>

        <PageHeader
          eyebrow={`${t.category} × ${countryLabel}`}
          title={`${name} in ${countryLabel}`}
          description={t.summary[locale] ?? t.summary.en}
        />

        <section className="mt-6 grid grid-cols-1 gap-3 md:grid-cols-2">
          <div className="rounded border border-border-subtle bg-bg-surface p-4">
            <div className="font-mono text-[10px] uppercase tracking-wider text-text-muted">
              Civilian guidance — {countryLabel}
            </div>
            <p className="mt-2 text-sm text-text-secondary">
              {t.civilianGuidance[locale] ?? t.civilianGuidance.en}
            </p>
          </div>
          <div className="rounded border border-border-subtle bg-bg-surface p-4">
            <div className="font-mono text-[10px] uppercase tracking-wider text-text-muted">
              Operator guidance — {countryLabel}
            </div>
            <p className="mt-2 text-sm text-text-secondary">
              {t.operatorGuidance[locale] ?? t.operatorGuidance.en}
            </p>
          </div>
        </section>

        {citedEventsInCountry.length > 0 && (
          <section className="mt-8">
            <h2 className="text-base font-semibold text-text-primary">Cited events</h2>
            <ul className="mt-3 space-y-2">
              {citedEventsInCountry.map((e) => (
                <li key={e.eventId}>
                  <Link
                    href={urls.event(locale, e.eventId)}
                    className="block rounded border border-border-subtle bg-bg-surface px-3 py-2 text-sm hover:bg-bg-elevated"
                  >
                    <div className="font-mono text-[10px] uppercase tracking-wider text-text-muted">
                      {e.class}{e.subclass ? ` · ${e.subclass}` : ""} ·{" "}
                      {e.occurredAt.slice(0, 10)} · danger {e.dangerScore}
                    </div>
                    <div className="mt-1 text-text-primary">
                      {e.summary[locale] ?? e.summary.en}
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )}

        {classEventsInCountry.length > 0 && (
          <section className="mt-8">
            <h2 className="text-base font-semibold text-text-primary">
              Related {t.eventClass.replace("_", " ")} events in {countryLabel}
            </h2>
            <ul className="mt-3 space-y-2">
              {classEventsInCountry.map((e) => (
                <li key={e.eventId}>
                  <Link
                    href={urls.event(locale, e.eventId)}
                    className="block rounded border border-border-subtle bg-bg-surface px-3 py-2 text-sm hover:bg-bg-elevated"
                  >
                    <div className="font-mono text-[10px] uppercase tracking-wider text-text-muted">
                      {e.class}{e.subclass ? ` · ${e.subclass}` : ""} ·{" "}
                      {e.occurredAt.slice(0, 10)}
                    </div>
                    <div className="mt-1 text-text-primary">
                      {e.summary[locale] ?? e.summary.en}
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
            <p className="mt-3 font-mono text-[10px] uppercase tracking-wider">
              <Link
                href={urls.topicCountry(locale, t.eventClass, country)}
                className="text-accent hover:underline"
              >
                All {t.eventClass.replace("_", " ")} events in {countryLabel} →
              </Link>
            </p>
          </section>
        )}

        {otherCountries.length > 0 && (
          <section className="mt-10">
            <h2 className="text-base font-semibold text-text-primary">
              {name} in other affected countries
            </h2>
            <ul className="mt-3 flex flex-wrap gap-2">
              {otherCountries.map((c) => (
                <li key={c.iso2}>
                  <Link
                    href={urls.threatCountry(locale, t.slug, c.iso2)}
                    className="inline-flex items-center rounded border border-border-subtle bg-bg-surface px-3 py-1.5 text-xs text-text-secondary hover:bg-bg-elevated hover:text-text-primary"
                  >
                    {c.label}
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )}

        {sameCountryOtherThreats.length > 0 && (
          <section className="mt-8">
            <h2 className="text-base font-semibold text-text-primary">
              Other threats in {countryLabel}
            </h2>
            <ul className="mt-3 grid grid-cols-1 gap-2 md:grid-cols-2">
              {sameCountryOtherThreats.map((th) => (
                <li key={th.slug}>
                  <Link
                    href={urls.threatCountry(locale, th.slug, country)}
                    className="block rounded border border-border-subtle bg-bg-surface px-3 py-2 text-sm text-text-secondary hover:bg-bg-elevated hover:text-text-primary"
                  >
                    {th.name[locale] ?? th.name.en}
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )}

        <section className="mt-10">
          <h2 className="text-base font-semibold text-text-primary">FAQ</h2>
          <div className="mt-3 space-y-3">
            {faqs.map((f, i) => (
              <details
                key={i}
                className="group rounded border border-border-subtle bg-bg-surface p-4"
              >
                <summary className="cursor-pointer text-sm font-medium text-text-primary">
                  {f.q}
                </summary>
                <p className="mt-2 text-sm text-text-secondary">{f.a}</p>
              </details>
            ))}
          </div>
        </section>

        <p className="mt-10 text-xs text-text-muted">
          Threat profile:{" "}
          <Link href={urls.threat(locale, t.slug)} className="text-accent hover:underline">
            full {name}
          </Link>{" "}
          · country:{" "}
          <Link href={urls.country(locale, country)} className="text-accent hover:underline">
            {countryLabel} brief
          </Link>{" "}
          · methodology:{" "}
          <Link href={urls.methodology(locale)} className="text-accent hover:underline">
            /methodology
          </Link>
        </p>
      </article>
    </>
  );
}
