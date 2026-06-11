import type { Metadata } from "next";
import { localePath } from "@aegis/url-builder";
import { ACTIVE_LOCALES, isLocale, type Locale } from "@aegis/i18n-config";
import { buildMetadata } from "@/lib/seo";
import { PageHeader } from "@/components/PageHeader";

export function generateStaticParams() {
  return ACTIVE_LOCALES.map((locale) => ({ locale }));
}

const TITLE = "Aegis Lens for humanitarian organisations";
const DESCRIPTION =
  "Pre-positioning supplies, evacuation planning, cluster-munition tracking, and duty-of-care for UN agencies, ICRC, and field NGOs. Danger scoring and accuracy classes built for safety-critical workflows.";

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
    pathFor: (lc) => localePath(lc, "/use-cases/humanitarian"),
  });
}

const USE_CASES = [
  {
    name: "Pre-positioning supplies",
    body: "Forecast where displacement and access constraints are concentrating, and stage stocks closer to where they will be needed.",
  },
  {
    name: "Evacuation planning",
    body: "Score corridors by recent danger, infrastructure damage, and access incidents — refreshed continuously, with full source trail.",
  },
  {
    name: "Cluster-munition tracking",
    body: "Persistent records of submunition strikes and explosive-remnant sightings to support EORE messaging and survey prioritisation.",
  },
  {
    name: "Staff duty-of-care",
    body: "AOI-based alerts on incidents near offices, guesthouses, and field movements — at a tempo field security can actually act on.",
  },
];

const FEATURES = [
  {
    name: "Map",
    body: "Humanitarian-friendly basemap with admin boundaries, displacement overlays, and event filters by class and severity.",
  },
  {
    name: "API",
    body: "Structured records exportable to common humanitarian data standards. Free tier for accredited humanitarian access.",
  },
  {
    name: "Alerts",
    body: "Per-AOI thresholds for security focal points. Quiet hours, severity floors, and weekly digests for non-ops staff.",
  },
];

export default async function HumanitarianUseCasePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: raw } = await params;
  const locale = (isLocale(raw) ? raw : "en") as Locale;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Service",
    name: TITLE,
    description: DESCRIPTION,
    inLanguage: locale,
    provider: { "@type": "Organization", name: "Aegis Lens" },
    audience: {
      "@type": "Audience",
      audienceType: "UN agencies, ICRC, and humanitarian NGOs",
    },
    areaServed: "Worldwide",
  };

  return (
    <>
      <PageHeader eyebrow="Use case · Humanitarian" title={TITLE} description={DESCRIPTION} />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="mx-auto max-w-4xl px-4 py-10">
        <section className="flex items-start gap-5">
          <svg
            aria-hidden="true"
            viewBox="0 0 48 48"
            className="h-12 w-12 shrink-0 text-accent"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="square"
            strokeLinejoin="miter"
          >
            <path d="M24 6 L8 18 V40 H40 V18 Z" />
            <path d="M24 22 V34 M18 28 H30" />
          </svg>
          <div>
            <h2 className="text-xl font-semibold text-text-primary">
              Safety-critical data, on the record
            </h2>
            <p className="mt-3 text-text-secondary">
              Humanitarian planning lives or dies on whether the underlying picture is honest about
              what it does not know. Aegis Lens publishes confidence and geolocation accuracy on
              every event, so coordinators and security focal points can plan against signal and
              hold off on noise — with the audit trail your donors and partners expect.
            </p>
          </div>
        </section>

        <section className="mt-12">
          <h2 className="text-xl font-semibold text-text-primary">Where it fits</h2>
          <ul className="mt-4 grid gap-3 md:grid-cols-2">
            {USE_CASES.map((u) => (
              <li
                key={u.name}
                className="rounded border border-border-subtle bg-bg-surface p-4"
              >
                <p className="font-mono text-xs uppercase tracking-widest text-accent">
                  {u.name}
                </p>
                <p className="mt-2 text-sm text-text-secondary">{u.body}</p>
              </li>
            ))}
          </ul>
        </section>

        <section className="mt-12">
          <div className="rounded border border-border-subtle bg-bg-surface p-5">
            <p className="font-mono text-xs uppercase tracking-widest text-accent">
              Featured customer · Example
            </p>
            <blockquote className="mt-3 text-text-secondary">
              “We standardised our movement clearance on Aegis Lens danger scores. The transparency
              of the model is what made it acceptable to our security committee.”
            </blockquote>
            <p className="mt-2 text-sm text-text-muted">
              — Country security advisor, illustrative.
            </p>
          </div>
        </section>

        <section className="mt-12">
          <h2 className="text-xl font-semibold text-text-primary">Product highlights</h2>
          <div className="mt-4 grid gap-4 md:grid-cols-3">
            {FEATURES.map((f) => (
              <article
                key={f.name}
                className="rounded border border-border-subtle bg-bg-surface p-4"
              >
                <p className="font-mono text-xs uppercase tracking-widest text-accent">
                  {f.name}
                </p>
                <p className="mt-2 text-sm text-text-secondary">{f.body}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="mt-12">
          <h2 className="text-xl font-semibold text-text-primary">Next step</h2>
          <p className="mt-3 text-text-secondary">
            Accredited humanitarian access is available under our partner program. We are happy to
            run a scoping call with country security and information-management teams together.
          </p>
          <div className="mt-4 flex flex-wrap gap-3">
            <a
              className="inline-block rounded border border-accent px-4 py-2 font-mono text-sm text-accent hover:bg-accent hover:text-bg-base"
              href="mailto:sales@aegislens.example?subject=Humanitarian%20deployment%20inquiry"
            >
              Talk to sales
            </a>
            <a
              className="inline-block rounded border border-border-default px-4 py-2 font-mono text-sm text-text-primary hover:border-accent hover:text-accent"
              href={localePath(locale, "/api")}
            >
              Try the API
            </a>
          </div>
        </section>
      </div>
    </>
  );
}
